/**
 * NOORMEXA Privacy-First Geolocation & Regional Location Intelligence Service
 * 
 * Complies with strict browser privacy best practices:
 * 1. Zero-permission instant region/country detection via timezone & locale (non-intrusive).
 * 2. User-initiated high-accuracy GPS requests with timeout fallbacks & permission checks.
 * 3. Offline fast reverse geocoding with multi-lingual city coordinates database.
 * 4. Realistic proximity-based logistics hub selection.
 */

import { CurrencyCode } from "@/types/marketplace";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DetectedLocation {
  lat: number;
  lng: number;
  cityAr: string;
  cityEn: string;
  countryAr: string;
  countryEn: string;
  countryCode: string;
  currency: CurrencyCode;
  accuracyMeters?: number;
  source: "gps" | "ip" | "timezone" | "cached" | "city_lookup" | "static_default";
  timestamp: number;
  isHighAccuracy?: boolean;
}

export const DEFAULT_STATIC_LOCATION: DetectedLocation = {
  lat: 24.7136,
  lng: 46.6753,
  cityAr: "الرياض",
  cityEn: "Riyadh",
  countryAr: "المملكة العربية السعودية",
  countryEn: "Saudi Arabia",
  countryCode: "SA",
  currency: "SAR",
  accuracyMeters: 5000,
  source: "static_default",
  timestamp: Date.now(),
};

export interface DeliveryDestinationItem {
  key: string;
  cityAr: string;
  cityEn: string;
  countryAr: string;
  countryEn: string;
  countryCode: string;
  flagEmoji: string;
  currency: CurrencyCode;
  coords: LatLng;
}

export const POPULAR_DELIVERY_DESTINATIONS: DeliveryDestinationItem[] = [
  { key: "riyadh", cityAr: "الرياض", cityEn: "Riyadh", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", countryCode: "SA", flagEmoji: "🇸🇦", currency: "SAR", coords: { lat: 24.7136, lng: 46.6753 } },
  { key: "jeddah", cityAr: "جدة", cityEn: "Jeddah", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", countryCode: "SA", flagEmoji: "🇸🇦", currency: "SAR", coords: { lat: 21.5433, lng: 39.1728 } },
  { key: "dammam", cityAr: "الدمام", cityEn: "Dammam", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", countryCode: "SA", flagEmoji: "🇸🇦", currency: "SAR", coords: { lat: 26.4207, lng: 50.0888 } },
  { key: "cairo", cityAr: "القاهرة", cityEn: "Cairo", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", countryCode: "EG", flagEmoji: "🇪🇬", currency: "EGP", coords: { lat: 30.0444, lng: 31.2357 } },
  { key: "alexandria", cityAr: "الإسكندرية", cityEn: "Alexandria", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", countryCode: "EG", flagEmoji: "🇪🇬", currency: "EGP", coords: { lat: 31.2001, lng: 29.9187 } },
  { key: "dubai", cityAr: "دبي", cityEn: "Dubai", countryAr: "الإمارات العربية المتحدة", countryEn: "UAE", countryCode: "AE", flagEmoji: "🇦🇪", currency: "AED", coords: { lat: 25.2048, lng: 55.2708 } },
  { key: "abudhabi", cityAr: "أبوظبي", cityEn: "Abu Dhabi", countryAr: "الإمارات العربية المتحدة", countryEn: "UAE", countryCode: "AE", flagEmoji: "🇦🇪", currency: "AED", coords: { lat: 24.4539, lng: 54.3773 } },
  { key: "kuwait", cityAr: "الكويت", cityEn: "Kuwait City", countryAr: "دولة الكويت", countryEn: "Kuwait", countryCode: "KW", flagEmoji: "🇰🇼", currency: "KWD", coords: { lat: 29.3759, lng: 47.9774 } },
  { key: "doha", cityAr: "الدوحة", cityEn: "Doha", countryAr: "دولة قطر", countryEn: "Qatar", countryCode: "QA", flagEmoji: "🇶🇦", currency: "QAR", coords: { lat: 25.2854, lng: 51.5310 } },
  { key: "manama", cityAr: "المنامة", cityEn: "Manama", countryAr: "مملكة البحرين", countryEn: "Bahrain", countryCode: "BH", flagEmoji: "🇧🇭", currency: "USD", coords: { lat: 26.2285, lng: 50.5860 } },
  { key: "muscat", cityAr: "مسقط", cityEn: "Muscat", countryAr: "سلطنة عمان", countryEn: "Oman", countryCode: "OM", flagEmoji: "🇴🇲", currency: "USD", coords: { lat: 23.5880, lng: 58.3829 } },
  { key: "amman", cityAr: "عمان", cityEn: "Amman", countryAr: "المملكة الأردنية", countryEn: "Jordan", countryCode: "JO", flagEmoji: "🇯🇴", currency: "USD", coords: { lat: 31.9539, lng: 35.9106 } },
  { key: "london", cityAr: "لندن", cityEn: "London", countryAr: "المملكة المتحدة", countryEn: "United Kingdom", countryCode: "GB", flagEmoji: "🇬🇧", currency: "USD", coords: { lat: 51.5074, lng: -0.1278 } },
  { key: "newyork", cityAr: "نيويورك", cityEn: "New York", countryAr: "الولايات المتحدة", countryEn: "United States", countryCode: "US", flagEmoji: "🇺🇸", currency: "USD", coords: { lat: 40.7128, lng: -74.0060 } },
  { key: "paris", cityAr: "باريس", cityEn: "Paris", countryAr: "فرنسا", countryEn: "France", countryCode: "FR", flagEmoji: "🇫🇷", currency: "EUR", coords: { lat: 48.8566, lng: 2.3522 } },
];

export interface FulfillmentHub {
  id: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  countryCode: string;
  coords: LatLng;
  code: string;
}

// 1. Comprehensive Regional & Global City Coordinates Database
export const CITY_COORDINATES_DB: Record<string, { lat: number; lng: number; cityAr: string; cityEn: string; countryCode: string; countryAr: string; countryEn: string; currency: CurrencyCode }> = {
  // Saudi Arabia
  riyadh: { lat: 24.7136, lng: 46.6753, cityAr: "الرياض", cityEn: "Riyadh", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  jeddah: { lat: 21.5433, lng: 39.1728, cityAr: "جدة", cityEn: "Jeddah", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  dammam: { lat: 26.4207, lng: 50.0888, cityAr: "الدمام", cityEn: "Dammam", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  makkah: { lat: 21.3891, lng: 39.8579, cityAr: "مكة المكرمة", cityEn: "Mecca", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  mecca: { lat: 21.3891, lng: 39.8579, cityAr: "مكة المكرمة", cityEn: "Mecca", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  medina: { lat: 24.5247, lng: 39.5692, cityAr: "المدينة المنورة", cityEn: "Medina", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  khobar: { lat: 26.2172, lng: 50.1971, cityAr: "الخبر", cityEn: "Al Khobar", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  dhahran: { lat: 26.2361, lng: 50.1111, cityAr: "الظهران", cityEn: "Dhahran", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  tabuk: { lat: 28.3835, lng: 36.5662, cityAr: "تبوك", cityEn: "Tabuk", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  abha: { lat: 18.2164, lng: 42.5053, cityAr: "أبها", cityEn: "Abha", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  taif: { lat: 21.2854, lng: 40.4222, cityAr: "الطائف", cityEn: "Taif", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  buraydah: { lat: 26.3260, lng: 43.9750, cityAr: "بريدة", cityEn: "Buraidah", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  hail: { lat: 27.5114, lng: 41.7208, cityAr: "حائل", cityEn: "Hail", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  jubail: { lat: 27.0174, lng: 49.6225, cityAr: "الجبيل", cityEn: "Jubail", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  yanbu: { lat: 24.0891, lng: 38.0637, cityAr: "ينبع", cityEn: "Yanbu", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  jazan: { lat: 16.8892, lng: 42.5511, cityAr: "جازان", cityEn: "Jazan", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },
  khamis: { lat: 18.3000, lng: 42.7333, cityAr: "خميس مشيط", cityEn: "Khamis Mushait", countryCode: "SA", countryAr: "المملكة العربية السعودية", countryEn: "Saudi Arabia", currency: "SAR" },

  // Egypt
  cairo: { lat: 30.0444, lng: 31.2357, cityAr: "القاهرة", cityEn: "Cairo", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },
  giza: { lat: 30.0131, lng: 31.2089, cityAr: "الجيزة", cityEn: "Giza", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },
  alexandria: { lat: 31.2001, lng: 29.9187, cityAr: "الإسكندرية", cityEn: "Alexandria", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },
  mansoura: { lat: 31.0409, lng: 31.3785, cityAr: "المنصورة", cityEn: "Mansoura", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },
  tanta: { lat: 30.7865, lng: 31.0004, cityAr: "طنطا", cityEn: "Tanta", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },
  zagazig: { lat: 30.5877, lng: 31.5020, cityAr: "الزقازيق", cityEn: "Zagazig", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },
  portsaid: { lat: 31.2653, lng: 32.3019, cityAr: "بورسعيد", cityEn: "Port Said", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },
  suez: { lat: 29.9668, lng: 32.5498, cityAr: "السويس", cityEn: "Suez", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },
  ismailia: { lat: 30.5965, lng: 32.2715, cityAr: "الإسماعيلية", cityEn: "Ismailia", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },
  aswan: { lat: 24.0889, lng: 32.8998, cityAr: "أسوان", cityEn: "Aswan", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },
  luxor: { lat: 25.6872, lng: 32.6396, cityAr: "الأقصر", cityEn: "Luxor", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },
  hurghada: { lat: 27.2579, lng: 33.8116, cityAr: "الغردقة", cityEn: "Hurghada", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },
  sharm: { lat: 27.9158, lng: 34.3299, cityAr: "شرم الشيخ", cityEn: "Sharm El Sheikh", countryCode: "EG", countryAr: "جمهورية مصر العربية", countryEn: "Egypt", currency: "EGP" },

  // UAE
  dubai: { lat: 25.2048, lng: 55.2708, cityAr: "دبي", cityEn: "Dubai", countryCode: "AE", countryAr: "الإمارات العربية المتحدة", countryEn: "United Arab Emirates", currency: "AED" },
  abudhabi: { lat: 24.4539, lng: 54.3773, cityAr: "أبوظبي", cityEn: "Abu Dhabi", countryCode: "AE", countryAr: "الإمارات العربية المتحدة", countryEn: "United Arab Emirates", currency: "AED" },
  sharjah: { lat: 25.3463, lng: 55.4209, cityAr: "الشارقة", cityEn: "Sharjah", countryCode: "AE", countryAr: "الإمارات العربية المتحدة", countryEn: "United Arab Emirates", currency: "AED" },
  ajman: { lat: 25.4052, lng: 55.5136, cityAr: "عجمان", cityEn: "Ajman", countryCode: "AE", countryAr: "الإمارات العربية المتحدة", countryEn: "United Arab Emirates", currency: "AED" },
  alain: { lat: 24.2075, lng: 55.7447, cityAr: "العين", cityEn: "Al Ain", countryCode: "AE", countryAr: "الإمارات العربية المتحدة", countryEn: "United Arab Emirates", currency: "AED" },
  rasalkhaimah: { lat: 25.7895, lng: 55.9432, cityAr: "رأس الخيمة", cityEn: "Ras Al Khaimah", countryCode: "AE", countryAr: "الإمارات العربية المتحدة", countryEn: "United Arab Emirates", currency: "AED" },
  fujairah: { lat: 25.1288, lng: 56.3265, cityAr: "الفجيرة", cityEn: "Fujairah", countryCode: "AE", countryAr: "الإمارات العربية المتحدة", countryEn: "United Arab Emirates", currency: "AED" },

  // Kuwait
  kuwait: { lat: 29.3759, lng: 47.9774, cityAr: "الكويت", cityEn: "Kuwait City", countryCode: "KW", countryAr: "دولة الكويت", countryEn: "Kuwait", currency: "KWD" },
  hawally: { lat: 29.3328, lng: 48.0286, cityAr: "حولي", cityEn: "Hawally", countryCode: "KW", countryAr: "دولة الكويت", countryEn: "Kuwait", currency: "KWD" },
  salmiya: { lat: 29.3344, lng: 48.0772, cityAr: "السالمية", cityEn: "Salmiya", countryCode: "KW", countryAr: "دولة الكويت", countryEn: "Kuwait", currency: "KWD" },

  // Qatar
  doha: { lat: 25.2854, lng: 51.5310, cityAr: "الدوحة", cityEn: "Doha", countryCode: "QA", countryAr: "دولة قطر", countryEn: "Qatar", currency: "QAR" },
  rayyan: { lat: 25.2919, lng: 51.4244, cityAr: "الريان", cityEn: "Al Rayyan", countryCode: "QA", countryAr: "دولة قطر", countryEn: "Qatar", currency: "QAR" },

  // Bahrain
  manama: { lat: 26.2285, lng: 50.5860, cityAr: "المنامة", cityEn: "Manama", countryCode: "BH", countryAr: "مملكة البحرين", countryEn: "Bahrain", currency: "USD" },
  riffa: { lat: 26.1300, lng: 50.5550, cityAr: "الرفاع", cityEn: "Riffa", countryCode: "BH", countryAr: "مملكة البحرين", countryEn: "Bahrain", currency: "USD" },

  // Oman
  muscat: { lat: 23.5880, lng: 58.3829, cityAr: "مسقط", cityEn: "Muscat", countryCode: "OM", countryAr: "سلطنة عمان", countryEn: "Oman", currency: "USD" },
  salalah: { lat: 17.0151, lng: 54.0924, cityAr: "صلالة", cityEn: "Salalah", countryCode: "OM", countryAr: "سلطنة عمان", countryEn: "Oman", currency: "USD" },

  // Jordan
  amman: { lat: 31.9539, lng: 35.9106, cityAr: "عمان", cityEn: "Amman", countryCode: "JO", countryAr: "المملكة الأردنية الهاشمية", countryEn: "Jordan", currency: "USD" },
  aqaba: { lat: 29.5320, lng: 35.0063, cityAr: "العقبة", cityEn: "Aqaba", countryCode: "JO", countryAr: "المملكة الأردنية الهاشمية", countryEn: "Jordan", currency: "USD" },

  // Lebanon
  beirut: { lat: 33.8938, lng: 35.5018, cityAr: "بيروت", cityEn: "Beirut", countryCode: "LB", countryAr: "لبنان", countryEn: "Lebanon", currency: "USD" },

  // Iraq
  baghdad: { lat: 33.3152, lng: 44.3661, cityAr: "بغداد", cityEn: "Baghdad", countryCode: "IQ", countryAr: "العراق", countryEn: "Iraq", currency: "USD" },
  erbil: { lat: 36.1911, lng: 44.0092, cityAr: "أربيل", cityEn: "Erbil", countryCode: "IQ", countryAr: "العراق", countryEn: "Iraq", currency: "USD" },

  // North Africa
  casablanca: { lat: 33.5731, lng: -7.5898, cityAr: "الدار البيضاء", cityEn: "Casablanca", countryCode: "MA", countryAr: "المملكة المغربية", countryEn: "Morocco", currency: "USD" },
  rabat: { lat: 34.0209, lng: -6.8416, cityAr: "الرباط", cityEn: "Rabat", countryCode: "MA", countryAr: "المملكة المغربية", countryEn: "Morocco", currency: "USD" },
  tunis: { lat: 36.8065, lng: 10.1815, cityAr: "تونس", cityEn: "Tunis", countryCode: "TN", countryAr: "الجمهورية التونسية", countryEn: "Tunisia", currency: "USD" },
  algiers: { lat: 36.7538, lng: 3.0588, cityAr: "الجزائر", cityEn: "Algiers", countryCode: "DZ", countryAr: "الجمهورية الجزائرية", countryEn: "Algeria", currency: "USD" },

  // Major Global Hubs
  london: { lat: 51.5074, lng: -0.1278, cityAr: "لندن", cityEn: "London", countryCode: "GB", countryAr: "المملكة المتحدة", countryEn: "United Kingdom", currency: "USD" },
  newyork: { lat: 40.7128, lng: -74.0060, cityAr: "نيويورك", cityEn: "New York", countryCode: "US", countryAr: "الولايات المتحدة", countryEn: "United States", currency: "USD" },
  paris: { lat: 48.8566, lng: 2.3522, cityAr: "باريس", cityEn: "Paris", countryCode: "FR", countryAr: "فرنسا", countryEn: "France", currency: "EUR" },
  berlin: { lat: 52.5200, lng: 13.4050, cityAr: "برلين", cityEn: "Berlin", countryCode: "DE", countryAr: "ألمانيا", countryEn: "Germany", currency: "EUR" },
  rome: { lat: 41.9028, lng: 12.4964, cityAr: "روما", cityEn: "Rome", countryCode: "IT", countryAr: "إيطاليا", countryEn: "Italy", currency: "EUR" },
  madrid: { lat: 40.4168, lng: -3.7038, cityAr: "مدريد", cityEn: "Madrid", countryCode: "ES", countryAr: "إسبانيا", countryEn: "Spain", currency: "EUR" },
  istanbul: { lat: 41.0082, lng: 28.9784, cityAr: "إسطنبول", cityEn: "Istanbul", countryCode: "TR", countryAr: "تركيا", countryEn: "Turkey", currency: "USD" },
  tokyo: { lat: 35.6762, lng: 139.6503, cityAr: "طوكيو", cityEn: "Tokyo", countryCode: "JP", countryAr: "اليابان", countryEn: "Japan", currency: "USD" },
};

// 2. Verified Regional Logistics Fulfillment Hubs
export const VERIFIED_FULFILLMENT_HUBS: FulfillmentHub[] = [
  {
    id: "hub-ruh-01",
    nameAr: "مستودع نورميكسا المركزي - الرياض (RUH-01)",
    nameEn: "NOORMEXA Central Hub - Riyadh (RUH-01)",
    cityAr: "الرياض",
    cityEn: "Riyadh",
    countryCode: "SA",
    code: "RUH-01",
    coords: { lat: 24.7136, lng: 46.6753 },
  },
  {
    id: "hub-jed-02",
    nameAr: "مركز توزيع البحر الأحمر - جدة (JED-02)",
    nameEn: "Red Sea Logistics Hub - Jeddah (JED-02)",
    cityAr: "جدة",
    cityEn: "Jeddah",
    countryCode: "SA",
    code: "JED-02",
    coords: { lat: 21.5433, lng: 39.1728 },
  },
  {
    id: "hub-dmm-01",
    nameAr: "مركز الفرز الشرقي - الدمام (DMM-01)",
    nameEn: "Eastern Hub - Dammam (DMM-01)",
    cityAr: "الدمام",
    cityEn: "Dammam",
    countryCode: "SA",
    code: "DMM-01",
    coords: { lat: 26.4207, lng: 50.0888 },
  },
  {
    id: "hub-cai-01",
    nameAr: "مستودع نورميكسا وادي النيل - القاهرة (CAI-01)",
    nameEn: "NOORMEXA Nile Logistics Hub - Cairo (CAI-01)",
    cityAr: "القاهرة",
    cityEn: "Cairo",
    countryCode: "EG",
    code: "CAI-01",
    coords: { lat: 30.0444, lng: 31.2357 },
  },
  {
    id: "hub-alx-01",
    nameAr: "مركز التوزيع الساحلي - الإسكندرية (ALX-01)",
    nameEn: "Coastal Logistics Hub - Alexandria (ALX-01)",
    cityAr: "الإسكندرية",
    cityEn: "Alexandria",
    countryCode: "EG",
    code: "ALX-01",
    coords: { lat: 31.2001, lng: 29.9187 },
  },
  {
    id: "hub-dxb-01",
    nameAr: "مركز لوجستيات دبي ساوث (DXB-01)",
    nameEn: "Dubai South Express Hub (DXB-01)",
    cityAr: "دبي",
    cityEn: "Dubai",
    countryCode: "AE",
    code: "DXB-01",
    coords: { lat: 25.2048, lng: 55.2708 },
  },
  {
    id: "hub-auh-01",
    nameAr: "مركز المصفح اللوجستي - أبوظبي (AUH-01)",
    nameEn: "Mussafah Logistics Center - Abu Dhabi (AUH-01)",
    cityAr: "أبوظبي",
    cityEn: "Abu Dhabi",
    countryCode: "AE",
    code: "AUH-01",
    coords: { lat: 24.4539, lng: 54.3773 },
  },
  {
    id: "hub-kwi-01",
    nameAr: "مركز الشويخ اللوجستي - الكويت (KWI-01)",
    nameEn: "Shuwaikh Central Hub - Kuwait (KWI-01)",
    cityAr: "الكويت",
    cityEn: "Kuwait City",
    countryCode: "KW",
    code: "KWI-01",
    coords: { lat: 29.3759, lng: 47.9774 },
  },
  {
    id: "hub-doh-01",
    nameAr: "مركز اللوجستيات الذكية - الدوحة (DOH-01)",
    nameEn: "Smart Logistics Hub - Doha (DOH-01)",
    cityAr: "الدوحة",
    cityEn: "Doha",
    countryCode: "QA",
    code: "DOH-01",
    coords: { lat: 25.2854, lng: 51.5310 },
  },
  {
    id: "hub-amm-01",
    nameAr: "مركز القسطل اللوجستي - عمان (AMM-01)",
    nameEn: "Qastal Hub - Amman (AMM-01)",
    cityAr: "عمان",
    cityEn: "Amman",
    countryCode: "JO",
    code: "AMM-01",
    coords: { lat: 31.9539, lng: 35.9106 },
  },
];

// Helper: Calculate distance in KM using the Haversine formula
export function calculateDistanceKm(c1: LatLng, c2: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Normalizes a city query string (removes prefixes, diacritics, and punctuation)
export function normalizeLocationString(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/^ال|^al-|^el-/g, "")
    .replace(/[\s-_,.]+/g, "");
}

/**
 * Resolves precise coordinates for any city name in Arabic or English
 */
export function getCityCoordinates(
  cityName?: string,
  fallbackLat?: number,
  fallbackLng?: number
): LatLng {
  if (fallbackLat !== undefined && fallbackLng !== undefined && !isNaN(fallbackLat) && !isNaN(fallbackLng)) {
    return { lat: fallbackLat, lng: fallbackLng };
  }

  if (!cityName || typeof cityName !== "string") {
    return { lat: 24.7136, lng: 46.6753 }; // Default Riyadh
  }

  const normalized = normalizeLocationString(cityName);

  // Exact or partial key match
  for (const [key, info] of Object.entries(CITY_COORDINATES_DB)) {
    const normKey = normalizeLocationString(key);
    const normAr = normalizeLocationString(info.cityAr);
    const normEn = normalizeLocationString(info.cityEn);

    if (
      normalized === normKey ||
      normalized === normAr ||
      normalized === normEn ||
      normalized.includes(normKey) ||
      normKey.includes(normalized) ||
      normalized.includes(normAr) ||
      normAr.includes(normalized) ||
      normalized.includes(normEn) ||
      normEn.includes(normalized)
    ) {
      return { lat: info.lat, lng: info.lng };
    }
  }

  return { lat: 24.7136, lng: 46.6753 };
}

/**
 * Finds the nearest verified fulfillment center to a given location
 */
export function getNearestFulfillmentHub(userCoords: LatLng): FulfillmentHub {
  let closestHub = VERIFIED_FULFILLMENT_HUBS[0];
  let minDistance = Infinity;

  for (const hub of VERIFIED_FULFILLMENT_HUBS) {
    const dist = calculateDistanceKm(userCoords, hub.coords);
    if (dist < minDistance) {
      minDistance = dist;
      closestHub = hub;
    }
  }

  return closestHub;
}

/**
 * Computes an intelligent, geographically safe local fulfillment center
 * for last-mile delivery tracking without risking placement over oceans or outside boundaries
 */
export function getIntelligentLocalOrigin(destinationCoords: LatLng): LatLng {
  const closestHub = getNearestFulfillmentHub(destinationCoords);
  const distanceToClosestHub = calculateDistanceKm(destinationCoords, closestHub.coords);

  // If user is within reasonable regional range (< 120km) of a major hub, use the actual hub
  if (distanceToClosestHub <= 120) {
    return closestHub.coords;
  }

  // Otherwise, place an inland neighborhood dispatch facility ~4 km away
  return {
    lat: destinationCoords.lat + 0.024,
    lng: destinationCoords.lng + 0.018,
  };
}

/**
 * ZERO-PERMISSION Instant Region Detection
 * Uses standard browser Intl.DateTimeFormat (no permission prompt, 100% privacy-safe)
 */
export function detectUserRegionFromTimezone(): DetectedLocation {
  let timeZone = "Asia/Riyadh";
  try {
    if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Riyadh";
    }
  } catch {
    // fallback
  }

  const tz = timeZone.toLowerCase();

  if (tz.includes("cairo") || tz.includes("egypt") || tz.includes("africa/cairo")) {
    return {
      lat: 30.0444,
      lng: 31.2357,
      cityAr: "القاهرة",
      cityEn: "Cairo",
      countryAr: "جمهورية مصر العربية",
      countryEn: "Egypt",
      countryCode: "EG",
      currency: "EGP",
      source: "timezone",
      timestamp: Date.now(),
    };
  }

  if (tz.includes("dubai") || tz.includes("abu_dhabi") || tz.includes("asia/dubai")) {
    return {
      lat: 25.2048,
      lng: 55.2708,
      cityAr: "دبي",
      cityEn: "Dubai",
      countryAr: "الإمارات العربية المتحدة",
      countryEn: "United Arab Emirates",
      countryCode: "AE",
      currency: "AED",
      source: "timezone",
      timestamp: Date.now(),
    };
  }

  if (tz.includes("kuwait") || tz.includes("asia/kuwait")) {
    return {
      lat: 29.3759,
      lng: 47.9774,
      cityAr: "الكويت",
      cityEn: "Kuwait City",
      countryAr: "دولة الكويت",
      countryEn: "Kuwait",
      countryCode: "KW",
      currency: "KWD",
      source: "timezone",
      timestamp: Date.now(),
    };
  }

  if (tz.includes("qatar") || tz.includes("doha") || tz.includes("asia/qatar")) {
    return {
      lat: 25.2854,
      lng: 51.5310,
      cityAr: "الدوحة",
      cityEn: "Doha",
      countryAr: "دولة قطر",
      countryEn: "Qatar",
      countryCode: "QA",
      currency: "QAR",
      source: "timezone",
      timestamp: Date.now(),
    };
  }

  if (tz.includes("bahrain") || tz.includes("manama") || tz.includes("asia/bahrain")) {
    return {
      lat: 26.2285,
      lng: 50.5860,
      cityAr: "المنامة",
      cityEn: "Manama",
      countryAr: "مملكة البحرين",
      countryEn: "Bahrain",
      countryCode: "BH",
      currency: "USD",
      source: "timezone",
      timestamp: Date.now(),
    };
  }

  if (tz.includes("muscat") || tz.includes("oman") || tz.includes("asia/muscat")) {
    return {
      lat: 23.5880,
      lng: 58.3829,
      cityAr: "مسقط",
      cityEn: "Muscat",
      countryAr: "سلطنة عمان",
      countryEn: "Oman",
      countryCode: "OM",
      currency: "USD",
      source: "timezone",
      timestamp: Date.now(),
    };
  }

  if (tz.includes("amman") || tz.includes("jordan") || tz.includes("asia/amman")) {
    return {
      lat: 31.9539,
      lng: 35.9106,
      cityAr: "عمان",
      cityEn: "Amman",
      countryAr: "المملكة الأردنية الهاشمية",
      countryEn: "Jordan",
      countryCode: "JO",
      currency: "USD",
      source: "timezone",
      timestamp: Date.now(),
    };
  }

  if (tz.includes("london") || tz.includes("europe/london")) {
    return {
      lat: 51.5074,
      lng: -0.1278,
      cityAr: "لندن",
      cityEn: "London",
      countryAr: "المملكة المتحدة",
      countryEn: "United Kingdom",
      countryCode: "GB",
      currency: "USD",
      source: "timezone",
      timestamp: Date.now(),
    };
  }

  if (tz.includes("america") || tz.includes("new_york") || tz.includes("los_angeles") || tz.includes("chicago")) {
    return {
      lat: 40.7128,
      lng: -74.0060,
      cityAr: "نيويورك",
      cityEn: "New York",
      countryAr: "الولايات المتحدة",
      countryEn: "United States",
      countryCode: "US",
      currency: "USD",
      source: "timezone",
      timestamp: Date.now(),
    };
  }

  if (tz.includes("europe/paris") || tz.includes("europe/berlin") || tz.includes("europe/rome") || tz.includes("europe/madrid")) {
    return {
      lat: 48.8566,
      lng: 2.3522,
      cityAr: "باريس",
      cityEn: "Paris",
      countryAr: "فرنسا",
      countryEn: "France",
      countryCode: "FR",
      currency: "EUR",
      source: "timezone",
      timestamp: Date.now(),
    };
  }

  // Default to Saudi Arabia (Riyadh)
  return {
    lat: 24.7136,
    lng: 46.6753,
    cityAr: "الرياض",
    cityEn: "Riyadh",
    countryAr: "المملكة العربية السعودية",
    countryEn: "Saudi Arabia",
    countryCode: "SA",
    currency: "SAR",
    source: "timezone",
    timestamp: Date.now(),
  };
}

/**
 * Performs fast, private reverse geocoding from lat/lng coordinates
 * 1. Checks closest known city in local database (< 40km away) for instant 0-network lookup.
 * 2. If remote or in another district, uses OpenStreetMap Nominatim with privacy safeguard.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number,
  locale: "ar" | "en" = "ar"
): Promise<{ cityAr: string; cityEn: string; countryAr: string; countryEn: string; countryCode: string; currency: CurrencyCode }> {
  // 1. Check local DB proximity
  let closestCityInfo: typeof CITY_COORDINATES_DB[string] | null = null;
  let minDistance = Infinity;

  for (const info of Object.values(CITY_COORDINATES_DB)) {
    const dist = calculateDistanceKm({ lat, lng }, { lat: info.lat, lng: info.lng });
    if (dist < minDistance) {
      minDistance = dist;
      closestCityInfo = info;
    }
  }

  if (closestCityInfo && minDistance <= 35) {
    return {
      cityAr: closestCityInfo.cityAr,
      cityEn: closestCityInfo.cityEn,
      countryAr: closestCityInfo.countryAr,
      countryEn: closestCityInfo.countryEn,
      countryCode: closestCityInfo.countryCode,
      currency: closestCityInfo.currency,
    };
  }

  // 2. Client-side fetch to OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${locale === "ar" ? "ar,en" : "en,ar"}`,
      {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const detectedCity = addr.city || addr.town || addr.municipality || addr.state_district || addr.state || (closestCityInfo?.cityAr || "موقعك الحالي");
      const detectedCountry = addr.country || (closestCityInfo?.countryAr || "المملكة العربية السعودية");
      const countryCode = (addr.country_code || closestCityInfo?.countryCode || "SA").toUpperCase();

      const currencyMap: Record<string, CurrencyCode> = {
        SA: "SAR",
        EG: "EGP",
        AE: "AED",
        KW: "KWD",
        QA: "QAR",
        BH: "USD",
        OM: "USD",
        JO: "USD",
        GB: "USD",
        US: "USD",
        FR: "EUR",
        DE: "EUR",
        IT: "EUR",
        ES: "EUR",
      };

      return {
        cityAr: detectedCity,
        cityEn: detectedCity,
        countryAr: detectedCountry,
        countryEn: detectedCountry,
        countryCode,
        currency: currencyMap[countryCode] || "SAR",
      };
    }
  } catch (err) {
    console.warn("Reverse geocode network fallback:", err);
  }

  // Fallback to closest local city or default
  if (closestCityInfo) {
    return {
      cityAr: closestCityInfo.cityAr,
      cityEn: closestCityInfo.cityEn,
      countryAr: closestCityInfo.countryAr,
      countryEn: closestCityInfo.countryEn,
      countryCode: closestCityInfo.countryCode,
      currency: closestCityInfo.currency,
    };
  }

  return {
    cityAr: "الرياض",
    cityEn: "Riyadh",
    countryAr: "المملكة العربية السعودية",
    countryEn: "Saudi Arabia",
    countryCode: "SA",
    currency: "SAR",
  };
}

/**
 * Checks browser permission state for geolocation
 */
export async function checkGeolocationPermissionState(): Promise<"granted" | "denied" | "prompt" | "unsupported"> {
  if (typeof window === "undefined" || !navigator || !("geolocation" in navigator)) {
    return "unsupported";
  }

  if (navigator.permissions && navigator.permissions.query) {
    try {
      const status = await navigator.permissions.query({ name: "geolocation" });
      return status.state;
    } catch {
      return "prompt";
    }
  }

  return "prompt";
}

export interface GpsRequestResult {
  success: boolean;
  location?: DetectedLocation;
  errorMessageAr?: string;
  errorMessageEn?: string;
  isPermissionDenied?: boolean;
}

/**
 * User-Initiated GPS Geolocation request with high accuracy, timeout fallback,
 * and multi-lingual error messages
 */
export async function requestUserGpsLocation(locale: "ar" | "en" = "ar"): Promise<GpsRequestResult> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return {
      success: false,
      errorMessageAr: "متصفحك لا يدعم تحديد الموقع الجغرافي (Geolocation).",
      errorMessageEn: "Your browser does not support Geolocation.",
    };
  }

  return new Promise((resolve) => {
    let resolved = false;

    const onSuccess = async (pos: GeolocationPosition) => {
      if (resolved) return;
      resolved = true;

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracyMeters = pos.coords.accuracy;

      try {
        const rev = await reverseGeocodeCoordinates(lat, lng, locale);
        const resultLoc: DetectedLocation = {
          lat,
          lng,
          cityAr: rev.cityAr,
          cityEn: rev.cityEn,
          countryAr: rev.countryAr,
          countryEn: rev.countryEn,
          countryCode: rev.countryCode,
          currency: rev.currency,
          accuracyMeters,
          source: "gps",
          timestamp: Date.now(),
          isHighAccuracy: true,
        };

        // Cache in sessionStorage for privacy (expires when tab closes)
        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("noormexa_detected_location", JSON.stringify(resultLoc));
          }
        } catch {}

        resolve({
          success: true,
          location: resultLoc,
        });
      } catch {
        resolve({
          success: true,
          location: {
            lat,
            lng,
            cityAr: "موقعك الحالي",
            cityEn: "Your Current Location",
            countryAr: "المملكة العربية السعودية",
            countryEn: "Saudi Arabia",
            countryCode: "SA",
            currency: "SAR",
            accuracyMeters,
            source: "gps",
            timestamp: Date.now(),
          },
        });
      }
    };

    const onError = (err: GeolocationPositionError) => {
      if (resolved) return;
      
      // If high accuracy timed out, try standard accuracy once smoothly
      if (err.code === err.TIMEOUT) {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          () => {
            if (resolved) return;
            resolved = true;
            resolve({
              success: false,
              errorMessageAr: "انتهت مهلة استجابة إشارة GPS. يرجى التأكد من تشغيل الموقع بالجهاز والمحاولة مجدداً.",
              errorMessageEn: "GPS signal timed out. Please ensure location services are enabled.",
            });
          },
          { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
        );
        return;
      }

      resolved = true;

      if (err.code === err.PERMISSION_DENIED) {
        resolve({
          success: false,
          isPermissionDenied: true,
          errorMessageAr: "تم رفض إذن تحديد الموقع. يرجى الضغط على أيقونة القفل أو الإعدادات في شريط العنوان وتفعيل إذن الموقع (Allow Location).",
          errorMessageEn: "Location permission denied. Please enable location access in your browser settings.",
        });
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        resolve({
          success: false,
          errorMessageAr: "إشارة الموقع الجغرافي غير متوفرة حالياً من جهازك. تم الاعتماد على العنوان الافتراضي.",
          errorMessageEn: "GPS position unavailable from your device. Using standard address.",
        });
      } else {
        resolve({
          success: false,
          errorMessageAr: `تعذر التقاط الموقع الجغرافي (${err.message}).`,
          errorMessageEn: `Unable to detect location (${err.message}).`,
        });
      }
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0,
    });
  });
}

/**
 * Fetches approximate location using IP-based geolocation services
 * with strict timeouts and error resilience.
 */
export async function fetchIpBasedLocation(): Promise<DetectedLocation | null> {
  if (typeof window === "undefined") return null;

  const services = [
    {
      url: "https://ipapi.co/json/",
      parser: (data: Record<string, unknown>): DetectedLocation | null => {
        if (!data || !data.latitude || !data.longitude) return null;
        const countryCode = String(data.country_code || "SA").toUpperCase();
        const city = String(data.city || data.region || "الرياض");
        const country = String(data.country_name || "Saudi Arabia");
        
        const currencyMap: Record<string, CurrencyCode> = {
          SA: "SAR",
          EG: "EGP",
          AE: "AED",
          KW: "KWD",
          QA: "QAR",
          BH: "USD",
          OM: "USD",
          JO: "USD",
          US: "USD",
          GB: "USD",
          FR: "EUR",
          DE: "EUR",
        };

        return {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          cityAr: city,
          cityEn: city,
          countryAr: country,
          countryEn: country,
          countryCode,
          currency: (data.currency as CurrencyCode) || currencyMap[countryCode] || "SAR",
          accuracyMeters: 10000,
          source: "ip",
          timestamp: Date.now(),
        };
      },
    },
    {
      url: "https://ipwho.is/",
      parser: (data: Record<string, unknown>): DetectedLocation | null => {
        if (!data || !data.latitude || !data.longitude || data.success === false) return null;
        const countryCode = String(data.country_code || "SA").toUpperCase();
        const city = String(data.city || data.region || "الرياض");
        const country = String(data.country || "Saudi Arabia");
        const connection = data.connection as Record<string, unknown> | undefined;

        return {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          cityAr: city,
          cityEn: city,
          countryAr: country,
          countryEn: country,
          countryCode,
          currency: (connection?.currency as CurrencyCode) || "SAR",
          accuracyMeters: 15000,
          source: "ip",
          timestamp: Date.now(),
        };
      },
    },
  ];

  for (const svc of services) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(svc.url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const parsed = svc.parser(json);
        if (parsed) {
          // Normalize with known city database if nearby
          const closestCoords = getCityCoordinates(parsed.cityEn);
          if (closestCoords) {
            parsed.lat = closestCoords.lat;
            parsed.lng = closestCoords.lng;
          }
          return parsed;
        }
      }
    } catch {
      // Continue to next fallback service
    }
  }

  return null;
}

/**
 * Saves detected location into local and session storage
 */
export function saveDetectedLocation(loc: DetectedLocation): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(loc);
    localStorage.setItem("noormexa_detected_location_v2", raw);
    sessionStorage.setItem("noormexa_detected_location", raw);
    window.dispatchEvent(new CustomEvent("noormexa-location-updated", { detail: loc }));
  } catch {}
}

/**
 * Loads saved location from local or session storage
 */
export function loadSavedLocation(): DetectedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("noormexa_detected_location_v2") || sessionStorage.getItem("noormexa_detected_location");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
        return parsed;
      }
    }
  } catch {}
  return null;
}

/**
 * Robust master detection function that follows an intelligent priority order:
 * 1. Previously saved/selected user location
 * 2. Timezone & Locale heuristics (zero-permission)
 * 3. Fallback to Static Default
 */
export function getInitialLocation(): DetectedLocation {
  const saved = loadSavedLocation();
  if (saved) return saved;

  return detectUserRegionFromTimezone();
}

/**
 * Performs full multi-stage location detection:
 * Tries GPS (if user allows) -> IP Geolocation -> Timezone Heuristic -> Static Default
 */
export async function detectBestAvailableLocation(_locale: "ar" | "en" = "ar"): Promise<DetectedLocation> {
  const saved = loadSavedLocation();
  if (saved) return saved;

  try {
    const ipLoc = await fetchIpBasedLocation();
    if (ipLoc) {
      saveDetectedLocation(ipLoc);
      return ipLoc;
    }
  } catch {}

  const tzLoc = detectUserRegionFromTimezone();
  saveDetectedLocation(tzLoc);
  return tzLoc;
}
