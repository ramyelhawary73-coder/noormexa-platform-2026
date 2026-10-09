import { supabase } from "@/lib/supabaseClient";
import type { PublicStore } from "@/lib/marketplace";
import type { Product, MarketingPost } from "@/types/marketplace";

// These aliases are navigation compatibility only; the database remains the authority.
const OFFICIAL_STORE_ID = "store-noormexa-official";
const LEGACY_OFFICIAL_SLUG = "noormexa-official";

export type PublicStorefront = {
  store: PublicStore;
  products: Product[];
  posts: MarketingPost[];
};

export type PublicStorefrontResult = {
  storefront: PublicStorefront | null;
  error: string | null;
};

export async function loadPublicStorefront(routeSlug: string): Promise<PublicStorefrontResult> {
  const requestedSlug = routeSlug.trim().toLowerCase();
  if (!requestedSlug || requestedSlug.length > 160) {
    return { storefront: null, error: null };
  }

  // Lookup by safe public RPC only. Do not SELECT full stores or trust client store IDs.
  const isOfficialAlias =
    requestedSlug === LEGACY_OFFICIAL_SLUG || requestedSlug === OFFICIAL_STORE_ID;
  const lookup = isOfficialAlias
    ? supabase.rpc("get_public_store_by_id", { p_store_id: OFFICIAL_STORE_ID })
    : requestedSlug.startsWith("store-")
      ? supabase.rpc("get_public_store_by_id", { p_store_id: requestedSlug })
      : supabase.rpc("get_public_store_by_slug", { p_slug: requestedSlug });

  const { data: storeRows, error: lookupError } = await lookup;
  if (lookupError) {
    return { storefront: null, error: "store_lookup_unavailable" };
  }

  const store = (storeRows?.[0] ?? null) as PublicStore | null;
  if (!store) return { storefront: null, error: null };

  // Public RLS enforces approved-store visibility; extra status checks apply here.
  // Never use MarketplaceContext products/posts or localStorage for store data.
  const [productsResult, postsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("store_id", store.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("marketing_posts")
      .select("*")
      .eq("store_id", store.id)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  if (productsResult.error || postsResult.error) {
    return { storefront: null, error: "store_content_unavailable" };
  }

  return {
    storefront: {
      store,
      products: (productsResult.data ?? []) as Product[],
      posts: (postsResult.data ?? []) as MarketingPost[],
    },
    error: null,
  };
}
