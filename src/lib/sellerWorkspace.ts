import { supabase } from "@/lib/supabaseClient";
import type {
  MarketingPost,
  Order,
  Product,
  Shipment,
  ShippingAddress,
  ShipmentStatus,
} from "@/types/marketplace";

export type SellerWorkspaceData = {
  products: Product[];
  orders: Order[];
  shipments: Shipment[];
  marketingPosts: MarketingPost[];
};

function asShippingAddress(value: unknown): ShippingAddress {
  const raw = (value ?? {}) as Partial<ShippingAddress>;
  return {
    fullName: raw.fullName ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? "",
    country: raw.country ?? "",
    state: raw.state,
    region: raw.region,
    city: raw.city ?? "",
    address: raw.address ?? "",
    postalCode: raw.postalCode,
    notes: raw.notes,
  };
}

function asOrder(row: Record<string, unknown>): Order {
  const rawItems = Array.isArray(row.items) ? row.items : [];

  return {
    id: String(row.id ?? ""),
    orderNumber: String(row.order_number ?? row.id ?? ""),
    trackingNumber: String(row.tracking_number ?? ""),
    buyer_id: String(row.buyer_id ?? ""),
    store_id: String(row.store_id ?? ""),
    store_name: typeof row.store_name === "string" ? row.store_name : undefined,
    total_amount: Number(row.total_amount ?? 0),
    subtotal: Number(row.subtotal ?? 0),
    discount_amount: Number(row.discount_amount ?? 0),
    shipping_cost: Number(row.shipping_cost ?? 0),
    vat_amount: Number(row.vat_amount ?? 0),
    commission_amount: Number(row.commission_amount ?? 0),
    status: (row.status ?? "pending") as Order["status"],
    payment_method: (row.payment_method ?? "cod") as Order["payment_method"],
    payment_status: (row.payment_status ?? "pending") as Order["payment_status"],
    shipping_speed: "standard",
    shipping_info: asShippingAddress(row.shipping_info),
    items: rawItems.map((item, index) => {
      const raw = (item ?? {}) as Record<string, unknown>;
      return {
        id: String(raw.id ?? `${row.id ?? "order"}-item-${index}`),
        product_id: String(raw.product_id ?? raw.productId ?? ""),
        product_name: String(raw.product_name ?? raw.name ?? ""),
        quantity: Number(raw.quantity ?? 1),
        unit_price: Number(raw.unit_price ?? raw.price ?? 0),
        selected_variants_label:
          typeof raw.selected_variants_label === "string"
            ? raw.selected_variants_label
            : undefined,
        image_url:
          typeof raw.image_url === "string" || raw.image_url === null
            ? (raw.image_url as string | null)
            : undefined,
      };
    }),
    tracking_steps: [],
    created_at: String(row.created_at ?? new Date(0).toISOString()),
  };
}

function asShipment(row: Record<string, unknown>): Shipment {
  const checkpoints = Array.isArray(row.checkpoints) ? row.checkpoints : [];

  return {
    id: String(row.id ?? ""),
    orderId: String(row.order_id ?? ""),
    orderNumber: String(row.order_id ?? ""),
    awbNumber: String(row.awb_number ?? ""),
    carrierId: String(row.carrier_id ?? ""),
    carrierName: String(row.carrier_name ?? ""),
    carrierLogo:
      typeof row.carrier_logo === "string" ? row.carrier_logo : undefined,
    storeId: String(row.store_id ?? ""),
    storeName: String(row.store_name ?? ""),
    recipientName: String(row.recipient_name ?? ""),
    recipientPhone: String(row.recipient_phone ?? ""),
    recipientCountry: String(row.recipient_country ?? ""),
    recipientCity: String(row.recipient_city ?? ""),
    recipientAddress: String(row.recipient_address ?? ""),
    originCountry: "",
    originCity: "",
    originWarehouse: "",
    packageWeightKg: Number(row.package_weight_kg ?? 1),
    dimensions: { length: 0, width: 0, height: 0 },
    itemCount: 0,
    itemsList: String(row.items_list ?? ""),
    declaredValue: Number(row.declared_value ?? 0),
    paymentType: (row.payment_type ?? "prepaid") as Shipment["paymentType"],
    codAmount: Number(row.cod_amount ?? 0),
    shippingSpeed: "standard",
    status: (row.status ?? "ready_to_ship") as ShipmentStatus,
    driverName:
      typeof row.driver_name === "string" ? row.driver_name : undefined,
    driverPhone:
      typeof row.driver_phone === "string" ? row.driver_phone : undefined,
    driverVehicle:
      typeof row.driver_vehicle === "string" ? row.driver_vehicle : undefined,
    deliveryOtp:
      typeof row.delivery_otp === "string" ? row.delivery_otp : undefined,
    estimatedDelivery: "",
    checkpoints: checkpoints as Shipment["checkpoints"],
    created_at: String(row.created_at ?? new Date(0).toISOString()),
  };
}

export async function loadSellerWorkspaceData(
  storeId: string
): Promise<{ data: SellerWorkspaceData; error: string | null }> {
  if (!storeId) {
    return {
      data: { products: [], orders: [], shipments: [], marketingPosts: [] },
      error: null,
    };
  }

  const [productsResult, ordersResult, shipmentsResult, postsResult] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false }),
      supabase
        .from("shipments")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false }),
      supabase
        .from("marketing_posts")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false }),
    ]);

  const firstError =
    productsResult.error ||
    ordersResult.error ||
    shipmentsResult.error ||
    postsResult.error;

  return {
    data: {
      products: (productsResult.data ?? []) as Product[],
      orders: (ordersResult.data ?? []).map((row) =>
        asOrder(row as Record<string, unknown>)
      ),
      shipments: (shipmentsResult.data ?? []).map((row) =>
        asShipment(row as Record<string, unknown>)
      ),
      marketingPosts: (postsResult.data ?? []) as MarketingPost[],
    },
    error: firstError?.message ?? null,
  };
}

export async function createSellerMarketingPost(
  payload: Omit<MarketingPost, "id" | "created_at" | "likes_count" | "views_count">
): Promise<{ post: MarketingPost | null; error: string | null }> {
  const id = `post-${crypto.randomUUID()}`;
  const { data, error } = await supabase
    .from("marketing_posts")
    .insert({
      ...payload,
      id,
      likes_count: 0,
      views_count: 0,
    })
    .select()
    .single();

  if (error || !data) {
    return {
      post: null,
      error: error?.message ?? "Could not create marketing post",
    };
  }

  return { post: data as MarketingPost, error: null };
}

export async function updateSellerMarketingPost(
  postId: string,
  updates: Partial<Pick<MarketingPost, "title" | "content" | "image_url" | "promo_code" | "discount_percent" | "featured_product_id" | "is_pinned" | "status">>
): Promise<boolean> {
  const { error } = await supabase
    .from("marketing_posts")
    .update(updates)
    .eq("id", postId);
  return !error;
}

export async function deleteSellerMarketingPost(postId: string): Promise<boolean> {
  const { error } = await supabase
    .from("marketing_posts")
    .delete()
    .eq("id", postId);
  return !error;
}

export async function updateSellerShipmentStatus(
  shipmentId: string,
  storeId: string,
  status: ShipmentStatus
): Promise<boolean> {
  const { error } = await supabase
    .from("shipments")
    .update({ status })
    .eq("id", shipmentId)
    .eq("store_id", storeId);
  return !error;
}
