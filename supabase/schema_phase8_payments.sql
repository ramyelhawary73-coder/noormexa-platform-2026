-- ============================================================
-- NOORMEXA — المرحلة 8: بوابة الدفع الإلكتروني (Paymob + Stripe)
-- ============================================================

alter table public.orders
  add column if not exists payment_provider text,
  add column if not exists payment_reference text,
  add column if not exists paid_at timestamptz;

create index if not exists orders_payment_reference_idx
  on public.orders (payment_reference);

-- ============================================================
-- ملحوظة مهمة: تحديث حالة الطلب لـ "paid" بيتم من خلال
-- Webhook من Paymob/Stripe مباشرة، باستخدام مفتاح خاص بالسيرفر
-- (Service Role Key) بيتخطى قواعد الحماية العادية (RLS) بأمان،
-- لأنه بيتحقق من توقيع الطلب (HMAC/Signature) قبل أي تحديث.
-- ============================================================
