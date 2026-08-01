-- ============================================================
-- NOORMEXA — المرحلة 2 (تكملة): رفع صور المنتجات فعليًا
-- ============================================================
-- شغّل هذا الملف فى Supabase SQL Editor بعد باقي ملفات السكيما.
--
-- ده بينشئ "Bucket" (مساحة تخزين) عامة اسمها product-images،
-- عشان البائع يقدر يرفع صور منتجاته فعليًا من لوحة التحكم
-- (بدل ما يحتاج يحط رابط صورة يدوي من الإنترنت).
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- أي حد يقدر يشوف الصور (عشان تظهر للعملاء فى الموقع بدون تسجيل دخول)
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- المستخدم المسجل بس يقدر يرفع صور، وداخل مجلد خاص باسم الـ user id بتاعه
drop policy if exists "product_images_owner_upload" on storage.objects;
create policy "product_images_owner_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- المستخدم يقدر يحذف/يعدّل صوره هو بس
drop policy if exists "product_images_owner_manage" on storage.objects;
create policy "product_images_owner_manage"
  on storage.objects for all
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- ملحوظة: بعد تشغيل الملف ده، هتلاقي فى لوحة تحكم البائع (/dashboard)
-- إمكانية رفع صورة حقيقية من جهازه لكل منتج، بدل كتابة رابط يدوي.
-- ============================================================
