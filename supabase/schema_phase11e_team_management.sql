-- NOORMEXA Phase 11E — Tenant Team Management + Invite Flow
-- Requires:
--   * schema_phase11a_authorization_foundation.sql
--   * schema_phase11b_platform_account_isolation.sql
--   * schema_phase11c_secure_store_creation_privacy.sql
--
-- Prepared on the feature branch only. DO NOT apply to Production without
-- explicit approval.
--
-- Tenant team policy:
--   owner   -> may invite/manage manager, editor, support
--   manager -> may invite/manage editor, support
--   editor  -> no team-management capability
--   support -> no team-management capability
--
-- Generic tenant team flows:
--   * never grant owner;
--   * never grant Platform Admin / Platform Super Admin;
--   * never operate on the official NOORMEXA store;
--   * never expose auth user IDs, created_by, admin flags, or metadata;
--   * never reveal whether an invited email belongs to a Platform account.

begin;

-- ---------------------------------------------------------------------------
-- 1) Internal team-management predicates
-- ---------------------------------------------------------------------------

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

revoke all on function private.is_customer_tenant_store(text) from public;
revoke all on function private.is_customer_tenant_store(text) from anon;
revoke all on function private.is_customer_tenant_store(text) from authenticated;

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

  -- Ownership is never editable/removable through the generic team flow.
  if p_target_current_role = 'owner' then
    return false;
  end if;

  if p_target_current_role not in ('manager', 'editor', 'support') then
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

revoke all on function private.can_manage_store_role(uuid, text, text) from public;
revoke all on function private.can_manage_store_role(uuid, text, text) from anon;
revoke all on function private.can_manage_store_role(uuid, text, text) from authenticated;

comment on function private.can_manage_store_role(uuid, text, text) is
  'Internal current-role ceiling for tenant member update/removal. Owner rows are never manageable through the generic flow.';

-- ---------------------------------------------------------------------------
-- 2) Platform accounts cannot become customer-tenant members
-- ---------------------------------------------------------------------------

create or replace function public.protect_platform_account_tenant_membership()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.user_id is null then
    return new;
  end if;

  if private.is_platform_account(new.user_id)
     and private.is_customer_tenant_store(new.store_id) then
    raise exception 'Platform accounts cannot join customer tenant stores';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_platform_account_tenant_membership_trigger
  on public.store_members;
create trigger protect_platform_account_tenant_membership_trigger
  before insert or update of user_id, store_id on public.store_members
  for each row execute function public.protect_platform_account_tenant_membership();

revoke all on function public.protect_platform_account_tenant_membership()
  from public;
revoke all on function public.protect_platform_account_tenant_membership()
  from anon;
revoke all on function public.protect_platform_account_tenant_membership()
  from authenticated;

-- ---------------------------------------------------------------------------
-- 3) Generic invitation — always pending, never account-existence probing
-- ---------------------------------------------------------------------------
-- The inviter never receives user_id or information about whether the email is
-- registered. Normal invitations remain pending until the target account claims
-- them. If the email belongs to a Platform account, the function returns the
-- same success result but stores nothing, preventing a Platform identity from
-- appearing in tenant data.

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
  v_existing public.store_members;
  v_actor_email text;
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
  if v_email = ''
     or position('@' in v_email) < 2
     or length(v_email) > 320 then
    raise exception 'A valid email is required';
  end if;

  select lower(u.email)
    into v_actor_email
    from auth.users u
   where u.id = auth.uid()
   limit 1;

  if v_actor_email is not null and v_email = v_actor_email then
    raise exception 'You cannot invite your own account';
  end if;

  -- Do not persist or disclose Platform-account email membership attempts.
  -- The result deliberately matches a normal accepted invitation.
  if private.is_platform_account_email(v_email) then
    return true;
  end if;

  select sm.*
    into v_existing
    from public.store_members sm
   where sm.store_id = p_store_id
     and lower(sm.email) = v_email
   limit 1;

  if found then
    if v_existing.role = 'owner'
       or not private.can_manage_store_role(
         auth.uid(),
         p_store_id,
         v_existing.role
       ) then
      raise exception 'This membership cannot be managed by your role';
    end if;

    if v_existing.user_id is not null
       and v_existing.status = 'active' then
      raise exception 'This user is already an active store member';
    end if;

    update public.store_members
       set role = p_role,
           user_id = null,
           status = 'pending',
           created_by = auth.uid(),
           updated_at = now()
     where id = v_existing.id;

    return true;
  end if;

  insert into public.store_members (
    store_id,
    user_id,
    email,
    role,
    status,
    created_by
  )
  values (
    p_store_id,
    null,
    v_email,
    p_role,
    'pending',
    auth.uid()
  );

  return true;
end;
$$;

revoke all on function public.invite_store_member_by_email(text, text, text)
  from public;
revoke all on function public.invite_store_member_by_email(text, text, text)
  from anon;
revoke all on function public.invite_store_member_by_email(text, text, text)
  from authenticated;
grant execute on function public.invite_store_member_by_email(text, text, text)
  to authenticated;

comment on function public.invite_store_member_by_email(text, text, text) is
  'Tenant-scoped invitation. Always creates a pending non-owner role and does not disclose account existence or Platform identity.';

-- ---------------------------------------------------------------------------
-- 4) Invitation claim — only the invited authenticated account can claim
-- ---------------------------------------------------------------------------

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

  if v_uid is null then
    return 0;
  end if;

  -- Platform accounts are never linked into customer tenants.
  if private.is_platform_account(v_uid) then
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

revoke all on function public.claim_my_store_invitations() from public;
revoke all on function public.claim_my_store_invitations() from anon;
revoke all on function public.claim_my_store_invitations() from authenticated;
grant execute on function public.claim_my_store_invitations() to authenticated;

comment on function public.claim_my_store_invitations() is
  'Claims pending customer-tenant invitations matching the authenticated auth.users email. Platform accounts always receive zero claims.';

-- The old profile trigger is kept only for the dedicated official-store flow.
-- Customer-tenant invitations must be claimed through the caller-safe RPC above.
create or replace function public.link_pending_store_members()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_auth_email text;
begin
  if private.is_platform_super_admin(new.id) then
    return new;
  end if;

  select lower(u.email)
    into v_auth_email
    from auth.users u
   where u.id = new.id
   limit 1;

  if v_auth_email is null
     or new.email is null
     or lower(new.email) <> v_auth_email then
    return new;
  end if;

  update public.store_members sm
     set user_id = new.id,
         status = case
           when sm.status = 'disabled' then sm.status
           else 'active'
         end,
         updated_at = now()
    from public.stores s
   where sm.store_id = s.id
     and coalesce(s.is_official, false) = true
     and lower(sm.email) = v_auth_email
     and (sm.user_id is null or sm.user_id = new.id);

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5) Tenant-safe team listing — ACTIVE MEMBERS ONLY
-- ---------------------------------------------------------------------------
-- Pending invitations are intentionally not listed. This prevents the team API
-- from becoming an account-existence side channel. Once the invited user claims
-- the invitation, the active member appears.

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

revoke all on function public.get_store_team(text) from public;
revoke all on function public.get_store_team(text) from anon;
revoke all on function public.get_store_team(text) from authenticated;
grant execute on function public.get_store_team(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6) Explicit role change
-- ---------------------------------------------------------------------------

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
    auth.uid(),
    p_store_id,
    v_target.role
  ) then
    raise exception 'You cannot manage this member';
  end if;

  if not private.can_assign_store_role(
    auth.uid(),
    p_store_id,
    p_role
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
  from public;
revoke all on function public.update_store_member_role(text, uuid, text)
  from anon;
revoke all on function public.update_store_member_role(text, uuid, text)
  from authenticated;
grant execute on function public.update_store_member_role(text, uuid, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 7) Explicit member removal
-- ---------------------------------------------------------------------------

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
    auth.uid(),
    p_store_id,
    v_target.role
  ) then
    raise exception 'You cannot remove this member';
  end if;

  delete from public.store_members
   where id = p_membership_id
     and store_id = p_store_id;

  return found;
end;
$$;

revoke all on function public.remove_store_member(text, uuid) from public;
revoke all on function public.remove_store_member(text, uuid) from anon;
revoke all on function public.remove_store_member(text, uuid) from authenticated;
grant execute on function public.remove_store_member(text, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 8) Tighten dedicated official-store role creation
-- ---------------------------------------------------------------------------
-- Official store management stays a separate Platform-only workflow. Generic
-- tenant RPCs above cannot operate on the official store.

create or replace function public.add_official_store_member_by_email(
  p_email text,
  p_role text default 'manager'
)
returns public.store_members
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_store_id text;
  v_user_id uuid;
  v_email text;
  v_result public.store_members;
begin
  if not private.is_platform_super_admin(auth.uid()) then
    raise exception 'Only Platform Super Admin can manage official-store members';
  end if;

  v_email := lower(trim(coalesce(p_email, '')));
  if v_email = '' or position('@' in v_email) < 2 then
    raise exception 'A valid email is required';
  end if;

  -- Owner is reserved and can never be granted by a generic team action.
  if p_role not in ('manager', 'editor', 'support') then
    raise exception 'Invalid official-store role';
  end if;

  select id into v_store_id
    from public.stores
   where coalesce(is_official, false) = true
   order by case when id = 'store-noormexa-official' then 0 else 1 end, created_at
   limit 1;

  if v_store_id is null then
    raise exception 'Official NOORMEXA store is not provisioned';
  end if;

  select p.id into v_user_id
    from public.profiles p
   where p.email is not null
     and lower(p.email) = v_email
   limit 1;

  if v_user_id is not null and private.is_platform_super_admin(v_user_id) then
    raise exception 'Protected Platform Super Admin membership cannot be changed by this flow';
  end if;

  insert into public.store_members (
    store_id, user_id, email, role, status, created_by
  )
  values (
    v_store_id,
    v_user_id,
    v_email,
    p_role,
    case when v_user_id is null then 'pending' else 'active' end,
    auth.uid()
  )
  on conflict (store_id, email)
  do update set
    user_id = excluded.user_id,
    role = excluded.role,
    status = excluded.status,
    updated_at = now()
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.add_official_store_member_by_email(text, text)
  from public;
revoke all on function public.add_official_store_member_by_email(text, text)
  from anon;
revoke all on function public.add_official_store_member_by_email(text, text)
  from authenticated;
grant execute on function public.add_official_store_member_by_email(text, text)
  to authenticated;

commit;
