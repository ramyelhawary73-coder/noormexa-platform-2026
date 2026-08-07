import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// ترتيب المفاتيح ده محدد رسميًا من Paymob لحساب توقيع HMAC
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
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export async function POST(req: NextRequest) {
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  const body = await req.json();
  const transaction = body?.obj;

  if (!transaction) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  // لو مفتاح التحقق مضاف، لازم نتأكد إن الطلب فعلاً جاي من Paymob
  // ومش محاولة تزوير (أي حد يقدر يبعت طلب وهمي لنفس الرابط).
  if (hmacSecret) {
    const concatenated = HMAC_FIELDS.map((field) => {
      const value = getNested(transaction, field);
      return value === null || value === undefined ? "" : String(value);
    }).join("");

    const computedHmac = crypto.createHmac("sha512", hmacSecret).update(concatenated).digest("hex");
    const receivedHmac = req.nextUrl.searchParams.get("hmac");

    if (!receivedHmac || computedHmac !== receivedHmac) {
      console.error("Paymob webhook: HMAC mismatch");
      return NextResponse.json({ error: "توقيع غير صحيح" }, { status: 401 });
    }
  }

  const reference = transaction.order?.merchant_order_id as string | undefined;
  const success = Boolean(transaction.success);

  if (!reference) {
    return NextResponse.json({ error: "لا يوجد مرجع للطلب" }, { status: 400 });
  }

  if (success) {
    await supabaseAdmin
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("payment_reference", reference);
  }

  return NextResponse.json({ received: true });
}
