-- NOORMEXA Phase 11G — Final Financial + SECURITY DEFINER Cutover
-- Requires:
--   * schema_phase11h_app_compatibility_foundation.sql (applied before app deploy)
--   * schema_phase11b_platform_account_isolation.sql
--   * schema_phase11c_secure_store_creation_privacy.sql
--   * schema_phase11d_tenant_rls_cutover.sql
--   * schema_phase11e_team_management.sql
--   * schema_phase11f_seller_workspace_authority.sql
--
-- FINAL SECURITY CUTOVER. Do not apply before the compatible application is
-- deployed and runtime-tested against the additive Phase 11A + 11H surface.

begin;

-- ---------------------------------------------------------------------------
-- 1) Payment metadata integrity
-- ---------------------------------------------------------------------------

alter table public.orders
  add column if not exists payment_provider text,
  add column if not exists payment_reference text,
  add column if not exists paid_at timestamptz,
  add column if not exists shipping_speed text,
  add column if not exists checkout_reference text;

create index if not exists orders_payment_reference_idx
  on public.orders (payment_reference)
  where payment_reference is not null;

create index if not exists orders_payment_provider_reference_idx
  on public.orders (payment_provider, payment_reference)
  where payment_reference is not null;

create unique index if not exists orders_buyer_checkout_store_key
  on public.orders (buyer_id, checkout_reference, store_id)
  where checkout_reference is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_payment_provider_check'
  ) then
    alter table public.orders
      add constraint orders_payment_provider_check
      check (
        payment_provider is null
        or payment_provider in ('stripe', 'paymob')
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_shipping_speed_check'
  ) then
    alter table public.orders
      add constraint orders_shipping_speed_check
      check (
        shipping_speed is null
        or shipping_speed in ('standard', 'priority')
      );
  end if;
end;
$$;

-- Orders are created only through create_checkout_orders_secure() after 11D.
-- Browser/store sessions may update operational order status through RLS, but
-- financial/customer/payment snapshots remain server-managed.

create or replace function public.protect_order_financial_fields()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.status is distinct from old.status
     and new.status = 'paid' then
    raise exception 'Paid order status is server-managed';
  end if;

  if new.total_amount is distinct from old.total_amount
     or new.subtotal is distinct from old.subtotal
     or new.discount_amount is distinct from old.discount_amount
     or new.shipping_cost is distinct from old.shipping_cost
     or new.vat_amount is distinct from old.vat_amount
     or new.commission_amount is distinct from old.commission_amount
     or new.payment_method is distinct from old.payment_method
     or new.payment_status is distinct from old.payment_status
     or new.payment_provider is distinct from old.payment_provider
     or new.payment_reference is distinct from old.payment_reference
     or new.paid_at is distinct from old.paid_at
     or new.shipping_speed is distinct from old.shipping_speed
     or new.checkout_reference is distinct from old.checkout_reference
     or new.shipping_info is distinct from old.shipping_info
     or new.items is distinct from old.items then
    raise exception 'Order financial/payment fields are server-managed';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_order_financial_fields_trigger
  on public.orders;

create trigger protect_order_financial_fields_trigger
  before update on public.orders
  for each row execute function public.protect_order_financial_fields();

revoke all on function public.protect_order_financial_fields()
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2) Replace the last legacy stores policy that depends on public role probes
-- ---------------------------------------------------------------------------

drop policy if exists "stores_authorized_delete" on public.stores;

create policy "stores_authorized_delete"
  on public.stores
  for delete
  to authenticated
  using (
    private.is_platform_super_admin(auth.uid())
    or (
      coalesce(is_official, false) = false
      and (
        private.is_platform_admin(auth.uid())
        or owner_id = auth.uid()::text
        or private.has_active_store_role(
          auth.uid(),
          id,
          array['owner']::text[]
        )
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 3) Trigger helper search_path hardening
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4) Legacy SECURITY DEFINER least privilege
-- ---------------------------------------------------------------------------
-- Trigger/internal helpers are not application RPCs. They keep working as
-- triggers/policy internals without direct PostgREST EXECUTE grants.

revoke all on function public.decrement_product_stock(uuid, integer)
  from public, anon, authenticated;
revoke all on function public.has_store_role(uuid, text, text[])
  from public, anon, authenticated;
revoke all on function public.is_platform_admin(uuid)
  from public, anon, authenticated;
revoke all on function public.is_super_admin(uuid)
  from public, anon, authenticated;
revoke all on function public.link_pending_store_members()
  from public, anon, authenticated;
revoke all on function public.protect_admin_fields()
  from public, anon, authenticated;
revoke all on function public.protect_profile_email_identity()
  from public, anon, authenticated;
revoke all on function public.protect_store_privileged_fields()
  from public, anon, authenticated;
revoke all on function public.protect_super_admin_store_membership()
  from public, anon, authenticated;
revoke all on function public.protect_tenant_binding_fields()
  from public, anon, authenticated;
revoke all on function public.protect_platform_account_tenant_membership()
  from public, anon, authenticated;
revoke all on function public.set_updated_at()
  from public, anon, authenticated;

-- Intended public application RPCs are authenticated-only. Their own internal
-- authorization checks remain mandatory; anonymous execution is explicitly
-- denied even though PostgreSQL functions default EXECUTE to PUBLIC.

revoke all on function public.get_official_store_team()
  from public, anon, authenticated;
grant execute on function public.get_official_store_team() to authenticated;

revoke all on function public.add_official_store_member_by_email(text, text)
  from public, anon, authenticated;
grant execute on function public.add_official_store_member_by_email(text, text)
  to authenticated;

revoke all on function public.remove_official_store_member_by_email(text)
  from public, anon, authenticated;
grant execute on function public.remove_official_store_member_by_email(text)
  to authenticated;

revoke all on function public.get_manageable_platform_admins()
  from public, anon, authenticated;
grant execute on function public.get_manageable_platform_admins()
  to authenticated;

revoke all on function public.grant_platform_admin_by_email(text)
  from public, anon, authenticated;
grant execute on function public.grant_platform_admin_by_email(text)
  to authenticated;

revoke all on function public.revoke_platform_admin(uuid)
  from public, anon, authenticated;
grant execute on function public.revoke_platform_admin(uuid)
  to authenticated;

commit;
