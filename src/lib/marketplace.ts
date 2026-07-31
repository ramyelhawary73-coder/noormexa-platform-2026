import { supabase } from "./supabaseClient";
import type { Category, Store, Product } from "@/types/marketplace";

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single();
  if (error || !data) return null;
  return data as Category;
}

export async function getProductsByCategorySlug(slug: string): Promise<Product[]> {
  const category = await getCategoryBySlug(slug);
  if (!category) return [];
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", category.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Product[];
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const { data, error } = await supabase.from("stores").select("*").eq("slug", slug).single();
  if (error || !data) return null;
  return data as Store;
}

export async function getProductsByStore(storeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as Product;
}

export async function getMyStore(userId: string): Promise<Store | null> {
  const { data, error } = await supabase.from("stores").select("*").eq("owner_id", userId).maybeSingle();
  if (error || !data) return null;
  return data as Store;
}

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "store"}-${suffix}`;
}

export async function createStore(
  ownerId: string,
  name: string,
  description: string
): Promise<{ store: Store | null; error: string | null }> {
  const slug = slugify(name);
  const { data, error } = await supabase
    .from("stores")
    .insert({
      owner_id: ownerId,
      name,
      slug,
      description,
      status: "pending",
    })
    .select()
    .single();

  if (error || !data) return { store: null, error: error?.message ?? "تعذر إنشاء المتجر" };
  return { store: data as Store, error: null };
}

// ============================================================
// دوال لوحة تحكم المالك (Admin) — تتطلب profiles.is_admin = true
// ============================================================

export async function getAllStoresAdmin(): Promise<Store[]> {
  const { data, error } = await supabase.from("stores").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Store[];
}

export async function updateStoreStatus(
  storeId: string,
  status: "pending" | "approved" | "suspended"
): Promise<boolean> {
  const { error } = await supabase.from("stores").update({ status }).eq("id", storeId);
  return !error;
}

export async function updateStoreCommission(storeId: string, rate: number): Promise<boolean> {
  const { error } = await supabase.from("stores").update({ commission_rate: rate }).eq("id", storeId);
  return !error;
}

export async function updateStorePlan(storeId: string, plan: string): Promise<boolean> {
  const { error } = await supabase.from("stores").update({ plan }).eq("id", storeId);
  return !error;
}

export async function createCategory(payload: {
  name_ar: string;
  name_en: string;
  slug: string;
  icon: string;
  sort_order: number;
}): Promise<{ category: Category | null; error: string | null }> {
  const { data, error } = await supabase.from("categories").insert(payload).select().single();
  if (error || !data) return { category: null, error: error?.message ?? "تعذر إضافة التصنيف" };
  return { category: data as Category, error: null };
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  return !error;
}

export type PlatformStats = {
  totalStores: number;
  pendingStores: number;
  approvedStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const [storesRes, productsRes, ordersRes] = await Promise.all([
    supabase.from("stores").select("status"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("commission_amount"),
  ]);

  const stores = (storesRes.data ?? []) as { status: string }[];
  const orders = (ordersRes.data ?? []) as { commission_amount: number }[];

  return {
    totalStores: stores.length,
    pendingStores: stores.filter((s) => s.status === "pending").length,
    approvedStores: stores.filter((s) => s.status === "approved").length,
    totalProducts: productsRes.count ?? 0,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + Number(o.commission_amount || 0), 0),
  };
}

export async function getMyProducts(storeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Product[];
}

export async function createProduct(payload: {
  store_id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  stock: number;
}): Promise<{ product: Product | null; error: string | null }> {
  const { data, error } = await supabase
    .from("products")
    .insert({ ...payload, status: "active" })
    .select()
    .single();
  if (error || !data) return { product: null, error: error?.message ?? "تعذر إضافة المنتج" };
  return { product: data as Product, error: null };
}

export async function updateProductStatus(
  productId: string,
  status: "active" | "hidden" | "out_of_stock"
): Promise<boolean> {
  const { error } = await supabase.from("products").update({ status }).eq("id", productId);
  return !error;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  return !error;
}
