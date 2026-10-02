import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  isSupabaseAdminConfigured,
  supabaseAdmin,
} from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
];

function getNested(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function timingSafeHexEqual(expected: string, received: string): boolean {
  if (!/^[a-f0-9]+$/i.test(received)) return false;

  try {
    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(received, "hex");

    return (
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ error: "payment_server_unavailable" }, { status: 503 });
  }

  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  const expectedIntegrationId = process.env.PAYMOB_INTEGRATION_ID;

  // Service Role updates are never allowed behind an unsigned webhook.
  if (!hmacSecret || !expectedIntegrationId) {
    console.error("Paymob webhook: verification configuration is missing");
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const transaction = body.obj;
  if (!transaction || typeof transaction !== "object") {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const tx = transaction as Record<string, unknown>;
  const concatenated = HMAC_FIELDS.map((field) => {
    const value = getNested(tx, field);
    return value === null || value === undefined ? "" : String(value);
  }).join("");

  const computedHmac = crypto
    .createHmac("sha512", hmacSecret)
    .update(concatenated)
    .digest("hex");
  const receivedHmac = req.nextUrl.searchParams.get("hmac");

  if (!receivedHmac || !timingSafeHexEqual(computedHmac, receivedHmac)) {
    console.error("Paymob webhook: HMAC mismatch");
    return NextResponse.json({ error: "توقيع غير صحيح" }, { status: 401 });
  }

  const integrationId = String(tx.integration_id ?? "");
  if (integrationId !== String(expectedIntegrationId)) {
    console.error("Paymob webhook: integration mismatch");
    return NextResponse.json({ error: "تكامل غير صحيح" }, { status: 401 });
  }

  const orderObject =
    tx.order && typeof tx.order === "object"
      ? (tx.order as Record<string, unknown>)
      : null;
  const reference =
    typeof orderObject?.merchant_order_id === "string"
      ? orderObject.merchant_order_id
      : undefined;

  if (!reference || !reference.startsWith("noormexa-")) {
    return NextResponse.json({ error: "لا يوجد مرجع صالح للطلب" }, { status: 400 });
  }

  const success = Boolean(tx.success);
  if (!success) {
    return NextResponse.json({ received: true, applied: false });
  }

  const transactionAmount = Number(tx.amount_cents);
  const currency = String(tx.currency ?? "").toUpperCase();

  if (!Number.isInteger(transactionAmount) || transactionAmount <= 0 || currency !== "EGP") {
    return NextResponse.json({ error: "قيمة أو عملة غير صحيحة" }, { status: 400 });
  }

  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("id, total_amount, status, payment_status")
    .eq("payment_reference", reference)
    .eq("payment_provider", "paymob");

  if (ordersError) {
    console.error("Paymob webhook: order lookup failed", ordersError.message);
    return NextResponse.json({ error: "تعذر التحقق من الطلب" }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    // Signed but stale/unknown references are acknowledged without changing DB.
    return NextResponse.json({ received: true, applied: false });
  }

  if (orders.every((order) => order.payment_status === "paid")) {
    return NextResponse.json({ received: true, applied: false, idempotent: true });
  }

  const expectedAmount = Math.round(
    orders.reduce(
      (sum, order) => sum + Number(order.total_amount ?? 0),
      0
    ) * 100
  );

  if (expectedAmount !== transactionAmount) {
    console.error("Paymob webhook: amount mismatch");
    return NextResponse.json({ error: "قيمة الدفع لا تطابق الطلب" }, { status: 409 });
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: "paid",
      payment_status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("payment_reference", reference)
    .eq("payment_provider", "paymob")
    .eq("payment_status", "pending")
    .select("id");

  if (updateError) {
    console.error("Paymob webhook: payment update failed", updateError.message);
    return NextResponse.json({ error: "تعذر تحديث الطلب" }, { status: 500 });
  }

  return NextResponse.json({
    received: true,
    applied: (updated?.length ?? 0) > 0,
  });
}
