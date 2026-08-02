-- ============================================================
-- NOORMEXA — المرحلة 3 (تكملة): منشورات وإشعارات الإدارة
-- ============================================================
-- ده بيدّي المطوّر/مالك المنصة إمكانية ينزل إعلانات أو رسائل
-- تظهر لكل البائعين/المتاجر فى لوحة التحكم بتاعتهم.
-- ============================================================

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all', -- all | sellers | stores | advertisers
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- أي مستخدم مسجل دخول يقدر يشوف الإعلانات (هنفلتر الجمهور فى الكود)
drop policy if exists "announcements_select_all" on public.announcements;
create policy "announcements_select_all"
  on public.announcements for select
  using (auth.uid() is not null);

-- الأدمن بس (مالك أو مطوّر) يقدر ينشئ/يحذف إعلانات
drop policy if exists "announcements_admin_write" on public.announcements;
create policy "announcements_admin_write"
  on public.announcements for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ============================================================
-- بعد التشغيل، هتلاقي فى لوحة تحكم المالك (/admin) قسم جديد
-- "المنشورات والإشعارات" — أي حاجة تكتبها هناك تظهر فورًا
-- فى أعلى لوحة تحكم كل بائع ومتجر (/dashboard).
-- ============================================================
