-- REVIEW ONLY: four truthful official NOORMEXA editorial drafts.
-- No fake discounts, fabricated inventory, offers, or product links.
-- Separate from legacy product drafts. Applying THIS file never inserts products.
-- Not applied to Production. Conflict-safe and rerunnable without overwriting editor changes.
begin;

do $check$
begin
  if not exists (
    select 1 from public.stores
    where id = 'store-noormexa-official'
      and slug = 'noormexa-flagship-direct'
      and is_official is true
      and status = 'approved'
  ) then
    raise exception 'Expected approved official store is missing or changed. No backfill applied.';
  end if;
end
$check$;

with seed as (
  select *
  from jsonb_to_recordset($official_posts$
[
  {
    "id": "noormexa-official-news-2026-01",
    "store_id": "store-noormexa-official",
    "store_name": "متجر نورميكسا الرسمي",
    "title": "NOORMEXA — وجهة واحدة لاكتشاف المتاجر والمنتجات",
    "content": "استكشف أقسام السوق والمتاجر المتاحة من مكان واحد، وتعرّف على المنتجات التي يضيفها التجار بعد اعتماد متاجرهم. تابع المساحات الرسمية لمعرفة المستجدات والمحتوى الجديد أولًا بأول.",
    "image_url": null,
    "promo_code": null,
    "discount_percent": null,
    "featured_product_id": null,
    "is_pinned": true,
    "created_at": null
  },
  {
    "id": "noormexa-official-news-2026-02",
    "store_id": "store-noormexa-official",
    "store_name": "متجر نورميكسا الرسمي",
    "title": "المتجر الرسمي لـNOORMEXA — المصدر المباشر لمستجداتنا",
    "content": "هذه مساحة النشر الرسمية التابعة لمنصة NOORMEXA. نشارك هنا أخبار الخدمات والتحديثات والمحتوى الذي يقدمه فريق المتجر الرسمي، مع فصل واضح بين منشوراتنا ومنشورات المتاجر المستقلة.",
    "image_url": null,
    "promo_code": null,
    "discount_percent": null,
    "featured_product_id": null,
    "is_pinned": false,
    "created_at": null
  },
  {
    "id": "noormexa-official-news-2026-03",
    "store_id": "store-noormexa-official",
    "store_name": "متجر نورميكسا الرسمي",
    "title": "للتجار — أنشئ متجرك ونظّم أعمالك من مساحة واحدة",
    "content": "يتيح NOORMEXA طلب إنشاء متجر داخل المنصة، ومتابعة حالته حتى الاعتماد. بعد تفعيل المتجر، يمكن إدارة الكتالوج والمنشورات والمهام التشغيلية بحسب صلاحيات أعضاء فريق المتجر.",
    "image_url": null,
    "promo_code": null,
    "discount_percent": null,
    "featured_product_id": null,
    "is_pinned": false,
    "created_at": null
  },
  {
    "id": "noormexa-official-news-2026-04",
    "store_id": "store-noormexa-official",
    "store_name": "متجر نورميكسا الرسمي",
    "title": "NOORMEXA على الهاتف والكمبيوتر",
    "content": "تصفّح السوق من هاتفك أو الكمبيوتر، واستخدم ميزة تثبيت الموقع كتطبيق للوصول السريع عندما يدعم جهازك ومتصفحك هذه الميزة. تجربة موحّدة لاستكشاف المتاجر والمحتوى المتاح.",
    "image_url": null,
    "promo_code": null,
    "discount_percent": null,
    "featured_product_id": null,
    "is_pinned": false,
    "created_at": null
  }
]
$official_posts$::jsonb) as x(
    id text, store_id text, store_name text, store_logo text,
    title text, content text, image_url text, promo_code text,
    discount_percent numeric, featured_product_id text,
    is_pinned boolean, created_at timestamptz
  )
)
insert into public.marketing_posts (
  id, store_id, store_name, store_logo, title, content, image_url,
  promo_code, discount_percent, featured_product_id, is_pinned,
  likes_count, views_count, status, created_at
)
select
  id, store_id, store_name, store_logo, title, content, image_url,
  promo_code, discount_percent, featured_product_id, coalesce(is_pinned,false),
  0, 0, 'draft', coalesce(created_at,now())
from seed
where store_id = 'store-noormexa-official'
on conflict (id) do nothing;

commit;

-- Approve final wording; apply with explicit Production consent.
-- Each post stays draft until an authenticated official Editor publishes it.
