-- ============================================================
-- NOORMEXA — إكمال المرحلة 6: بيانات الشحن فى الطلب
-- ============================================================
-- كانت عملية الشراء بتتم من غير ما نجمع اسم/عنوان/تليفون
-- المتسوق، فمكانش فيه أي طريقة توصل بيها الشحنة له فعليًا.
-- ============================================================

alter table public.orders
  add column if not exists shipping_name text,
  add column if not exists shipping_phone text,
  add column if not exists shipping_address text,
  add column if not exists shipping_city text,
  add column if not exists shipping_notes text;
