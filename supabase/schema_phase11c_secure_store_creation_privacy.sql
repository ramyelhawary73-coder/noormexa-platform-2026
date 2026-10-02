-- NOORMEXA Phase 11C — Secure Store Creation + Public Store Privacy
-- Requires:
--   * schema_phase11a_authorization_foundation.sql
--   * schema_phase11b_platform_account_isolation.sql
--
-- This migration is prepared on the feature branch only at this stage.
-- Do NOT apply it to Production without explicit approval.
--
-- Security goals:
--   1) authenticated clients cannot INSERT directly into stores;
--   2) owner_id is always derived from auth.uid();
--   3) new tenant stores always start pending / unverified / non-official;
--   4) plan and commission cannot be chosen by the client at creation time;
--   5) only one official store can exist;
--   6) public storefront reads never expose ownership, KYC, banking,
--      commission, internal plan, or private contact fields.

begin;

-- ---------------------------------------------------------------------------
-- 1) Safe defaults — defense in depth
-- ---------------------------------------------------------------------------

alter table public.stores
  alter column status set default 'pending',
  alter column is_verified set default false,
  alter column is_official set default false,
  alter column plan set default 'professional',
  alter column commission_rate set default 8.00;

-- There must never be a second official platform store.
create unique index if not exists stores_single_official_store_idx
  on public.stores ((is_official))
  where is_official = true;

-- ---------------------------------------------------------------------------
-- 2) Harden privileged store fields on INSERT as well as UPDATE
-- ---------------------------------------------------------------------------

create or replace function public.protect_store_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  -- Trusted SQL Editor / service-role operations remain the recovery path.
  if auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Any app-originated generic store creation must be a normal tenant
    -- store owned by the authenticated caller and must start unprivileged.
    if new.owner_id is distinct from auth.uid()::text
       or coalesce(new.status, 'pending') <> 'pending'
       or coalesce(new.is_verified, false) <> false
       or coalesce(new.is_official, false) <> false
       or coalesce(new.commission_rate, 8.00) <> 8.00
       or coalesce(new.plan, 'professional') <> 'professional' then
      raise exception 'Privileged store fields cannot be supplied by the client during creation';
    end if;

    return new;
  end if;

  if new.owner_id is distinct from old.owner_id
     or new.status is distinct from old.status
     or new.is_verified is distinct from old.is_verified
     or new.is_official is distinct from old.is_official
     or new.commission_rate is distinct from old.commission_rate
     or new.plan is distinct from old.plan then
    if not private.is_platform_admin(auth.uid()) then
      raise exception 'Platform Admin approval is required for privileged store fields';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_store_privileged_fields_trigger on public.stores;
create trigger protect_store_privileged_fields_trigger
  before insert or update on public.stores
  for each row execute function public.protect_store_privileged_fields();

-- ---------------------------------------------------------------------------
-- 3) Secure generic tenant store creation
-- ---------------------------------------------------------------------------
-- This is the only application path for creating a normal customer store.
-- Privileged fields are deliberately NOT function parameters.

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

  -- A human-readable base slug is accepted as a preference only. The server
  -- normalizes it and owns collision handling.
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
        id,
        owner_id,
        name,
        slug,
        description,
        country,
        plan,
        status,
        is_verified,
        is_official,
        commission_rate,
        logo_url,
        banner_url,
        bank_name,
        iban,
        cr_number,
        tax_number,
        contact_email,
        contact_phone
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

  -- Store creation is the only generic workflow allowed to mint an owner
  -- membership. Generic invitations in later phases can never assign owner.
  insert into public.store_members (
    store_id,
    user_id,
    email,
    role,
    status,
    created_by
  )
  values (
    v_store.id,
    v_uid,
    v_auth_email,
    'owner',
    'active',
    v_uid
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
) from public;
revoke all on function public.create_store_secure(
  text, text, text, text, text, text, text, text, text, text, text, text
) from anon;
revoke all on function public.create_store_secure(
  text, text, text, text, text, text, text, text, text, text, text, text
) from authenticated;
grant execute on function public.create_store_secure(
  text, text, text, text, text, text, text, text, text, text, text, text
) to authenticated;

comment on function public.create_store_secure(
  text, text, text, text, text, text, text, text, text, text, text, text
) is
  'Creates a normal tenant store. owner_id comes from auth.uid(); privileged store fields are server-owned.';

-- Direct authenticated INSERT is no longer an application capability.
drop policy if exists "stores_authenticated_insert" on public.stores;
revoke insert on table public.stores from authenticated;
revoke insert on table public.stores from anon;

-- ---------------------------------------------------------------------------
-- 4) Remove direct public access to full store rows
-- ---------------------------------------------------------------------------
-- Approved-store visibility moves to explicit safe RPCs below. Authenticated
-- users may read a full store row only when they own/manage that store or
-- have Platform administration authority.

drop policy if exists "stores_public_or_authorized_select" on public.stores;
drop policy if exists "stores_authorized_select" on public.stores;

create policy "stores_authorized_select"
  on public.stores
  for select
  to authenticated
  using (
    owner_id = auth.uid()::text
    or private.is_platform_admin(auth.uid())
    or private.has_active_store_role(
      auth.uid(),
      id,
      array['owner','manager','editor','support']::text[]
    )
  );

revoke select on table public.stores from anon;
grant select on table public.stores to authenticated;
revoke truncate, references, trigger on table public.stores from anon, authenticated;

-- The Phase 11A invoker view cannot safely serve anonymous traffic after
-- direct public table access is removed. Replace it with explicit
-- SECURITY DEFINER RPCs that expose only approved rows and safe columns.
drop view if exists public.store_public_directory;

-- ---------------------------------------------------------------------------
-- 5) Safe public storefront surfaces
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

revoke all on function public.list_public_stores() from public;
revoke all on function public.list_public_stores() from anon;
revoke all on function public.list_public_stores() from authenticated;
grant execute on function public.list_public_stores() to anon, authenticated;

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

revoke all on function public.get_public_store_by_slug(text) from public;
revoke all on function public.get_public_store_by_slug(text) from anon;
revoke all on function public.get_public_store_by_slug(text) from authenticated;
grant execute on function public.get_public_store_by_slug(text) to anon, authenticated;

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

revoke all on function public.get_public_store_by_id(text) from public;
revoke all on function public.get_public_store_by_id(text) from anon;
revoke all on function public.get_public_store_by_id(text) from authenticated;
grant execute on function public.get_public_store_by_id(text) to anon, authenticated;

comment on function public.list_public_stores() is
  'Public approved-store directory without owner, KYC, banking, commission, plan, or private contact fields.';
comment on function public.get_public_store_by_slug(text) is
  'Public approved-store lookup by slug using storefront-safe columns only.';
comment on function public.get_public_store_by_id(text) is
  'Public approved-store lookup by id using storefront-safe columns only.';

commit;
