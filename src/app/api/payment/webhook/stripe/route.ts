import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  isSupabaseAdminConfigured,
  supabaseAdmin,
} from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "payment_server_unavailable" }, { status: 503 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe غير مفعّل" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("missing signature");
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature error:", error);
    return NextResponse.json({ error: "توقيع غير صحيح" }, { status: 401 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, applied: false });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const reference =
    session.metadata?.reference || session.client_reference_id || undefined;

  if (
    !reference ||
    !reference.startsWith("noormexa-") ||
    session.payment_status !== "paid"
  ) {
    return NextResponse.json({ received: true, applied: false });
  }

  const amountTotal = session.amount_total;
  const currency = session.currency?.toUpperCase();

  if (
    typeof amountTotal !== "number" ||
    amountTotal <= 0 ||
    currency !== "EGP"
  ) {
    return NextResponse.json(
      { error: "قيمة أو عملة Stripe غير صحيحة" },
      { status: 400 }
    );
  }

  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("id, total_amount, status, payment_status")
    .eq("payment_reference", reference)
    .eq("payment_provider", "stripe");

  if (ordersError) {
    console.error("Stripe webhook: order lookup failed", ordersError.message);
    return NextResponse.json({ error: "تعذر التحقق من الطلب" }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ received: true, applied: false });
  }

  if (orders.every((order) => order.payment_status === "paid")) {
    return NextResponse.json({
      received: true,
      applied: false,
      idempotent: true,
    });
  }

  const expectedAmount = Math.round(
    orders.reduce(
      (sum, order) => sum + Number(order.total_amount ?? 0),
      0
    ) * 100
  );

  if (expectedAmount !== amountTotal) {
    console.error("Stripe webhook: amount mismatch");
    return NextResponse.json(
      { error: "قيمة الدفع لا تطابق الطلب" },
      { status: 409 }
    );
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: "paid",
      payment_status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("payment_reference", reference)
    .eq("payment_provider", "stripe")
    .eq("payment_status", "pending")
    .select("id");

  if (updateError) {
    console.error("Stripe webhook: payment update failed", updateError.message);
    return NextResponse.json({ error: "تعذر تحديث الطلب" }, { status: 500 });
  }

  return NextResponse.json({
    received: true,
    applied: (updated?.length ?? 0) > 0,
  });
}
