-- NOORMEXA Phase 11H — App Compatibility Foundation
-- ADDITIVE / COMPATIBILITY ONLY.
--
-- Intended deployment position:
--   1) Phase 11A authorization foundation
--   2) THIS migration (11H)
--   3) deploy/test compatible application
--   4) only then run Security Cutover 11B -> 11G
--
-- This migration deliberately does NOT:
--   * drop legacy RLS policies;
--   * revoke legacy table DML;
--   * hide columns from the old production application;
--   * change Auth/OAuth/Secrets;
--   * delete or rewrite existing business data.
--
-- It only adds the application surfaces required by the hardened branch and
-- creates a server-authoritative checkout transaction.

begin;

-- ---------------------------------------------------------------------------
-- 1) Compatibility helpers used by new application RPCs
-- ---------------------------------------------------------------------------

create or replace function private.is_platform_super_admin_email(p_email text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    exists (
      select 1
      from public.profiles p
      where p_email is not null
        and p.email is not null
        and lower(p.email) = lower(trim(p_email))
        and p.is_super_admin = true
    ),
    false
  );
$$;

revoke all on function private.is_platform_super_admin_email(text)
  from public, anon, authenticated;
grant execute on function private.is_platform_super_admin_email(text)
  to authenticated;

create or replace function private.is_platform_account_email(p_email text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    exists (
      select 1
      from public.profiles p
      where p_email is not null
        and p.email is not null
        and lower(p.email) = lower(trim(p_email))
        and (p.is_admin = true or p.is_super_admin = true)
    ),
    false
  );
$$;

revoke all on function private.is_platform_account_email(text)
  from public, anon, authenticated;
grant execute on function private.is_platform_account_email(text)
  to authenticated;

create or replace function private.is_customer_tenant_store(p_store_id text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    exists (
      select 1
      from public.stores s
      where s.id = p_store_id
        and coalesce(s.is_official, false) = false
    ),
    false
  );
$$;

revoke all on function private.is_customer_tenant_store(text)
  from public, anon, authenticated;
grant execute on function private.is_customer_tenant_store(text)
  to authenticated;

create or replace function private.can_manage_store_role(
  p_actor_uid uuid,
  p_store_id text,
  p_target_current_role text
)
returns boolean
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_actor_role text;
begin
  if p_actor_uid is null
     or p_store_id is null
     or p_target_current_role is null then
    return false;
  end if;

  if p_target_current_role = 'owner'
     or p_target_current_role not in ('manager', 'editor', 'support') then
    return false;
  end if;

  if private.is_platform_super_admin(p_actor_uid) then
    return true;
  end if;

  v_actor_role := private.active_store_role(p_actor_uid, p_store_id);

  if v_actor_role = 'owner' then
    return p_target_current_role in ('manager', 'editor', 'support');
  end if;

  if v_actor_role = 'manager' then
    return p_target_current_role in ('editor', 'support');
  end if;

  return false;
end;
$$;

revoke all on function private.can_manage_store_role(uuid, text, text)
  from public, anon, authenticated;
grant execute on function private.can_manage_store_role(uuid, text, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 2) New application payment / checkout columns
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

-- ---------------------------------------------------------------------------
-- 3) Public store compatibility RPCs
-- ---------------------------------------------------------------------------

create or replace function public.list_public_stores()
returns table(
  id text,
  name text,
  slug text,
  description text,
  country text,
  logo_url text,
  banner_url text,
  is_verified boolean,
  is_official boolean
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    s.id,
    s.name,
    s.slug,
    s.description,
    s.country,
    s.logo_url,
    s.banner_url,
    coalesce(s.is_verified, false),
    coalesce(s.is_official, false)
  from public.stores s
  where s.status = 'approved'
  order by s.created_at asc;
$$;

revoke all on function public.list_public_stores()
  from public, anon, authenticated;
grant execute on function public.list_public_stores()
  to anon, authenticated;

create or replace function public.get_public_store_by_slug(p_slug text)
returns table(
  id text,
  name text,
  slug text,
  description text,
  country text,
  logo_url text,
  banner_url text,
  is_verified boolean,
  is_official boolean
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    s.id,
    s.name,
    s.slug,
    s.description,
    s.country,
    s.logo_url,
    s.banner_url,
    coalesce(s.is_verified, false),
    coalesce(s.is_official, false)
  from public.stores s
  where s.status = 'approved'
    and lower(s.slug) = lower(trim(p_slug))
  limit 1;
$$;

revoke all on function public.get_public_store_by_slug(text)
  from public, anon, authenticated;
grant execute on function public.get_public_store_by_slug(text)
  to anon, authenticated;

create or replace function public.get_public_store_by_id(p_store_id text)
returns table(
  id text,
  name text,
  slug text,
  description text,
  country text,
  logo_url text,
  banner_url text,
  is_verified boolean,
  is_official boolean
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    s.id,
    s.name,
    s.slug,
    s.description,
    s.country,
    s.logo_url,
    s.banner_url,
    coalesce(s.is_verified, false),
    coalesce(s.is_official, false)
  from public.stores s
  where s.status = 'approved'
    and s.id = p_store_id
  limit 1;
$$;

revoke all on function public.get_public_store_by_id(text)
  from public, anon, authenticated;
grant execute on function public.get_public_store_by_id(text)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4) Secure tenant store creation (new app path, no cutover yet)
-- ---------------------------------------------------------------------------

create or replace function public.create_store_secure(
  p_name text,
  p_slug text default null,
  p_description text default null,
  p_country text default null,
  p_cr_number text default null,
  p_tax_number text default null,
  p_bank_name text default null,
  p_iban text default null,
  p_contact_email text default null,
  p_contact_phone text default null,
  p_logo_url text default null,
  p_banner_url text default null
)
returns public.stores
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_uid uuid;
  v_auth_email text;
  v_store_id text;
  v_slug_base text;
  v_slug text;
  v_store public.stores;
  v_attempt integer;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if private.is_platform_account(v_uid) then
    raise exception 'Platform accounts cannot create customer tenant stores';
  end if;

  if p_name is null or length(trim(p_name)) < 2 then
    raise exception 'Store name is required';
  end if;

  if length(trim(p_name)) > 120 then
    raise exception 'Store name is too long';
  end if;

  select lower(u.email)
    into v_auth_email
    from auth.users u
   where u.id = v_uid
   limit 1;

  if v_auth_email is null then
    raise exception 'Authenticated email is required';
  end if;

  v_slug_base := lower(trim(coalesce(nullif(p_slug, ''), p_name)));
  v_slug_base := regexp_replace(v_slug_base, '[^[:alnum:]]+', '-', 'g');
  v_slug_base := trim(both '-' from v_slug_base);
  v_slug_base := left(v_slug_base, 80);

  if v_slug_base = '' then
    v_slug_base := 'store';
  end if;

  v_store_id := 'store-' || substr(
    md5(v_uid::text || clock_timestamp()::text || random()::text),
    1,
    24
  );

  for v_attempt in 0..4 loop
    v_slug := case
      when v_attempt = 0 then v_slug_base
      else v_slug_base || '-' || substr(
        md5(clock_timestamp()::text || random()::text || v_attempt::text),
        1,
        6
      )
    end;

    begin
      insert into public.stores (
        id, owner_id, name, slug, description, country, plan, status,
        is_verified, is_official, commission_rate, logo_url, banner_url,
        bank_name, iban, cr_number, tax_number, contact_email, contact_phone
      )
      values (
        v_store_id,
        v_uid::text,
        trim(p_name),
        v_slug,
        nullif(trim(coalesce(p_description, '')), ''),
        coalesce(nullif(trim(coalesce(p_country, '')), ''), 'المملكة العربية السعودية'),
        'professional',
        'pending',
        false,
        false,
        8.00,
        nullif(trim(coalesce(p_logo_url, '')), ''),
        nullif(trim(coalesce(p_banner_url, '')), ''),
        nullif(trim(coalesce(p_bank_name, '')), ''),
        nullif(trim(coalesce(p_iban, '')), ''),
        nullif(trim(coalesce(p_cr_number, '')), ''),
        nullif(trim(coalesce(p_tax_number, '')), ''),
        nullif(lower(trim(coalesce(p_contact_email, ''))), ''),
        nullif(trim(coalesce(p_contact_phone, '')), '')
      )
      returning * into v_store;

      exit;
    exception
      when unique_violation then
        if v_attempt = 4 then
          raise exception 'Could not allocate a unique store slug';
        end if;
    end;
  end loop;

  insert into public.store_members (
    store_id, user_id, email, role, status, created_by
  )
  values (
    v_store.id, v_uid, v_auth_email, 'owner', 'active', v_uid
  )
  on conflict (store_id, email)
  do update set
    user_id = excluded.user_id,
    role = 'owner',
    status = 'active',
    updated_at = now();

  return v_store;
end;
$$;

revoke all on function public.create_store_secure(
  text, text, text, text, text, text, text, text, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.create_store_secure(
  text, text, text, text, text, text, text, text, text, text, text, text
) to authenticated;

-- ---------------------------------------------------------------------------
-- 5) Platform-management compatibility RPCs
-- ---------------------------------------------------------------------------

create or replace function public.get_manageable_platform_admins()
returns table(
  id uuid,
  email text,
  full_name text,
  is_admin boolean,
  is_super_admin boolean
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if not private.is_platform_super_admin(auth.uid()) then
    raise exception 'Platform Super Admin access required';
  end if;

  return query
  select p.id, p.email, p.full_name, p.is_admin, false
  from public.profiles p
  where p.is_admin = true
    and p.is_super_admin = false
  order by p.created_at asc;
end;
$$;

revoke all on function public.get_manageable_platform_admins()
  from public, anon, authenticated;
grant execute on function public.get_manageable_platform_admins()
  to authenticated;

create or replace function public.grant_platform_admin_by_email(p_email text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_target_id uuid;
begin
  if not private.is_platform_super_admin(auth.uid()) then
    raise exception 'Platform Super Admin access required';
  end if;

  if p_email is null or trim(p_email) = '' then
    raise exception 'A valid email is required';
  end if;

  select p.id into v_target_id
  from public.profiles p
  where p.email is not null
    and lower(p.email) = lower(trim(p_email))
  limit 1;

  if v_target_id is null then
    return false;
  end if;

  if private.is_platform_super_admin(v_target_id) then
    raise exception 'Protected Platform Super Admin account cannot be modified';
  end if;

  update public.profiles
  set is_admin = true,
      updated_at = now()
  where id = v_target_id
    and is_super_admin = false;

  return found;
end;
$$;

revoke all on function public.grant_platform_admin_by_email(text)
  from public, anon, authenticated;
grant execute on function public.grant_platform_admin_by_email(text)
  to authenticated;

create or replace function public.revoke_platform_admin(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not private.is_platform_super_admin(auth.uid()) then
    raise exception 'Platform Super Admin access required';
  end if;

  if p_user_id is null then
    return false;
  end if;

  if private.is_platform_super_admin(p_user_id) then
    raise exception 'Protected Platform Super Admin account cannot be modified';
  end if;

  update public.profiles
  set is_admin = false,
      updated_at = now()
  where id = p_user_id
    and is_super_admin = false
    and is_admin = true;

  return found;
end;
$$;

revoke all on function public.revoke_platform_admin(uuid)
  from public, anon, authenticated;
grant execute on function public.revoke_platform_admin(uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 6) Tenant team compatibility RPCs
-- ---------------------------------------------------------------------------

create or replace function public.invite_store_member_by_email(
  p_store_id text,
  p_email text,
  p_role text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.is_customer_tenant_store(p_store_id) then
    raise exception 'Tenant team management is not available for this store';
  end if;

  if not private.can_assign_store_role(auth.uid(), p_store_id, p_role) then
    raise exception 'You cannot assign this store role';
  end if;

  v_email := lower(trim(coalesce(p_email, '')));
  if v_email = '' or position('@' in v_email) < 2 then
    raise exception 'A valid email is required';
  end if;

  if private.is_platform_account_email(v_email) then
    return true;
  end if;

  insert into public.store_members (
    store_id, user_id, email, role, status, created_by
  )
  values (
    p_store_id, null, v_email, p_role, 'pending', auth.uid()
  )
  on conflict (store_id, email)
  do update set
    role = excluded.role,
    status = case
      when public.store_members.user_id is null then 'pending'
      else public.store_members.status
    end,
    updated_at = now();

  return true;
end;
$$;

revoke all on function public.invite_store_member_by_email(text, text, text)
  from public, anon, authenticated;
grant execute on function public.invite_store_member_by_email(text, text, text)
  to authenticated;

create or replace function public.claim_my_store_invitations()
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_uid uuid;
  v_email text;
  v_count integer := 0;
begin
  v_uid := auth.uid();

  if v_uid is null or private.is_platform_account(v_uid) then
    return 0;
  end if;

  select lower(u.email)
    into v_email
    from auth.users u
   where u.id = v_uid
   limit 1;

  if v_email is null then
    return 0;
  end if;

  update public.store_members sm
     set user_id = v_uid,
         status = 'active',
         updated_at = now()
   where sm.user_id is null
     and sm.status = 'pending'
     and lower(sm.email) = v_email
     and private.is_customer_tenant_store(sm.store_id)
     and not exists (
       select 1
       from public.store_members existing
       where existing.store_id = sm.store_id
         and existing.user_id = v_uid
     );

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.claim_my_store_invitations()
  from public, anon, authenticated;
grant execute on function public.claim_my_store_invitations()
  to authenticated;

create or replace function public.get_store_team(p_store_id text)
returns table(
  membership_id uuid,
  email text,
  full_name text,
  role text,
  status text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.is_customer_tenant_store(p_store_id) then
    raise exception 'Tenant team management is not available for this store';
  end if;

  if not private.is_platform_super_admin(auth.uid())
     and not private.has_active_store_role(
       auth.uid(),
       p_store_id,
       array['owner','manager']::text[]
     ) then
    raise exception 'Store owner or manager access required';
  end if;

  return query
  select
    sm.id,
    sm.email,
    p.full_name,
    sm.role,
    sm.status,
    sm.created_at
  from public.store_members sm
  left join public.profiles p on p.id = sm.user_id
  where sm.store_id = p_store_id
    and sm.status = 'active'
    and sm.user_id is not null
    and coalesce(private.is_platform_account(sm.user_id), false) = false
    and coalesce(private.is_platform_account_email(sm.email), false) = false
  order by
    case sm.role
      when 'owner' then 0
      when 'manager' then 1
      when 'editor' then 2
      else 3
    end,
    sm.created_at;
end;
$$;

revoke all on function public.get_store_team(text)
  from public, anon, authenticated;
grant execute on function public.get_store_team(text)
  to authenticated;

create or replace function public.update_store_member_role(
  p_store_id text,
  p_membership_id uuid,
  p_role text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_target public.store_members;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.is_customer_tenant_store(p_store_id) then
    raise exception 'Tenant team management is not available for this store';
  end if;

  select sm.*
    into v_target
    from public.store_members sm
   where sm.id = p_membership_id
     and sm.store_id = p_store_id
   limit 1;

  if not found then
    return false;
  end if;

  if v_target.role = 'owner'
     or v_target.user_id = auth.uid()
     or (v_target.user_id is not null and private.is_platform_account(v_target.user_id))
     or private.is_platform_account_email(v_target.email) then
    raise exception 'This membership cannot be modified through the tenant flow';
  end if;

  if not private.can_manage_store_role(
    auth.uid(), p_store_id, v_target.role
  ) then
    raise exception 'You cannot manage this member';
  end if;

  if not private.can_assign_store_role(
    auth.uid(), p_store_id, p_role
  ) then
    raise exception 'You cannot assign this store role';
  end if;

  update public.store_members
     set role = p_role,
         updated_at = now()
   where id = p_membership_id
     and store_id = p_store_id;

  return found;
end;
$$;

revoke all on function public.update_store_member_role(text, uuid, text)
  from public, anon, authenticated;
grant execute on function public.update_store_member_role(text, uuid, text)
  to authenticated;

create or replace function public.remove_store_member(
  p_store_id text,
  p_membership_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_target public.store_members;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.is_customer_tenant_store(p_store_id) then
    raise exception 'Tenant team management is not available for this store';
  end if;

  select sm.*
    into v_target
    from public.store_members sm
   where sm.id = p_membership_id
     and sm.store_id = p_store_id
   limit 1;

  if not found then
    return false;
  end if;

  if v_target.role = 'owner'
     or v_target.user_id = auth.uid()
     or (v_target.user_id is not null and private.is_platform_account(v_target.user_id))
     or private.is_platform_account_email(v_target.email) then
    raise exception 'This membership cannot be removed through the tenant flow';
  end if;

  if not private.can_manage_store_role(
    auth.uid(), p_store_id, v_target.role
  ) then
    raise exception 'You cannot remove this member';
  end if;

  delete from public.store_members
   where id = p_membership_id
     and store_id = p_store_id;

  return found;
end;
$$;

revoke all on function public.remove_store_member(text, uuid)
  from public, anon, authenticated;
grant execute on function public.remove_store_member(text, uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 7) Seller workspace compatibility RPCs
-- ---------------------------------------------------------------------------

create or replace function public.get_my_tenant_stores()
returns table(
  id text,
  owner_id text,
  name text,
  slug text,
  description text,
  country text,
  plan text,
  status text,
  is_verified boolean,
  is_official boolean,
  commission_rate numeric,
  logo_url text,
  banner_url text,
  created_at timestamptz,
  membership_role text
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    s.id,
    s.owner_id,
    s.name,
    s.slug,
    s.description,
    s.country,
    s.plan,
    s.status,
    coalesce(s.is_verified, false),
    false,
    s.commission_rate,
    s.logo_url,
    s.banner_url,
    s.created_at,
    sm.role
  from public.store_members sm
  join public.stores s on s.id = sm.store_id
  where sm.user_id = auth.uid()
    and sm.status = 'active'
    and coalesce(s.is_official, false) = false
    and coalesce(private.is_platform_account(sm.user_id), false) = false
  order by sm.created_at asc;
$$;

revoke all on function public.get_my_tenant_stores()
  from public, anon, authenticated;
grant execute on function public.get_my_tenant_stores()
  to authenticated;

create or replace function public.get_my_store_private_settings(p_store_id text)
returns table(
  contact_email text,
  contact_phone text,
  cr_number text,
  tax_number text,
  bank_name text,
  iban text
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.is_customer_tenant_store(p_store_id) then
    raise exception 'Private tenant settings are not available for this store';
  end if;

  if not private.has_active_store_role(
    auth.uid(),
    p_store_id,
    array['owner','manager']::text[]
  ) then
    raise exception 'Store owner or manager access required';
  end if;

  return query
  select
    s.contact_email,
    s.contact_phone,
    s.cr_number,
    s.tax_number,
    s.bank_name,
    s.iban
  from public.stores s
  where s.id = p_store_id
    and coalesce(s.is_official, false) = false
  limit 1;
end;
$$;

revoke all on function public.get_my_store_private_settings(text)
  from public, anon, authenticated;
grant execute on function public.get_my_store_private_settings(text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 8) Atomic server-authoritative checkout core
-- ---------------------------------------------------------------------------
-- Client input contains product ids + quantities + cosmetic variant labels.
-- Price, store, store name, buyer, commission, stock, order/payment state,
-- VAT, discount and shipping totals are all derived inside PostgreSQL.
--
-- Current authoritative checkout constants preserve existing NOORMEXA behavior:
--   VAT: 14%
--   standard shipping: 50 EGP
--   priority shipping: 120 EGP
--   free standard shipping threshold: 1500 EGP
--   supported promos: NOOR10, WELCOME20, GLOBAL15, FREESHIP
--
-- The legacy public.order_items table is intentionally NOT written. The
-- canonical Phase 11 order line snapshot is public.orders.items JSONB.

create or replace function private.create_checkout_orders_core(
  p_items jsonb,
  p_shipping_info jsonb,
  p_shipping_speed text,
  p_payment_method text,
  p_promo_code text,
  p_checkout_reference text
)
returns setof public.orders
language plpgsql
volatile
security definer
set search_path = pg_catalog, public, private, auth
as $$
declare
  v_uid uuid;
  v_auth_email text;
  v_checkout_reference text;
  v_line_count integer;
  v_distinct_products integer;
  v_updated_products integer;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_shipping numeric := 0;
  v_vat numeric := 0;
  v_promo text;
  v_shipping_info jsonb;
  v_store record;
  v_store_count integer := 0;
  v_store_index integer := 0;
  v_ratio numeric;
  v_store_discount numeric;
  v_store_shipping numeric;
  v_store_vat numeric;
  v_remaining_discount numeric;
  v_remaining_shipping numeric;
  v_remaining_vat numeric;
  v_store_items jsonb;
  v_order public.orders;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) < 1
     or jsonb_array_length(p_items) > 50 then
    raise exception 'Checkout items are invalid';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) item
    where jsonb_typeof(item) <> 'object'
       or coalesce(trim(item->>'product_id'), '') = ''
       or length(trim(item->>'product_id')) > 128
       or coalesce(item->>'quantity', '') !~ '^[1-9][0-9]?$'
  ) then
    raise exception 'Checkout item payload is invalid';
  end if;

  if p_shipping_speed not in ('standard', 'priority') then
    raise exception 'Unsupported shipping speed';
  end if;

  if p_payment_method not in ('cod', 'stripe', 'applePayMada') then
    raise exception 'Unsupported payment method';
  end if;

  v_checkout_reference := trim(coalesce(p_checkout_reference, ''));
  if length(v_checkout_reference) < 16 or length(v_checkout_reference) > 80 then
    raise exception 'Invalid checkout reference';
  end if;

  select lower(u.email)
    into v_auth_email
    from auth.users u
   where u.id = v_uid
   limit 1;

  if v_auth_email is null then
    raise exception 'Authenticated email is required';
  end if;

  if p_shipping_info is null or jsonb_typeof(p_shipping_info) <> 'object' then
    raise exception 'Shipping information is required';
  end if;

  if length(trim(coalesce(p_shipping_info->>'fullName', ''))) < 2
     or length(trim(coalesce(p_shipping_info->>'phone', ''))) < 5
     or length(trim(coalesce(p_shipping_info->>'country', ''))) < 2
     or length(trim(coalesce(p_shipping_info->>'city', ''))) < 2
     or length(trim(coalesce(p_shipping_info->>'address', ''))) < 5 then
    raise exception 'Shipping information is incomplete';
  end if;

  v_shipping_info := jsonb_build_object(
    'fullName', left(trim(p_shipping_info->>'fullName'), 120),
    'email', v_auth_email,
    'phone', left(trim(p_shipping_info->>'phone'), 40),
    'country', left(trim(p_shipping_info->>'country'), 120),
    'state', left(trim(coalesce(p_shipping_info->>'state', '')), 120),
    'region', left(trim(coalesce(p_shipping_info->>'region', '')), 120),
    'city', left(trim(p_shipping_info->>'city'), 120),
    'address', left(trim(p_shipping_info->>'address'), 500),
    'postalCode', left(trim(coalesce(p_shipping_info->>'postalCode', '')), 40),
    'notes', left(trim(coalesce(p_shipping_info->>'notes', '')), 500)
  );

  -- Idempotent retry: once this checkout reference exists for this buyer,
  -- return the existing authoritative orders without touching stock again.
  if exists (
    select 1
    from public.orders o
    where o.buyer_id = v_uid::text
      and o.checkout_reference = v_checkout_reference
  ) then
    return query
    select o.*
    from public.orders o
    where o.buyer_id = v_uid::text
      and o.checkout_reference = v_checkout_reference
    order by o.created_at, o.id;
    return;
  end if;

  select count(*), count(distinct trim(item->>'product_id'))
    into v_line_count, v_distinct_products
  from jsonb_array_elements(p_items) item;

  -- Atomic stock reservation/decrement. If any product is unavailable,
  -- inactive, belongs to an unapproved store, has invalid price, or lacks
  -- enough stock, row_count differs and the raised exception rolls back every
  -- stock change made by this statement.
  with requested as (
    select
      trim(item->>'product_id') as product_id,
      (item->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items) item
  ),
  aggregated as (
    select product_id, sum(quantity)::integer as quantity
    from requested
    group by product_id
  )
  update public.products p
     set stock = p.stock - a.quantity,
         status = case
           when p.stock - a.quantity = 0 then 'out_of_stock'
           else p.status
         end,
         updated_at = now()
    from aggregated a
   where p.id = a.product_id
     and p.status = 'active'
     and p.price is not null
     and p.price > 0
     and p.stock >= a.quantity
     and exists (
       select 1
       from public.stores s
       where s.id = p.store_id
         and s.status = 'approved'
     );

  get diagnostics v_updated_products = row_count;

  if v_updated_products <> v_distinct_products then
    raise exception 'One or more products are unavailable or have insufficient stock';
  end if;

  with requested as (
    select
      trim(item->>'product_id') as product_id,
      (item->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items) item
  )
  select round(sum(p.price * r.quantity), 2)
    into v_subtotal
  from requested r
  join public.products p on p.id = r.product_id;

  if v_subtotal is null or v_subtotal <= 0 then
    raise exception 'Checkout subtotal is invalid';
  end if;

  v_promo := upper(trim(coalesce(p_promo_code, '')));

  if v_promo = '' then
    v_discount := 0;
  elsif v_promo = 'NOOR10' then
    v_discount := round(v_subtotal * 0.10, 2);
  elsif v_promo = 'WELCOME20' then
    if v_subtotal < 500 then
      raise exception 'WELCOME20 requires a minimum subtotal of 500 EGP';
    end if;
    v_discount := round(v_subtotal * 0.20, 2);
  elsif v_promo = 'GLOBAL15' then
    v_discount := round(v_subtotal * 0.15, 2);
  elsif v_promo = 'FREESHIP' then
    v_discount := 0;
  else
    raise exception 'Invalid promo code';
  end if;

  if v_subtotal >= 1500 or v_promo = 'FREESHIP' then
    v_shipping := case when p_shipping_speed = 'priority' then 70 else 0 end;
  else
    v_shipping := case when p_shipping_speed = 'priority' then 120 else 50 end;
  end if;

  v_vat := round(greatest(v_subtotal - v_discount, 0) * 0.14, 2);

  with requested as (
    select trim(item->>'product_id') as product_id
    from jsonb_array_elements(p_items) item
  )
  select count(distinct p.store_id)
    into v_store_count
  from requested r
  join public.products p on p.id = r.product_id;

  if v_store_count < 1 then
    raise exception 'No valid stores found for checkout';
  end if;

  v_remaining_discount := v_discount;
  v_remaining_shipping := v_shipping;
  v_remaining_vat := v_vat;

  for v_store in
    with requested as (
      select
        trim(item->>'product_id') as product_id,
        (item->>'quantity')::integer as quantity
      from jsonb_array_elements(p_items) item
    )
    select
      p.store_id,
      s.name as store_name,
      coalesce(s.commission_rate, 8.00) as commission_rate,
      round(sum(p.price * r.quantity), 2) as store_subtotal
    from requested r
    join public.products p on p.id = r.product_id
    join public.stores s on s.id = p.store_id
    group by p.store_id, s.name, s.commission_rate
    order by p.store_id
  loop
    v_store_index := v_store_index + 1;
    v_ratio := v_store.store_subtotal / v_subtotal;

    if v_store_index = v_store_count then
      v_store_discount := v_remaining_discount;
      v_store_shipping := v_remaining_shipping;
      v_store_vat := v_remaining_vat;
    else
      v_store_discount := round(v_discount * v_ratio, 2);
      v_store_shipping := round(v_shipping * v_ratio, 2);
      v_store_vat := round(v_vat * v_ratio, 2);

      v_remaining_discount := v_remaining_discount - v_store_discount;
      v_remaining_shipping := v_remaining_shipping - v_store_shipping;
      v_remaining_vat := v_remaining_vat - v_store_vat;
    end if;

    with requested as (
      select
        trim(item->>'product_id') as product_id,
        (item->>'quantity')::integer as quantity,
        left(nullif(trim(coalesce(item->>'selected_variants_label', '')), ''), 200)
          as selected_variants_label
      from jsonb_array_elements(p_items) item
    )
    select jsonb_agg(
      jsonb_build_object(
        'id', 'item-' || replace(gen_random_uuid()::text, '-', ''),
        'product_id', p.id,
        'product_name', p.name,
        'quantity', r.quantity,
        'unit_price', p.price,
        'selected_variants_label', r.selected_variants_label,
        'image_url', p.image_url
      )
      order by p.id, r.selected_variants_label nulls first
    )
      into v_store_items
    from requested r
    join public.products p on p.id = r.product_id
    where p.store_id = v_store.store_id;

    insert into public.orders (
      id,
      order_number,
      tracking_number,
      buyer_id,
      store_id,
      store_name,
      subtotal,
      discount_amount,
      shipping_cost,
      vat_amount,
      total_amount,
      commission_amount,
      status,
      payment_method,
      payment_status,
      shipping_info,
      items,
      shipping_speed,
      checkout_reference,
      payment_provider,
      payment_reference,
      paid_at
    )
    values (
      'ord-' || replace(gen_random_uuid()::text, '-', ''),
      'NRX-' || to_char(current_date, 'YYYY') || '-' ||
        upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
      'TRK-NRX-' ||
        upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
      v_uid::text,
      v_store.store_id,
      v_store.store_name,
      v_store.store_subtotal,
      v_store_discount,
      v_store_shipping,
      v_store_vat,
      round(
        greatest(
          v_store.store_subtotal - v_store_discount +
          v_store_shipping + v_store_vat,
          0
        ),
        2
      ),
      round(v_store.store_subtotal * v_store.commission_rate / 100, 2),
      'pending',
      p_payment_method,
      'pending',
      v_shipping_info,
      coalesce(v_store_items, '[]'::jsonb),
      p_shipping_speed,
      v_checkout_reference,
      null,
      null,
      null
    )
    returning * into v_order;

    return next v_order;
  end loop;

  return;
end;
$$;

revoke all on function private.create_checkout_orders_core(
  jsonb, jsonb, text, text, text, text
) from public, anon, authenticated;
grant execute on function private.create_checkout_orders_core(
  jsonb, jsonb, text, text, text, text
) to authenticated;

create or replace function public.create_checkout_orders_secure(
  p_items jsonb,
  p_shipping_info jsonb,
  p_shipping_speed text default 'standard',
  p_payment_method text default 'cod',
  p_promo_code text default null,
  p_checkout_reference text default null
)
returns setof public.orders
language sql
volatile
security invoker
set search_path = pg_catalog, public, private
as $$
  select *
  from private.create_checkout_orders_core(
    p_items,
    p_shipping_info,
    p_shipping_speed,
    p_payment_method,
    p_promo_code,
    p_checkout_reference
  );
$$;

revoke all on function public.create_checkout_orders_secure(
  jsonb, jsonb, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.create_checkout_orders_secure(
  jsonb, jsonb, text, text, text, text
) to authenticated;

comment on function public.create_checkout_orders_secure(
  jsonb, jsonb, text, text, text, text
) is
  'Authenticated checkout entrypoint. Client supplies product IDs/quantities only; PostgreSQL owns buyer, prices, store grouping, stock, commission, totals and payment state.';

commit;
