-- NOORMEXA Phase 11G — Payment API / Order Financial Integrity
-- Requires:
--   * schema_phase11d_tenant_rls_cutover.sql
--
-- Prepared on the feature branch only. DO NOT apply to Production without
-- explicit approval.
--
-- Goals:
--   * add the server-side payment tracking columns used by the API/webhooks;
--   * prevent authenticated browser sessions (including seller staff) from
--     mutating payment/financial/customer payload fields directly;
--   * allow trusted server/service-role settlement paths to update those fields.

begin;

alter table public.orders
  add column if not exists payment_provider text,
  add column if not exists payment_reference text,
  add column if not exists paid_at timestamptz;

create index if not exists orders_payment_reference_idx
  on public.orders (payment_reference)
  where payment_reference is not null;

create index if not exists orders_payment_provider_reference_idx
  on public.orders (payment_provider, payment_reference)
  where payment_reference is not null;

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
end;
$$;

-- ---------------------------------------------------------------------------
-- Order financial/payment fields are server-owned after INSERT.
-- ---------------------------------------------------------------------------
-- Buyers create an order once through the normal checkout path. Store staff
-- may update operational status through RLS, but must never be able to rewrite
-- totals, commission, customer payload, or payment settlement metadata.
--
-- Trusted SQL / Service Role requests have auth.uid() = null in this project
-- and therefore retain the recovery/server update path.

create or replace function public.protect_order_financial_fields()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $
begin
  if auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- A browser/client may create a pending order, but it can never self-assert
    -- payment settlement or a later operational state.
    new.status := 'pending';
    new.payment_status := 'pending';
    new.payment_provider := null;
    new.payment_reference := null;
    new.paid_at := null;
    return new;
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
     or new.shipping_info is distinct from old.shipping_info
     or new.items is distinct from old.items then
    raise exception 'Order financial/payment fields are server-managed';
  end if;

  return new;
end;
$;

drop trigger if exists protect_order_financial_fields_trigger
  on public.orders;

create trigger protect_order_financial_fields_trigger
  before insert or update on public.orders
  for each row execute function public.protect_order_financial_fields();

revoke all on function public.protect_order_financial_fields() from public;
revoke all on function public.protect_order_financial_fields() from anon;
revoke all on function public.protect_order_financial_fields() from authenticated;

commit;
