import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "seller" | "customer" | "guest";

export const ADMIN_EMAILS = [
  "ramyelhawary73@gmail.com",
  "admin@noormexa.com",
  "owner@noormexa.com",
  "support@noormexa.com",
];

/**
 * Returns the exact determined user role based on email, profile, and auth metadata:
 * - "admin": Platform Owner / Super Admin
 * - "seller": Vendor / Store Owner / Brand Creator
 * - "customer": Registered Buyer / Shopper
 * - "guest": Unauthenticated visitor
 */
export function getUserRole(
  user: { email?: string | null; user_metadata?: Record<string, unknown> } | User | null,
  profile: Record<string, unknown> | null
): UserRole {
  if (!user) return "guest";

  const email = (user.email || "").toLowerCase().trim();
  const isAdminEmail = ADMIN_EMAILS.includes(email) || email.endsWith("@noormexa.com");
  const isExplicitAdmin =
    Boolean(profile?.is_admin) ||
    profile?.account_type === "admin" ||
    profile?.account_type === "owner" ||
    Boolean(user.user_metadata?.is_admin);

  if (isAdminEmail || isExplicitAdmin) {
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
