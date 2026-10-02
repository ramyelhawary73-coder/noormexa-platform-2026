-- NOORMEXA Phase 11A — Tenant Authorization Foundation
-- Additive foundation only. This migration intentionally does NOT:
--   * drop or replace existing RLS policies;
--   * change profiles.is_admin / profiles.is_super_admin values;
--   * change Auth, OAuth, Secrets, Site URL, products, orders, or live tenant data;
--   * grant generic tenant roles any Platform-level privilege.
--
-- Intended rollout:
--   1) review this file on a feature branch;
--   2) add Platform-account isolation and tenant RLS in later reviewed phases;
--   3) apply to Production only after explicit approval.
--
-- Fixed tenant RBAC for the first production release:
--   owner   -> may manage manager/editor/support
--   manager -> may manage editor/support
--   editor  -> cannot manage team roles
--   support -> cannot manage team roles
--
-- Generic tenant flows must never grant "owner", Platform Admin, or
-- Platform Super Admin. Ownership transfer, if ever needed, requires a
-- separate privileged workflow.

begin;

-- ---------------------------------------------------------------------------
-- 1) Internal authorization schema
-- ---------------------------------------------------------------------------
-- Keep policy/helper internals outside the exposed public API schema.
create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

-- RLS policies execute as the requesting database role. Authenticated users
-- therefore need USAGE on this non-exposed schema plus EXECUTE only on the
-- exact predicates used by RLS. The schema itself is not an exposed PostgREST
-- API surface and anon remains denied.
grant usage on schema private to authenticated;

comment on schema private is
  'NOORMEXA internal authorization helpers for RLS/server-side policy checks; not an exposed application API.';

-- ---------------------------------------------------------------------------
-- 2) Platform-plane helpers
-- ---------------------------------------------------------------------------

create or replace function private.is_platform_super_admin(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    (
      select p.is_super_admin
      from public.profiles p
      where p.id = p_uid
    ),
    false
  );
$$;

revoke all on function private.is_platform_super_admin(uuid) from public;
revoke all on function private.is_platform_super_admin(uuid) from anon;
revoke all on function private.is_platform_super_admin(uuid) from authenticated;
grant execute on function private.is_platform_super_admin(uuid) to authenticated;

comment on function private.is_platform_super_admin(uuid) is
  'Internal check for the single Platform Super Admin plane.';

create or replace function private.is_platform_admin(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    (
      select (p.is_admin or p.is_super_admin)
      from public.profiles p
      where p.id = p_uid
    ),
    false
  );
$$;

revoke all on function private.is_platform_admin(uuid) from public;
revoke all on function private.is_platform_admin(uuid) from anon;
revoke all on function private.is_platform_admin(uuid) from authenticated;
grant execute on function private.is_platform_admin(uuid) to authenticated;

comment on function private.is_platform_admin(uuid) is
  'Internal Platform Admin-or-higher check. Not a tenant role.';

create or replace function private.is_platform_account(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    (
      select (p.is_admin or p.is_super_admin)
      from public.profiles p
      where p.id = p_uid
    ),
    false
  );
$$;

revoke all on function private.is_platform_account(uuid) from public;
revoke all on function private.is_platform_account(uuid) from anon;
revoke all on function private.is_platform_account(uuid) from authenticated;
grant execute on function private.is_platform_account(uuid) to authenticated;

comment on function private.is_platform_account(uuid) is
  'Internal predicate used to exclude Platform accounts from tenant-facing user surfaces.';

-- ---------------------------------------------------------------------------
-- 3) Tenant/store membership helpers
-- ---------------------------------------------------------------------------

create or replace function private.active_store_role(
  p_uid uuid,
  p_store_id text
)
returns text
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select sm.role
  from public.store_members sm
  where sm.user_id = p_uid
    and sm.store_id = p_store_id
    and sm.status = 'active'
  limit 1;
$$;

revoke all on function private.active_store_role(uuid, text) from public;
revoke all on function private.active_store_role(uuid, text) from anon;
revoke all on function private.active_store_role(uuid, text) from authenticated;
grant execute on function private.active_store_role(uuid, text) to authenticated;

comment on function private.active_store_role(uuid, text) is
  'Returns the active tenant role for one user in one store, or null.';

create or replace function private.has_active_store_role(
  p_uid uuid,
  p_store_id text,
  p_allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    exists (
      select 1
      from public.store_members sm
      where sm.user_id = p_uid
        and sm.store_id = p_store_id
        and sm.status = 'active'
        and sm.role = any(p_allowed_roles)
    ),
    false
  );
$$;

revoke all on function private.has_active_store_role(uuid, text, text[]) from public;
revoke all on function private.has_active_store_role(uuid, text, text[]) from anon;
revoke all on function private.has_active_store_role(uuid, text, text[]) from authenticated;
grant execute on function private.has_active_store_role(uuid, text, text[]) to authenticated;

comment on function private.has_active_store_role(uuid, text, text[]) is
  'Internal tenant-role predicate for later RLS policies.';

create or replace function private.store_role_rank(p_role text)
returns smallint
language sql
immutable
security invoker
set search_path = pg_catalog
as $$
  select case p_role
    when 'owner' then 40
    when 'manager' then 30
    when 'editor' then 20
    when 'support' then 10
    else 0
  end::smallint;
$$;

revoke all on function private.store_role_rank(text) from public;
revoke all on function private.store_role_rank(text) from anon;
revoke all on function private.store_role_rank(text) from authenticated;

comment on function private.store_role_rank(text) is
  'Internal fixed hierarchy. Higher rank never implies Platform privilege.';

create or replace function private.can_assign_store_role(
  p_actor_uid uuid,
  p_store_id text,
  p_target_role text
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
  if p_actor_uid is null or p_store_id is null or p_target_role is null then
    return false;
  end if;

  -- Generic tenant invitations may never grant ownership.
  -- Platform roles do not exist in store_members and are rejected implicitly.
  if p_target_role not in ('manager', 'editor', 'support') then
    return false;
  end if;

  -- Platform Super Admin can operate tenant teams without creating a
  -- tenant role above the allowed generic invitation ceiling.
  if private.is_platform_super_admin(p_actor_uid) then
    return true;
  end if;

  v_actor_role := private.active_store_role(p_actor_uid, p_store_id);

  if v_actor_role = 'owner' then
    return p_target_role in ('manager', 'editor', 'support');
  end if;

  if v_actor_role = 'manager' then
    return p_target_role in ('editor', 'support');
  end if;

  return false;
end;
$$;

revoke all on function private.can_assign_store_role(uuid, text, text) from public;
revoke all on function private.can_assign_store_role(uuid, text, text) from anon;
revoke all on function private.can_assign_store_role(uuid, text, text) from authenticated;

comment on function private.can_assign_store_role(uuid, text, text) is
  'Enforces NOORMEXA tenant invitation ceiling: owner->manager/editor/support; manager->editor/support only.';

-- ---------------------------------------------------------------------------
-- 4) Safe self-membership application surface
-- ---------------------------------------------------------------------------
-- These functions intentionally return no other user_id, Platform role flag,
-- metadata, or cross-tenant member information. They run as the caller and
-- therefore remain constrained by table RLS.

create or replace function public.get_my_store_memberships()
returns table (
  store_id text,
  store_name text,
  store_slug text,
  role text,
  status text,
  is_official boolean,
  is_verified boolean
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select
    sm.store_id,
    s.name as store_name,
    s.slug as store_slug,
    sm.role,
    sm.status,
    coalesce(s.is_official, false) as is_official,
    coalesce(s.is_verified, false) as is_verified
  from public.store_members sm
  join public.stores s on s.id = sm.store_id
  where sm.user_id = auth.uid()
  order by sm.created_at asc;
$$;

revoke all on function public.get_my_store_memberships() from public;
revoke all on function public.get_my_store_memberships() from anon;
revoke all on function public.get_my_store_memberships() from authenticated;
grant execute on function public.get_my_store_memberships() to authenticated;

comment on function public.get_my_store_memberships() is
  'Returns only the authenticated user own store memberships; no other member or Platform account identity.';

create or replace function public.get_my_store_role(p_store_id text)
returns text
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select sm.role
  from public.store_members sm
  where sm.store_id = p_store_id
    and sm.user_id = auth.uid()
    and sm.status = 'active'
  limit 1;
$$;

revoke all on function public.get_my_store_role(text) from public;
revoke all on function public.get_my_store_role(text) from anon;
revoke all on function public.get_my_store_role(text) from authenticated;
grant execute on function public.get_my_store_role(text) to authenticated;

comment on function public.get_my_store_role(text) is
  'Returns the caller active role only for the requested store.';

-- ---------------------------------------------------------------------------
-- 5) Safe public-store projection
-- ---------------------------------------------------------------------------
-- Public storefront code must migrate away from stores.select('*').
-- This projection deliberately excludes:
-- owner_id, plan, commission_rate, bank_name, iban, cr_number, tax_number,
-- contact_email, contact_phone, and other private/internal fields.
--
-- SECURITY INVOKER keeps underlying stores RLS effective.

create or replace view public.store_public_directory
with (security_invoker = true)
as
select
  s.id,
  s.name,
  s.slug,
  s.description,
  s.country,
  s.logo_url,
  s.banner_url,
  coalesce(s.is_verified, false) as is_verified,
  coalesce(s.is_official, false) as is_official
from public.stores s
where s.status = 'approved';

revoke all on table public.store_public_directory from public;
revoke all on table public.store_public_directory from anon;
revoke all on table public.store_public_directory from authenticated;
grant select on table public.store_public_directory to anon, authenticated;

comment on view public.store_public_directory is
  'Safe public NOORMEXA store projection. Contains storefront fields only; excludes ownership, KYC, banking, commission, and internal plan data.';

commit;
