import { supabase } from "./supabaseClient";
import type { TenantStore } from "./marketplace";

export async function getMyOfficialStaffStore(
  accessToken?: string
): Promise<TenantStore | null> {
  let token = accessToken;

  if (!token) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    token = session?.access_token;
  }

  if (!token) return null;

  const response = await fetch("/api/seller/official-workspace", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    store?: TenantStore | null;
  };

  return payload.store ?? null;
}
