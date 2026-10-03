import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/serverAuth";
import {
  isSupabaseAdminConfigured,
  supabaseAdmin,
} from "@/lib/supabaseAdmin";

const STAFF_ROLES = new Set(["owner", "manager", "editor", "support"]);

export async function GET(request: NextRequest) {
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

  const { data: memberships, error: membershipError } = await supabaseAdmin
    .from("store_members")
    .select("store_id, role, status")
    .eq("user_id", auth.user.id)
    .eq("status", "active");

  if (membershipError) {
    return NextResponse.json(
      { error: "membership_lookup_failed" },
      { status: 500 }
    );
  }

  const candidateMemberships = (memberships ?? []).filter((membership) =>
    STAFF_ROLES.has(String(membership.role))
  );

  if (candidateMemberships.length === 0) {
    return NextResponse.json({ store: null });
  }

  const storeIds = candidateMemberships.map((membership) => membership.store_id);

  const { data: officialStores, error: storeError } = await supabaseAdmin
    .from("stores")
    .select(
      "id, name, slug, description, logo_url, banner_url, commission_rate, plan, status, is_verified, is_official, country, created_at"
    )
    .in("id", storeIds)
    .eq("is_official", true)
    .limit(1);

  if (storeError) {
    return NextResponse.json({ error: "store_lookup_failed" }, { status: 500 });
  }

  const officialStore = officialStores?.[0];
  if (!officialStore) {
    return NextResponse.json({ store: null });
  }

  const membership = candidateMemberships.find(
    (item) => item.store_id === officialStore.id
  );

  if (!membership) {
    return NextResponse.json({ store: null });
  }

  return NextResponse.json({
    store: {
      ...officialStore,
      // Never expose the protected official owner id to staff clients.
      owner_id: "",
      membership_role: membership.role,
    },
  });
}
