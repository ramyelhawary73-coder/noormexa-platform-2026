import "server-only";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getBearerToken, requireAuthenticatedUser } from "@/lib/serverAuth";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabaseAdmin";

type ManageableRole = "manager" | "editor" | "support";

function validEmail(value: unknown): value is string {
  return typeof value === "string" &&
    value.length <= 320 &&
    /^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/.test(value);
}

function authScopedClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type AllowedStore = { id: string; role: "owner" | "manager" };

async function getAuthorizedTenantStore(
  request: NextRequest,
  storeId: string
): Promise<{
  store: AllowedStore | null;
  token: string | null;
  error: NextResponse | null;
}> {
  if (!isSupabaseAdminConfigured) {
    return { store: null, token: null, error: NextResponse.json({ error: "server_not_configured" }, { status: 503 }) };
  }

  const auth = await requireAuthenticatedUser(request);
  const token = getBearerToken(request);
  if (!auth.user || !token) {
    return { store: null, token: null, error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }

  if (!storeId || storeId.length > 128) {
    return { store: null, token: null, error: NextResponse.json({ error: "invalid_store" }, { status: 400 }) };
  }

  const [{ data: store, error: storeError }, { data: membership, error: memberError }] = await Promise.all([
    supabaseAdmin.from("stores").select("id,status,is_official").eq("id", storeId).maybeSingle(),
    supabaseAdmin.from("store_members").select("role,status").eq("store_id", storeId)
      .eq("user_id", auth.user.id).maybeSingle(),
  ]);

  if (storeError || memberError || !store || store.is_official || store.status === "suspended" ||
      membership?.status !== "active" || !["owner", "manager"].includes(membership.role)) {
    return { store: null, token: null, error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { store: { id: store.id, role: membership.role as "owner" | "manager" }, token, error: null };
}

function siteOrigin(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || request.nextUrl.origin;
}

// Owners/managers can review pending invitations only for their own customer store.
export async function GET(request: NextRequest) {
  const storeId = request.nextUrl.searchParams.get("storeId")?.trim() ?? "";
  const auth = await getAuthorizedTenantStore(request, storeId);
  if (auth.error) return auth.error;

  const { data, error } = await supabaseAdmin
    .from("store_members")
    .select("id,email,role,status,created_at")
    .eq("store_id", storeId)
    .eq("status", "pending")
    .is("user_id", null)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "invitation_list_failed" }, { status: 500 });

  return NextResponse.json({
    invitations: (data ?? []).map((item) => ({
      membership_id: item.id,
      email: item.email,
      role: item.role,
      status: item.status,
      created_at: item.created_at,
    })),
  });
}

export async function POST(request: NextRequest) {
  let payload: { storeId?: unknown; email?: unknown; role?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const storeId = typeof payload.storeId === "string" ? payload.storeId.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const role = payload.role;
  if (!validEmail(email) || !["manager", "editor", "support"].includes(String(role))) {
    return NextResponse.json({ error: "invalid_invitation" }, { status: 400 });
  }

  const auth = await getAuthorizedTenantStore(request, storeId);
  if (auth.error) return auth.error;
  if (!auth.store || !auth.token) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (auth.store.role === "manager" && role === "manager") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin.from("profiles")
    .select("id,is_super_admin,is_admin").eq("email", email).limit(1).maybeSingle();
  if (profileError) return NextResponse.json({ error: "invitation_unavailable" }, { status: 500 });

  // Preserve platform-account isolation; do not disclose protected identities.
  if (profile?.is_super_admin || profile?.is_admin) {
    return NextResponse.json({ ok: true, membershipStatus: "pending", emailSent: false });
  }

  const client = authScopedClient(auth.token);
  if (!client) return NextResponse.json({ error: "server_not_configured" }, { status: 503 });

  // Authorization remains with the existing Postgres RPC, using the verified
  // caller's JWT. Never execute this function with a service-role identity.
  const { data: accepted, error: inviteError } = await client.rpc(
    "invite_store_member_by_email",
    { p_store_id: storeId, p_email: email, p_role: role as ManageableRole }
  );

  if (inviteError || !accepted) {
    return NextResponse.json({ error: "invitation_not_allowed" }, { status: 403 });
  }

  const redirectTo = `${siteOrigin(request)}/auth/callback?next=${encodeURIComponent("/auth/set-password?next=/seller/dashboard")}`;

  // Supabase Auth sends the email through the existing configured SMTP.
  // For previously registered auth users without profiles, inviteUserByEmail
  // may reject the invite; use the existing recovery/setup channel.
  if (profile) {
    return NextResponse.json({ ok: true, membershipStatus: "pending", emailSent: false, existingAccount: true });
  }

  const { error: inviteMailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { account_type: "customer", account_type_chosen: true },
  });

  if (!inviteMailError) {
    return NextResponse.json({ ok: true, membershipStatus: "pending", emailSent: true });
  }

  const { error: recoveryError } = await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });
  if (recoveryError) {
    return NextResponse.json({ error: "email_delivery_failed", membershipSaved: true }, { status: 502 });
  }
  return NextResponse.json({ ok: true, membershipStatus: "pending", emailSent: true });
}
