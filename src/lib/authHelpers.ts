import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "seller" | "customer" | "guest";

export function isPlatformAdminProfile(profile: Record<string, unknown> | null): boolean {
  return Boolean(profile?.is_admin) || Boolean(profile?.is_super_admin);
}

export function isPlatformSuperAdminProfile(profile: Record<string, unknown> | null): boolean {
  return Boolean(profile?.is_super_admin);
}

/**
 * Privileged authorization is derived only from the trusted public.profiles row.
 * Email addresses and user_metadata must never grant platform-admin access.
 *
 * Non-privileged seller role selection may still use account_type metadata as a
 * signup fallback until the profile is created.
 */
export function getUserRole(
  user: { email?: string | null; user_metadata?: Record<string, unknown> } | User | null,
  profile: Record<string, unknown> | null
): UserRole {
  if (!user) return "guest";

  if (isPlatformAdminProfile(profile)) {
    return "admin";
  }

  const accountType =
    (typeof profile?.account_type === "string" ? profile.account_type : null) ||
    (typeof user.user_metadata?.account_type === "string" ? user.user_metadata.account_type : null) ||
    "customer";

  if (
    accountType === "seller" ||
    accountType === "store" ||
    accountType === "brand" ||
    accountType === "advertiser" ||
    Boolean(profile?.is_seller)
  ) {
    return "seller";
  }

  return "customer";
}
