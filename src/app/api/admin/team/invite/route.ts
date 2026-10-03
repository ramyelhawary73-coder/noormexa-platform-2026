import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/serverAuth";
import {
  isSupabaseAdminConfigured,
  supabaseAdmin,
} from "@/lib/supabaseAdmin";

type OfficialStoreRole = "manager" | "editor" | "support";

const ALLOWED_ROLES = new Set<OfficialStoreRole>([
  "manager",
  "editor",
  "support",
]);

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getSafeSiteOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return configured || request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "server_not_configured" },
      { status: 503 }
    );
  }

  const auth = await requireAuthenticatedUser(request);
  if (!auth.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: callerProfile, error: callerError } = await supabaseAdmin
    .from("profiles")
    .select("id, is_super_admin")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (callerError || !callerProfile?.is_super_admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let payload: { email?: unknown; role?: unknown };
  try {
    payload = (await request.json()) as { email?: unknown; role?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const email = normalizeEmail(payload.email);
  const role = payload.role as OfficialStoreRole;

  if (!email || !email.includes("@") || !ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: "invalid_invitation" }, { status: 400 });
  }

  const { data: officialStore, error: storeError } = await supabaseAdmin
    .from("stores")
    .select("id")
    .eq("is_official", true)
    .limit(1)
    .maybeSingle();

  if (storeError || !officialStore) {
    return NextResponse.json(
      { error: "official_store_not_found" },
      { status: 409 }
    );
  }

  const { data: targetProfile, error: targetError } = await supabaseAdmin
    .from("profiles")
    .select("id, is_super_admin")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();

  if (targetError) {
    return NextResponse.json({ error: "profile_lookup_failed" }, { status: 500 });
  }

  if (targetProfile?.is_super_admin) {
    return NextResponse.json(
      { error: "protected_super_admin" },
      { status: 409 }
    );
  }

  const membershipStatus = targetProfile ? "active" : "pending";

  const { error: membershipError } = await supabaseAdmin
    .from("store_members")
    .upsert(
      {
        store_id: officialStore.id,
        user_id: targetProfile?.id ?? null,
        email,
        role,
        status: membershipStatus,
        created_by: auth.user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "store_id,email" }
    );

  if (membershipError) {
    return NextResponse.json(
      { error: "membership_save_failed" },
      { status: 500 }
    );
  }

  if (targetProfile) {
    return NextResponse.json({
      ok: true,
      membershipStatus: "active",
      emailSent: false,
      existingAccount: true,
    });
  }

  const siteOrigin = getSafeSiteOrigin(request);
  const passwordPath = "/auth/set-password?next=/seller/dashboard";
  const redirectTo =
    `${siteOrigin}/auth/callback?next=${encodeURIComponent(passwordPath)}`;

  const { error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        account_type: "customer",
        account_type_chosen: true,
        official_store_role: role,
        invited_to_official_store: true,
      },
    });

  if (!inviteError) {
    return NextResponse.json({
      ok: true,
      membershipStatus: "pending",
      emailSent: true,
      emailType: "invite",
      existingAccount: false,
    });
  }

  // An Auth user can already exist without a public profile. In that case an
  // Admin invite is rejected, so send a recovery/setup-password link instead.
  const { error: recoveryError } =
    await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

  if (recoveryError) {
    return NextResponse.json(
      {
        error: "email_delivery_failed",
        membershipSaved: true,
        membershipStatus: "pending",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    membershipStatus: "pending",
    emailSent: true,
    emailType: "recovery",
    existingAccount: true,
  });
}
