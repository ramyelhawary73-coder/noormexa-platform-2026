import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    paymob: Boolean(process.env.PAYMOB_API_KEY && process.env.PAYMOB_INTEGRATION_ID && process.env.PAYMOB_IFRAME_ID),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
  });
}

export async function POST(req: NextRequest) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "الدفع الإلكتروني غير مفعّل على هذا السيرفر بعد." }, { status: 503 });
  }

  let body: { orderIds?: string[]; provider?: "paymob" | "stripe" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const orderIds = Array.isArray(body.orderIds) ? body.orderIds : [];
  const provider = body.provider;

  if (orderIds.length === 0 || (provider !== "paymob" && provider !== "stripe")) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  // نتحقق من الطلبات ومبلغها الحقيقي من قاعدة البيانات مباشرة
  // (مش من الفرونت إند)، عشان محدش يقدر يلاعب فى المبلغ المدفوع.
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("id, total_amount, status")
    .in("id", orderIds);

  if (ordersError || !orders || orders.length === 0) {
    return NextResponse.json({ error: "تعذر العثور على الطلب" }, { status: 404 });
  }

  const alreadyPaid = orders.some((o) => o.status !== "pending");
  if (alreadyPaid) {
    return NextResponse.json({ error: "هذا الطلب تم دفعه أو معالجته بالفعل" }, { status: 409 });
  }

  const totalAmount = orders.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);
  const reference = `noormexa-${orderIds.join("-")}-${Date.now()}`;

  try {
    if (provider === "stripe") {
      const url = await createStripeSession(totalAmount, orderIds, reference);
      if (!url) return NextResponse.json({ error: "تعذر بدء الدفع عبر Stripe" }, { status: 502 });
      await tagOrders(orderIds, "stripe", reference);
      return NextResponse.json({ url });
    }

    const url = await createPaymobSession(totalAmount, reference);
    if (!url) return NextResponse.json({ error: "تعذر بدء الدفع عبر Paymob" }, { status: 502 });
    await tagOrders(orderIds, "paymob", reference);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json({ error: "حدث خطأ غير متوقع فى بدء الدفع" }, { status: 500 });
  }
}

async function tagOrders(orderIds: string[], provider: string, reference: string) {
  await supabaseAdmin
    .from("orders")
    .update({ payment_provider: provider, payment_reference: reference })
    .in("id", orderIds);
}

async function createStripeSession(
  amountEGP: number,
  orderIds: string[],
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
    metadata: { orderIds: orderIds.join(","), reference },
    success_url: `${origin}/orders?payment=success`,
    cancel_url: `${origin}/cart?payment=cancelled`,
  });

  return session.url;
}

async function createPaymobSession(amountEGP: number, reference: string): Promise<string | null> {
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = process.env.PAYMOB_INTEGRATION_ID;
  const iframeId = process.env.PAYMOB_IFRAME_ID;
  if (!apiKey || !integrationId || !iframeId) return null;

  const amountCents = Math.round(amountEGP * 100);

  // 1) تسجيل الدخول والحصول على Token
  const authRes = await fetch("https://accept.paymob.com/api/auth/tokens", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!authRes.ok) return null;
  const { token } = await authRes.json();

  // 2) تسجيل الطلب
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

  // 3) الحصول على مفتاح الدفع (Payment Key)
  const keyRes = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
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
        first_name: "NA",
        last_name: "NA",
        email: "customer@noormexa.app",
        phone_number: "+201000000000",
        country: "EG",
        city: "NA",
        street: "NA",
        building: "NA",
        floor: "NA",
        apartment: "NA",
      },
    }),
  });
  if (!keyRes.ok) return null;
  const { token: paymentToken } = await keyRes.json();

  return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
}
