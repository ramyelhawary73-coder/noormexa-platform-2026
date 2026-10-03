import { supabase } from "./supabaseClient";
import type { TenantStore } from "./marketplace";

export async function getMyOfficialStaffStore(): Promise<TenantStore | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const response = await fetch("/api/seller/official-workspace", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    store?: TenantStore | null;
  };

  return payload.store ?? null;
}
