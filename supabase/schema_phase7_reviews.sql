-- ============================================================
-- NOORMEXA — المرحلة 7: التقييمات والمراجعات
-- ============================================================
-- ده أهم عنصر ثقة فى أي سوق إلكتروني عالمي — بيدّي العميل
-- الجديد ثقة إن المنتج والمتجر موثوقين قبل ما يشتري.
-- ============================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (product_id, buyer_id) -- تقييم واحد بس لكل عميل لكل منتج
);

alter table public.reviews enable row level security;

-- أي حد يقدر يقرأ التقييمات (حتى الزوار، عشان يشوفوها قبل التسجيل)
drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all"
  on public.reviews for select
  using (true);

-- المستخدم المسجل بس يقدر يضيف تقييم، وباسمه هو بس
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
  on public.reviews for insert
  with check (buyer_id = auth.uid());

-- المستخدم يقدر يعدّل أو يحذف تقييمه هو بس
drop policy if exists "reviews_manage_own" on public.reviews;
create policy "reviews_manage_own"
  on public.reviews for all
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());

-- الأدمن يقدر يحذف أي تقييم (لإدارة الإساءات مثلاً)
drop policy if exists "reviews_admin_delete" on public.reviews;
create policy "reviews_admin_delete"
  on public.reviews for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create index if not exists reviews_product_id_idx on public.reviews (product_id);

-- ============================================================
-- بعد التشغيل، هتلاقي فى صفحة كل منتج تقييم بالنجوم + مراجعات
-- العملاء، ومتوسط التقييم هيظهر فى صفحة المنتج.
-- ============================================================
