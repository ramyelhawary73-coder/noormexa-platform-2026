-- ============================================================
-- NOORMEXA — سكريبت إعداد قاعدة بيانات Supabase من الصفر
-- ============================================================
-- طريقة الاستخدام:
-- 1. افتح مشروع Supabase الجديد بتاعك
-- 2. من القائمة الجانبية: SQL Editor
-- 3. اعمل New Query والصق كل الكود ده
-- 4. دوس Run مرة واحدة بس
-- ============================================================

-- جدول الملفات الشخصية (profiles)
-- بيتربط تلقائيًا بجدول المستخدمين الخاص بنظام Auth فى Supabase
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  account_type text not null default 'customer'
    check (account_type in ('customer', 'seller', 'store', 'advertiser')),
  business_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'بيانات حساب المستخدم (متسوق / بائع / متجر / معلن) داخل منصة NOORMEXA';

-- تفعيل الحماية على مستوى الصفوف (Row Level Security)
-- ده أهم خطوة أمنية: بدونها أي حد يقدر يقرا/يعدل بيانات أي مستخدم تاني
alter table public.profiles enable row level security;

-- سياسة: المستخدم يقدر يشوف بياناته الشخصية بس
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- سياسة: المستخدم يقدر ينشئ صف بياناته الشخصية بس (وقت التسجيل)
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- سياسة: المستخدم يقدر يعدل بياناته الشخصية بس
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- تحديث updated_at تلقائيًا مع كل تعديل
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- ملاحظات مهمة:
-- ============================================================
-- • لو عايز صفحات متاجر/بائعين تكون عامة (يشوفها أي زائر بدون تسجيل دخول)
--   مستقبلاً، ضيف policy إضافية زي دي:
--
--   create policy "profiles_select_public_stores"
--     on public.profiles for select
--     using (account_type in ('store', 'seller', 'advertiser'));
--
-- • تأكد إن إعداد Auth > Providers > Email مفعّل فى مشروع Supabase.
-- • لو حابب تسريع الاختبار: Auth > Providers > Email > "Confirm email"
--   ممكن توقفه مؤقتًا عشان التسجيل يشتغل من غير تأكيد بريد إلكتروني،
--   لكن يفضّل تفعيله قبل الإطلاق الفعلي للمستخدمين الحقيقيين.
-- ============================================================
