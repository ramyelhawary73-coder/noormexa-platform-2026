-- ============================================================
-- NOORMEXA — المرحلة 3 (تكملة): إدارة أكثر من مالك (Admin) للمنصة
-- ============================================================
-- شغّل هذا الملف فى Supabase SQL Editor بعد schema.sql و schema_phase2_marketplace.sql
--
-- ده بيضيف صلاحية تسمح لأي حساب عليه is_admin = true إنه يشوف
-- ويعدّل بيانات أي حساب تانى (تحديدًا عشان يقدر يمنح صلاحية "مالك"
-- لإيميل جديد من داخل لوحة تحكم الموقع نفسها، من غير ما يحتاج يفتح
-- Supabase ويكتب SQL كل مرة).
-- ============================================================

-- دالة آمنة للتحقق من صلاحية المالك، بتتجاوز الحماية (RLS) وقت التنفيذ
-- عشان نتجنب مشكلة "التكرار اللانهائي" اللي بتحصل لو سياسة الحماية
-- على جدول profiles قامت بعمل استعلام على نفس جدول profiles مباشرة.
create or replace function public.is_platform_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_all"
  on public.profiles for select
  using (id = auth.uid() or public.is_platform_admin(auth.uid()));

drop policy if exists "profiles_admin_update_all" on public.profiles;
create policy "profiles_admin_update_all"
  on public.profiles for update
  using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));

-- ============================================================
-- ملحوظة: بعد تشغيل الملف ده، هتلاقي فى لوحة تحكم المالك (/admin)
-- قسم جديد اسمه "إدارة المالكين" تقدر منه تدي صلاحية Admin لأي
-- إيميل مسجل فى الموقع، أو تسحبها منه، من غير كتابة SQL تاني.
-- ============================================================
