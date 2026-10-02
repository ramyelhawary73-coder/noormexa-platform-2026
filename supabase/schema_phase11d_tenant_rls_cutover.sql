-- NOORMEXA Phase 11D — Tenant RLS Cutover
-- Requires:
--   * schema_phase11a_authorization_foundation.sql
--   * schema_phase11b_platform_account_isolation.sql
--   * schema_phase11c_secure_store_creation_privacy.sql
--
-- Prepared on the feature branch only. DO NOT apply to Production without
-- explicit approval and pre-deployment verification.
--
-- Scope intentionally limited to:
--   products, orders, shipments, marketing_posts
--
-- Out of scope in this migration:
--   order_items (legacy schema mismatch discovered during audit),
--   reviews, payments, storage, Auth, Secrets, OAuth.
--
-- Fixed RBAC used here:
--   owner   -> tenant operational administration
--   manager -> tenant operational administration
--   editor  -> product/content management only
--   support -> order/shipment support only
--
-- Platform Admin-or-higher keeps platform operational access through the
-- internal private.is_platform_admin() predicate.

begin;

-- ---------------------------------------------------------------------------
-- 0) Ensure RLS remains enabled
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.shipments enable row level security;
alter table public.marketing_posts enable row level security;

-- ---------------------------------------------------------------------------
-- 1) PRODUCTS
-- ---------------------------------------------------------------------------
-- Public:
--   * may read active catalog rows only.
-- Tenant:
--   * all active store roles may read their own store's hidden/active rows.
--   * owner/manager/editor may create/update/delete products.
--   * support is read-only.
-- Platform:
--   * Platform Admin-or-higher may operate across stores.
--
-- IMPORTANT: caller-supplied store_id never grants access by itself; the
-- policy verifies active membership in that exact store.

drop policy if exists "Store isolated products" on public.products;
drop policy if exists "products_public_active_select" on public.products;
drop policy if exists "products_tenant_select" on public.products;
drop policy if exists "products_tenant_insert" on public.products;
drop policy if exists "products_tenant_update" on public.products;
drop policy if exists "products_tenant_delete" on public.products;

create policy "products_public_active_select"
  on public.products
  for select
  to anon, authenticated
  using (
    status = 'active'
  );

create policy "products_tenant_select"
  on public.products
  for select
  to authenticated
  using (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','editor','support']::text[]
    )
  );

create policy "products_tenant_insert"
  on public.products
  for insert
  to authenticated
  with check (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','editor']::text[]
    )
  );

create policy "products_tenant_update"
  on public.products
  for update
  to authenticated
  using (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','editor']::text[]
    )
  )
  with check (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','editor']::text[]
    )
  );

create policy "products_tenant_delete"
  on public.products
  for delete
  to authenticated
  using (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','editor']::text[]
    )
  );

revoke all on table public.products from anon, authenticated;
grant select on table public.products to anon;
grant select, insert, update, delete on table public.products to authenticated;

-- ---------------------------------------------------------------------------
-- 2) ORDERS
-- ---------------------------------------------------------------------------
-- Customer:
--   * may create an order only with buyer_id = auth.uid().
--   * may read only their own orders.
--   * may not directly change status/payment/commission fields.
-- Tenant:
--   * owner/manager/support may read and update orders for their own store.
--   * editor has no access to customer order PII.
-- Platform:
--   * Platform Admin-or-higher may read/update.
-- Delete:
--   * no client role receives DELETE. Historical order records are retained.

drop policy if exists "Store isolated orders" on public.orders;
drop policy if exists "orders_buyer_select_own" on public.orders;
drop policy if exists "orders_buyer_insert_own" on public.orders;
drop policy if exists "orders_tenant_select" on public.orders;
drop policy if exists "orders_tenant_update" on public.orders;

create policy "orders_buyer_select_own"
  on public.orders
  for select
  to authenticated
  using (
    buyer_id = auth.uid()::text
  );

create policy "orders_buyer_insert_own"
  on public.orders
  for insert
  to authenticated
  with check (
    buyer_id = auth.uid()::text
    and store_id is not null
  );

create policy "orders_tenant_select"
  on public.orders
  for select
  to authenticated
  using (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','support']::text[]
    )
  );

create policy "orders_tenant_update"
  on public.orders
  for update
  to authenticated
  using (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','support']::text[]
    )
  )
  with check (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','support']::text[]
    )
  );

revoke all on table public.orders from anon, authenticated;
grant select, insert, update on table public.orders to authenticated;

-- ---------------------------------------------------------------------------
-- 3) SHIPMENTS
-- ---------------------------------------------------------------------------
-- Customer:
--   * may read a shipment only when it is linked to one of their orders.
-- Tenant:
--   * owner/manager/support may read/create/update shipments for own store.
--   * editor cannot access recipient phone/address/OTP/driver data.
-- Platform:
--   * Platform Admin-or-higher may operate across stores.
-- Delete:
--   * no client role receives DELETE.

drop policy if exists "Store isolated shipments" on public.shipments;
drop policy if exists "shipments_buyer_select_own" on public.shipments;
drop policy if exists "shipments_tenant_select" on public.shipments;
drop policy if exists "shipments_tenant_insert" on public.shipments;
drop policy if exists "shipments_tenant_update" on public.shipments;

create policy "shipments_buyer_select_own"
  on public.shipments
  for select
  to authenticated
  using (
    order_id is not null
    and exists (
      select 1
      from public.orders o
      where o.id = shipments.order_id
        and o.buyer_id = auth.uid()::text
    )
  );

create policy "shipments_tenant_select"
  on public.shipments
  for select
  to authenticated
  using (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','support']::text[]
    )
  );

create policy "shipments_tenant_insert"
  on public.shipments
  for insert
  to authenticated
  with check (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','support']::text[]
    )
  );

create policy "shipments_tenant_update"
  on public.shipments
  for update
  to authenticated
  using (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','support']::text[]
    )
  )
  with check (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','support']::text[]
    )
  );

revoke all on table public.shipments from anon, authenticated;
grant select, insert, update on table public.shipments to authenticated;

-- ---------------------------------------------------------------------------
-- 4) MARKETING POSTS
-- ---------------------------------------------------------------------------
-- Public:
--   * may read published posts only.
-- Tenant:
--   * every active store role may read own drafts/archived posts.
--   * owner/manager/editor may create/update/delete content.
--   * support is read-only.
-- Platform:
--   * Platform Admin-or-higher may operate across stores.

drop policy if exists "Store isolated marketing_posts" on public.marketing_posts;
drop policy if exists "marketing_posts_public_published_select" on public.marketing_posts;
drop policy if exists "marketing_posts_tenant_select" on public.marketing_posts;
drop policy if exists "marketing_posts_tenant_insert" on public.marketing_posts;
drop policy if exists "marketing_posts_tenant_update" on public.marketing_posts;
drop policy if exists "marketing_posts_tenant_delete" on public.marketing_posts;

create policy "marketing_posts_public_published_select"
  on public.marketing_posts
  for select
  to anon, authenticated
  using (
    status = 'published'
  );

create policy "marketing_posts_tenant_select"
  on public.marketing_posts
  for select
  to authenticated
  using (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','editor','support']::text[]
    )
  );

create policy "marketing_posts_tenant_insert"
  on public.marketing_posts
  for insert
  to authenticated
  with check (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','editor']::text[]
    )
  );

create policy "marketing_posts_tenant_update"
  on public.marketing_posts
  for update
  to authenticated
  using (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','editor']::text[]
    )
  )
  with check (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','editor']::text[]
    )
  );

create policy "marketing_posts_tenant_delete"
  on public.marketing_posts
  for delete
  to authenticated
  using (
    private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      store_id,
      array['owner','manager','editor']::text[]
    )
  );

revoke all on table public.marketing_posts from anon, authenticated;
grant select on table public.marketing_posts to anon;
grant select, insert, update, delete on table public.marketing_posts to authenticated;

commit;
