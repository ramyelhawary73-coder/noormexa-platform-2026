-- NOORMEXA Phase 11B — Platform Account Isolation
-- Requires: schema_phase11a_authorization_foundation.sql
--
-- Purpose:
--   * hide the Platform Super Admin account from lower-privilege identities;
--   * stop arbitrary UUID probing through public admin-role helper functions;
--   * remove Platform Admin broad read/update access to every profile;
--   * provide scoped, sanitized team/user-management RPCs;
--   * keep tenant-facing team results free of Platform accounts and user IDs.
--
-- This file is reviewed/stored on the feature branch only at this stage.
-- Do NOT apply it to Production without explicit approval.

begin;

-- ---------------------------------------------------------------------------
-- 1) Additional internal identity predicates
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

revoke all on function private.is_platform_super_admin_email(text) from public;
revoke all on function private.is_platform_super_admin_email(text) from anon;
revoke all on function private.is_platform_super_admin_email(text) from authenticated;
grant execute on function private.is_platform_super_admin_email(text) to authenticated;

comment on function private.is_platform_super_admin_email(text) is
  'Internal predicate used by RLS to hide the protected Platform Super Admin identity.';

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

revoke all on function private.is_platform_account_email(text) from public;
revoke all on function private.is_platform_account_email(text) from anon;
revoke all on function private.is_platform_account_email(text) from authenticated;

comment on function private.is_platform_account_email(text) is
  'Internal-only email predicate for excluding Platform accounts from tenant-facing team results.';

-- ---------------------------------------------------------------------------
-- 2) Stop arbitrary Platform-role probing while preserving current RLS calls
-- ---------------------------------------------------------------------------
-- Legacy RLS still calls public.is_platform_admin(auth.uid()) and
-- public.is_super_admin(auth.uid()). Until the full RLS cutover, these public
-- functions must remain callable, but they must not answer questions about
-- arbitrary user UUIDs supplied by a caller.

create or replace function public.is_platform_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    uid is not null
    and auth.uid() is not null
    and uid = auth.uid()
    and private.is_platform_admin(uid),
    false
  );
$$;

comment on function public.is_platform_admin(uuid) is
  'Compatibility predicate for current RLS. Answers only for the authenticated caller UUID; arbitrary-user probing returns false.';

create or replace function public.is_super_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select coalesce(
    uid is not null
    and auth.uid() is not null
    and uid = auth.uid()
    and private.is_platform_super_admin(uid),
    false
  );
$$;

comment on function public.is_super_admin(uuid) is
  'Compatibility predicate for current RLS. Answers only for the authenticated caller UUID; arbitrary-user probing returns false.';

-- ---------------------------------------------------------------------------
-- 3) Keep target-account protections working after self-only public helpers
-- ---------------------------------------------------------------------------

create or replace function public.protect_super_admin_store_membership()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if auth.uid() is null then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if old.user_id is not null
     and private.is_platform_super_admin(old.user_id) then
    if tg_op = 'DELETE' then
      raise exception 'Super Admin store membership is protected';
    end if;

    if new.user_id is distinct from old.user_id
       or new.status is distinct from old.status
       or new.role is distinct from old.role then
      raise exception 'Super Admin store membership is protected';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function public.remove_official_store_member_by_email(p_email text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_store_id text;
  v_target_user uuid;
begin
  if not private.is_platform_super_admin(auth.uid()) then
    raise exception 'Only Platform Super Admin can manage official-store members';
  end if;

  select id into v_store_id
    from public.stores
   where coalesce(is_official, false) = true
   order by case when id = 'store-noormexa-official' then 0 else 1 end, created_at
   limit 1;

  if v_store_id is null then
    return false;
  end if;

  select user_id into v_target_user
    from public.store_members
   where store_id = v_store_id
     and lower(email) = lower(trim(p_email))
   limit 1;

  if v_target_user is not null
     and private.is_platform_super_admin(v_target_user) then
    raise exception 'Super Admin membership cannot be removed from the app';
  end if;

  delete from public.store_members
   where store_id = v_store_id
     and lower(email) = lower(trim(p_email));

  return found;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4) Profiles: remove lower Platform Admin broad visibility / mutation
-- ---------------------------------------------------------------------------
-- Every signed-in user keeps profiles_select_own / profiles_update_own.
-- The Super Admin may still inspect/manage non-super profiles for platform
-- operations, but ordinary Platform Admin accounts no longer gain global
-- profile visibility merely because is_admin=true.

drop policy if exists "profiles_admin_select_all" on public.profiles;
drop policy if exists "profiles_admin_update_all" on public.profiles;
drop policy if exists "profiles_super_admin_select_manageable" on public.profiles;
drop policy if exists "profiles_super_admin_update_manageable" on public.profiles;

create policy "profiles_super_admin_select_manageable"
  on public.profiles
  for select
  to authenticated
  using (
    private.is_platform_super_admin(auth.uid())
    and coalesce(is_super_admin, false) = false
  );

create policy "profiles_super_admin_update_manageable"
  on public.profiles
  for update
  to authenticated
  using (
    private.is_platform_super_admin(auth.uid())
    and coalesce(is_super_admin, false) = false
  )
  with check (
    private.is_platform_super_admin(auth.uid())
    and coalesce(is_super_admin, false) = false
  );

-- Least privilege for non-DML table capabilities. RLS continues to govern
-- normal SELECT/INSERT/UPDATE/DELETE paths.
revoke truncate, references, trigger on table public.profiles from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5) store_members direct read: hide the protected Super Admin row
-- ---------------------------------------------------------------------------
-- Super Admin may inspect all memberships. Platform Admin may inspect
-- non-super memberships but never the protected developer membership.
-- Tenant users continue to see only their own direct membership row; team
-- listing for owner/manager is provided through the sanitized RPC below.

drop policy if exists "store_members_select_authorized" on public.store_members;

create policy "store_members_select_authorized"
  on public.store_members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or private.is_platform_super_admin(auth.uid())
    or (
      private.is_platform_admin(auth.uid())
      and coalesce(private.is_platform_super_admin(user_id), false) = false
      and coalesce(private.is_platform_super_admin_email(email), false) = false
    )
  );

revoke truncate, references, trigger on table public.store_members from authenticated;

-- ---------------------------------------------------------------------------
-- 6) Sanitize the existing Official Store Team RPC without breaking its API
-- ---------------------------------------------------------------------------
-- Keep the same return shape for the current UI. When the caller is a normal
-- Platform Admin, the protected Super Admin row is omitted entirely.
-- Super Admin retains full visibility inside the Platform administration plane.

create or replace function public.get_official_store_team()
returns table(
  store_id text,
  email text,
  full_name text,
  role text,
  status text,
  user_id uuid,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_caller_is_super boolean;
begin
  if not private.is_platform_admin(auth.uid()) then
    raise exception 'Platform Admin access required';
  end if;

  v_caller_is_super := private.is_platform_super_admin(auth.uid());

  return query
  select
    sm.store_id,
    sm.email,
    p.full_name,
    sm.role,
    sm.status,
    sm.user_id,
    sm.created_at
  from public.store_members sm
  join public.stores s
    on s.id = sm.store_id
   and coalesce(s.is_official, false) = true
  left join public.profiles p
    on p.id = sm.user_id
  where
    v_caller_is_super
    or (
      coalesce(private.is_platform_super_admin(sm.user_id), false) = false
      and coalesce(private.is_platform_super_admin_email(sm.email), false) = false
    )
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

revoke all on function public.get_official_store_team() from public;
revoke all on function public.get_official_store_team() from anon;
revoke all on function public.get_official_store_team() from authenticated;
grant execute on function public.get_official_store_team() to authenticated;

-- ---------------------------------------------------------------------------
-- 7) Tenant-safe team listing
-- ---------------------------------------------------------------------------
-- No auth user UUID, created_by UUID, admin flags, metadata, or Platform
-- accounts are returned. Only owner/manager in the SAME store may list that
-- tenant's team. Platform Super Admin may use the endpoint operationally, but
-- Platform accounts are still excluded from the tenant result itself.

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
    sm.id as membership_id,
    sm.email,
    p.full_name,
    sm.role,
    sm.status,
    sm.created_at
  from public.store_members sm
  left join public.profiles p
    on p.id = sm.user_id
  where sm.store_id = p_store_id
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

revoke all on function public.get_store_team(text) from public;
revoke all on function public.get_store_team(text) from anon;
revoke all on function public.get_store_team(text) from authenticated;
grant execute on function public.get_store_team(text) to authenticated;

comment on function public.get_store_team(text) is
  'Tenant-scoped team listing for owner/manager. Never returns Platform accounts, auth user IDs, created_by IDs, admin flags, or metadata.';

-- ---------------------------------------------------------------------------
-- 8) Safe Platform Admin management RPCs
-- ---------------------------------------------------------------------------
-- Only Platform Super Admin may list/grant/revoke Platform Admin accounts.
-- The protected Super Admin account is never included in the list and cannot
-- be targeted by these generic management functions.

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
  select
    p.id,
    p.email,
    p.full_name,
    p.is_admin,
    false as is_super_admin
  from public.profiles p
  where p.is_admin = true
    and p.is_super_admin = false
  order by p.created_at asc;
end;
$$;

revoke all on function public.get_manageable_platform_admins() from public;
revoke all on function public.get_manageable_platform_admins() from anon;
revoke all on function public.get_manageable_platform_admins() from authenticated;
grant execute on function public.get_manageable_platform_admins() to authenticated;

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
    raise exception 'Protected Platform Super Admin account cannot be modified by this flow';
  end if;

  update public.profiles
  set is_admin = true,
      updated_at = now()
  where id = v_target_id
    and is_super_admin = false;

  return found;
end;
$$;

revoke all on function public.grant_platform_admin_by_email(text) from public;
revoke all on function public.grant_platform_admin_by_email(text) from anon;
revoke all on function public.grant_platform_admin_by_email(text) from authenticated;
grant execute on function public.grant_platform_admin_by_email(text) to authenticated;

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
    raise exception 'Protected Platform Super Admin account cannot be modified by this flow';
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

revoke all on function public.revoke_platform_admin(uuid) from public;
revoke all on function public.revoke_platform_admin(uuid) from anon;
revoke all on function public.revoke_platform_admin(uuid) from authenticated;
grant execute on function public.revoke_platform_admin(uuid) to authenticated;

commit;
