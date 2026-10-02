import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  getBearerToken,
  requireAuthenticatedUser,
} from "@/lib/serverAuth";

export const runtime = "nodejs";

type CheckoutItemInput = {
  productId: string;
  quantity: number;
  selectedVariantsLabel?: string;
};

type CheckoutBody = {
  items?: unknown;
  shipping?: unknown;
  shippingSpeed?: unknown;
  paymentMethod?: unknown;
  promoCode?: unknown;
  checkoutReference?: unknown;
};

function getUserScopedSupabase(accessToken: string) {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://qiqvmsjjgwdsievkrhly.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function normalizeItems(value: unknown): CheckoutItemInput[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) {
    return null;
  }

  const normalized: CheckoutItemInput[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const raw = item as Record<string, unknown>;

    const productId =
      typeof raw.productId === "string" ? raw.productId.trim() : "";
    const quantity =
      typeof raw.quantity === "number" && Number.isInteger(raw.quantity)
        ? raw.quantity
        : NaN;

    if (!productId || productId.length > 128 || quantity < 1 || quantity > 99) {
      return null;
    }

    normalized.push({
      productId,
      quantity,
      selectedVariantsLabel:
        typeof raw.selectedVariantsLabel === "string"
          ? raw.selectedVariantsLabel.trim().slice(0, 200)
          : undefined,
    });
  }

  return normalized;
}

function normalizeShipping(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;

  const read = (key: string, max: number) =>
    typeof raw[key] === "string" ? raw[key].trim().slice(0, max) : "";

  const shipping = {
    fullName: read("fullName", 120),
    email: read("email", 254),
    phone: read("phone", 40),
    country: read("country", 120),
    state: read("state", 120),
    region: read("region", 120),
    city: read("city", 120),
    address: read("address", 500),
    postalCode: read("postalCode", 40),
    notes: read("notes", 500),
  };

  if (
    shipping.fullName.length < 2 ||
    shipping.phone.length < 5 ||
    shipping.country.length < 2 ||
    shipping.city.length < 2 ||
    shipping.address.length < 5
  ) {
    return null;
  }

  return shipping;
}

function mapOrder(row: Record<string, unknown>) {
  const items = Array.isArray(row.items) ? row.items : [];

  return {
    id: String(row.id ?? ""),
    orderNumber: String(row.order_number ?? ""),
    trackingNumber: String(row.tracking_number ?? ""),
    buyer_id: String(row.buyer_id ?? ""),
    store_id: String(row.store_id ?? ""),
    store_name:
      typeof row.store_name === "string" ? row.store_name : undefined,
    subtotal: Number(row.subtotal ?? 0),
    discount_amount: Number(row.discount_amount ?? 0),
    shipping_cost: Number(row.shipping_cost ?? 0),
    vat_amount: Number(row.vat_amount ?? 0),
    total_amount: Number(row.total_amount ?? 0),
    commission_amount: Number(row.commission_amount ?? 0),
    status: String(row.status ?? "pending"),
    payment_method: String(row.payment_method ?? "cod"),
    payment_status: String(row.payment_status ?? "pending"),
    shipping_speed:
      row.shipping_speed === "priority" ? "priority" : "standard",
    shipping_info:
      row.shipping_info && typeof row.shipping_info === "object"
        ? row.shipping_info
        : {},
    items,
    tracking_steps: [],
    created_at: String(row.created_at ?? new Date().toISOString()),
    carrier: "NOORMEXA Global Express Logistics",
  };
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedUser(req);
  if (!auth.user) {
    return NextResponse.json(
      { error: "يجب تسجيل الدخول لإتمام الطلب." },
      { status: 401 }
    );
  }

  const accessToken = getBearerToken(req);
  if (!accessToken) {
    return NextResponse.json(
      { error: "جلسة الدخول غير صالحة." },
      { status: 401 }
    );
  }

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const items = normalizeItems(body.items);
  const shipping = normalizeShipping(body.shipping);
  const shippingSpeed =
    body.shippingSpeed === "priority" ? "priority" : "standard";
  const paymentMethod =
    body.paymentMethod === "cod" ||
    body.paymentMethod === "stripe" ||
    body.paymentMethod === "applePayMada"
      ? body.paymentMethod
      : null;
  const promoCode =
    typeof body.promoCode === "string"
      ? body.promoCode.trim().toUpperCase().slice(0, 40)
      : null;
  const checkoutReference =
    typeof body.checkoutReference === "string"
      ? body.checkoutReference.trim()
      : "";

  if (!items || !shipping || !paymentMethod) {
    return NextResponse.json(
      { error: "بيانات الطلب غير مكتملة أو غير صالحة." },
      { status: 400 }
    );
  }

  if (
    checkoutReference.length < 16 ||
    checkoutReference.length > 80
  ) {
    return NextResponse.json(
      { error: "مرجع عملية الشراء غير صالح." },
      { status: 400 }
    );
  }

  const userSupabase = getUserScopedSupabase(accessToken);
  if (!userSupabase) {
    return NextResponse.json(
      { error: "خدمة الطلبات غير مهيأة على هذا السيرفر." },
      { status: 503 }
    );
  }

  // Important: no price, store id, buyer id, commission, status, VAT, shipping
  // total or stock value is accepted from the browser.
  const { data, error } = await userSupabase.rpc(
    "create_checkout_orders_secure",
    {
      p_items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        selected_variants_label: item.selectedVariantsLabel ?? null,
      })),
      p_shipping_info: shipping,
      p_shipping_speed: shippingSpeed,
      p_payment_method: paymentMethod,
      p_promo_code: promoCode || null,
      p_checkout_reference: checkoutReference,
    }
  );

  if (error) {
    const message = error.message || "تعذر إنشاء الطلب.";
    const conflict =
      /stock|unavailable|promo|minimum|unsupported|invalid/i.test(message);

    return NextResponse.json(
      { error: message },
      { status: conflict ? 409 : 400 }
    );
  }

  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "لم يتم إنشاء أي طلب." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    checkoutReference,
    orders: rows.map((row) =>
      mapOrder(row as Record<string, unknown>)
    ),
  });
}
