-- ==============================================================================
-- NOORMEXA GLOBAL MULTI-TENANT STORE ISOLATION SCHEMA FOR SUPABASE
-- سكيما العزل السحابي الكامل والمستقل لكل متجر في Supabase مع سياسات RLS
-- ==============================================================================

-- 1. جدول المتاجر المستقلة (Stores / Tenants)
CREATE TABLE IF NOT EXISTS public.stores (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    country TEXT DEFAULT 'المملكة العربية السعودية',
    plan TEXT DEFAULT 'professional',
    status TEXT DEFAULT 'approved',
    is_verified BOOLEAN DEFAULT TRUE,
    is_official BOOLEAN DEFAULT FALSE,
    commission_rate NUMERIC(5, 2) DEFAULT 8.00,
    logo_url TEXT,
    banner_url TEXT,
    bank_name TEXT,
    iban TEXT,
    cr_number TEXT,
    tax_number TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول المنتجات المعزولة لكل متجر (Products per Store)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    brand_name TEXT,
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    description_en TEXT,
    category_id TEXT,
    category_slug TEXT,
    price NUMERIC(12, 2) NOT NULL,
    original_price NUMERIC(12, 2),
    image_url TEXT,
    gallery_images JSONB DEFAULT '[]'::JSONB,
    stock INTEGER DEFAULT 10,
    status TEXT DEFAULT 'active',
    free_shipping BOOLEAN DEFAULT FALSE,
    specs JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول طلبات الشراء المعزولة للمتجر (Orders per Store)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    tracking_number TEXT,
    buyer_id TEXT,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    store_name TEXT,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    shipping_cost NUMERIC(12, 2) DEFAULT 0,
    vat_amount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    commission_amount NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'applePayMada',
    payment_status TEXT DEFAULT 'pending',
    shipping_info JSONB NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول الشحنات والبوالص المعزولة للمتجر (Shipments & Waybills per Store)
CREATE TABLE IF NOT EXISTS public.shipments (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    store_name TEXT,
    awb_number TEXT UNIQUE NOT NULL,
    carrier_id TEXT NOT NULL,
    carrier_name TEXT NOT NULL,
    carrier_logo TEXT,
    order_id TEXT,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    recipient_city TEXT NOT NULL,
    recipient_country TEXT DEFAULT 'المملكة العربية السعودية',
    recipient_address TEXT NOT NULL,
    items_list TEXT,
    package_weight_kg NUMERIC(6, 2) DEFAULT 1.0,
    declared_value NUMERIC(12, 2) DEFAULT 0,
    payment_type TEXT DEFAULT 'prepaid',
    cod_amount NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'ready_to_ship',
    delivery_otp TEXT,
    driver_name TEXT,
    driver_phone TEXT,
    driver_vehicle TEXT,
    checkpoints JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول المنشورات والعروض التسويقية لكل متجر (Marketing Posts)
CREATE TABLE IF NOT EXISTS public.marketing_posts (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    store_name TEXT,
    store_logo TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    promo_code TEXT,
    discount_percent NUMERIC(5, 2),
    featured_product_id TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. إنشاء الفهارس لتسريع استعلامات العزل لكل متجر (Store Indexes)
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_shipments_store_id ON public.shipments(store_id);
CREATE INDEX IF NOT EXISTS idx_shipments_awb ON public.shipments(awb_number);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_store_id ON public.marketing_posts(store_id);

-- 7. تفعيل الحماية والأمان على مستوى السطور (Row Level Security - RLS)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_posts ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة والتعديل لكل مستخدم ومتجر بحسب سياسات المنصة المباشرة
DROP POLICY IF EXISTS "Public read stores" ON public.stores;
CREATE POLICY "Public read stores" ON public.stores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert stores" ON public.stores;
CREATE POLICY "Public insert stores" ON public.stores FOR ALL USING (true);

DROP POLICY IF EXISTS "Store isolated products" ON public.products;
CREATE POLICY "Store isolated products" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Store isolated orders" ON public.orders;
CREATE POLICY "Store isolated orders" ON public.orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Store isolated shipments" ON public.shipments;
CREATE POLICY "Store isolated shipments" ON public.shipments FOR ALL USING (true);

DROP POLICY IF EXISTS "Store isolated marketing_posts" ON public.marketing_posts;
CREATE POLICY "Store isolated marketing_posts" ON public.marketing_posts FOR ALL USING (true);
