-- ============================================================
-- NOORMEXA — المرحلة 2: البنية التحتية الحقيقية للسوق
-- ============================================================
-- شغّل هذا الملف في Supabase SQL Editor بعد ملف schema.sql
-- (لازم جدول profiles يكون موجود الأول).
--
-- الجداول: categories, stores, products, orders, order_items
-- + عمود is_admin على profiles للوحة تحكم المالك (المرحلة 3)
-- ============================================================

-- 1) صلاحية المالك (Admin) على جدول الحسابات
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ملاحظة: بعد إنشاء حسابك، فعّل صلاحيتك كمالك بتنفيذ هذا السطر
-- (غيّر البريد الإلكتروني بإيميلك الحقيقي):
--
-- update public.profiles set is_admin = true
--   where email = 'your-email@example.com';

-- 2) التصنيفات (Categories)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  slug text not null unique,
  icon text default 'Package',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all"
  on public.categories for select
  using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
  on public.categories for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

insert into public.categories (name_ar, name_en, slug, icon, sort_order) values
  ('إلكترونيات', 'Electronics', 'electronics', 'Package', 1),
  ('أزياء', 'Fashion', 'fashion', 'ShoppingBag', 2),
  ('منزل', 'Home', 'home', 'HomeIcon', 3),
  ('جمال', 'Beauty', 'beauty', 'Sparkles', 4),
  ('إكسسوارات', 'Accessories', 'accessories', 'Gift', 5),
  ('هدايا', 'Gifts', 'gifts', 'Gift', 6)
on conflict (slug) do nothing;

-- 3) المتاجر (Stores) — كل متجر مرتبط بحساب بائع/متجر فى profiles
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  commission_rate numeric(5,2) not null default 8.00, -- نسبة عمولة المنصة %
  plan text not null default 'basic', -- basic | professional | store
  status text not null default 'pending', -- pending | approved | suspended
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stores enable row level security;

drop policy if exists "stores_select_approved_or_own" on public.stores;
create policy "stores_select_approved_or_own"
  on public.stores for select
  using (status = 'approved' or owner_id = auth.uid());

drop policy if exists "stores_owner_manage" on public.stores;
create policy "stores_owner_manage"
  on public.stores for insert
  with check (owner_id = auth.uid());

drop policy if exists "stores_owner_update" on public.stores;
create policy "stores_owner_update"
  on public.stores for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "stores_admin_all" on public.stores;
create policy "stores_admin_all"
  on public.stores for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

drop trigger if exists set_stores_updated_at on public.stores;
create trigger set_stores_updated_at
  before update on public.stores
  for each row execute function public.set_updated_at();

-- 4) المنتجات (Products)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  stock integer not null default 0,
  status text not null default 'active', -- active | hidden | out_of_stock
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "products_select_active_or_own" on public.products;
create policy "products_select_active_or_own"
  on public.products for select
  using (
    (status = 'active' and store_id in (select id from public.stores where status = 'approved'))
    or store_id in (select id from public.stores where owner_id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "products_owner_manage" on public.products;
create policy "products_owner_manage"
  on public.products for all
  using (store_id in (select id from public.stores where owner_id = auth.uid()))
  with check (store_id in (select id from public.stores where owner_id = auth.uid()));

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all"
  on public.products for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- 5) الطلبات (Orders) + عناصر الطلب (Order Items)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  total_amount numeric(10,2) not null default 0,
  commission_amount numeric(10,2) not null default 0, -- أرباح المنصة من هذا الطلب
  status text not null default 'pending', -- pending | paid | shipped | completed | cancelled
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "orders_buyer_or_store_owner" on public.orders;
create policy "orders_buyer_or_store_owner"
  on public.orders for select
  using (
    buyer_id = auth.uid()
    or store_id in (select id from public.stores where owner_id = auth.uid())
  );

drop policy if exists "orders_buyer_create" on public.orders;
create policy "orders_buyer_create"
  on public.orders for insert
  with check (buyer_id = auth.uid());

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all"
  on public.orders for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null
);

alter table public.order_items enable row level security;

drop policy if exists "order_items_via_order" on public.order_items;
create policy "order_items_via_order"
  on public.order_items for select
  using (
    order_id in (
      select id from public.orders
      where buyer_id = auth.uid()
        or store_id in (select id from public.stores where owner_id = auth.uid())
    )
  );

drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all"
  on public.order_items for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ============================================================
-- ملاحظات مهمة:
-- ============================================================
-- • commission_rate على جدول stores هي النسبة اللي بتاخدها المنصة من كل عملية بيع.
--   المالك (Admin) بس هو اللي يقدر يعدلها من لوحة التحكم (المرحلة 3).
-- • عمود is_admin على profiles هو مفتاح صلاحيات لوحة تحكم المالك.
--   لازم تفعّله لحسابك بعد التسجيل (شوف التعليق فوق).
-- • الجداول دي أساس المرحلة 2 فقط؛ لوحة تحكم المالك (تعديل العمولات،
--   الموافقة على المتاجر، عرض الأرباح) هتيجي في المرحلة 3.
-- ============================================================
