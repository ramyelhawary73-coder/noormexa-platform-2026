import { supabase, isSupabaseConfigured } from "./supabaseClient";
import QRCode from "qrcode";

export type ShipmentStatus =
  | "draft"
  | "ready_to_ship"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "cancelled";

export type CarrierCode =
  | "NRX_FLEET"
  | "ARAMEX"
  | "SMSA"
  | "BOSTA"
  | "DHL"
  | "FEDEX"
  | "SPL";

export interface ShipmentEvent {
  id: string;
  shipment_id?: string;
  awb_number: string;
  status: ShipmentStatus;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  location: string;
  lat?: number;
  lng?: number;
  timestamp: string;
}

export interface CourierInfo {
  name: string;
  phone: string;
  rating: number;
  avatar: string;
  vehicle_type: "van" | "motorcycle" | "truck";
  vehicle_plate: string;
  current_lat?: number;
  current_lng?: number;
  current_speed_kmh?: number;
  heading_deg?: number;
}

export interface WaypointLocation {
  name: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  passed: boolean;
  timestamp?: string;
  notes?: string;
}

export interface Shipment {
  id: string;
  awb_number: string;
  order_id: string;
  store_id: string;
  store_name: string;
  store_phone?: string;
  store_city?: string;
  carrier_code: CarrierCode;
  carrier_name: string;
  carrier_logo?: string;
  status: ShipmentStatus;
  
  // Sender (Origin)
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  sender_city: string;
  sender_country: string;
  sender_lat?: number;
  sender_lng?: number;

  // Recipient (Destination)
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: string;
  recipient_district?: string;
  recipient_country: string;
  recipient_postal_code?: string;
  recipient_lat?: number;
  recipient_lng?: number;

  // Package Specs
  package_weight_kg: number;
  package_dimensions?: string; // e.g. 30x20x15 cm
  items_summary: string;
  items_count: number;
  declared_value: number;
  currency: string;
  payment_type: "prepaid" | "cod";
  cod_amount?: number;

  // Courier & Security
  delivery_otp: string;
  courier?: CourierInfo;
  estimated_delivery_date: string;
  estimated_delivery_time?: string;
  
  // Live Route & Checkpoints
  waypoints?: WaypointLocation[];
  events: ShipmentEvent[];

  // Metadata
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface CreateShipmentInput {
  order_id: string;
  store_id: string;
  store_name: string;
  carrier_code: CarrierCode;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  sender_city: string;
  sender_country: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: string;
  recipient_district?: string;
  recipient_country: string;
  recipient_postal_code?: string;
  package_weight_kg: number;
  package_dimensions?: string;
  items_summary: string;
  items_count: number;
  declared_value: number;
  currency: string;
  payment_type: "prepaid" | "cod";
  cod_amount?: number;
  notes?: string;
}

const LOCAL_STORAGE_SHIPMENTS_KEY = "noormexa_logistics_shipments_v2";

export const CARRIER_METADATA: Record<
  CarrierCode,
  { nameAr: string; nameEn: string; logo: string; baseRate: number; avgHours: number; color: string }
> = {
  NRX_FLEET: {
    nameAr: "أسطول نورميكسا المباشر (Express VIP)",
    nameEn: "NOORMEXA Direct Fleet (VIP)",
    logo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80",
    baseRate: 25,
    avgHours: 24,
    color: "#f59e0b",
  },
  SMSA: {
    nameAr: "سمسا إكسبريس (SMSA Express)",
    nameEn: "SMSA Express",
    logo: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=150&auto=format&fit=crop&q=80",
    baseRate: 28,
    avgHours: 36,
    color: "#e11d48",
  },
  ARAMEX: {
    nameAr: "أرامكس العالمية (Aramex)",
    nameEn: "Aramex Global",
    logo: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=150&auto=format&fit=crop&q=80",
    baseRate: 32,
    avgHours: 48,
    color: "#dc2626",
  },
  BOSTA: {
    nameAr: "بوسطة للشحن الذكي (Bosta)",
    nameEn: "Bosta Smart Logistics",
    logo: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=150&auto=format&fit=crop&q=80",
    baseRate: 20,
    avgHours: 24,
    color: "#ef4444",
  },
  DHL: {
    nameAr: "دي إتش إل إكسبريس (DHL Express)",
    nameEn: "DHL Express Global",
    logo: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=150&auto=format&fit=crop&q=80",
    baseRate: 55,
    avgHours: 18,
    color: "#eab308",
  },
  FEDEX: {
    nameAr: "فيديكس الدولية (FedEx Priority)",
    nameEn: "FedEx Priority",
    logo: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=150&auto=format&fit=crop&q=80",
    baseRate: 50,
    avgHours: 24,
    color: "#9333ea",
  },
  SPL: {
    nameAr: "سبل - البريد السعودي (Saudi Post)",
    nameEn: "SPL Saudi Post",
    logo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
    baseRate: 22,
    avgHours: 48,
    color: "#16a34a",
  },
};

// Seed sample authentic shipments for real tracking and demo experience
export const INITIAL_SAMPLE_SHIPMENTS: Shipment[] = [
  {
    id: "shp-live-001",
    awb_number: "NRX-984214-SA",
    order_id: "ORD-99321",
    store_id: "store-official",
    store_name: "متجر نورميكسا المباشر (NOORMEXA Direct)",
    store_phone: "+966 50 123 4567",
    store_city: "الرياض",
    carrier_code: "NRX_FLEET",
    carrier_name: CARRIER_METADATA.NRX_FLEET.nameAr,
    carrier_logo: CARRIER_METADATA.NRX_FLEET.logo,
    status: "out_for_delivery",
    sender_name: "مستودعات نورميكسا المركزية - السلي",
    sender_phone: "+966 11 400 9900",
    sender_address: "مجمع المستودعات اللوجستية الحديثة، مخرج 18",
    sender_city: "الرياض",
    sender_country: "المملكة العربية السعودية",
    sender_lat: 24.6333,
    sender_lng: 46.8167,
    recipient_name: "عبدالرحمن بن سعود آل خالد",
    recipient_phone: "+966 55 987 6543",
    recipient_address: "حي الياسمين، شارع أنس بن مالك، فيلا 42",
    recipient_city: "الرياض",
    recipient_district: "حي الياسمين",
    recipient_country: "المملكة العربية السعودية",
    recipient_postal_code: "13322",
    recipient_lat: 24.8188,
    recipient_lng: 46.6384,
    package_weight_kg: 1.85,
    package_dimensions: "28x20x12 cm",
    items_summary: "ساعة ذكية فاخرة ألترا + عطر العود الملكي المعتمد",
    items_count: 2,
    declared_value: 1450,
    currency: "SAR",
    payment_type: "prepaid",
    delivery_otp: "6942",
    estimated_delivery_date: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    estimated_delivery_time: "اليوم بين 03:30 م و 05:00 م",
    courier: {
      name: "كابتن فهد السبيعي",
      phone: "+966 54 888 2314",
      rating: 4.95,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      vehicle_type: "van",
      vehicle_plate: "أ د هـ 9042",
      current_lat: 24.775,
      current_lng: 46.662,
      current_speed_kmh: 42,
      heading_deg: 345,
    },
    waypoints: [
      { name: "مركز التوزيع المركزي بالسلي", city: "الرياض", country: "السعودية", lat: 24.6333, lng: 46.8167, passed: true, timestamp: "08:15 ص", notes: "تم تجهيز وفحص الطرد بختم الأمان" },
      { name: "محطة الفرز السريع - شمال الرياض", city: "الرياض", country: "السعودية", lat: 24.7410, lng: 46.6850, passed: true, timestamp: "11:30 ص", notes: "تم التحميل على مركبة التوصيل المباشر" },
      { name: "موقع الكابتن الحالي (حي النرجس)", city: "الرياض", country: "السعودية", lat: 24.7750, lng: 46.6620, passed: true, timestamp: "01:10 م", notes: "في الطريق إليك - المسافة المتبقية 4.8 كم" },
      { name: "عنوان التسليم - حي الياسمين", city: "الرياض", country: "السعودية", lat: 24.8188, lng: 46.6384, passed: false, notes: "الوجهة النهائية للعميل" },
    ],
    events: [
      {
        id: "ev-01",
        awb_number: "NRX-984214-SA",
        status: "ready_to_ship",
        title_ar: "تم إصدار بوليصة الشحن وتجهيز الطرد",
        title_en: "Shipment Label Created & Packaged",
        description_ar: "تم استلام بيانات الطلب وتأكيد مواصفات البوليصة وإرفاق باركود الشحن الذكي.",
        description_en: "Order data received, package prepped with smart barcode.",
        location: "الرياض - مستودع نورميكسا المركزي",
        lat: 24.6333,
        lng: 46.8167,
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
      {
        id: "ev-02",
        awb_number: "NRX-984214-SA",
        status: "picked_up",
        title_ar: "تم استلام الشحنة من المستودع",
        title_en: "Package Picked Up from Warehouse",
        description_ar: "تم تسليم الطرد لأسطول النقل السريع وبدء الترانزيت نحو مركز الفرز.",
        description_en: "Picked up by transit fleet for regional distribution sorting.",
        location: "الرياض - السلي",
        lat: 24.6333,
        lng: 46.8167,
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
      {
        id: "ev-03",
        awb_number: "NRX-984214-SA",
        status: "in_transit",
        title_ar: "وصلت الشحنة لمركز التوزيع والفرز الإقليمي",
        title_en: "Arrived at Regional Distribution Hub",
        description_ar: "تم الفرز الآلي وتعيين مسار التوصيل المباشر لشمال الرياض.",
        description_en: "Automated optical sorting complete, assigned to north sector.",
        location: "الرياض - محطة الفرز الشمالية",
        lat: 24.7410,
        lng: 46.6850,
        timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
      },
      {
        id: "ev-04",
        awb_number: "NRX-984214-SA",
        status: "out_for_delivery",
        title_ar: "الشحنة مع مندوب التوصيل في طريقها إليك الآن",
        title_en: "Out for Final Delivery with Courier",
        description_ar: "الكابتن فهد السبيعي في طريقه إلى موقعك، يرجى تجهيز رمز الأمان (OTP: 6942) عند الاستلام.",
        description_en: "Driver Fahad is on the way. Please keep OTP 6942 ready.",
        location: "الرياض - حي النرجس / الياسمين",
        lat: 24.7750,
        lng: 46.6620,
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    notes: "يرجى الاتصال قبل الوصول بـ 15 دقيقة للتسليم السلس.",
  },
  {
    id: "shp-live-002",
    awb_number: "SMSA-773190-SA",
    order_id: "ORD-88120",
    store_id: "store-gadgets",
    store_name: "متجر تقنيات المستقبل",
    store_phone: "+966 54 321 0987",
    store_city: "جدة",
    carrier_code: "SMSA",
    carrier_name: CARRIER_METADATA.SMSA.nameAr,
    carrier_logo: CARRIER_METADATA.SMSA.logo,
    status: "in_transit",
    sender_name: "مركز شحن تقنيات المستقبل - حي الرويس",
    sender_phone: "+966 12 650 1122",
    sender_address: "طريق المدينة المنورة، مجمع الأندلس التجاري",
    sender_city: "جدة",
    sender_country: "المملكة العربية السعودية",
    sender_lat: 21.5433,
    sender_lng: 39.1728,
    recipient_name: "سارة بنت منصور العمري",
    recipient_phone: "+966 56 444 8899",
    recipient_address: "حي الشاطئ، شارع الكورنيش، برج النورس",
    recipient_city: "الدمام",
    recipient_district: "حي الشاطئ",
    recipient_country: "المملكة العربية السعودية",
    recipient_postal_code: "31411",
    recipient_lat: 26.4428,
    recipient_lng: 50.1190,
    package_weight_kg: 3.2,
    package_dimensions: "40x30x20 cm",
    items_summary: "شاشة ألعاب 24 بوصة + لوحة مفاتيح ميكانيكية لاسلكية",
    items_count: 2,
    declared_value: 2300,
    currency: "SAR",
    payment_type: "cod",
    cod_amount: 2300,
    delivery_otp: "3184",
    estimated_delivery_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    estimated_delivery_time: "غداً بحلول 02:00 م",
    courier: {
      name: "كابتن سمسا - خط الترانزيت الجوي",
      phone: "+966 92 000 9999",
      rating: 4.88,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      vehicle_type: "truck",
      vehicle_plate: "س م س 7731",
      current_lat: 24.1500,
      current_lng: 45.0000,
      current_speed_kmh: 88,
      heading_deg: 65,
    },
    waypoints: [
      { name: "مركز استلام جدة", city: "جدة", country: "السعودية", lat: 21.5433, lng: 39.1728, passed: true, timestamp: "أمس 04:00 م" },
      { name: "مركز الشحن الجوي والبري المركزي", city: "الرياض", country: "السعودية", lat: 24.7136, lng: 46.6753, passed: true, timestamp: "اليوم 06:00 ص" },
      { name: "محور الترانزيت السريع - طريق الشرقية", city: "الشرقية", country: "السعودية", lat: 25.5000, lng: 48.5000, passed: false, timestamp: "اليوم 04:00 م" },
      { name: "محطة فرز الدمام الرئيسية", city: "الدمام", country: "السعودية", lat: 26.4428, lng: 50.1190, passed: false },
    ],
    events: [
      {
        id: "ev-smsa-1",
        awb_number: "SMSA-773190-SA",
        status: "picked_up",
        title_ar: "تم استلام الشحنة من متجر تقنيات المستقبل في جدة",
        title_en: "Shipment Received at Jeddah Hub",
        description_ar: "تم وزن الطرد وتسجيل بيانات التحصيل عند الاستلام (COD: 2300 SAR).",
        description_en: "Weighed & registered with COD balance.",
        location: "جدة - محطة الرويس",
        lat: 21.5433,
        lng: 39.1728,
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
      },
      {
        id: "ev-smsa-2",
        awb_number: "SMSA-773190-SA",
        status: "in_transit",
        title_ar: "في الطريق عبر خط النقل السريع إلى المنطقة الشرقية",
        title_en: "In Transit to Eastern Province",
        description_ar: "الشحنة في رحلة الترانزيت البري السريع متجهة لمحطة توزيع الدمام.",
        description_en: "Transit convoy en route to Dammam sorting hub.",
        location: "طريق الرياض - الدمام السريع",
        lat: 25.5000,
        lng: 48.5000,
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "shp-live-003",
    awb_number: "ARX-551902-AE",
    order_id: "ORD-77412",
    store_id: "store-perfumes",
    store_name: "دار العود والعبير الملكي",
    store_phone: "+971 4 333 4455",
    store_city: "دبي",
    carrier_code: "ARAMEX",
    carrier_name: CARRIER_METADATA.ARAMEX.nameAr,
    carrier_logo: CARRIER_METADATA.ARAMEX.logo,
    status: "delivered",
    sender_name: "دار العود - دبي مول",
    sender_phone: "+971 4 333 4455",
    sender_address: "الداون تاون، شارع المركز المالي",
    sender_city: "دبي",
    sender_country: "الإمارات العربية المتحدة",
    sender_lat: 25.1972,
    sender_lng: 55.2744,
    recipient_name: "م. محمد بن سلطان القاسمي",
    recipient_phone: "+971 50 112 3344",
    recipient_address: "جزيرة الريم، برج سكاي تاور، شقة 1802",
    recipient_city: "أبوظبي",
    recipient_district: "جزيرة الريم",
    recipient_country: "الإمارات العربية المتحدة",
    package_weight_kg: 0.9,
    items_summary: "مجموعة دهن العود الكمبودي المعتق + مسك أبيض ملكي",
    items_count: 1,
    declared_value: 1850,
    currency: "AED",
    payment_type: "prepaid",
    delivery_otp: "9910",
    estimated_delivery_date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    estimated_delivery_time: "تم التسليم بنجاح مع التوقيع الإلكتروني",
    courier: {
      name: "كابتن يوسف المنصوري",
      phone: "+971 52 777 9900",
      rating: 5.0,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      vehicle_type: "van",
      vehicle_plate: "DXB 55190",
    },
    waypoints: [
      { name: "مركز دبي للشحن", city: "دبي", country: "الإمارات", lat: 25.1972, lng: 55.2744, passed: true },
      { name: "محطة الفرز أبوظبي", city: "أبوظبي", country: "الإمارات", lat: 24.4539, lng: 54.3773, passed: true },
      { name: "برج سكاي تاور - جزيرة الريم", city: "أبوظبي", country: "الإمارات", lat: 24.4950, lng: 54.4050, passed: true },
    ],
    events: [
      {
        id: "ev-arx-1",
        awb_number: "ARX-551902-AE",
        status: "picked_up",
        title_ar: "تم استلام الشحنة من متجر دار العود في دبي",
        title_en: "Picked up at Dubai Mall Branch",
        description_ar: "تم استلام الطرد وتوثيق الختم الجمركي للشحن الداخلي.",
        description_en: "Customs and internal security seal attached.",
        location: "دبي - وسط المدينة",
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        id: "ev-arx-2",
        awb_number: "ARX-551902-AE",
        status: "in_transit",
        title_ar: "وصلت محطة فرز أبوظبي المركزية",
        title_en: "Arrived at Abu Dhabi Central Hub",
        description_ar: "تم تجهيز الشحنة مع خط سير مندوب جزيرة الريم.",
        description_en: "Routed to Reem Island delivery unit.",
        location: "أبوظبي - المصفح",
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
      {
        id: "ev-arx-3",
        awb_number: "ARX-551902-AE",
        status: "delivered",
        title_ar: "تم التسليم بنجاح للعميل",
        title_en: "Successfully Delivered to Recipient",
        description_ar: "تم تسليم الشحنة للسيد محمد القاسمي بعد التحقق من الرمز السري والتوقيع.",
        description_en: "Delivered & verified with customer signature.",
        location: "أبوظبي - جزيرة الريم",
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

// Helper to generate a unique AWB tracking code
export function generateAwbNumber(carrierCode: CarrierCode, countryCode = "SA"): string {
  const prefixMap: Record<CarrierCode, string> = {
    NRX_FLEET: "NRX",
    SMSA: "SMSA",
    ARAMEX: "ARX",
    BOSTA: "BST",
    DHL: "DHL",
    FEDEX: "FDX",
    SPL: "SPL",
  };
  const prefix = prefixMap[carrierCode] || "AWB";
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomNum}-${countryCode.toUpperCase()}`;
}

// Helper to generate a 4-digit secure OTP code
export function generateDeliveryOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generates an authentic scannable Data URL QR Code
 */
export async function generateAwbQrDataUrl(
  awbNumber: string,
  baseUrl = ""
): Promise<string> {
  try {
    const rootUrl =
      baseUrl ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "https://noormexa.com");
    const trackUrl = `${rootUrl}/shipping?track=${encodeURIComponent(awbNumber)}`;
    
    return await QRCode.toDataURL(trackUrl, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 320,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.warn("Failed to generate QR code via QRCode library, falling back to SVG", err);
    return "";
  }
}

/**
 * Get all stored shipments from LocalStorage (safe fallback cache)
 */
export function getLocalShipments(): Shipment[] {
  if (typeof window === "undefined") return INITIAL_SAMPLE_SHIPMENTS;
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_SHIPMENTS_KEY);
    if (!raw) {
      window.localStorage.setItem(
        LOCAL_STORAGE_SHIPMENTS_KEY,
        JSON.stringify(INITIAL_SAMPLE_SHIPMENTS)
      );
      return INITIAL_SAMPLE_SHIPMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_SHIPMENTS;
  } catch {
    return INITIAL_SAMPLE_SHIPMENTS;
  }
}

/**
 * Save shipments to LocalStorage
 */
export function saveLocalShipments(shipments: Shipment[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LOCAL_STORAGE_SHIPMENTS_KEY,
      JSON.stringify(shipments)
    );
  } catch (err) {
    console.error("Failed to save shipments to local storage", err);
  }
}

/**
 * Fetch a single shipment by AWB tracking number
 * Tries Supabase first, then falls back to persistent local storage cache
 */
export async function fetchShipmentByAwb(
  awbNumber: string
): Promise<{ shipment: Shipment | null; source: "supabase" | "local" | "demo" }> {
  const cleanAwb = awbNumber.trim().toUpperCase();

  // Try Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("*, events:shipment_events(*)")
        .ilike("awb_number", cleanAwb)
        .single();

      if (!error && data) {
        const formatted: Shipment = {
          ...data,
          events: Array.isArray(data.events)
            ? data.events.sort(
                (a: ShipmentEvent, b: ShipmentEvent) =>
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              )
            : [],
        };
        return { shipment: formatted, source: "supabase" };
      }
    } catch (supabaseErr) {
      console.warn("Supabase fetch failed, falling back to local store", supabaseErr);
    }
  }

  // Fallback to local storage
  const localList = getLocalShipments();
  const match = localList.find(
    (s) => s.awb_number.toUpperCase() === cleanAwb || s.order_id.toUpperCase() === cleanAwb
  );

  if (match) {
    return { shipment: match, source: "local" };
  }

  return { shipment: null, source: "demo" };
}

/**
 * Fetch all shipments for a specific store
 */
export async function fetchStoreShipments(
  storeId: string
): Promise<{ shipments: Shipment[]; isLiveSupabase: boolean }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("*, events:shipment_events(*)")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return { shipments: data as Shipment[], isLiveSupabase: true };
      }
    } catch (err) {
      console.warn("Error fetching store shipments from Supabase", err);
    }
  }

  const localList = getLocalShipments();
  const storeFiltered = localList.filter(
    (s) => s.store_id === storeId || storeId === "all" || s.store_id === "store-official"
  );

  return {
    shipments: storeFiltered.length > 0 ? storeFiltered : localList,
    isLiveSupabase: false,
  };
}

/**
 * Create a new official shipment in Supabase and LocalStorage
 */
export async function createNewShipment(
  input: CreateShipmentInput
): Promise<{ shipment: Shipment; savedInSupabase: boolean; error?: string }> {
  const carrierMeta = CARRIER_METADATA[input.carrier_code] || CARRIER_METADATA.NRX_FLEET;
  const awbNumber = generateAwbNumber(input.carrier_code, input.recipient_country === "الإمارات العربية المتحدة" ? "AE" : "SA");
  const deliveryOtp = generateDeliveryOtp();
  const now = new Date().toISOString();
  const estHours = carrierMeta.avgHours;
  const estDate = new Date(Date.now() + estHours * 3600 * 1000).toISOString();

  const initialEvent: ShipmentEvent = {
    id: `ev-${Date.now()}`,
    awb_number: awbNumber,
    status: "ready_to_ship",
    title_ar: `تم إصدار بوليصة الشحن بنجاح عبر (${carrierMeta.nameAr})`,
    title_en: `Waybill Generated Successfully via (${carrierMeta.nameEn})`,
    description_ar: `تم تأكيد تفاصيل الشحن والوزن (${input.package_weight_kg} كجم) وتعيين رقم البوليصة الرسمي مع رمز الاستلام السري.`,
    description_en: `Shipping label verified. Package weight ${input.package_weight_kg} kg with secure OTP.`,
    location: `${input.sender_city} - مستودع المتجر`,
    timestamp: now,
  };

  const newShipment: Shipment = {
    id: `shp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    awb_number: awbNumber,
    order_id: input.order_id,
    store_id: input.store_id,
    store_name: input.store_name,
    carrier_code: input.carrier_code,
    carrier_name: carrierMeta.nameAr,
    carrier_logo: carrierMeta.logo,
    status: "ready_to_ship",
    sender_name: input.sender_name,
    sender_phone: input.sender_phone,
    sender_address: input.sender_address,
    sender_city: input.sender_city,
    sender_country: input.sender_country,
    sender_lat: 24.6877,
    sender_lng: 46.7219,
    recipient_name: input.recipient_name,
    recipient_phone: input.recipient_phone,
    recipient_address: input.recipient_address,
    recipient_city: input.recipient_city,
    recipient_district: input.recipient_district || "وسط المدينة",
    recipient_country: input.recipient_country,
    recipient_postal_code: input.recipient_postal_code || "11564",
    recipient_lat: 24.7800,
    recipient_lng: 46.6500,
    package_weight_kg: input.package_weight_kg,
    package_dimensions: input.package_dimensions || "25x20x15 cm",
    items_summary: input.items_summary,
    items_count: input.items_count,
    declared_value: input.declared_value,
    currency: input.currency || "SAR",
    payment_type: input.payment_type,
    cod_amount: input.payment_type === "cod" ? input.cod_amount || input.declared_value : 0,
    delivery_otp: deliveryOtp,
    estimated_delivery_date: estDate,
    estimated_delivery_time: `خلال ${estHours} ساعة عمل`,
    events: [initialEvent],
    waypoints: [
      { name: `مستودع المتجر (${input.sender_city})`, city: input.sender_city, country: input.sender_country, lat: 24.6877, lng: 46.7219, passed: true, timestamp: "الآن" },
      { name: `مركز التوزيع الإقليمي (${carrierMeta.nameEn})`, city: input.sender_city, country: input.sender_country, lat: 24.7300, lng: 46.6900, passed: false },
      { name: `عنوان التسليم (${input.recipient_city})`, city: input.recipient_city, country: input.recipient_country, lat: 24.7800, lng: 46.6500, passed: false },
    ],
    created_at: now,
    updated_at: now,
    notes: input.notes || "طرد قابل للكسر - يرجى التعامل بعناية",
  };

  let savedInSupabase = false;

  // Attempt to insert in Supabase
  if (isSupabaseConfigured) {
    try {
      const { error: shpError } = await supabase.from("shipments").insert({
        id: newShipment.id,
        awb_number: newShipment.awb_number,
        order_id: newShipment.order_id,
        store_id: newShipment.store_id,
        store_name: newShipment.store_name,
        carrier_code: newShipment.carrier_code,
        carrier_name: newShipment.carrier_name,
        carrier_logo: newShipment.carrier_logo,
        status: newShipment.status,
        sender_name: newShipment.sender_name,
        sender_phone: newShipment.sender_phone,
        sender_address: newShipment.sender_address,
        sender_city: newShipment.sender_city,
        sender_country: newShipment.sender_country,
        recipient_name: newShipment.recipient_name,
        recipient_phone: newShipment.recipient_phone,
        recipient_address: newShipment.recipient_address,
        recipient_city: newShipment.recipient_city,
        recipient_district: newShipment.recipient_district,
        recipient_country: newShipment.recipient_country,
        recipient_postal_code: newShipment.recipient_postal_code,
        package_weight_kg: newShipment.package_weight_kg,
        package_dimensions: newShipment.package_dimensions,
        items_summary: newShipment.items_summary,
        items_count: newShipment.items_count,
        declared_value: newShipment.declared_value,
        currency: newShipment.currency,
        payment_type: newShipment.payment_type,
        cod_amount: newShipment.cod_amount,
        delivery_otp: newShipment.delivery_otp,
        estimated_delivery_date: newShipment.estimated_delivery_date,
        created_at: newShipment.created_at,
        updated_at: newShipment.updated_at,
      });

      if (!shpError) {
        // Insert event
        await supabase.from("shipment_events").insert({
          id: initialEvent.id,
          shipment_id: newShipment.id,
          awb_number: newShipment.awb_number,
          status: initialEvent.status,
          title_ar: initialEvent.title_ar,
          title_en: initialEvent.title_en,
          description_ar: initialEvent.description_ar,
          description_en: initialEvent.description_en,
          location: initialEvent.location,
          timestamp: initialEvent.timestamp,
        });
        savedInSupabase = true;
      }
    } catch (supErr) {
      console.warn("Supabase insert failed, maintaining in localStorage", supErr);
    }
  }

  // Always save to LocalStorage for offline-first reliability
  const currentList = getLocalShipments();
  const updatedList = [newShipment, ...currentList.filter((s) => s.awb_number !== newShipment.awb_number)];
  saveLocalShipments(updatedList);

  return {
    shipment: newShipment,
    savedInSupabase,
  };
}

/**
 * Update shipment status and append a tracking event
 */
export async function updateShipmentStatus(
  awbNumber: string,
  newStatus: ShipmentStatus,
  customNote?: string
): Promise<{ success: boolean; shipment: Shipment | null }> {
  const currentList = getLocalShipments();
  const index = currentList.findIndex(
    (s) => s.awb_number.toUpperCase() === awbNumber.toUpperCase()
  );

  if (index === -1) {
    return { success: false, shipment: null };
  }

  const target = currentList[index];
  const now = new Date().toISOString();

  const statusTitles: Record<ShipmentStatus, { ar: string; en: string; descAr: string; descEn: string }> = {
    draft: { ar: "مسودة شحنة", en: "Draft Shipment", descAr: "تم حفظ بيانات الشحنة كمسودة", descEn: "Saved as draft" },
    ready_to_ship: { ar: "جاهز للشحن والاستلام", en: "Ready to Ship", descAr: "الطرد جاهز وتم إخطار شركة الشحن", descEn: "Package is ready for pickup" },
    picked_up: { ar: "تم استلام الشحنة من المستودع", en: "Picked Up by Courier", descAr: "تم استلام الطرد بواسطة مندوب الشحن", descEn: "Courier picked up the parcel" },
    in_transit: { ar: "الشحنة في طريق الترانزيت", en: "In Transit", descAr: "الشحنة تنتقل بين المحطات اللوجستية المركزية", descEn: "Moving between logistics hubs" },
    out_for_delivery: { ar: "الشحنة مع المندوب للتسليم النهائي", en: "Out for Delivery", descAr: `المندوب في طريقه للعنوان، الرمز السري: (${target.delivery_otp})`, descEn: `Driver out for delivery with OTP: (${target.delivery_otp})` },
    delivered: { ar: "تم التسليم بنجاح للعميل", en: "Successfully Delivered", descAr: "تم تسليم الطرد والتأكد من مطابقة الرمز السري والتوقيع.", descEn: "Delivered & verified with secure OTP." },
    returned: { ar: "تم إرجاع الشحنة للمرسل", en: "Returned to Shipper", descAr: "تمت إعادة الطرد للمستودع", descEn: "Returned to merchant warehouse" },
    cancelled: { ar: "تم إلغاء الشحنة", en: "Shipment Cancelled", descAr: "تم إلغاء بوليصة الشحن بطلب العميل أو المتجر", descEn: "Waybill cancelled by user or store" },
  };

  const statusMeta = statusTitles[newStatus];

  const newEvent: ShipmentEvent = {
    id: `ev-${Date.now()}`,
    awb_number: target.awb_number,
    status: newStatus,
    title_ar: statusMeta.ar,
    title_en: statusMeta.en,
    description_ar: customNote || statusMeta.descAr,
    description_en: customNote || statusMeta.descEn,
    location: target.recipient_city,
    timestamp: now,
  };

  const updatedShipment: Shipment = {
    ...target,
    status: newStatus,
    updated_at: now,
    events: [newEvent, ...(target.events || [])],
  };

  currentList[index] = updatedShipment;
  saveLocalShipments(currentList);

  // Sync with Supabase if configured
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from("shipments")
        .update({ status: newStatus, updated_at: now })
        .eq("awb_number", target.awb_number);

      await supabase.from("shipment_events").insert({
        id: newEvent.id,
        shipment_id: target.id,
        awb_number: target.awb_number,
        status: newStatus,
        title_ar: newEvent.title_ar,
        title_en: newEvent.title_en,
        description_ar: newEvent.description_ar,
        description_en: newEvent.description_en,
        location: newEvent.location,
        timestamp: now,
      });
    } catch (err) {
      console.warn("Supabase status update failed, local copy intact", err);
    }
  }

  return { success: true, shipment: updatedShipment };
}

export interface LegacyMarketplaceShipment {
  id?: string;
  orderId?: string;
  orderNumber?: string;
  awbNumber?: string;
  trackingNumber?: string;
  carrierId?: string;
  carrierCode?: string;
  carrierName?: string;
  carrierLogo?: string;
  carrier?: string;
  storeId?: string;
  store_id?: string;
  storeName?: string;
  store_name?: string;
  originCity?: string;
  originCountry?: string;
  originWarehouse?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  recipientCountry?: string;
  recipientCity?: string;
  recipientAddress?: string;
  shipping_info?: {
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  packageWeightKg?: number;
  dimensions?: { length: number; width: number; height: number };
  itemCount?: number;
  itemsList?: string;
  declaredValue?: number;
  total_amount?: number;
  paymentType?: "prepaid" | "cod";
  codAmount?: number;
  deliveryOtp?: string;
  estimatedDelivery?: string;
  notes?: string;
  status?: string;
  driverName?: string;
  driverPhone?: string;
  driverAvatar?: string;
  driverVehicle?: string;
  checkpoints?: Array<{
    id?: string;
    status?: string;
    titleAr?: string;
    titleEn?: string;
    locationAr?: string;
    locationEn?: string;
    detailsAr?: string;
    detailsEn?: string;
    timestamp?: string;
  }>;
  created_at?: string;
  awb_number?: string;
}

/**
 * Adapter helper to convert any marketplace shipment format to the rich Logistics Shipment model
 */
export function adaptMarketplaceToLogisticsShipment(item: LegacyMarketplaceShipment | Shipment): Shipment {
  if ("awb_number" in item && item.awb_number && "waypoints" in item) {
    return item as Shipment;
  }

  const legacy = item as LegacyMarketplaceShipment;
  const awb = legacy.awbNumber || legacy.trackingNumber || legacy.awb_number || `AWB-${legacy.id || "NRX-001"}`;
  const now = new Date().toISOString();

  return {
    id: legacy.id || `shp_${Date.now()}`,
    awb_number: awb,
    order_id: legacy.orderId || legacy.orderNumber || "ORD-001",
    store_id: legacy.storeId || legacy.store_id || "store-techcraft",
    store_name: legacy.storeName || legacy.store_name || "NOORMEXA Official Store",
    store_city: legacy.originCity || "الرياض",
    carrier_code: (legacy.carrierCode || legacy.carrierId || "NRX_FLEET") as CarrierCode,
    carrier_name: legacy.carrierName || legacy.carrier || "NOORMEXA Direct Fleet (VIP)",
    carrier_logo: legacy.carrierLogo || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150",
    status: (legacy.status === "exception" ? "in_transit" : legacy.status || "ready_to_ship") as ShipmentStatus,
    sender_name: legacy.storeName || "مستودع نورميكسا المركزي",
    sender_phone: "+966 9200 88210",
    sender_address: legacy.originWarehouse || "مجمع المستودعات اللوجستية الحديثة",
    sender_city: legacy.originCity || "الرياض",
    sender_country: legacy.originCountry || "المملكة العربية السعودية",
    recipient_name: legacy.recipientName || legacy.shipping_info?.fullName || "العميل المستلم",
    recipient_phone: legacy.recipientPhone || legacy.shipping_info?.phone || "+966 50 123 4567",
    recipient_address: legacy.recipientAddress || legacy.shipping_info?.address || "حي النرجس",
    recipient_city: legacy.recipientCity || legacy.shipping_info?.city || "الرياض",
    recipient_district: "حي النرجس",
    recipient_country: legacy.recipientCountry || legacy.shipping_info?.country || "المملكة العربية السعودية",
    recipient_postal_code: "11564",
    package_weight_kg: legacy.packageWeightKg || 1.5,
    package_dimensions: legacy.dimensions ? `${legacy.dimensions.length}x${legacy.dimensions.width}x${legacy.dimensions.height} cm` : "30x20x15 cm",
    items_summary: legacy.itemsList || "منتجات تسوق إلكتروني موثقة",
    items_count: legacy.itemCount || 1,
    declared_value: legacy.declaredValue || legacy.total_amount || 450,
    currency: "SAR",
    payment_type: legacy.paymentType || "prepaid",
    cod_amount: legacy.codAmount || (legacy.paymentType === "cod" ? legacy.declaredValue || 0 : 0),
    delivery_otp: legacy.deliveryOtp || "8821",
    estimated_delivery_date: legacy.estimatedDelivery || "خلال 24-48 ساعة",
    estimated_delivery_time: "اليوم خلال ساعتين",
    notes: legacy.notes || "يرجى الاتصال قبل الوصول",
    courier: legacy.driverName
      ? {
          name: legacy.driverName,
          phone: legacy.driverPhone || "+966 55 123 4567",
          rating: 4.9,
          avatar: legacy.driverAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
          vehicle_type: "van",
          vehicle_plate: legacy.driverVehicle || "أ ب ج 1234",
          current_speed_kmh: 42,
        }
      : undefined,
    waypoints: [
      {
        name: "المستودع الرئيسي - الشحن والتغليف",
        lat: 24.7136,
        lng: 46.6753,
        city: legacy.originCity || "الرياض",
        country: "المملكة العربية السعودية",
        passed: true,
        timestamp: "08:00 AM",
      },
      {
        name: "مركز الفرز والتوزيع المركزي",
        lat: 24.7743,
        lng: 46.7386,
        city: "الرياض",
        country: "المملكة العربية السعودية",
        passed: ["in_transit", "out_for_delivery", "delivered"].includes(legacy.status || ""),
        timestamp: "11:30 AM",
      },
      {
        name: `عنوان التسليم: ${legacy.recipientCity || "الرياض"}`,
        lat: 24.8105,
        lng: 46.6341,
        city: legacy.recipientCity || "الرياض",
        country: "المملكة العربية السعودية",
        passed: legacy.status === "delivered",
        timestamp: legacy.status === "delivered" ? "02:15 PM" : undefined,
      },
    ],
    events: legacy.checkpoints
      ? legacy.checkpoints.map((cp, idx) => ({
          id: cp.id || `ev-${idx}`,
          awb_number: awb,
          status: (cp.status === "exception" ? "in_transit" : cp.status || "ready_to_ship") as ShipmentStatus,
          title_ar: cp.titleAr || "محطة شحن",
          title_en: cp.titleEn || "Checkpoint",
          description_ar: cp.detailsAr || "",
          description_en: cp.detailsEn || "",
          location: cp.locationAr || cp.locationEn || "الرياض",
          timestamp: cp.timestamp || now,
        }))
      : [],
    created_at: legacy.created_at || now,
    updated_at: now,
  };
}

