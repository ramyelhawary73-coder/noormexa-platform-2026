import { supabase } from "./supabaseClient";
import type { Category, Store, Product } from "@/types/marketplace";

export type PublicStore = Pick<
  Store,
  "id" | "name" | "slug" | "description" | "logo_url" | "banner_url" | "country" | "is_verified" | "is_official"
>;

export type StoreMembershipRole = "owner" | "manager" | "editor" | "support";

export type TenantStore = Store & {
  membership_role: StoreMembershipRole;
};

export type StorePrivateSettings = {
  contact_email: string | null;
  contact_phone: string | null;
  cr_number: string | null;
  tax_number: string | null;
  bank_name: string | null;
  iban: string | null;
};

export type CreateStoreInput = {
  name: string;
  slug?: string;
  description?: string;
  country?: string;
  cr_number?: string;
  tax_number?: string;
  bank_name?: string;
  iban?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  banner_url?: string;
};

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

export async function getStoreBySlug(slug: string): Promise<PublicStore | null> {
  const { data, error } = await supabase.rpc("get_public_store_by_slug", {
    p_slug: slug,
  });
  if (error || !data?.length) return null;
  return data[0] as PublicStore;
}

export async function getStoreById(id: string): Promise<PublicStore | null> {
  const { data, error } = await supabase.rpc("get_public_store_by_id", {
    p_store_id: id,
  });
  if (error || !data?.length) return null;
  return data[0] as PublicStore;
}

export async function listPublicStores(): Promise<PublicStore[]> {
  const { data, error } = await supabase.rpc("list_public_stores");
  if (error || !data) return [];
  return data as PublicStore[];
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

export async function getMyTenantStores(): Promise<TenantStore[]> {
  // This RPC derives the caller from auth.uid() and only returns stores for
  // active customer-tenant memberships. selectedStoreId is never trusted.
  const { data, error } = await supabase.rpc("get_my_tenant_stores");
  if (error || !data) return [];
  return data as TenantStore[];
}

export async function getMyStorePrivateSettings(
  storeId: string
): Promise<StorePrivateSettings | null> {
  const { data, error } = await supabase.rpc("get_my_store_private_settings", {
    p_store_id: storeId,
  });
  if (error || !data?.length) return null;
  return data[0] as StorePrivateSettings;
}

export async function getMyStore(_legacyUserId?: string): Promise<Store | null> {
  // Backward-compatible wrapper. The old caller-supplied userId is ignored;
  // database membership + auth.uid() are the authority.
  const stores = await getMyTenantStores();
  return stores[0] ?? null;
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
  inputOrName: CreateStoreInput | string,
  legacyDescription = ""
): Promise<{ store: Store | null; error: string | null }> {
  const input: CreateStoreInput =
    typeof inputOrName === "string"
      ? { name: inputOrName, description: legacyDescription }
      : inputOrName;

  const { data, error } = await supabase.rpc("create_store_secure", {
    p_name: input.name,
    p_slug: input.slug?.trim() || slugify(input.name),
    p_description: input.description ?? null,
    p_country: input.country ?? null,
    p_cr_number: input.cr_number ?? null,
    p_tax_number: input.tax_number ?? null,
    p_bank_name: input.bank_name ?? null,
    p_iban: input.iban ?? null,
    p_contact_email: input.contact_email ?? null,
    p_contact_phone: input.contact_phone ?? null,
    p_logo_url: input.logo_url ?? null,
    p_banner_url: input.banner_url ?? null,
  });

  if (error || !data) {
    return { store: null, error: error?.message ?? "تعذر إنشاء المتجر." };
  }

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
  // Platform-admin management is intentionally exposed through a narrowly
  // scoped RPC. Direct platform-wide profile reads are not an authorization
  // boundary and must not be used for account administration.
  const { data, error } = await supabase.rpc("get_manageable_platform_admins");
  if (error || !data) return [];
  return data as AdminProfile[];
}

export async function grantAdminByEmail(
  email: string
): Promise<{ success: boolean; error: string | null }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { success: false, error: "اكتب بريدًا إلكترونيًا صالحًا." };
  }

  const { data, error } = await supabase.rpc("grant_platform_admin_by_email", {
    p_email: normalized,
  });

  if (error) {
    return { success: false, error: "تعذر منح الصلاحية، حاول تاني." };
  }

  if (!data) {
    return { success: false, error: "الإيميل ده مش مسجّل حساب على الموقع لسه. لازم يعمل حساب الأول." };
  }

  return { success: true, error: null };
}

export async function revokeAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("revoke_platform_admin", {
    p_user_id: userId,
  });
  return !error && Boolean(data);
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

export type AdminProductRow = Omit<Product, "store_name"> & { store_name?: string | null };

export async function getAllProductsAdmin(): Promise<AdminProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, stores(name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error || !data) return [];
  type Row = Product & { stores: { name: string } | null };
  return (data as Row[]).map((row) => ({ ...row, store_name: row.stores?.name ?? undefined }));
}

export type AdminOrderRow = Omit<Order, "store_name"> & { store_name: string | null; buyer_email: string | null };

export async function getAllOrdersAdmin(): Promise<AdminOrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, stores(name), profiles!orders_buyer_id_fkey(email)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error || !data) return [];
  type Row = Omit<Order, "store_name"> & { stores: { name: string } | null; profiles: { email: string } | null };
  return (data as Row[]).map((row) => {
    const { stores, profiles, ...order } = row;
    return {
      ...order,
      store_name: stores?.name ?? null,
      buyer_email: profiles?.email ?? null,
    };
  });
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

// ============================================================
// إدارة العلامة التجارية (Seller / Brand Console)
// ============================================================

export async function updateStoreProfile(
  storeId: string,
  updates: {
    name?: string;
    description?: string | null;
    country?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    cr_number?: string | null;
    tax_number?: string | null;
    bank_name?: string | null;
    iban?: string | null;
  }
): Promise<{ store: Store | null; error: string | null }> {
  // The store id is still re-authorized by stores RLS. No privileged fields
  // (owner/status/verification/official/commission/plan) are accepted here.
  const { data, error } = await supabase
    .from("stores")
    .update(updates)
    .eq("id", storeId)
    .select()
    .single();

  if (error || !data) return { store: null, error: error?.message ?? "تعذر تحديث بيانات المتجر" };
  return { store: data as Store, error: null };
}

export async function updateProduct(
  productId: string,
  updates: {
    name?: string;
    description?: string | null;
    price?: number;
    stock?: number;
    category_id?: string | null;
    image_url?: string | null;
  }
): Promise<{ product: Product | null; error: string | null }> {
  const { data, error } = await supabase.from("products").update(updates).eq("id", productId).select().single();
  if (error || !data) return { product: null, error: error?.message ?? "تعذر تحديث المنتج" };
  return { product: data as Product, error: null };
}

export async function uploadStoreImage(
  file: File,
  userId: string,
  kind: "logo" | "banner"
): Promise<{ url: string | null; error: string | null }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
  const path = `${userId}/${kind}-${Date.now()}-${safeName}`;

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
