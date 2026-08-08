-- ============================================================
-- NOORMEXA — إصلاح حرج: صلاحيات إتمام الطلب (Checkout)
-- ============================================================
-- المشكلة: المشتري كان يقدر "يقرأ" order_items بس، مش "يضيف"،
-- فكانت عملية الشراء بتفشل برسالة 403 من نص الطريق.
-- ============================================================

-- 1) السماح للمشتري يضيف عناصر لطلب هو نفسه اللي عمله
drop policy if exists "order_items_buyer_insert" on public.order_items;
create policy "order_items_buyer_insert"
  on public.order_items for insert
  with check (
    order_id in (select id from public.orders where buyer_id = auth.uid())
  );

-- 2) دالة آمنة لتنقيص المخزون بعد كل عملية شراء، بدل ما نديله صلاحية
--    تعديل كاملة على جدول المنتجات (لحماية باقي بيانات المنتج زي السعر).
create or replace function public.decrement_product_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_stock integer;
  current_status text;
  next_stock integer;
begin
  select stock, status into current_stock, current_status
  from public.products where id = p_product_id;

  if current_stock is null then
    return;
  end if;

  next_stock := greatest(0, current_stock - p_quantity);

  update public.products
  set
    stock = next_stock,
    status = case
      when current_status = 'hidden' then current_status
      when next_stock = 0 then 'out_of_stock'
      else 'active'
    end
  where id = p_product_id;
end;
$$;

grant execute on function public.decrement_product_stock(uuid, integer) to authenticated;

-- ============================================================
-- بعد تشغيل الملف ده، عملية "إتمام الطلب" هتشتغل من غير أخطاء 403.
-- ============================================================
