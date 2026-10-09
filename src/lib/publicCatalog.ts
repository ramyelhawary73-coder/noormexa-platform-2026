import { supabase } from "@/lib/supabaseClient";
import type { Product, Store } from "@/types/marketplace";
import type { PublicStore } from "@/lib/marketplace";

export type PublicCatalog = { products: Product[]; stores: Store[] };

// Only the database / public-store RPC determines which inventory is for sale.
// Do not let a signed-in seller's tenant SELECT permissions expose draft stock.
export async function loadPublicCatalog(): Promise<PublicCatalog> {
  const [publicStores, liveProducts] = await Promise.all([
    supabase.rpc("list_public_stores"),
    supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .gt("stock", 0)
      .gt("price", 0)
      .order("created_at", { ascending: false }),
  ]);

  if (publicStores.error || liveProducts.error) {
    throw new Error("Public catalog unavailable");
  }

  const approved = (publicStores.data ?? []) as PublicStore[];
  const approvedIds = new Set(approved.map((s) => s.id));
  const stores: Store[] = approved.map((s) => ({
    ...s,
    // Placeholder type fields are never returned from or exposed by the public RPC.
    owner_id: "",
    commission_rate: 0,
    plan: "",
    status: "approved" as const,
    created_at: "",
  }));

  // RLS is enforced in Postgres. The additional allow-list protects public
  // listings if the caller has authenticated access to other tenant drafts.
  const products = ((liveProducts.data ?? []) as Product[])
    .filter((p) =>
      approvedIds.has(p.store_id) &&
      p.status === "active" &&
      Number.isFinite(Number(p.price)) &&
      Number(p.price) > 0 &&
      Number.isFinite(Number(p.stock)) &&
      Number(p.stock) > 0
    )
    .map((p) => ({
      ...p,
      store_name: approved.find((s) => s.id === p.store_id)?.name ?? "",
    }));

  return { stores, products };
}
