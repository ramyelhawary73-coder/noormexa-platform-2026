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
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  return `${base || "store"}-${suffix}`;
}

export async function createStore(
  ownerId: string,
  name: string,
  description: string
): Promise<{ store: Store | null; error: string | null }> {
  const baseSlug = slugify(name);

  // نحاول لحد 5 مرات بمعرف مختلف كل مرة، عشان نضمن عدم تعارض
  // اسم المتجر (slug) لو حد تاني مستخدم نفس الاسم قبل كده.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 6);
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${suffix}`;

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

    if (!error && data) {
      return { store: data as Store, error: null };
    }

    // لو الخطأ مش تعارض فى الاسم (زي مشكلة صلاحيات مثلاً)، نوقف فورًا
    // ونرجع رسالة الخطأ الحقيقية بدل ما نكرر المحاولة من غير فايدة.
    if (error && error.code !== "23505") {
      return { store: null, error: error.message };
    }
  }

  return { store: null, error: "تعذر إنشاء المتجر، اسم المتجر مستخدم بكثرة. جرّب اسم مختلف." };
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

// ============================================================
// إدارة المالكين (Admins) المتعددين
// ============================================================

export type AdminProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  is_admin: boolean;
  is_super_admin: boolean;
};

export async function getAllAdmins(): Promise<AdminProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_admin, is_super_admin")
    .eq("is_admin", true);
  if (error || !data) return [];
  return data as AdminProfile[];
}

export async function grantAdminByEmail(
  email: string
): Promise<{ success: boolean; error: string | null }> {
  const normalized = email.trim().toLowerCase();
  const { data: found, error: findError } = await supabase
    .from("profiles")
    .select("id, email")
    .ilike("email", normalized)
    .maybeSingle();

  if (findError || !found) {
    return { success: false, error: "الإيميل ده مش مسجّل حساب على الموقع لسه. لازم يعمل حساب الأول." };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ is_admin: true })
    .eq("id", found.id);

  if (updateError) return { success: false, error: "تعذر منح الصلاحية، حاول تاني." };
  return { success: true, error: null };
}

export async function revokeAdmin(userId: string): Promise<boolean> {
  const { error } = await supabase.from("profiles").update({ is_admin: false }).eq("id", userId);
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

export async function uploadProductImage(
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
  const path = `${userId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) {
    return { url: null, error: "تعذر رفع الصورة. اتأكد إنك شغّلت ملف schema_phase2_storage.sql فى Supabase." };
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: "all" | "sellers" | "stores" | "advertisers";
  created_at: string;
};

export async function getAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error || !data) return [];
  return data as Announcement[];
}

export async function createAnnouncement(payload: {
  title: string;
  body: string;
  audience: Announcement["audience"];
  createdBy: string;
}): Promise<{ announcement: Announcement | null; error: string | null }> {
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title: payload.title,
      body: payload.body,
      audience: payload.audience,
      created_by: payload.createdBy,
    })
    .select()
    .single();
  if (error || !data) return { announcement: null, error: error?.message ?? "تعذر نشر الإعلان" };
  return { announcement: data as Announcement, error: null };
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  return !error;
}
