-- NOORMEXA Phase 11F — Seller Workspace Authority
-- Requires:
--   * schema_phase11a_authorization_foundation.sql
--   * schema_phase11b_platform_account_isolation.sql
--   * schema_phase11c_secure_store_creation_privacy.sql
--   * schema_phase11e_team_management.sql
--
-- Prepared on the feature branch only. DO NOT apply to Production without
-- explicit approval.
--
-- Security goals:
--   * Seller workspace store list comes only from the authenticated user's
--     active store_members rows.
--   * Customer tenant staff never gain access to the official Platform store
--     through the seller workspace.
--   * editor/support can read operational store identity through a safe RPC,
--     but cannot SELECT the full stores row containing KYC/banking fields.
--   * owner/manager can retrieve private store settings through a separate
--     role-gated RPC.
--   * selectedStoreId remains a UI preference only; every server/database
--     operation is still authorized by membership/RLS.

begin;

-- ---------------------------------------------------------------------------
-- 1) Safe seller-workspace store list
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
    coalesce(s.is_verified, false) as is_verified,
    false as is_official,
    s.commission_rate,
    s.logo_url,
    s.banner_url,
    s.created_at,
    sm.role as membership_role
  from public.store_members sm
  join public.stores s
    on s.id = sm.store_id
  where sm.user_id = auth.uid()
    and sm.status = 'active'
    and coalesce(s.is_official, false) = false
    and coalesce(private.is_platform_account(sm.user_id), false) = false
  order by sm.created_at asc;
$$;

revoke all on function public.get_my_tenant_stores() from public;
revoke all on function public.get_my_tenant_stores() from anon;
revoke all on function public.get_my_tenant_stores() from authenticated;
grant execute on function public.get_my_tenant_stores() to authenticated;

comment on function public.get_my_tenant_stores() is
  'Authoritative seller-workspace store list derived only from active customer-tenant memberships.';

-- ---------------------------------------------------------------------------
-- 2) Private/KYC store settings for owner/manager only
-- ---------------------------------------------------------------------------

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

revoke all on function public.get_my_store_private_settings(text) from public;
revoke all on function public.get_my_store_private_settings(text) from anon;
revoke all on function public.get_my_store_private_settings(text) from authenticated;
grant execute on function public.get_my_store_private_settings(text) to authenticated;

comment on function public.get_my_store_private_settings(text) is
  'Returns KYC/contact/banking settings only to an active owner/manager of the same customer tenant.';

-- ---------------------------------------------------------------------------
-- 3) Full stores-row SELECT is not available to editor/support
-- ---------------------------------------------------------------------------

drop policy if exists "stores_authorized_select" on public.stores;

create policy "stores_authorized_select"
  on public.stores
  for select
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
          array['owner','manager']::text[]
        )
      )
    )
  );

commit;
