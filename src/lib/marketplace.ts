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

export async function getStoreById(id: string): Promise<Store | null> {
  const { data, error } = await supabase.from("stores").select("*").eq("id", id).single();
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

export type OrderStatus = "pending" | "paid" | "shipped" | "completed" | "cancelled";

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name?: string;
};

export type Order = {
  id: string;
  buyer_id: string;
  store_id: string;
  total_amount: number;
  commission_amount: number;
  status: OrderStatus;
  created_at: string;
  store_name?: string;
  items?: OrderItemRow[];
  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_notes?: string | null;
};

export type CheckoutCartItem = {
  productId: string;
  storeId: string;
  price: number;
  quantity: number;
};

export type ShippingInfo = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
};

/**
 * ينشئ طلب منفصل لكل متجر موجود فى السلة (لأن كل طلب مرتبط بمتجر واحد)،
 * وبيحسب عمولة المنصة تلقائيًا حسب نسبة عمولة كل متجر.
 */
export async function checkoutCart(
  buyerId: string,
  cartItems: CheckoutCartItem[],
  shipping: ShippingInfo
): Promise<{ orderIds: string[]; error: string | null }> {
  const storeIds = Array.from(new Set(cartItems.map((i) => i.storeId)));
  const { data: stores } = await supabase.from("stores").select("id, commission_rate").in("id", storeIds);
  const commissionByStore = new Map((stores ?? []).map((s) => [s.id, Number(s.commission_rate ?? 0)]));

  const orderIds: string[] = [];

  for (const storeId of storeIds) {
    const storeItems = cartItems.filter((i) => i.storeId === storeId);
    const totalAmount = storeItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const commissionRate = commissionByStore.get(storeId) ?? 0;
    const commissionAmount = Math.round(totalAmount * (commissionRate / 100) * 100) / 100;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_id: buyerId,
        store_id: storeId,
        total_amount: totalAmount,
        commission_amount: commissionAmount,
        status: "pending",
        shipping_name: shipping.fullName,
        shipping_phone: shipping.phone,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_notes: shipping.notes || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      return { orderIds, error: orderError?.message ?? "تعذر إنشاء الطلب" };
    }

    const itemRows = storeItems.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      quantity: i.quantity,
      unit_price: i.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
    if (itemsError) {
      return { orderIds, error: itemsError.message };
    }

    // ننقّص المخزون المتاح لكل منتج اتباع عن طريق دالة آمنة على مستوى
    // قاعدة البيانات (بدل تعديل مباشر مش مسموح للمشتري أصلًا بـ RLS).
    for (const item of storeItems) {
      await supabase.rpc("decrement_product_stock", {
        p_product_id: item.productId,
        p_quantity: item.quantity,
      });
    }

    orderIds.push(order.id as string);
  }

  return { orderIds, error: null };
}

export async function getMyOrders(buyerId: string): Promise<Order[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, stores(name)")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error || !orders) return [];

  const orderIds = orders.map((o) => o.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("*, products(name)")
    .in("order_id", orderIds.length ? orderIds : ["00000000-0000-0000-0000-000000000000"]);

  type StoreRow = { name: string } | null;
  type ProductRow = { name: string } | null;

  return (orders as (Order & { stores: StoreRow })[]).map((o) => ({
    ...o,
    store_name: o.stores?.name,
    items: ((items ?? []) as (OrderItemRow & { products: ProductRow })[])
      .filter((it) => it.order_id === o.id)
      .map((it) => ({ ...it, product_name: it.products?.name })),
  }));
}

export async function getStoreOrders(storeId: string): Promise<Order[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  if (error || !orders) return [];

  const orderIds = orders.map((o) => o.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("*, products(name)")
    .in("order_id", orderIds.length ? orderIds : ["00000000-0000-0000-0000-000000000000"]);

  type ProductRow = { name: string } | null;

  return (orders as Order[]).map((o) => ({
    ...o,
    items: ((items ?? []) as (OrderItemRow & { products: ProductRow })[])
      .filter((it) => it.order_id === o.id)
      .map((it) => ({ ...it, product_name: it.products?.name })),
  }));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  return !error;
}

export type Review = {
  id: string;
  product_id: string;
  buyer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name?: string | null;
};

export type ReviewSummary = {
  average: number;
  count: number;
};

export async function getProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  type Row = Review & { profiles: { full_name: string | null } | null };
  return (data as Row[]).map((row) => ({ ...row, reviewer_name: row.profiles?.full_name ?? null }));
}

export function summarizeReviews(reviews: Review[]): ReviewSummary {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

export async function getMyReviewForProduct(productId: string, buyerId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("buyer_id", buyerId)
    .maybeSingle();
  if (error || !data) return null;
  return data as Review;
}

export async function submitReview(payload: {
  productId: string;
  buyerId: string;
  rating: number;
  comment: string;
}): Promise<{ review: Review | null; error: string | null }> {
  const { data, error } = await supabase
    .from("reviews")
    .upsert(
      {
        product_id: payload.productId,
        buyer_id: payload.buyerId,
        rating: payload.rating,
        comment: payload.comment || null,
      },
      { onConflict: "product_id,buyer_id" }
    )
    .select()
    .single();

  if (error || !data) return { review: null, error: error?.message ?? "تعذر إرسال التقييم" };
  return { review: data as Review, error: null };
}
