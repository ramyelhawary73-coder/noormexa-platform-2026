import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAuthenticatedUser } from "@/lib/serverAuth";
import {
  supabaseAdmin,
  isSupabaseAdminConfigured,
} from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type PaymentProvider = "paymob" | "stripe";

const MAX_ORDER_IDS = 20;

function providerConfigured(provider: PaymentProvider): boolean {
  if (provider === "stripe") {
    return Boolean(
      process.env.STRIPE_SECRET_KEY &&
        process.env.STRIPE_WEBHOOK_SECRET
    );
  }

  return Boolean(
    process.env.PAYMOB_API_KEY &&
      process.env.PAYMOB_INTEGRATION_ID &&
      process.env.PAYMOB_IFRAME_ID &&
      process.env.PAYMOB_HMAC_SECRET
  );
}

function normalizeOrderIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && item.length <= 128)
    )
  );
}

export async function GET() {
  return NextResponse.json({
    paymob: providerConfigured("paymob"),
    stripe: providerConfigured("stripe"),
  });
}

export async function POST(req: NextRequest) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json(
      { error: "الدفع الإلكتروني غير مفعّل على هذا السيرفر بعد." },
      { status: 503 }
    );
  }

  const auth = await requireAuthenticatedUser(req);
  if (!auth.user) {
    return NextResponse.json(
      { error: "يجب تسجيل الدخول لبدء عملية الدفع." },
      { status: 401 }
    );
  }

  let body: { orderIds?: unknown; provider?: PaymentProvider };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const orderIds = normalizeOrderIds(body.orderIds);
  const provider = body.provider;

  if (
    orderIds.length === 0 ||
    orderIds.length > MAX_ORDER_IDS ||
    (provider !== "paymob" && provider !== "stripe")
  ) {
    return NextResponse.json({ error: "بيانات ناقصة أو غير صالحة" }, { status: 400 });
  }

  if (!providerConfigured(provider)) {
    return NextResponse.json(
      { error: "بوابة الدفع المطلوبة غير متاحة حاليًا." },
      { status: 503 }
    );
  }

  // Service Role bypasses RLS, so authorization is explicit here:
  // every requested order must exist AND belong to the authenticated buyer.
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select(
      "id, buyer_id, total_amount, status, payment_method, payment_status, payment_provider, payment_reference, checkout_reference"
    )
    .in("id", orderIds)
    .eq("buyer_id", auth.user.id);

  if (ordersError || !orders || orders.length !== orderIds.length) {
    // Deliberately do not reveal whether an order exists but belongs to
    // somebody else.
    return NextResponse.json({ error: "تعذر العثور على الطلب" }, { status: 404 });
  }

  const expectedPaymentMethod =
    provider === "stripe" ? "stripe" : "applePayMada";
  const checkoutReferences = new Set(
    orders
      .map((order) => order.checkout_reference)
      .filter((value): value is string => typeof value === "string" && value.length > 0)
  );

  const notPayable = orders.some(
    (order) =>
      order.status !== "pending" ||
      (order.payment_status ?? "pending") !== "pending" ||
      order.payment_method !== expectedPaymentMethod
  );

  if (notPayable || checkoutReferences.size !== 1) {
    return NextResponse.json(
      { error: "الطلبات لا تنتمي إلى عملية دفع واحدة صالحة." },
      { status: 409 }
    );
  }

  const checkoutReference = Array.from(checkoutReferences)[0];

  const totalAmount = orders.reduce(
    (sum, order) => sum + Number(order.total_amount ?? 0),
    0
  );

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return NextResponse.json({ error: "قيمة الطلب غير صالحة للدفع" }, { status: 409 });
  }

  const reference = `noormexa-${crypto.randomUUID()}`;

  const tagged = await tagOrders(
    orderIds,
    auth.user.id,
    provider,
    reference,
    checkoutReference
  );

  if (!tagged) {
    return NextResponse.json(
      { error: "تغيرت حالة الطلب قبل بدء الدفع. حاول مرة أخرى." },
      { status: 409 }
    );
  }

  try {
    if (provider === "stripe") {
      const url = await createStripeSession(totalAmount, reference);
      if (!url) {
        await clearPaymentTag(orderIds, auth.user.id, reference);
        return NextResponse.json(
          { error: "تعذر بدء الدفع عبر Stripe" },
          { status: 502 }
        );
      }

      return NextResponse.json({ url });
    }

    const url = await createPaymobSession(
      totalAmount,
      reference,
      auth.user.email ?? undefined
    );

    if (!url) {
      await clearPaymentTag(orderIds, auth.user.id, reference);
      return NextResponse.json(
        { error: "تعذر بدء الدفع عبر Paymob" },
        { status: 502 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    await clearPaymentTag(orderIds, auth.user.id, reference);
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع فى بدء الدفع" },
      { status: 500 }
    );
  }
}

async function tagOrders(
  orderIds: string[],
  buyerId: string,
  provider: PaymentProvider,
  reference: string,
  checkoutReference: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({
      payment_provider: provider,
      payment_reference: reference,
      payment_status: "pending",
    })
    .in("id", orderIds)
    .eq("buyer_id", buyerId)
    .eq("checkout_reference", checkoutReference)
    .eq("status", "pending")
    .eq("payment_status", "pending")
    .is("payment_provider", null)
    .is("payment_reference", null)
    .select("id");

  return !error && (data?.length ?? 0) === orderIds.length;
}

async function clearPaymentTag(
  orderIds: string[],
  buyerId: string,
  reference: string
) {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      payment_provider: null,
      payment_reference: null,
    })
    .in("id", orderIds)
    .eq("buyer_id", buyerId)
    .eq("payment_reference", reference)
    .eq("payment_status", "pending");

  if (error) {
    console.error("Payment tag cleanup failed:", error.message);
  }
}

async function createStripeSession(
  amountEGP: number,
  reference: string
): Promise<string | null> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  const stripe = new Stripe(secretKey);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: Math.round(amountEGP * 100),
          product_data: { name: "طلب NOORMEXA" },
        },
        quantity: 1,
      },
    ],
    client_reference_id: reference,
    metadata: { reference },
    success_url: `${origin}/orders?payment=success`,
    cancel_url: `${origin}/cart?payment=cancelled`,
  });

  return session.url;
}

async function createPaymobSession(
  amountEGP: number,
  reference: string,
  buyerEmail?: string
): Promise<string | null> {
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = process.env.PAYMOB_INTEGRATION_ID;
  const iframeId = process.env.PAYMOB_IFRAME_ID;
  if (!apiKey || !integrationId || !iframeId) return null;

  const amountCents = Math.round(amountEGP * 100);

  const authRes = await fetch("https://accept.paymob.com/api/auth/tokens", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!authRes.ok) return null;
  const { token } = await authRes.json();

  const orderRes = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: "EGP",
      merchant_order_id: reference,
      items: [],
    }),
  });
  if (!orderRes.ok) return null;
  const paymobOrder = await orderRes.json();

  const keyRes = await fetch(
    "https://accept.paymob.com/api/acceptance/payment_keys",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: paymobOrder.id,
        currency: "EGP",
        integration_id: Number(integrationId),
        billing_data: {
          first_name: "NOORMEXA",
          last_name: "Customer",
          email: buyerEmail || "customer@noormexa.com",
          phone_number: "+201000000000",
          country: "EG",
          city: "NA",
          street: "NA",
          building: "NA",
          floor: "NA",
          apartment: "NA",
        },
      }),
    }
  );

  if (!keyRes.ok) return null;
  const { token: paymentToken } = await keyRes.json();

  return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
}
