-- NOORMEXA Permissions Foundation
-- Scope: platform roles, official-store team membership, profiles/stores RLS only.
-- Does NOT migrate demo products/orders or change existing platform admin flags.

begin;

-- ---------------------------------------------------------------------------
-- 1) Official-store team membership
-- ---------------------------------------------------------------------------
create table if not exists public.store_members (
  id uuid primary key default gen_random_uuid(),
  store_id text not null references public.stores(id) on delete cascade,
  user_id uuid null references public.profiles(id) on delete cascade,
  email text not null,
  role text not null default 'manager'
    check (role in ('owner', 'manager', 'editor', 'support')),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'disabled')),
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_members_store_email_key unique (store_id, email)
);

create unique index if not exists store_members_store_user_key
  on public.store_members(store_id, user_id)
  where user_id is not null;

create index if not exists store_members_user_id_idx
  on public.store_members(user_id);

create index if not exists store_members_email_lower_idx
  on public.store_members(lower(email));

alter table public.store_members enable row level security;

revoke all on table public.store_members from anon;
revoke insert, update, delete on table public.store_members from authenticated;
grant select on table public.store_members to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Trusted authorization helpers
-- ---------------------------------------------------------------------------
create or replace function public.has_store_role(
  uid uuid,
  target_store_id text,
  allowed_roles text[]
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    exists (
      select 1
      from public.store_members sm
      where sm.store_id = target_store_id
        and sm.user_id = uid
        and sm.status = 'active'
        and sm.role = any(allowed_roles)
    ),
    false
  );
$$;

revoke all on function public.has_store_role(uuid, text, text[]) from public;
grant execute on function public.has_store_role(uuid, text, text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- 3) store_members RLS
-- Platform admins may inspect the official-store team.
-- Mutations are intentionally routed through guarded RPCs below.
-- ---------------------------------------------------------------------------
drop policy if exists "store_members_select_authorized" on public.store_members;
create policy "store_members_select_authorized"
  on public.store_members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_platform_admin(auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 4) Bind profile email to the authenticated identity and safely activate
-- pending memberships only when profiles.email matches auth.users.email.
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_email_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $
declare
  v_auth_email text;
begin
  -- Direct trusted SQL/service operations retain a recovery path.
  if auth.uid() is null then
    return new;
  end if;

  select email into v_auth_email
    from auth.users
   where id = new.id;

  if v_auth_email is null
     or new.email is null
     or lower(new.email) <> lower(v_auth_email) then
    raise exception 'Profile email must match the authenticated identity';
  end if;

  return new;
end;
$;

drop trigger if exists protect_profile_email_identity_trigger on public.profiles;
create trigger protect_profile_email_identity_trigger
  before insert or update of email on public.profiles
  for each row execute function public.protect_profile_email_identity();

create or replace function public.link_pending_store_members()
returns trigger
language plpgsql
security definer
set search_path = public
as $
declare
  v_auth_email text;
begin
  select email into v_auth_email
    from auth.users
   where id = new.id;

  if v_auth_email is not null
     and new.email is not null
     and lower(new.email) = lower(v_auth_email) then
    update public.store_members
       set user_id = new.id,
           status = case when status = 'disabled' then status else 'active' end,
           updated_at = now()
     where lower(email) = lower(v_auth_email)
       and (user_id is null or user_id = new.id);
  end if;

  return new;
end;
$;

drop trigger if exists link_pending_store_members_trigger on public.profiles;
create trigger link_pending_store_members_trigger
  after insert or update of email on public.profiles
  for each row execute function public.link_pending_store_members();

-- Keep timestamps reliable.
create or replace function public.touch_store_members_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_store_members_updated_at_trigger on public.store_members;
create trigger touch_store_members_updated_at_trigger
  before update on public.store_members
  for each row execute function public.touch_store_members_updated_at();

-- Protect the developer's official-store membership from accidental app removal.
create or replace function public.protect_super_admin_store_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  if old.user_id is not null and public.is_super_admin(old.user_id) then
    if tg_op = 'DELETE' then
      raise exception 'Super Admin store membership is protected';
    end if;

    if new.user_id is distinct from old.user_id
       or new.status is distinct from old.status
       or new.role is distinct from old.role then
      raise exception 'Super Admin store membership is protected';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_super_admin_store_membership_trigger on public.store_members;
create trigger protect_super_admin_store_membership_trigger
  before update or delete on public.store_members
  for each row execute function public.protect_super_admin_store_membership();

-- ---------------------------------------------------------------------------
-- 5) Guarded official-store team RPCs.
-- Only Platform Super Admin may add/change/remove team members.
-- An email can be added before signup: it remains pending and auto-links later.
-- ---------------------------------------------------------------------------
create or replace function public.get_official_store_team()
returns table (
  store_id text,
  email text,
  full_name text,
  role text,
  status text,
  user_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'Platform Admin access required';
  end if;

  return query
  select sm.store_id,
         sm.email,
         p.full_name,
         sm.role,
         sm.status,
         sm.user_id,
         sm.created_at
  from public.store_members sm
  join public.stores s on s.id = sm.store_id and coalesce(s.is_official, false) = true
  left join public.profiles p on p.id = sm.user_id
  order by
    case sm.role when 'owner' then 0 when 'manager' then 1 when 'editor' then 2 else 3 end,
    sm.created_at;
end;
$$;

create or replace function public.add_official_store_member_by_email(
  p_email text,
  p_role text default 'manager'
)
returns public.store_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_id text;
  v_user_id uuid;
  v_email text;
  v_result public.store_members;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'Only Platform Super Admin can manage official-store members';
  end if;

  v_email := lower(trim(p_email));
  if v_email = '' or position('@' in v_email) < 2 then
    raise exception 'A valid email is required';
  end if;

  if p_role not in ('owner', 'manager', 'editor', 'support') then
    raise exception 'Invalid store role';
  end if;

  select id into v_store_id
    from public.stores
   where coalesce(is_official, false) = true
   order by case when id = 'store-noormexa-official' then 0 else 1 end, created_at
   limit 1;

  if v_store_id is null then
    raise exception 'Official NOORMEXA store is not provisioned';
  end if;

  select id into v_user_id
    from public.profiles
   where lower(email) = v_email
   limit 1;

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

create or replace function public.remove_official_store_member_by_email(
  p_email text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_id text;
  v_target_user uuid;
begin
  if not public.is_super_admin(auth.uid()) then
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

  if v_target_user is not null and public.is_super_admin(v_target_user) then
    raise exception 'Super Admin membership cannot be removed from the app';
  end if;

  delete from public.store_members
   where store_id = v_store_id
     and lower(email) = lower(trim(p_email));

  return found;
end;
$$;

revoke all on function public.get_official_store_team() from public;
revoke all on function public.add_official_store_member_by_email(text, text) from public;
revoke all on function public.remove_official_store_member_by_email(text) from public;

grant execute on function public.get_official_store_team() to authenticated;
grant execute on function public.add_official_store_member_by_email(text, text) to authenticated;
grant execute on function public.remove_official_store_member_by_email(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6) Tighten stores RLS. Approved stores remain publicly readable.
-- Owners/managers can update normal store data; privileged fields are protected.
-- ---------------------------------------------------------------------------
drop policy if exists "Public insert stores" on public.stores;
drop policy if exists "Public read stores" on public.stores;
drop policy if exists "stores_select_approved_or_own" on public.stores;
drop policy if exists "stores_owner_manage" on public.stores;
drop policy if exists "stores_owner_update" on public.stores;
drop policy if exists "stores_admin_all" on public.stores;

create policy "stores_public_or_authorized_select"
  on public.stores
  for select
  using (
    status = 'approved'
    or owner_id = auth.uid()::text
    or public.is_platform_admin(auth.uid())
    or public.has_store_role(
      auth.uid(),
      id,
      array['owner','manager','editor','support']::text[]
    )
  );

create policy "stores_authenticated_insert"
  on public.stores
  for insert
  to authenticated
  with check (
    owner_id = auth.uid()::text
    or public.is_platform_admin(auth.uid())
  );

create policy "stores_authorized_update"
  on public.stores
  for update
  to authenticated
  using (
    public.is_platform_admin(auth.uid())
    or owner_id = auth.uid()::text
    or public.has_store_role(
      auth.uid(),
      id,
      array['owner','manager']::text[]
    )
  )
  with check (
    public.is_platform_admin(auth.uid())
    or owner_id = auth.uid()::text
    or public.has_store_role(
      auth.uid(),
      id,
      array['owner','manager']::text[]
    )
  );

create policy "stores_authorized_delete"
  on public.stores
  for delete
  to authenticated
  using (
    public.is_super_admin(auth.uid())
    or (
      coalesce(is_official, false) = false
      and (
        public.is_platform_admin(auth.uid())
        or owner_id = auth.uid()::text
        or public.has_store_role(auth.uid(), id, array['owner']::text[])
      )
    )
  );

-- Ordinary store owners/managers may not self-approve, change commission,
-- convert a store to official, or transfer ownership.
create or replace function public.protect_store_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.owner_id is distinct from old.owner_id
     or new.status is distinct from old.status
     or new.is_verified is distinct from old.is_verified
     or new.is_official is distinct from old.is_official
     or new.commission_rate is distinct from old.commission_rate
     or new.plan is distinct from old.plan then
    if not public.is_platform_admin(auth.uid()) then
      raise exception 'Platform Admin approval is required for privileged store fields';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_store_privileged_fields_trigger on public.stores;
create trigger protect_store_privileged_fields_trigger
  before update on public.stores
  for each row execute function public.protect_store_privileged_fields();

-- ---------------------------------------------------------------------------
-- 7) Provision the single real official store without touching demo catalog/order data.
-- Preserve existing platform role flags exactly as they are.
-- ---------------------------------------------------------------------------
do $$
declare
  v_super_id uuid;
  v_super_email text;
  v_admin record;
begin
  select id, email
    into v_super_id, v_super_email
    from public.profiles
   where coalesce(is_super_admin, false) = true
   order by created_at
   limit 1;

  if v_super_id is null then
    raise exception 'Permissions Foundation requires an existing Platform Super Admin';
  end if;

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
    contact_email
  )
  values (
    'store-noormexa-official',
    v_super_id::text,
    'متجر نورميكسا الرسمي',
    'noormexa-flagship-direct',
    'المتجر الرسمي المباشر لمنصة NOORMEXA.',
    'Global',
    'platform_owner',
    'approved',
    true,
    true,
    0,
    'direct@noormexa.com'
  )
  on conflict (id) do nothing;

  insert into public.store_members (
    store_id, user_id, email, role, status, created_by
  )
  values (
    'store-noormexa-official',
    v_super_id,
    lower(v_super_email),
    'owner',
    'active',
    v_super_id
  )
  on conflict (store_id, email)
  do update set
    user_id = excluded.user_id,
    role = 'owner',
    status = 'active',
    updated_at = now();

  for v_admin in
    select id, email
      from public.profiles
     where coalesce(is_admin, false) = true
       and coalesce(is_super_admin, false) = false
       and email is not null
  loop
    insert into public.store_members (
      store_id, user_id, email, role, status, created_by
    )
    values (
      'store-noormexa-official',
      v_admin.id,
      lower(v_admin.email),
      'manager',
      'active',
      v_super_id
    )
    on conflict (store_id, email)
    do update set
      user_id = excluded.user_id,
      status = 'active',
      updated_at = now();
  end loop;
end
$$;

commit;
