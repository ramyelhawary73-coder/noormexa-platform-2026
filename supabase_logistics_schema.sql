-- ============================================================================
-- NOORMEXA GLOBAL LOGISTICS & SHIPPING SCHEMA (SUPABASE POSTGRESQL)
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Shipments Table
CREATE TABLE IF NOT EXISTS public.shipments (
    id TEXT PRIMARY KEY DEFAULT ('shp_' || replace(uuid_generate_v4()::text, '-', '')),
    awb_number TEXT NOT NULL UNIQUE,
    order_id TEXT NOT NULL,
    store_id TEXT NOT NULL,
    store_name TEXT NOT NULL,
    store_phone TEXT,
    store_city TEXT,
    carrier_code TEXT NOT NULL DEFAULT 'NRX_FLEET',
    carrier_name TEXT NOT NULL,
    carrier_logo TEXT,
    status TEXT NOT NULL DEFAULT 'ready_to_ship' CHECK (status IN ('draft', 'ready_to_ship', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled')),
    
    -- Shipper (Origin) Details
    sender_name TEXT NOT NULL,
    sender_phone TEXT NOT NULL,
    sender_address TEXT NOT NULL,
    sender_city TEXT NOT NULL,
    sender_country TEXT NOT NULL DEFAULT 'المملكة العربية السعودية',
    sender_lat NUMERIC(10, 7),
    sender_lng NUMERIC(10, 7),

    -- Consignee (Destination) Details
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    recipient_address TEXT NOT NULL,
    recipient_city TEXT NOT NULL,
    recipient_district TEXT,
    recipient_country TEXT NOT NULL DEFAULT 'المملكة العربية السعودية',
    recipient_postal_code TEXT,
    recipient_lat NUMERIC(10, 7),
    recipient_lng NUMERIC(10, 7),

    -- Package Specifications
    package_weight_kg NUMERIC(6, 2) NOT NULL DEFAULT 1.0,
    package_dimensions TEXT DEFAULT '30x20x15 cm',
    items_summary TEXT NOT NULL,
    items_count INTEGER NOT NULL DEFAULT 1,
    declared_value NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    currency TEXT NOT NULL DEFAULT 'SAR',
    payment_type TEXT NOT NULL DEFAULT 'prepaid' CHECK (payment_type IN ('prepaid', 'cod')),
    cod_amount NUMERIC(10, 2) DEFAULT 0.0,

    -- Security & Courier
    delivery_otp TEXT NOT NULL,
    estimated_delivery_date TIMESTAMPTZ,
    estimated_delivery_time TEXT,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Shipment Tracking Events Table
CREATE TABLE IF NOT EXISTS public.shipment_events (
    id TEXT PRIMARY KEY DEFAULT ('ev_' || replace(uuid_generate_v4()::text, '-', '')),
    shipment_id TEXT REFERENCES public.shipments(id) ON DELETE CASCADE,
    awb_number TEXT NOT NULL,
    status TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    location TEXT NOT NULL,
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Shipping Carriers Configuration Table
CREATE TABLE IF NOT EXISTS public.shipping_carriers (
    id TEXT PRIMARY KEY,
    carrier_code TEXT NOT NULL UNIQUE,
    carrier_name_ar TEXT NOT NULL,
    carrier_name_en TEXT NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_live_mode BOOLEAN NOT NULL DEFAULT false,
    api_key TEXT,
    api_secret TEXT,
    account_number TEXT,
    base_shipping_rate NUMERIC(10, 2) NOT NULL DEFAULT 25.0,
    estimated_hours INTEGER NOT NULL DEFAULT 24,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_shipments_awb ON public.shipments(awb_number);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_store_id ON public.shipments(store_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipment_events_awb ON public.shipment_events(awb_number);
CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON public.shipment_events(shipment_id);

-- 6. Seed Default Carriers Data
INSERT INTO public.shipping_carriers (id, carrier_code, carrier_name_ar, carrier_name_en, logo_url, base_shipping_rate, estimated_hours)
VALUES
    ('c-nrx', 'NRX_FLEET', 'أسطول نورميكسا المباشر (VIP)', 'NOORMEXA Direct Fleet (VIP)', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150', 25.0, 24),
    ('c-smsa', 'SMSA', 'سمسا إكسبريس (SMSA Express)', 'SMSA Express', 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=150', 28.0, 36),
    ('c-arx', 'ARAMEX', 'أرامكس العالمية (Aramex)', 'Aramex Global', 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=150', 32.0, 48),
    ('c-bst', 'BOSTA', 'بوسطة للشحن الذكي (Bosta)', 'Bosta Smart Logistics', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=150', 20.0, 24),
    ('c-dhl', 'DHL', 'دي إتش إل إكسبريس (DHL Express)', 'DHL Express Global', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=150', 55.0, 18),
    ('c-fdx', 'FEDEX', 'فيديكس الدولية (FedEx Priority)', 'FedEx Priority', 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=150', 50.0, 24),
    ('c-spl', 'SPL', 'سبل - البريد السعودي (Saudi Post)', 'SPL Saudi Post', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150', 22.0, 48)
ON CONFLICT (carrier_code) DO NOTHING;

-- 7. Setup Row Level Security (RLS)
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_carriers ENABLE ROW LEVEL SECURITY;

-- Public read access for tracking by AWB
CREATE POLICY "Public can view shipments by AWB" ON public.shipments
    FOR SELECT USING (true);

CREATE POLICY "Public can view shipment events" ON public.shipment_events
    FOR SELECT USING (true);

CREATE POLICY "Public can view active shipping carriers" ON public.shipping_carriers
    FOR SELECT USING (is_active = true);

-- Allow authenticated users / merchants to create and update shipments
CREATE POLICY "Authenticated users can insert shipments" ON public.shipments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update shipments" ON public.shipments
    FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can insert events" ON public.shipment_events
    FOR INSERT WITH CHECK (true);
