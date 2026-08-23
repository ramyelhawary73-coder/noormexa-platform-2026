"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  CurrencyCode,
  CurrencyInfo,
  Category,
  Store,
  MarketingPost,
  StorePayout,
  Product,
  PlatformSettings,
  CartItem,
  Order,
  PromoCode,
  PaymentGatewayKey,
  ShippingAddress,
  SelectedVariant,
  ShippingCarrier,
  Shipment,
  TrackingCheckpoint,
  ShippingRateQuote,
  CarrierStatus,
  ShipmentStatus,
} from "@/types/marketplace";
import { INITIAL_CARRIERS, INITIAL_SHIPMENTS, getShippingQuotes } from "@/data/logistics";

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  EGP: {
    code: "EGP",
    nameAr: "جنيه مصري",
    nameEn: "Egyptian Pound",
    symbolAr: "ج.م",
    symbolEn: "EGP",
    rateAgainstEGP: 1,
  },
  SAR: {
    code: "SAR",
    nameAr: "ريال سعودي",
    nameEn: "Saudi Riyal",
    symbolAr: "ر.س",
    symbolEn: "SAR",
    rateAgainstEGP: 0.075, // 1 EGP = 0.075 SAR (~1 SAR = 13.33 EGP)
  },
  AED: {
    code: "AED",
    nameAr: "درهم إماراتي",
    nameEn: "UAE Dirham",
    symbolAr: "د.إ",
    symbolEn: "AED",
    rateAgainstEGP: 0.0735, // 1 EGP = 0.0735 AED (~1 AED = 13.6 EGP)
  },
  USD: {
    code: "USD",
    nameAr: "دولار أمريكي",
    nameEn: "US Dollar",
    symbolAr: "$",
    symbolEn: "$",
    rateAgainstEGP: 0.02, // 1 EGP = 0.02 USD (~1 USD = 50 EGP)
  },
  EUR: {
    code: "EUR",
    nameAr: "يورو",
    nameEn: "Euro",
    symbolAr: "€",
    symbolEn: "€",
    rateAgainstEGP: 0.0185, // 1 EGP = 0.0185 EUR (~1 EUR = 54 EGP)
  },
  KWD: {
    code: "KWD",
    nameAr: "دينار كويتي",
    nameEn: "Kuwaiti Dinar",
    symbolAr: "د.ك",
    symbolEn: "KWD",
    rateAgainstEGP: 0.0061, // 1 EGP = 0.0061 KWD (~1 KWD = 163 EGP)
  },
  QAR: {
    code: "QAR",
    nameAr: "ريال قطري",
    nameEn: "Qatari Riyal",
    symbolAr: "ر.ق",
    symbolEn: "QAR",
    rateAgainstEGP: 0.073, // 1 EGP = 0.073 QAR (~1 QAR = 13.7 EGP)
  },
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  defaultCommissionRate: 8,
  vatEnabled: true,
  vatRate: 14,
  freeShippingThreshold: 1500, // EGP
  standardShippingCost: 50, // EGP
  priorityShippingCost: 120, // EGP
  autoApproveProducts: true,
  autoApproveStores: false,
  gateways: {
    applePayMada: {
      key: "applePayMada",
      nameAr: "Apple Pay / مدى",
      nameEn: "Apple Pay / Mada",
      descriptionAr: "دفع سريع وآمن بنقرة واحدة عبر Apple Pay أو بطاقات مدى المحلية",
      descriptionEn: "Instant one-tap checkout with Apple Pay & local Mada cards",
      enabled: true,
      icon: "Smartphone",
      badge: "الأكثر شيوعاً",
    },
    stripe: {
      key: "stripe",
      nameAr: "بطاقة ائتمانية عالمية (Stripe)",
      nameEn: "Credit / Debit Card (Stripe)",
      descriptionAr: "قبول جميع بطاقات Visa, MasterCard, American Express الدولية والمشفرة",
      descriptionEn: "Encrypted global payments via Visa, MasterCard, & Amex",
      enabled: true,
      icon: "CreditCard",
      badge: "دولي",
    },
    tabbyTamara: {
      key: "tabbyTamara",
      nameAr: "تابي / تمارا (قسّمها على 4 دفعات بدون فوائد)",
      nameEn: "Tabby / Tamara (Split in 4, 0% Interest)",
      descriptionAr: "ادفع ربع المبلغ اليوم وقسّم الباقي على 3 أشهر بدون أي رسوم خفية",
      descriptionEn: "Pay 25% today, split the rest over 3 months with zero interest",
      enabled: true,
      icon: "Sparkles",
      badge: "تقسيط مريح",
    },
    paypal: {
      key: "paypal",
      nameAr: "PayPal Express",
      nameEn: "PayPal Express",
      descriptionAr: "الدفع الفوري الآمن لحاملي حسابات باي بال حول العالم",
      descriptionEn: "Fast and protected checkout with your PayPal account",
      enabled: true,
      icon: "Wallet",
    },
    cod: {
      key: "cod",
      nameAr: "الدفع عند الاستلام (COD)",
      nameEn: "Cash on Delivery (COD)",
      descriptionAr: "ادفع نقدًا أو بالبطاقة لمندوب الشحن عند وصول الطلب لباب بيتك",
      descriptionEn: "Pay cash or card directly to courier upon doorstep delivery",
      enabled: true,
      icon: "Banknote",
    },
  },
};

export const PROMO_CODES: PromoCode[] = [
  {
    code: "NOOR10",
    discountType: "percentage",
    discountValue: 10,
    descriptionAr: "خصم 10% على إجمالي الطلب",
    descriptionEn: "10% off total order value",
  },
  {
    code: "WELCOME20",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 500,
    descriptionAr: "خصم ترحيبي 20% للطلبات فوق 500 ج.م",
    descriptionEn: "20% welcome discount for orders above 500 EGP",
  },
  {
    code: "GLOBAL15",
    discountType: "percentage",
    discountValue: 15,
    descriptionAr: "خصم 15% للتسوق العالمي",
    descriptionEn: "15% discount for global shopping",
  },
  {
    code: "FREESHIP",
    discountType: "free_shipping",
    discountValue: 100,
    descriptionAr: "شحن قياسي مجاني بالكامل",
    descriptionEn: "100% Free standard shipping",
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name_ar: "إلكترونيات وتكنولوجيا", name_en: "Electronics & Tech", slug: "electronics", icon: "Laptop", sort_order: 1 },
  { id: "cat-2", name_ar: "أزياء وأناقة فاخرة", name_en: "Luxury & Fashion", slug: "fashion", icon: "Shirt", sort_order: 2 },
  { id: "cat-3", name_ar: "عطور وعناية شخصية", name_en: "Perfumes & Beauty", slug: "beauty", icon: "Sparkles", sort_order: 3 },
  { id: "cat-4", name_ar: "المنزل والديكور الحديث", name_en: "Home & Modern Living", slug: "home", icon: "Home", sort_order: 4 },
  { id: "cat-5", name_ar: "ساعات وإكسسوارات", name_en: "Watches & Accessories", slug: "accessories", icon: "Watch", sort_order: 5 },
  { id: "cat-6", name_ar: "هدايا وتحف فاخرة", name_en: "Luxury Gifts", slug: "gifts", icon: "Gift", sort_order: 6 },
];

export const INITIAL_STORES: Store[] = [
  {
    id: "store-noormexa-official",
    owner_id: "owner-platform-admin",
    name: "متجر نورميكسا الرسمي (NOORMEXA Flagship Direct)",
    slug: "noormexa-official",
    description: "المتجر الرسمي المباشر لعلامة نورميكسا العالمية. منتجات أصلية 100% بضمان الوكيل، شحن فائق السرعة، ومكافآت حصرية لعملاء المنصة.",
    logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80",
    commission_rate: 0,
    plan: "platform_owner",
    status: "approved",
    is_verified: true,
    is_official: true,
    rating: 5.0,
    total_sales: 3890,
    country: "المملكة العربية السعودية / مصر / الإمارات",
    contact_email: "direct@noormexa.com",
    contact_phone: "+966 800 124 6677",
    cr_number: "CR-NRX-HQ-2026",
    tax_number: "VAT-NRX-310029384",
    bank_name: "حساب خزينة المنصة الرئيسي (Central Treasury)",
    iban: "SA0000000000000000000000",
    return_policy: "إرجاع واستبدال مجاني فوري لمدة 30 يوماً مع ضمان ذهبي شامل من المنصة",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "store-techcraft",
    owner_id: "owner-1",
    name: "TechCraft Global Innovations",
    slug: "techcraft",
    description: "الوجهة الرائدة لأحدث الأجهزة الذكية وملحقات الحواسيب والصوتيات الاحترافية.",
    logo_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80",
    commission_rate: 8,
    plan: "professional",
    status: "approved",
    is_verified: true,
    rating: 4.9,
    total_sales: 1420,
    country: "الإمارات / مصر",
    contact_email: "support@techcraft-global.com",
    contact_phone: "+971 50 123 4567",
    cr_number: "CR-DXB-8839201",
    tax_number: "VAT-AE-10029384",
    bank_name: "بنك الإمارات دبي الوطني (ENBD)",
    iban: "AE330500000000012345678",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "store-noorcouture",
    owner_id: "owner-2",
    name: "Noor Couture Atelier",
    slug: "noor-couture",
    description: "تصاميم أزياء راقية مستوحاة من التراث العربي العصري بأقمشة إيطالية وإسبانية فاخرة.",
    logo_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
    commission_rate: 6,
    plan: "storePlan",
    status: "approved",
    is_verified: true,
    rating: 4.8,
    total_sales: 980,
    country: "السعودية",
    contact_email: "atelier@noorcouture.sa",
    contact_phone: "+966 55 987 6543",
    cr_number: "CR-RUH-10109923",
    tax_number: "VAT-SA-3001293840",
    bank_name: "البنك الأهلي السعودي (SNB)",
    iban: "SA1210000001234567890123",
    created_at: "2026-01-15T12:00:00Z",
  },
  {
    id: "store-royaloils",
    owner_id: "owner-3",
    name: "Royal Oud & Perfumery",
    slug: "royal-oud",
    description: "خلاصات دهن العود الكمبودي والزيوت العطرية النقية والفرنسية الملكية.",
    logo_url: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=200&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1200&auto=format&fit=crop&q=80",
    commission_rate: 8,
    plan: "professional",
    status: "approved",
    is_verified: true,
    rating: 5.0,
    total_sales: 2150,
    country: "الكويت / السعودية",
    contact_email: "orders@royaloud-perfumes.com",
    contact_phone: "+965 99 887 766",
    cr_number: "CR-KWT-4499120",
    tax_number: "VAT-KW-99881122",
    bank_name: "مصرف الراجحي (Al Rajhi Bank)",
    iban: "SA4480000000608010101010",
    created_at: "2026-02-01T09:00:00Z",
  },
  {
    id: "store-aurorahome",
    owner_id: "owner-4",
    name: "Aurora Living & Artisan Home",
    slug: "aurora-home",
    description: "قطع ديكور وتأثيث إسكندنافية ومودرن تضفي الدفء والأناقة على كل زاوية في منزلك.",
    logo_url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&auto=format&fit=crop&q=80",
    banner_url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&auto=format&fit=crop&q=80",
    commission_rate: 7,
    plan: "basic",
    status: "approved",
    is_verified: true,
    rating: 4.7,
    total_sales: 640,
    country: "مصر",
    contact_email: "care@aurorahome.eg",
    contact_phone: "+20 100 234 5678",
    cr_number: "CR-CAI-5588390",
    tax_number: "VAT-EG-44002211",
    bank_name: "البنك التجاري الدولي (CIB Egypt)",
    iban: "EG380010000000001234567890123",
    created_at: "2026-02-12T14:30:00Z",
  },
];

export const INITIAL_PAYOUTS: StorePayout[] = [
  {
    id: "pay-101",
    store_id: "store-techcraft",
    store_name: "TechCraft Global Innovations",
    amount: 18500,
    status: "transferred",
    requested_at: "2026-02-10T10:00:00Z",
    processed_at: "2026-02-11T14:30:00Z",
    bank_name: "بنك الإمارات دبي الوطني (ENBD)",
    iban: "AE330500000000012345678",
    transaction_ref: "TXN-998822-GLB",
    notes: "تسوية مستحقات النصف الأول من شهر فبراير",
  },
  {
    id: "pay-102",
    store_id: "store-royaloils",
    store_name: "Royal Oud & Perfumery",
    amount: 12400,
    status: "approved",
    requested_at: "2026-02-18T16:00:00Z",
    processed_at: "2026-02-19T11:00:00Z",
    bank_name: "مصرف الراجحي (Al Rajhi Bank)",
    iban: "SA4480000000608010101010",
    transaction_ref: "TXN-774411-KSA",
    notes: "مستحقات مبيعات دهن العود والزيوت العطرية",
  },
  {
    id: "pay-103",
    store_id: "store-noorcouture",
    store_name: "Noor Couture Atelier",
    amount: 9200,
    status: "pending",
    requested_at: "2026-02-20T08:30:00Z",
    bank_name: "البنك الأهلي السعودي (SNB)",
    iban: "SA1210000001234567890123",
    notes: "طلب سحب الأرباح المتاحة",
  },
];

export const INITIAL_MARKETING_POSTS: MarketingPost[] = [
  {
    id: "post-1",
    store_id: "store-noormexa-official",
    store_name: "متجر نورميكسا الرسمي (NOORMEXA Flagship Direct)",
    store_logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    title: "🔥 إطلاق التشكيلة الرسمية المباشرة لعام 2026 مع شحن مجاني لجميع الطلبات!",
    content: "يسر إدارة منصة نورميكسا الإعلان عن إطلاق منتجاتنا الحصرية مباشرة من المستودع المركزي. استمتع بضمان الوكيل الشامل لمدة سنتين وخصومات حصرية تبدأ من 15% على جميع الفئات.",
    image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80",
    promo_code: "NOOR10",
    discount_percent: 10,
    featured_product_id: "prod-titan-smartphone",
    likes_count: 342,
    views_count: 1850,
    is_pinned: true,
    status: "published",
    created_at: "2026-02-18T10:00:00Z",
  },
  {
    id: "post-2",
    store_id: "store-techcraft",
    store_name: "TechCraft Global Innovations",
    store_logo: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&auto=format&fit=crop&q=80",
    title: "⚡ تخفيضات الفلاش الأسبوعية: خصم 20% على سماعات NOORMEXA Pro اللاسلكية",
    content: "لفترة محدودة حتى نهاية عطلة الأسبوع! احصل على سماعات NOORMEXA Pro ANC بصوت Hi-Res وبطارية 55 ساعة مع تغليف هدايا مجاني وكود خصم إضافي.",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    promo_code: "WELCOME20",
    discount_percent: 20,
    featured_product_id: "prod-aurora-headphones",
    likes_count: 189,
    views_count: 940,
    is_pinned: false,
    status: "published",
    created_at: "2026-02-19T14:30:00Z",
  },
  {
    id: "post-3",
    store_id: "store-royaloils",
    store_name: "Royal Oud & Perfumery",
    store_logo: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=200&auto=format&fit=crop&q=80",
    title: "🌿 إشعار وصول شحنة دهن العود الكمبودي المعتق 25 سنة",
    content: "وصلتنا الآن دفعة محدودة جداً من دهن العود الكمبودي الفاخر المعتق. ثبات فائق لأكثر من 48 ساعة مع فوحان استثنائي. الكميات محدودة للطلب الفوري.",
    image_url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80",
    promo_code: "GLOBAL15",
    discount_percent: 15,
    likes_count: 245,
    views_count: 1210,
    is_pinned: false,
    status: "published",
    created_at: "2026-02-20T09:15:00Z",
  },
  {
    id: "post-4",
    store_id: "store-noorcouture",
    store_name: "Noor Couture Atelier",
    store_logo: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80",
    title: "👗 تدشين مجموعة العبايات الكشميرية وحقائب الجلد الإيطالي المصنوعة يدوياً",
    content: "قطع فريدة مصممة لتبرز أناقتك الملكية. كل قطعة مشغولة يدوياً بعناية فائقة وتأتي مع شهادة أصالة وضمان استبدال.",
    image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
    likes_count: 178,
    views_count: 890,
    is_pinned: false,
    status: "published",
    created_at: "2026-02-20T16:45:00Z",
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-aurora-headphones",
    store_id: "store-techcraft",
    store_name: "TechCraft Global Innovations",
    category_id: "cat-1",
    category_slug: "electronics",
    name: "سماعات الرأس اللاسلكية الاحترافية NOORMEXA Pro ANC",
    name_en: "NOORMEXA Pro Wireless ANC Studio Headphones",
    description: "سماعة عزل ضوضاء فعال متطورة بصوت نقي فائق الدقة (Hi-Res Audio)، بطارية تدوم حتى 55 ساعة عمل متواصل، مع وسائد ميموري فوم مريحة للاستخدام الطويل ودعم Spatial Audio ثلاثي الأبعاد.",
    description_en: "Active Noise Cancelling studio-grade wireless headphones with 55hr battery life, ultra-plush memory foam earcups, and immersive 3D Spatial Audio.",
    price: 3450, // EGP
    original_price: 4200,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 45,
    status: "active",
    rating: 4.9,
    reviews_count: 88,
    is_featured: true,
    free_shipping: true,
    variants: [
      {
        id: "color",
        nameAr: "اللون",
        nameEn: "Color",
        options: [
          { id: "c-black", labelAr: "أسود فحمي مطفي", labelEn: "Matte Charcoal", colorCode: "#1c1c1e" },
          { id: "c-gold", labelAr: "ذهبي شامبانيا فاخر", labelEn: "Champagne Gold", colorCode: "#d4af37" },
          { id: "c-silver", labelAr: "فضي تيتانيوم", labelEn: "Titanium Silver", colorCode: "#d1d5db" },
        ],
      },
      {
        id: "edition",
        nameAr: "الإصدار",
        nameEn: "Edition",
        options: [
          { id: "ed-standard", labelAr: "النسخة القياسية", labelEn: "Standard Edition", priceDelta: 0 },
          { id: "ed-pro-case", labelAr: "نسخة مع حقيبة جلدية وشاحن سريع", labelEn: "Pro Bundle + Case", priceDelta: 350 },
        ],
      },
    ],
    specs: [
      { labelAr: "نوع التوصيل", labelEn: "Connectivity", valueAr: "Bluetooth 5.4 + منفذ 3.5mm", valueEn: "Bluetooth 5.4 + 3.5mm Jack" },
      { labelAr: "عمر البطارية", labelEn: "Battery Life", valueAr: "55 ساعة (مع تشغيل ANC)", valueEn: "55 Hours (with ANC ON)" },
      { labelAr: "المقاومة", labelEn: "Water Resistance", valueAr: "IPX4 ضد العرق والرذاذ", valueEn: "IPX4 Sweat Resistant" },
      { labelAr: "الضمان", labelEn: "Warranty", valueAr: "سنتين ضمان استبدال فوري", valueEn: "2 Years Full Replacement" },
    ],
    created_at: "2026-02-10T10:00:00Z",
  },
  {
    id: "prod-chronograph-watch",
    store_id: "store-techcraft",
    store_name: "TechCraft Global Innovations",
    category_id: "cat-5",
    category_slug: "accessories",
    name: "ساعة الكرونوغراف الفاخرة NOORMEXA Royal Sapphire",
    name_en: "NOORMEXA Royal Sapphire Chronograph Watch",
    description: "ساعة ميكانيكية أوتوماتيكية راقية مصنوعة من فولاذ مقاوم للصدأ 316L وزجاج ياقوتي مضاد للخدش، مع حركة سويسرية دقيقة ومقاومة للماء حتى 100 متر.",
    description_en: "Automatic luxury chronograph timepiece engineered with 316L stainless steel, scratch-resistant sapphire crystal glass, and 100m water resistance.",
    price: 6800,
    original_price: 8500,
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 18,
    status: "active",
    rating: 5.0,
    reviews_count: 42,
    is_featured: true,
    free_shipping: true,
    variants: [
      {
        id: "strap",
        nameAr: "نوع الحزام",
        nameEn: "Strap Material",
        options: [
          { id: "st-steel", labelAr: "سوار ستانلس ستيل مصقول", labelEn: "Brushed Steel Bracelet", priceDelta: 0 },
          { id: "st-leather", labelAr: "جلد طبيعي إيطالي بلون كحلي", labelEn: "Navy Italian Leather", priceDelta: 200 },
        ],
      },
    ],
    specs: [
      { labelAr: "قطر الهيكل", labelEn: "Case Diameter", valueAr: "42 ملم", valueEn: "42 mm" },
      { labelAr: "الزجاج", labelEn: "Glass", valueAr: "كريستال ياقوتي مضاد للانعكاس", valueEn: "Anti-Reflective Sapphire" },
      { labelAr: "مقاومة الماء", labelEn: "Water Resistance", valueAr: "10 ATM (100 متر)", valueEn: "10 ATM (100m)" },
    ],
    created_at: "2026-02-11T12:00:00Z",
  },
  {
    id: "prod-royal-oud-perfume",
    store_id: "store-royaloils",
    store_name: "Royal Oud & Perfumery",
    category_id: "cat-3",
    category_slug: "beauty",
    name: "عطر السلطان الملكي (Imperial Oud & Ambergris 100ml)",
    name_en: "Imperial Oud & Ambergris Eau de Parfum 100ml",
    description: "توليفة نادرة من دهن العود المعتق، العنبر الحوتي الأبيض، قطرات الورد الطائفي وخشب الصندل العطري لثبات وفوحان يدوم لأكثر من 48 ساعة.",
    description_en: "An opulent niche blend of aged Cambodian oud, rare white ambergris, Taif rose petals, and warm Mysore sandalwood with intense 48-hour sillage.",
    price: 2890,
    original_price: 3600,
    image_url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 60,
    status: "active",
    rating: 4.9,
    reviews_count: 114,
    is_featured: true,
    free_shipping: true,
    variants: [
      {
        id: "size",
        nameAr: "الحجم",
        nameEn: "Bottle Size",
        options: [
          { id: "sz-50", labelAr: "50 مل (تركيز عالي)", labelEn: "50ml Intense", priceDelta: -700 },
          { id: "sz-100", labelAr: "100 مل الحجم الملكي", labelEn: "100ml Signature", priceDelta: 0 },
        ],
      },
    ],
    specs: [
      { labelAr: "التركيز", labelEn: "Concentration", valueAr: "Extrait de Parfum (35% زيوت نقية)", valueEn: "Extrait de Parfum (35% oils)" },
      { labelAr: "بلد المنشأ", labelEn: "Origin", valueAr: "فرنسا / دبي", valueEn: "Grasse, France & Dubai" },
    ],
    created_at: "2026-02-12T15:00:00Z",
  },
  {
    id: "prod-cashmere-coat",
    store_id: "store-noorcouture",
    store_name: "Noor Couture Atelier",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "معطف الكشمير والحرير الفاخر بتطريز ذهبي يدوي",
    name_en: "Hand-Embroidered Cashmere & Silk Luxury Trench",
    description: "معطف طويل فاخر منسوج من كشمير المونغوليا الصافي بنسبة 100% مع بطانة حريرية ولمسات تطريز خيوط الذهب الخالص المستوحاة من المعمار الأندلسي.",
    description_en: "Ultra-luxurious full-length tailored trench woven from 100% pure Mongolian cashmere, featuring pure silk lining and artisanal gold filigree stitching.",
    price: 5200,
    original_price: 6400,
    image_url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 22,
    status: "active",
    rating: 4.8,
    reviews_count: 36,
    is_featured: true,
    free_shipping: true,
    variants: [
      {
        id: "size",
        nameAr: "المقاس",
        nameEn: "Size",
        options: [
          { id: "sz-s", labelAr: "صغير (Small)", labelEn: "S" },
          { id: "sz-m", labelAr: "متوسط (Medium)", labelEn: "M" },
          { id: "sz-l", labelAr: "كبير (Large)", labelEn: "L" },
          { id: "sz-xl", labelAr: "كبير جدًا (XL)", labelEn: "XL" },
        ],
      },
      {
        id: "color",
        nameAr: "اللون",
        nameEn: "Color",
        options: [
          { id: "c-camel", labelAr: "جملي دافئ (Camel Warm)", labelEn: "Warm Camel", colorCode: "#c19a6b" },
          { id: "c-navy", labelAr: "كحلي ملكي (Midnight Navy)", labelEn: "Midnight Navy", colorCode: "#0b1322" },
          { id: "c-cream", labelAr: "عاجي لؤلؤي (Ivory Pearl)", labelEn: "Ivory Pearl", colorCode: "#f6f2e9" },
        ],
      },
    ],
    specs: [
      { labelAr: "الخامة", labelEn: "Material", valueAr: "100% كشمير مونغولي نقي", valueEn: "100% Pure Mongolian Cashmere" },
      { labelAr: "العناية", labelEn: "Care", valueAr: "تنظيف جاف حصراً (Dry Clean)", valueEn: "Dry Clean Only" },
    ],
    created_at: "2026-02-14T11:00:00Z",
  },
  {
    id: "prod-titan-smartphone",
    store_id: "store-techcraft",
    store_name: "TechCraft Global Innovations",
    category_id: "cat-1",
    category_slug: "electronics",
    name: "هاتف ذكي فلاجشيب NOORMEXA Titan Ultra 5G (512GB)",
    name_en: "NOORMEXA Titan Ultra 5G Smartphone 512GB Titanium",
    description: "هاتف رائد بهيكل من التيتانيوم المصقول، شاشة OLED 120Hz ديناميكية، كاميرا احترافية بدقة 200 ميجابكسل مع تقريب بصري 10x وشحن فائق السرعة 120W.",
    description_en: "Flagship smartphone featuring aerospace-grade titanium frame, 120Hz Dynamic AMOLED display, 200MP studio triple camera system with 10x optical zoom, and 120W HyperCharge.",
    price: 18900,
    original_price: 21500,
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 25,
    status: "active",
    rating: 5.0,
    reviews_count: 59,
    is_featured: true,
    free_shipping: true,
    variants: [
      {
        id: "storage",
        nameAr: "السعة التخزينية",
        nameEn: "Storage",
        options: [
          { id: "st-256", labelAr: "256 جيجابايت", labelEn: "256 GB", priceDelta: 0 },
          { id: "st-512", labelAr: "512 جيجابايت (موصى بها)", labelEn: "512 GB Pro", priceDelta: 2200 },
          { id: "st-1tb", labelAr: "1 تيرابايت الترا", labelEn: "1 TB Ultra", priceDelta: 4500 },
        ],
      },
    ],
    specs: [
      { labelAr: "المعالج", labelEn: "Processor", valueAr: "Octa-Core 3.4GHz AI Engine", valueEn: "Octa-Core 3.4GHz AI Engine" },
      { labelAr: "الشاشة", labelEn: "Display", valueAr: "6.8 بوصة OLED 120Hz HDR10+", valueEn: "6.8-inch OLED 120Hz HDR10+" },
      { labelAr: "البطارية", labelEn: "Battery", valueAr: "5200 mAh مع شحن 120W", valueEn: "5200 mAh with 120W Fast Charge" },
    ],
    created_at: "2026-02-14T18:00:00Z",
  },
  {
    id: "prod-milano-leather-bag",
    store_id: "store-noorcouture",
    store_name: "Noor Couture Atelier",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "حقيبة يد جلد طبيعي إيطالي NOORMEXA Milano Leather",
    name_en: "NOORMEXA Milano Handcrafted Italian Leather Handbag",
    description: "حقيبة يد نسائية أيقونية مصنوعة يدويًا في فلورنسا من أجود أنواع جلد العجل الإيطالي المحبب مع إكسسوارات نحاسية مطلية بالذهب عيار 24.",
    description_en: "Iconic handcrafted leather tote made in Florence from full-grain Italian calfskin, featuring 24K gold-plated solid brass hardware and suede interior.",
    price: 4600,
    original_price: 5800,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 14,
    status: "active",
    rating: 4.9,
    reviews_count: 28,
    is_featured: true,
    free_shipping: true,
    variants: [
      {
        id: "color",
        nameAr: "اللون",
        nameEn: "Color",
        options: [
          { id: "bg-tan", labelAr: "بني عسلي كلاسيكي", labelEn: "Cognac Tan", colorCode: "#8b5a2b" },
          { id: "bg-black", labelAr: "أسود ملكي فاخر", labelEn: "Onyx Black", colorCode: "#111111" },
          { id: "bg-burgundy", labelAr: "عنابي مارون غني", labelEn: "Imperial Burgundy", colorCode: "#58111a" },
        ],
      },
    ],
    specs: [
      { labelAr: "الجلد", labelEn: "Leather", valueAr: "جلد عجل إيطالي 100% Full-Grain", valueEn: "100% Full-Grain Italian Calfskin" },
      { labelAr: "الإغلاق", labelEn: "Closure", valueAr: "قفل مغناطيسي خفي ومحكم", valueEn: "Concealed Magnetic Clasp" },
    ],
    created_at: "2026-02-15T09:00:00Z",
  },
  {
    id: "prod-aviator-sunglasses",
    store_id: "store-techcraft",
    store_name: "TechCraft Global Innovations",
    category_id: "cat-5",
    category_slug: "accessories",
    name: "نظارة شمسية تيتانيوم مستقطبة NOORMEXA Aviator Gold",
    name_en: "NOORMEXA Titan Aviator Polarized Sunglasses",
    description: "إطار خفيف الوزن من التيتانيوم الياباني فائق المتانة مع عدسات HD مستقطبة تحمي بنسبة 100% من الأشعة فوق البنفسجية UV400 ومقاومة للخدش والوهج.",
    description_en: "Ultralight aerospace titanium frame with Japanese HD polarized UV400 lenses offering absolute optical clarity and glare elimination.",
    price: 1850,
    original_price: 2400,
    image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 35,
    status: "active",
    rating: 4.8,
    reviews_count: 51,
    is_featured: false,
    free_shipping: true,
    specs: [
      { labelAr: "الحماية", labelEn: "Protection", valueAr: "UV400 + Polarized Cat 3", valueEn: "UV400 + Polarized Cat 3" },
      { labelAr: "مادة الإطار", labelEn: "Frame Material", valueAr: "تيتانيوم ياباني فائق الخفة (18 جم)", valueEn: "Japanese Aerospace Titanium (18g)" },
    ],
    created_at: "2026-02-15T12:00:00Z",
  },
  {
    id: "prod-gold-skincare-ritual",
    store_id: "store-royaloils",
    store_name: "Royal Oud & Perfumery",
    category_id: "cat-3",
    category_slug: "beauty",
    name: "مجموعة العناية الذهبية 24K وسيروم الإشراق الطبيعي",
    name_en: "24K Pure Gold & Squalane Radiant Skincare Ritual",
    description: "روتين عناية مكثف يحتوي على سيروم الذهب الخالص عيار 24 مع حمض الهيالورونيك، خلاصة السكوالان النباتي ومرطب الكولاجين البحري لنضارة فورية وتجديد خلايا البشرة.",
    description_en: "Luxurious rejuvenation ritual featuring 24K pure gold flakes, botanical squalane serum, and marine collagen moisturizer for luminous firm skin.",
    price: 1950,
    original_price: 2600,
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608248597359-bb0e43d1a8e2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 40,
    status: "active",
    rating: 4.9,
    reviews_count: 73,
    is_featured: false,
    free_shipping: true,
    specs: [
      { labelAr: "المكونات الرئيسية", labelEn: "Key Ingredients", valueAr: "رقائق ذهب 24K، هيالورونيك، سكوالان", valueEn: "24K Gold Flakes, Multi-Hyaluronic, Squalane" },
      { labelAr: "الملاءمة", labelEn: "Skin Types", valueAr: "مناسب لجميع أنواع البشرة وحساسة", valueEn: "All Skin Types including sensitive" },
    ],
    created_at: "2026-02-15T15:00:00Z",
  },
  {
    id: "prod-smart-diffuser",
    store_id: "store-aurorahome",
    store_name: "Aurora Living & Artisan Home",
    category_id: "cat-4",
    category_slug: "home",
    name: "موزع العطور الذكي من السيراميك الحجري NOORMEXA Aroma",
    name_en: "NOORMEXA Ultrasonic Stone Ceramic Smart Aroma Diffuser",
    description: "فواحة عطرية بالموجات فوق الصوتية مصنوعة يدويًا من الحجر الطبيعي والسيراميك مع إضاءة محيطية هادئة، تحكم عبر الهاتف ومؤقت ذكي.",
    description_en: "Handcrafted natural stone ceramic ultrasonic aromatherapy diffuser with ambient warm LED glow, smart mobile app control, and timer.",
    price: 1250,
    original_price: 1600,
    image_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 50,
    status: "active",
    rating: 4.7,
    reviews_count: 53,
    is_featured: false,
    free_shipping: false,
    specs: [
      { labelAr: "سعة الخزان", labelEn: "Capacity", valueAr: "300 مل (تغطية 40 م²)", valueEn: "300ml (40 sqm coverage)" },
      { labelAr: "الصوت", labelEn: "Noise Level", valueAr: "صامت تماماً أقل من 20dB", valueEn: "Ultra Silent <20dB" },
    ],
    created_at: "2026-02-15T08:00:00Z",
  },
  {
    id: "prod-artisan-coffee-set",
    store_id: "store-aurorahome",
    store_name: "Aurora Living & Artisan Home",
    category_id: "cat-6",
    category_slug: "gifts",
    name: "طقم تحضير القهوة المختصة الفاخر من النحاس والخشب الطبيعي",
    name_en: "Handcrafted Solid Copper & Walnut Artisan Pour-Over Set",
    description: "طقم متكامل لعشاق القهوة يشمل قمع ترشيح نحاسي مطروق يدويًا، قاعدة من خشب الجوز الأمريكي، إبريق صب بمقياس حرارة ومطحنة حبوب يدوية دقيقة.",
    description_en: "Master-crafted coffee set featuring a hand-hammered copper dripper, solid American walnut wood stand, gooseneck kettle with thermometer, and precision burr grinder.",
    price: 2100,
    original_price: 2750,
    image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 30,
    status: "active",
    rating: 4.9,
    reviews_count: 67,
    is_featured: false,
    free_shipping: true,
    specs: [
      { labelAr: "المواد", labelEn: "Materials", valueAr: "نحاس نقي 99% وخشب جوز معالج", valueEn: "99% Pure Copper & Walnut" },
      { labelAr: "محتويات الطقم", labelEn: "Contents", valueAr: "قمع، إبريق، سيرفر زجاجي، مطحنة وفلاتر", valueEn: "Dripper, Kettle, Server, Grinder, Filters" },
    ],
    created_at: "2026-02-16T16:00:00Z",
  },
  // --- Global Authorized Brand Flagship Products ---
  // ----------------------------------------------------
  // VERIFIED GLOBAL BRAND FLAGSHIPS & VIP PRE-ORDER SHOWCASE ITEMS
  // ----------------------------------------------------
  // Apple
  {
    id: "brand-apple-iphone16promax",
    brand_id: "apple",
    brand_name: "Apple",
    store_id: "store-apple-official",
    store_name: "Apple Authorized Flagship",
    category_id: "cat-1",
    category_slug: "electronics",
    name: "هاتف Apple iPhone 16 Pro Max سعة 512GB تيتانيوم طبيعي",
    name_en: "Apple iPhone 16 Pro Max 512GB Natural Titanium",
    description: "أحدث وأقوى هواتف Apple بشريحة A18 Pro الجبارة، هيكل تيتانيوم من الدرجة الخامسة خفيف وفائق المتانة، زر التحكم في الكاميرا، ونظام كاميرات سينمائي 48MP.",
    description_en: "Apple flagship with A18 Pro chip, Grade 5 titanium design, Camera Control, 48MP Fusion camera system, and 2-year authorized local warranty.",
    price: 74900,
    original_price: 79900,
    image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 25,
    status: "active",
    rating: 5.0,
    reviews_count: 142,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "المعالج", labelEn: "Processor", valueAr: "Apple A18 Pro 3nm", valueEn: "Apple A18 Pro 3nm" },
      { labelAr: "الشاشة", labelEn: "Display", valueAr: "6.9 بوصة Super Retina XDR ProMotion 120Hz", valueEn: "6.9\" Super Retina XDR 120Hz" },
      { labelAr: "الضمان", labelEn: "Warranty", valueAr: "سنتين ضمان الوكيل المعتمد (الرقم التسلسلي موثق)", valueEn: "2-Year Official Apple Warranty" },
    ],
    created_at: "2026-02-18T10:00:00Z",
  },
  {
    id: "brand-apple-watch-ultra2",
    brand_id: "apple",
    brand_name: "Apple",
    store_id: "store-apple-official",
    store_name: "Apple Authorized Flagship",
    category_id: "cat-1",
    category_slug: "electronics",
    name: "ساعة Apple Watch Ultra 2 تيتانيوم أسود 49mm مع حزام Ocean",
    name_en: "Apple Watch Ultra 2 Black Titanium 49mm with Ocean Band",
    description: "الساعة الرياضية الاحترافية الأكثر متانة، شاشة بسطوع 3000 nits، نظام GPS دقيق مزدوج التردد، مقاومة للماء حتى عمق 100 متر مع مستشعر الغوص والعمق.",
    description_en: "The ultimate rugged sports smartwatch with 3000-nit display, dual-frequency precision GPS, and depth gauge up to 40m/100m water resistance.",
    price: 43500,
    original_price: 47900,
    image_url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 18,
    status: "active",
    rating: 4.9,
    reviews_count: 88,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "المقاس والخامة", labelEn: "Case & Size", valueAr: "49 مم تيتانيوم أسود مطفي مع زجاج ياقوتي", valueEn: "49mm Black Titanium with Sapphire Crystal" },
      { labelAr: "البطارية", labelEn: "Battery", valueAr: "تصل إلى 72 ساعة في نمط توفير الطاقة", valueEn: "Up to 72 hours in low power mode" },
    ],
    created_at: "2026-02-18T11:00:00Z",
  },
  {
    id: "brand-apple-airpods-pro2",
    brand_id: "apple",
    brand_name: "Apple",
    store_id: "store-apple-official",
    store_name: "Apple Authorized Flagship",
    category_id: "cat-1",
    category_slug: "electronics",
    name: "سماعات Apple AirPods Pro (الجيل الثاني) مع علبة MagSafe USB-C",
    name_en: "Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C)",
    description: "إلغاء ضوضاء نشط أقوى بمرتين، نمط شفافية متكيف، صوت مكاني مخصص مع تتبع ديناميكي للرأس، وصوت بدون فقدان بجودة خرافية.",
    description_en: "Up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio with dynamic head tracking, and USB-C MagSafe case.",
    price: 13900,
    original_price: 15500,
    image_url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 45,
    status: "active",
    rating: 4.9,
    reviews_count: 310,
    is_featured: false,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "الشريحة", labelEn: "Chip", valueAr: "Apple H2 للأداء الصوتي المتطور", valueEn: "Apple H2 Headphone Chip" },
      { labelAr: "الشحن", labelEn: "Charging", valueAr: "منفذ USB-C مع دعم شحن Apple Watch و MagSafe", valueEn: "USB-C with MagSafe and Apple Watch charger support" },
    ],
    created_at: "2026-02-18T12:00:00Z",
  },
  // Nike
  {
    id: "brand-nike-air-jordan1",
    brand_id: "nike",
    brand_name: "Nike",
    store_id: "store-nike-official",
    store_name: "Nike Authorized Flagship",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "حذاء Nike Air Jordan 1 Retro High OG 'Chicago Lost & Found' الأصلي",
    name_en: "Nike Air Jordan 1 Retro High OG 'Chicago' Authentic",
    description: "الأيقونة الخالدة من علامة Nike و Jordan. جلد طبيعي فاخر بنمط Chicago الكلاسيكي مع بطانة Air المريحة وشهادة الفحص والأصالة.",
    description_en: "Iconic Air Jordan 1 Retro High OG in signature Chicago colorway. Genuine leather construction with Nike Air cushioning and authenticity verified stamp.",
    price: 11800,
    original_price: 13500,
    image_url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 20,
    status: "active",
    rating: 5.0,
    reviews_count: 94,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "الخامات", labelEn: "Materials", valueAr: "جلد طبيعي ممتاز 100% مع نعل مطاطي مانع للانزلاق", valueEn: "100% Genuine Premium Leather & Rubber Sole" },
      { labelAr: "التحقق", labelEn: "Authenticity", valueAr: "كود QR وكود تسلسلي أصلي على العلبة", valueEn: "Original serialized shoe box and RFID verification" },
    ],
    created_at: "2026-02-18T13:00:00Z",
  },
  {
    id: "brand-nike-dunk-low",
    brand_id: "nike",
    brand_name: "Nike",
    store_id: "store-nike-official",
    store_name: "Nike Authorized Flagship",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "حذاء Nike Dunk Low Retro 'Panda' أسود وأبيض أصلي",
    name_en: "Nike Dunk Low Retro 'Panda' Black & White Original",
    description: "الحذاء الأكثر طلبًا عالميًا من نايكي، تصميم كلاسيكي جذاب باللونين الأبيض والأسود يتناسق مع جميع الإطلالات العصرية والرياضية.",
    description_en: "The universally acclaimed Nike Dunk Low Panda featuring classic two-tone leather overlays, foam midsole, and padded low-cut collar.",
    price: 6400,
    original_price: 7500,
    image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 35,
    status: "active",
    rating: 4.8,
    reviews_count: 180,
    is_featured: false,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "اللون", labelEn: "Colorway", valueAr: "White / Black (Panda)", valueEn: "White / Black (Panda)" },
      { labelAr: "المقاسات", labelEn: "Sizes Available", valueAr: "40 إلى 46 EU مع ضمان تطابق المقاس", valueEn: "EU 40 to 46 with true-to-fit sizing" },
    ],
    created_at: "2026-02-18T13:30:00Z",
  },
  {
    id: "brand-nike-pegasus-41",
    brand_id: "nike",
    brand_name: "Nike",
    store_id: "store-nike-official",
    store_name: "Nike Authorized Flagship",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "حذاء الجري Nike Air Zoom Pegasus 41 المتطور بتوسيد ReactX",
    name_en: "Nike Air Zoom Pegasus 41 Road Running Shoes (ReactX Foam)",
    description: "حذاء الجري الأسطوري ببطانة ReactX الخارقة التي توفر استرجاع طاقة أعلى بنسبة 13%، مع وحدات Air Zoom مزدوجة للمقدمة والكعب.",
    description_en: "Responsive cushioning in the Pegasus provides an energized ride for everyday road running, powered by upgraded ReactX foam.",
    price: 7200,
    original_price: 8400,
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 28,
    status: "active",
    rating: 4.9,
    reviews_count: 110,
    is_featured: false,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "التوسيد", labelEn: "Cushioning", valueAr: "فوم ReactX الجديد كلياً + وسائد Air Zoom", valueEn: "ReactX foam + dual Air Zoom units" },
      { labelAr: "المقاسات", labelEn: "Sizes", valueAr: "40 إلى 45 EU", valueEn: "EU 40 to 45" },
    ],
    created_at: "2026-02-18T13:45:00Z",
  },
  // Rolex
  {
    id: "brand-rolex-submariner-date",
    brand_id: "rolex",
    brand_name: "Rolex",
    store_id: "store-rolex-official",
    store_name: "Geneva Timepieces & Rolex Boutique",
    category_id: "cat-5",
    category_slug: "watches",
    name: "ساعة Rolex Submariner Date فولاذ أويستر ستيل 41mm مع إطار سيراميك Cerachrom أخضر",
    name_en: "Rolex Submariner Date 41mm Oystersteel Green Cerachrom Bezel",
    description: "ساعة الغواصين الأيقونية الرائدة في العالم. حركة ميكانيكية ذاتية التعبئة عيار 3235، ميناء أسود مضيء بنظام Chromalight، مقاومة للماء 300 متر، كاملة بالعلبة والضمان الدولي الأخضر.",
    description_en: "The benchmark among divers' watches. Calibre 3235 automatic movement, green Cerachrom ceramic bezel, 300m waterproofness, full box and international guarantee card.",
    price: 495000,
    original_price: 520000,
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 3,
    status: "active",
    rating: 5.0,
    reviews_count: 28,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "الحركة والعيار", labelEn: "Movement", valueAr: "Rolex Calibre 3235 كرونومتر فائق الدقة (-2/+2 ث/يوم)", valueEn: "Rolex Calibre 3235 Superlative Chronometer" },
      { labelAr: "الشهادات والمرفقات", labelEn: "Papers & Box", valueAr: "العلبة الخضراء الأصلية، بطاقة NFC للضمان الدولي 5 سنوات", valueEn: "Original Green Box, NFC International Warranty Card 5-Year" },
    ],
    created_at: "2026-02-18T14:00:00Z",
  },
  {
    id: "brand-rolex-daytona-black",
    brand_id: "rolex",
    brand_name: "Rolex",
    store_id: "store-rolex-official",
    store_name: "Geneva Timepieces & Rolex Boutique",
    category_id: "cat-5",
    category_slug: "watches",
    name: "ساعة Rolex Cosmograph Daytona فولاذ أويستر ستيل 40mm ميناء أسود",
    name_en: "Rolex Cosmograph Daytona 40mm Oystersteel Black Dial",
    description: "أسطورة سباقات السيارات الخالدة. كرونوغراف ميكانيكي عيار 4131 فائق الدقة مع مقياس تاكيمتر محفور وإطار سيراكروم أسود مقاوم للخدش.",
    description_en: "The ultimate racing chronograph watch with Calibre 4131 movement, Cerachrom tachymetric scale bezel, and Oysterlock safety clasp.",
    price: 680000,
    original_price: 720000,
    image_url: "https://images.unsplash.com/photo-1547996160-71dfa63582b8?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1547996160-71dfa63582b8?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 2,
    status: "active",
    rating: 5.0,
    reviews_count: 19,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "العيار", labelEn: "Calibre", valueAr: "Rolex Calibre 4131 الكرونوغراف الأحدث", valueEn: "Rolex 4131 Chronograph" },
      { labelAr: "المقاومة", labelEn: "Water Resistance", valueAr: "100 متر مع أزرار كرونوغراف لولبية", valueEn: "100m waterproof screw-down pushers" },
    ],
    created_at: "2026-02-18T14:15:00Z",
  },
  // Dior
  {
    id: "brand-dior-sauvage-elixir",
    brand_id: "dior",
    brand_name: "Dior",
    store_id: "store-dior-official",
    store_name: "Christian Dior Paris Flagship",
    category_id: "cat-3",
    category_slug: "perfumes",
    name: "عطر Dior Sauvage Elixir فائق التركيز سعة 100 مل أصلي من باريس",
    name_en: "Dior Sauvage Elixir Parfum Concentré 100ml Genuine",
    description: "العطر الأكثر رجولية وجاذبية من دار ديور. تركيبة غنية نادرة بالخزامى المصنوعة خصيصاً في نيون، قلب من التوابل الفاخرة وخشب الصندل العطري النبيل.",
    description_en: "An extraordinarily concentrated fragrance steeped in the iconic freshness of Sauvage with an intoxicating heart of spices, 'tailor-made' lavender, and rich woods.",
    price: 9400,
    original_price: 10800,
    image_url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 40,
    status: "active",
    rating: 4.9,
    reviews_count: 215,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "التركيز", labelEn: "Concentration", valueAr: "Elixir فائق الثبات والفوحان (+24 ساعة)", valueEn: "Elixir High Concentration Ultra Long-Lasting" },
      { labelAr: "بلد الصنع", labelEn: "Country of Origin", valueAr: "فرنسا - باريس (بار كود محفور أصلي)", valueEn: "Made in France - Paris" },
    ],
    created_at: "2026-02-18T14:30:00Z",
  },
  {
    id: "brand-dior-saddle-bag",
    brand_id: "dior",
    brand_name: "Dior",
    store_id: "store-dior-official",
    store_name: "Christian Dior Paris Flagship",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "حقيبة Dior Saddle Bag جلد عجل حبيبي أسود مع إبزيم CD ذهبي",
    name_en: "Dior Saddle Bag Black Grained Calfskin with Gold CD Hardware",
    description: "الحقيبة الباريسية الأيقونية بتصميم السرج الكلاسيكي الشهير، مصنوعة يدويًا من جلد العجل المحبب مع مشبك CD ذهبي عتيق وحزام كتف قابل للتعديل.",
    description_en: "Legendary Dior Saddle silhouette in luxurious grained calfskin with aged gold-finish metal CD signature on strap handles.",
    price: 135000,
    original_price: 148000,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 5,
    status: "active",
    rating: 5.0,
    reviews_count: 42,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "الجلد والتصنيع", labelEn: "Craftsmanship", valueAr: "جلد عجل إيطالي 100% مع بطانة سويدي وكيس الغبار الأصلي", valueEn: "100% Grained Calfskin, Made in Italy" },
    ],
    created_at: "2026-02-18T14:45:00Z",
  },
  // Samsung
  {
    id: "brand-samsung-s24ultra",
    brand_id: "samsung",
    brand_name: "Samsung",
    store_id: "store-samsung-official",
    store_name: "Samsung Authorized Store",
    category_id: "cat-1",
    category_slug: "electronics",
    name: "هاتف Samsung Galaxy S24 Ultra بالذكاء الاصطناعي Galaxy AI سعة 512GB",
    name_en: "Samsung Galaxy S24 Ultra 512GB Titanium Gray (Galaxy AI)",
    description: "الهاتف الرائد المتربع على عرش أندرويد: إطار من التيتانيوم المقاوم للصدمات، قلم S-Pen مدمج، كاميرا 200MP مع تقريب بصري مذهل، وميزات Galaxy AI للترجمة والبحث الفوري.",
    description_en: "Galaxy S24 Ultra with Snapdragon 8 Gen 3, built-in S-Pen, 200MP camera with Quad Telephoto system, and full Galaxy AI suite.",
    price: 63900,
    original_price: 68500,
    image_url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 22,
    status: "active",
    rating: 4.9,
    reviews_count: 112,
    is_featured: false,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "المعالج", labelEn: "Processor", valueAr: "Snapdragon 8 Gen 3 for Galaxy", valueEn: "Snapdragon 8 Gen 3 for Galaxy" },
      { labelAr: "الضمان", labelEn: "Warranty", valueAr: "سنتين ضمان سامسونج المحلي المعتمد مع خدمة VIP", valueEn: "2-Year Samsung Official Regional Warranty" },
    ],
    created_at: "2026-02-18T15:00:00Z",
  },
  {
    id: "brand-samsung-zfold6",
    brand_id: "samsung",
    brand_name: "Samsung",
    store_id: "store-samsung-official",
    store_name: "Samsung Authorized Store",
    category_id: "cat-1",
    category_slug: "electronics",
    name: "هاتف Samsung Galaxy Z Fold 6 5G القابل للطي سعة 512GB فضي",
    name_en: "Samsung Galaxy Z Fold 6 5G 512GB Silver Shadow",
    description: "تصميم أنحف وأخف وزناً مع شاشة داخلية عملاقة 7.6 بوصة Dynamic AMOLED 2X تدعم تعدد المهام وقلم S-Pen وإمكانيات Galaxy AI الفورية.",
    description_en: "Ultra-slim foldable flagship with dual screens, Armour Aluminum hinge, and seamless AI productivity.",
    price: 86900,
    original_price: 92000,
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 12,
    status: "active",
    rating: 4.9,
    reviews_count: 56,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "الشاشة", labelEn: "Screen", valueAr: "7.6\" داخلية + 6.3\" خارجية 120Hz", valueEn: "7.6\" Foldable AMOLED 2X 120Hz" },
    ],
    created_at: "2026-02-18T15:15:00Z",
  },
  // Sony
  {
    id: "brand-sony-wh1000xm5",
    brand_id: "sony",
    brand_name: "Sony",
    store_id: "store-sony-official",
    store_name: "Sony Center Official",
    category_id: "cat-1",
    category_slug: "electronics",
    name: "سماعات Sony WH-1000XM5 اللاسلكية الرائدة في عزل الضوضاء",
    name_en: "Sony WH-1000XM5 Wireless Industry-Leading Noise Cancelling Headphones",
    description: "قمة هندسة الصوت اليابانية مع معالجين متقدمين و8 ميكروفونات لعزل أي ضجيج محيطي، دعم صوت عالي الدقة Hi-Res Audio و LDAC، وبطارية تدوم حتى 30 ساعة.",
    description_en: "Industry-leading noise cancellation powered by two processors and 8 microphones. Exceptional Hi-Res Audio wireless performance and 30-hour battery life.",
    price: 16800,
    original_price: 18900,
    image_url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 30,
    status: "active",
    rating: 4.9,
    reviews_count: 175,
    is_featured: false,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "عزل الضوضاء", labelEn: "Noise Cancelling", valueAr: "معالج V1 مخصص + معالج QN1 مع ضبط ضغط تلقائي", valueEn: "Integrated Processor V1 + HD QN1" },
      { labelAr: "عمر البطارية", labelEn: "Battery", valueAr: "30 ساعة (3 دقائق شحن تمنح 3 ساعات تشغيل)", valueEn: "30h battery (3-min quick charge gives 3 hours)" },
    ],
    created_at: "2026-02-18T15:30:00Z",
  },
  {
    id: "brand-sony-ps5-pro",
    brand_id: "sony",
    brand_name: "Sony",
    store_id: "store-sony-official",
    store_name: "Sony Center Official",
    category_id: "cat-1",
    category_slug: "electronics",
    name: "جهاز الألعاب PlayStation 5 Pro سعة 2TB مع تقنية PSSR و 4K 120Hz",
    name_en: "Sony PlayStation 5 Pro Console Edition 2TB (PSSR AI Upscaling)",
    description: "أقوى منصة ألعاب في العالم مع معالجة رسومية تفوق بنسبة 45% وتتبع أشعة متطور فائق السرعة مع دعم ألعاب 4K بسرعة 60/120 إطار بالثانية.",
    description_en: "PlayStation 5 Pro with upgraded GPU, Advanced Ray Tracing, and PlayStation Spectral Super Resolution (PSSR) AI scaling.",
    price: 38900,
    original_price: 42000,
    image_url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 15,
    status: "active",
    rating: 5.0,
    reviews_count: 240,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "التخزين", labelEn: "Storage", valueAr: "2TB Ultra-Fast SSD فائق السرعة", valueEn: "2TB Ultra-High Speed NVMe SSD" },
      { labelAr: "الضمان", labelEn: "Warranty", valueAr: "ضمان سوني الشرق الأوسط سنتين", valueEn: "2-Year Official Sony Regional Warranty" },
    ],
    created_at: "2026-02-18T15:45:00Z",
  },
  // Chanel
  {
    id: "brand-chanel-bleu-parfum",
    brand_id: "chanel",
    brand_name: "Chanel",
    store_id: "store-chanel-official",
    store_name: "Chanel Paris Boutique",
    category_id: "cat-3",
    category_slug: "perfumes",
    name: "عطر Bleu de Chanel Parfum المركز للرجال سعة 100 مل الأصلي",
    name_en: "Bleu de Chanel Parfum Pour Homme 100ml Original",
    description: "العطر الأكثر فخامة وتميزاً، تركيبة خشبية أروماتية آسرة تبرز حضور خشب الصندل الكاليدوني النبيل وأشجار الأرز الجذابة مع لمسات حمضية منعشة.",
    description_en: "An intensely masculine woody aromatic fragrance blending the fullness of New Caledonian sandalwood with the deep cedar and refreshing citrus accents.",
    price: 9800,
    original_price: 11200,
    image_url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 28,
    status: "active",
    rating: 5.0,
    reviews_count: 198,
    is_featured: false,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "التركيز", labelEn: "Concentration", valueAr: "Pure Parfum (أعلى تركيز وثبات لدى شانيل)", valueEn: "Pure Parfum" },
      { labelAr: "البلد", labelEn: "Origin", valueAr: "فرنسا - باريس", valueEn: "Made in France" },
    ],
    created_at: "2026-02-18T16:00:00Z",
  },
  {
    id: "brand-chanel-classic-flap",
    brand_id: "chanel",
    brand_name: "Chanel",
    store_id: "store-chanel-official",
    store_name: "Chanel Paris Boutique",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "حقيبة Chanel Classic Flap جلد خراف مبطن أسود مع قفل CC ذهبي",
    name_en: "Chanel Classic Medium Flap Bag Quilted Lambskin with Gold-Tone Metal",
    description: "الأيقونة الخالدة في تاريخ الموضة الراقية، جلد خراف باريسي ناعم مبطن بغرز الماس وقفل CC الدوار وسلسلة جلدية مدمجة.",
    description_en: "Timeless luxury staple featuring diamond-quilted lambskin, signature CC turn-lock closure, and interwoven leather-chain strap.",
    price: 360000,
    original_price: 385000,
    image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 2,
    status: "active",
    rating: 5.0,
    reviews_count: 31,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "المرفقات", labelEn: "Includes", valueAr: "العلبة المغناطيسية الأصلية، بطاقة الهوية الرقمية، وكتاب العناية", valueEn: "Original magnetic box, authenticity microchip, dust bag" },
    ],
    created_at: "2026-02-18T16:15:00Z",
  },
  // Adidas
  {
    id: "brand-adidas-samba-og",
    brand_id: "adidas",
    brand_name: "Adidas",
    store_id: "store-adidas-official",
    store_name: "Adidas Originals Official",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "حذاء Adidas Samba OG جلد أبيض وأسود ونعل صمغي كلاسيكي",
    name_en: "Adidas Samba OG Cloud White & Core Black Classic Shoes",
    description: "الأيقونة الخالدة منذ عقود. يتميز بجزء علوي من الجلد المحبب الفاخر مع طبقة T-Toe من الجلد السويدي الناعم ونعل Gum الأسطوري.",
    description_en: "Born on the pitch, the Samba is an unmistakable lifestyle icon featuring premium leather upper, suede T-toe overlay, and signature gum rubber sole.",
    price: 5200,
    original_price: 6100,
    image_url: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 45,
    status: "active",
    rating: 4.8,
    reviews_count: 165,
    is_featured: false,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "الخامات", labelEn: "Materials", valueAr: "جلد طبيعي كامل مع مقدمة سويدي ونعل مطاطي صمغي", valueEn: "Full grain leather upper with suede toe and gum sole" },
      { labelAr: "المقاسات", labelEn: "Sizing", valueAr: "جميع المقاسات من 39 إلى 45 EU", valueEn: "Standard EU 39-45" },
    ],
    created_at: "2026-02-18T16:30:00Z",
  },
  {
    id: "brand-adidas-ultraboost-light",
    brand_id: "adidas",
    brand_name: "Adidas",
    store_id: "store-adidas-official",
    store_name: "Adidas Originals Official",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "حذاء الجري Adidas Ultraboost Light فائق الخفة أسود كامل",
    name_en: "Adidas Ultraboost Light Core Black Running Shoes",
    description: "أخف حذاء Ultraboost صنعته أديداس على الإطلاق بفضل مادة Light BOOST المتطورة التي توفر طاقة ارتدادية قصوى في كل خطوة.",
    description_en: "Experience epic energy with the new Ultraboost Light, the lightest Ultraboost ever featuring next-gen Light BOOST midsole cushioning.",
    price: 7800,
    original_price: 9200,
    image_url: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 30,
    status: "active",
    rating: 4.9,
    reviews_count: 95,
    is_featured: false,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "التقنية", labelEn: "Technology", valueAr: "Light BOOST 30% أخف مع قماش Primeknit+ مريح", valueEn: "Light BOOST + Primeknit+ textile upper" },
    ],
    created_at: "2026-02-18T16:45:00Z",
  },
  // Gucci
  {
    id: "brand-gucci-gg-marmont-belt",
    brand_id: "gucci",
    brand_name: "Gucci",
    store_id: "store-gucci-official",
    store_name: "Gucci Firenze Boutique",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "حزام Gucci GG Marmont جلد عجل إيطالي أسود ناعم مع إبزيم نحاسي ذهبي",
    name_en: "Gucci GG Marmont Leather Belt with Shiny Gold-Toned Buckle",
    description: "حزام غوتشي الإيطالي الفاخر بعرض 4 سم مصنوع من أجود أنواع جلد العجل الإيطالي، مزين بشعار Double G الشهير المطلي بالذهب النحاسي العتيق.",
    description_en: "Signature 4cm leather belt crafted from smooth black Italian calfskin, finished with the iconic antiqued brass Double G logo buckle.",
    price: 18500,
    original_price: 21000,
    image_url: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 14,
    status: "active",
    rating: 4.9,
    reviews_count: 62,
    is_featured: false,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "البلد والصناعة", labelEn: "Origin", valueAr: "صنع في إيطاليا 100% (ختم المصنع التسلسلي)", valueEn: "Made in Italy with stamped serial code" },
      { labelAr: "المقاسات", labelEn: "Sizes", valueAr: "85 سم إلى 115 سم (قابل للتعديل)", valueEn: "85cm to 115cm" },
    ],
    created_at: "2026-02-18T17:00:00Z",
  },
  {
    id: "brand-gucci-marmont-bag",
    brand_id: "gucci",
    brand_name: "Gucci",
    store_id: "store-gucci-official",
    store_name: "Gucci Firenze Boutique",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "حقيبة كتف Gucci GG Marmont جلد شيفرون ماتيلاسيه أسود",
    name_en: "Gucci GG Marmont Small Matelassé Shoulder Bag Black",
    description: "حقيبة غوتشي الفاخرة المبطنة بنمط الشيفرون المتعرج، مزينة بشعار Double G الذهبي وسلسلة كتف جلدية مريحة وبطانة مايكروفايبر تشبه الجلد المدبوغ.",
    description_en: "Small GG Marmont chain shoulder bag structured in chevron matelassé leather with a heart on the back and double G hardware.",
    price: 95000,
    original_price: 104000,
    image_url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 6,
    status: "active",
    rating: 5.0,
    reviews_count: 48,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "المقاس", labelEn: "Dimensions", valueAr: "26 سم × 15 سم × 7 سم", valueEn: "26cm x 15cm x 7cm" },
    ],
    created_at: "2026-02-18T17:15:00Z",
  },
  // Louis Vuitton (lv)
  {
    id: "brand-lv-neverfull-mm",
    brand_id: "lv",
    brand_name: "Louis Vuitton",
    store_id: "store-lv-official",
    store_name: "Louis Vuitton Paris Flagship",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "حقيبة Louis Vuitton Neverfull MM بنمط Monogram كانفاس الكلاسيكي مع محفظة داخلية",
    name_en: "Louis Vuitton Neverfull MM Monogram Canvas Tote with Pouch",
    description: "الحقيبة الأسطورية الأكثر شهرة من لويس فيتون. قماش كانفاس متين مقاوم للماء والخدوش، مقابض وحواف من جلد البقر الطبيعي، ومحفظة قابلة للفصل.",
    description_en: "The timeless Neverfull MM tote pairs iconic Monogram canvas with natural cowhide leather trim and removable zip pouch.",
    price: 112000,
    original_price: 124000,
    image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 4,
    status: "active",
    rating: 5.0,
    reviews_count: 53,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "الخامات", labelEn: "Material", valueAr: "Monogram Coated Canvas مع بطانة قماشية ملونة", valueEn: "Monogram coated canvas, textile lining" },
      { labelAr: "البلد", labelEn: "Origin", valueAr: "صنع في فرنسا (رمز المصنع ورقم RFID)", valueEn: "Made in France with RFID chip" },
    ],
    created_at: "2026-02-18T17:20:00Z",
  },
  {
    id: "brand-lv-keepall-50",
    brand_id: "lv",
    brand_name: "Louis Vuitton",
    store_id: "store-lv-official",
    store_name: "Louis Vuitton Paris Flagship",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "حقيبة سفر Louis Vuitton Keepall Bandoulière 50 Monogram Eclipse",
    name_en: "Louis Vuitton Keepall Bandoulière 50 Monogram Eclipse Duffle Bag",
    description: "حقيبة السفر الأيقونية الفاخرة للرحلات القصيرة، قماش كانفاس Monogram Eclipse أسود ورمادي أنيق مع قفل وأشرطة كتف جلدية.",
    description_en: "An icon since 1930, the Keepall 50 is the definitive weekend duffle bag in sleek Monogram Eclipse canvas with padlock and shoulder strap.",
    price: 138000,
    original_price: 152000,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 3,
    status: "active",
    rating: 5.0,
    reviews_count: 37,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "الحجم والمقاس", labelEn: "Size", valueAr: "50 سم (حجم كابينة الطائرة المعتمد)", valueEn: "50cm Cabin Size Approved" },
    ],
    created_at: "2026-02-18T17:25:00Z",
  },
  // Dyson
  {
    id: "brand-dyson-airwrap-complete",
    brand_id: "dyson",
    brand_name: "Dyson",
    store_id: "store-dyson-official",
    store_name: "Dyson Technology Official",
    category_id: "cat-1",
    category_slug: "electronics",
    name: "مصفف الشعر الذكي Dyson Airwrap Multi-Styler Complete Long برتقالي كوبر ونيكل",
    name_en: "Dyson Airwrap Multi-Styler Complete Long (Copper & Nickel)",
    description: "تصفيف وتمويج وتجفيف الشعر بالهواء بدون حرارة مفرطة بفضل تأثير كواندا Coanda الهوائي الذكي. مناسب للشعر الطويل والمتوسط ويأتي مع حقيبة تخزين ملكية.",
    description_en: "Styles, curls, shapes and smooths using the aerodynamic Coanda effect without extreme heat. Comes with re-engineered barrels and storage case.",
    price: 28900,
    original_price: 32500,
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 19,
    status: "active",
    rating: 5.0,
    reviews_count: 140,
    is_featured: true,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "المحرك والتحكم", labelEn: "Motor & Control", valueAr: "محرك Dyson V9 رقمي مع تحكم حراري ذكي يقيس الحرارة 40 مرة/ثانية", valueEn: "Dyson digital motor V9 with intelligent heat control (measures 40x/sec)" },
      { labelAr: "الضمان", labelEn: "Warranty", valueAr: "سنتين ضمان الوكيل البريطاني المعتمد", valueEn: "2-Year Dyson Official Warranty" },
    ],
    created_at: "2026-02-18T17:30:00Z",
  },
  {
    id: "brand-dyson-supersonic-nural",
    brand_id: "dyson",
    brand_name: "Dyson",
    store_id: "store-dyson-official",
    store_name: "Dyson Technology Official",
    category_id: "cat-1",
    category_slug: "electronics",
    name: "مجفف الشعر الذكي Dyson Supersonic Nural بمستشعرات حماية فروة الرأس",
    name_en: "Dyson Supersonic Nural Intelligent Hair Dryer (Scalp Protect Mode)",
    description: "أحدث مجففات دايسون المزودة بشبكة مستشعرات Nural الذكية التي تخفض الحرارة تلقائياً عند الاقتراب من الرأس لحماية صحة فروة الرأس ولمعان الشعر الطبيعي.",
    description_en: "Auto-adapts to protect scalp health and enhance natural shine with intelligent Nural sensor network.",
    price: 24500,
    original_price: 27900,
    image_url: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 16,
    status: "active",
    rating: 4.9,
    reviews_count: 82,
    is_featured: false,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "المستشعرات", labelEn: "Sensors", valueAr: "Scalp Protect Mode بمستشعر المسافة Time-of-Flight", valueEn: "Time-of-Flight Scalp Protect Sensor" },
    ],
    created_at: "2026-02-18T17:45:00Z",
  },
  // Zara
  {
    id: "brand-zara-wool-blazer",
    brand_id: "zara",
    brand_name: "ZARA",
    store_id: "store-zara-official",
    store_name: "ZARA Official Boutique",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "بليزر رجالي صوف مهيكل بقصة Slim-Fit كلاسيكية من ZARA",
    name_en: "ZARA Men's Tailored Wool-Blend Structured Blazer",
    description: "بليزر أوروبي فاخر مصنوع من مزيج الصوف المعالج، ياقة مسننة، بطانة داخلية حريرية مريحة وأزرار من قرن الثور الأصلي، قصة أنيقة تناسب الإطلالات الرسمية والمسائية.",
    description_en: "Tailored wool-blend blazer featuring notched lapels, full satin interior lining, front flap pockets, and structured shoulder pads for a sharp European profile.",
    price: 3850,
    original_price: 4600,
    image_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 50,
    status: "active",
    rating: 4.8,
    reviews_count: 89,
    is_featured: false,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "الخامة", labelEn: "Fabric", valueAr: "70% صوف معالج، 30% فسكوز مع بطانة بوليستر حريري", valueEn: "70% Refined Wool, 30% Viscose with silky lining" },
      { labelAr: "المقاسات", labelEn: "Sizes", valueAr: "48 إلى 56 EU", valueEn: "EU 48 to 56" },
    ],
    created_at: "2026-02-18T18:00:00Z",
  },
  {
    id: "brand-zara-silk-dress",
    brand_id: "zara",
    brand_name: "ZARA",
    store_id: "store-zara-official",
    store_name: "ZARA Official Boutique",
    category_id: "cat-2",
    category_slug: "fashion",
    name: "فستان سهرة حرير ميدي بقصة انسيابية ومفتوح الظهر من ZARA Studio",
    name_en: "ZARA Studio 100% Mulberry Silk Flowy Midi Evening Dress",
    description: "فستان سهرة راقٍ من تشكيلة ZARA Studio الخاصة، حرير طبيعي نقي 100% بلون زمردي أخاذ، قصة درابيه أنثوية انسيابية وياقة ناعمة.",
    description_en: "Limited edition ZARA Studio evening dress crafted from pure silk with open back drape detail and elegant fluid movement.",
    price: 4900,
    original_price: 5800,
    image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80",
    ],
    stock: 25,
    status: "active",
    rating: 4.9,
    reviews_count: 67,
    is_featured: false,
    is_preorder: true,
    preorder_label: "حجز مسبق VIP / كونسيرج",
    free_shipping: true,
    specs: [
      { labelAr: "الخامات", labelEn: "Material", valueAr: "100% حرير طبيعي نقي عالي الجودة", valueEn: "100% Mulberry Pure Silk" },
      { labelAr: "المقاسات", labelEn: "Sizes", valueAr: "XS, S, M, L", valueEn: "XS to L" },
    ],
    created_at: "2026-02-18T18:15:00Z",
  },
];

interface MarketplaceContextType {
  // Currency
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  currencies: Record<CurrencyCode, CurrencyInfo>;
  updateExchangeRate: (code: CurrencyCode, newRate: number) => void;
  formatPrice: (amountInEGP: number, customCurrency?: CurrencyCode) => string;
  convertPrice: (amountInEGP: number, targetCurrency?: CurrencyCode) => number;

  // Platform Settings
  settings: PlatformSettings;
  updateSettings: (partial: Partial<PlatformSettings>) => void;
  toggleGateway: (key: PaymentGatewayKey, enabled: boolean) => void;

  // Catalog & Multi-Vendor Stores
  categories: Category[];
  stores: Store[];
  products: Product[];
  currentStoreId: string;
  setCurrentStoreId: (storeId: string) => void;
  createOfficialStore: (name: string, description: string, slug?: string) => Store;
  addProduct: (product: Omit<Product, "id" | "created_at">) => Product;
  updateProductItem: (id: string, updates: Partial<Product>) => void;
  deleteProductItem: (id: string) => void;
  registerStore: (storeData: {
    name: string;
    slug: string;
    description: string;
    country: string;
    plan?: string;
    cr_number?: string;
    tax_number?: string;
    bank_name?: string;
    iban?: string;
    contact_email?: string;
    contact_phone?: string;
    logo_url?: string;
    banner_url?: string;
  }) => { store: Store; autoApproved: boolean };
  updateStoreProfile: (storeId: string, updates: Partial<Store>) => void;
  updateStoreStatusItem: (storeId: string, status: Store["status"]) => void;
  deleteStoreItem: (storeId: string) => void;
  bulkUpdateStoresStatus: (storeIds: string[], status: Store["status"]) => void;
  bulkDeleteStores: (storeIds: string[]) => void;
  toggleStoreVerified: (storeId: string) => void;
  updateStoreCommissionRate: (storeId: string, rate: number) => void;

  // Marketing & Social Posts
  marketingPosts: MarketingPost[];
  addMarketingPost: (post: Omit<MarketingPost, "id" | "created_at" | "likes_count" | "views_count">) => MarketingPost;
  updateMarketingPost: (id: string, updates: Partial<MarketingPost>) => void;
  deleteMarketingPost: (id: string) => void;
  likeMarketingPost: (id: string) => void;

  // Payouts & Merchant Ledger
  payouts: StorePayout[];
  requestStorePayout: (
    storeId: string,
    amount: number,
    iban: string,
    bankName: string,
    notes?: string
  ) => { success: boolean; message: string; payout?: StorePayout };
  updatePayoutStatus: (payoutId: string, status: StorePayout["status"], transactionRef?: string) => void;

  // Wishlist
  wishlist: string[]; // productIds
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Cart & Promo
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedVariants?: SelectedVariant,
    selectedVariantsLabel?: string
  ) => void;
  removeFromCart: (productId: string, variantKey?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variantKey?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number; // in base EGP
  appliedPromo: PromoCode | null;
  applyPromoCode: (code: string) => { success: boolean; messageAr: string; messageEn: string };
  removePromoCode: () => void;
  calculatedDiscount: number; // in base EGP
  calculatedShipping: (shippingSpeed?: "standard" | "priority") => number; // in base EGP
  calculatedVat: number; // in base EGP
  calculatedGrandTotal: (shippingSpeed?: "standard" | "priority") => number; // in base EGP
  freeShippingProgress: { current: number; threshold: number; percentage: number; needed: number };

  // Orders
  orders: Order[];
  createOrder: (
    shipping: ShippingAddress,
    paymentMethod: PaymentGatewayKey,
    shippingSpeed: "standard" | "priority"
  ) => { order: Order | null; error: string | null };
  updateOrderStatus: (orderId: string, status: Order["status"], trackingNumber?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByTracking: (trackingNumber: string) => Order | undefined;

  // Logistics, Carriers & Shipment Tracking
  carriers: ShippingCarrier[];
  shipments: Shipment[];
  registerCarrier: (data: Omit<ShippingCarrier, "id">) => ShippingCarrier;
  updateCarrier: (id: string, updates: Partial<ShippingCarrier>) => void;
  toggleCarrierStatus: (id: string, status: CarrierStatus) => void;
  createShipment: (
    data: Omit<Shipment, "id" | "awbNumber" | "created_at" | "checkpoints">
  ) => Shipment;
  updateShipmentStatus: (
    id: string,
    status: ShipmentStatus,
    note?: string,
    location?: string
  ) => void;
  addShipmentCheckpoint: (
    shipmentId: string,
    checkpoint: Omit<TrackingCheckpoint, "id" | "passed">
  ) => void;
  assignShipmentDriver: (
    shipmentId: string,
    driver: { name: string; phone: string; vehicle?: string; avatar?: string }
  ) => void;
  dispatchBulkShipments: (
    shipmentIds: string[],
    carrierId: string
  ) => { count: number; awbList: string[] };
  calculateShippingQuotes: (
    originCountry: string,
    destCountry: string,
    weightKg?: number,
    speed?: "standard" | "priority" | "same_day"
  ) => ShippingRateQuote[];
  getShipmentByAwb: (awbOrOrder: string) => Shipment | undefined;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENCY: "noormexa_active_currency",
  SETTINGS: "noormexa_platform_settings",
  WISHLIST: "noormexa_wishlist",
  CART: "noormexa_smart_cart",
  PROMO: "noormexa_applied_promo",
  PRODUCTS: "noormexa_products_v3",
  STORES: "noormexa_stores_v2",
  ORDERS: "noormexa_orders_v2",
  CURRENCIES: "noormexa_currencies_v2",
  PAYOUTS: "noormexa_payouts_v2",
  CURRENT_STORE: "noormexa_active_store_id_v2",
  MARKETING_POSTS: "noormexa_marketing_posts_v2",
  CARRIERS: "noormexa_carriers_v1",
  SHIPMENTS: "noormexa_shipments_v1",
};

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("EGP");
  const [currenciesState, setCurrenciesState] = useState<Record<CurrencyCode, CurrencyInfo>>(CURRENCIES);
  const [settings, setSettingsState] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [stores, setStoresState] = useState<Store[]>(INITIAL_STORES);
  const [currentStoreId, setCurrentStoreIdState] = useState<string>("store-noormexa-official");
  const [products, setProductsState] = useState<Product[]>(INITIAL_PRODUCTS);
  const [marketingPosts, setMarketingPostsState] = useState<MarketingPost[]>(INITIAL_MARKETING_POSTS);
  const [payouts, setPayoutsState] = useState<StorePayout[]>(INITIAL_PAYOUTS);
  const [wishlist, setWishlistState] = useState<string[]>([]);
  const [cartItems, setCartItemsState] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [carriers, setCarriersState] = useState<ShippingCarrier[]>(INITIAL_CARRIERS);
  const [shipments, setShipmentsState] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [hydrated, setHydrated] = useState(false);

  // Read initial local storage safely
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active || typeof window === "undefined") return;

      try {
        const savedCurrency = window.localStorage.getItem(STORAGE_KEYS.CURRENCY) as CurrencyCode;
        if (savedCurrency && CURRENCIES[savedCurrency]) setCurrencyState(savedCurrency);

        const savedCurrencies = window.localStorage.getItem(STORAGE_KEYS.CURRENCIES);
        if (savedCurrencies) setCurrenciesState(JSON.parse(savedCurrencies));

        const savedSettings = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (savedSettings) setSettingsState(JSON.parse(savedSettings));

        const savedWishlist = window.localStorage.getItem(STORAGE_KEYS.WISHLIST);
        if (savedWishlist) setWishlistState(JSON.parse(savedWishlist));

        const savedCart = window.localStorage.getItem(STORAGE_KEYS.CART);
        if (savedCart) setCartItemsState(JSON.parse(savedCart));

        const savedPromo = window.localStorage.getItem(STORAGE_KEYS.PROMO);
        if (savedPromo) setAppliedPromo(JSON.parse(savedPromo));

        const savedProducts = window.localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) setProductsState(parsed);
        }

        const savedStores = window.localStorage.getItem(STORAGE_KEYS.STORES);
        if (savedStores) {
          const parsed = JSON.parse(savedStores);
          if (Array.isArray(parsed) && parsed.length > 0) setStoresState(parsed);
        }

        const savedActiveStore = window.localStorage.getItem(STORAGE_KEYS.CURRENT_STORE);
        if (savedActiveStore) setCurrentStoreIdState(savedActiveStore);

        const savedPosts = window.localStorage.getItem(STORAGE_KEYS.MARKETING_POSTS);
        if (savedPosts) {
          const parsed = JSON.parse(savedPosts);
          if (Array.isArray(parsed) && parsed.length > 0) setMarketingPostsState(parsed);
        }

        const savedPayouts = window.localStorage.getItem(STORAGE_KEYS.PAYOUTS);
        if (savedPayouts) {
          const parsed = JSON.parse(savedPayouts);
          if (Array.isArray(parsed) && parsed.length > 0) setPayoutsState(parsed);
        }

        const savedOrders = window.localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (savedOrders) setOrdersState(JSON.parse(savedOrders));

        const savedCarriers = window.localStorage.getItem(STORAGE_KEYS.CARRIERS);
        if (savedCarriers) {
          const parsed = JSON.parse(savedCarriers);
          if (Array.isArray(parsed) && parsed.length > 0) setCarriersState(parsed);
        }

        const savedShipments = window.localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
        if (savedShipments) {
          const parsed = JSON.parse(savedShipments);
          if (Array.isArray(parsed) && parsed.length > 0) setShipmentsState(parsed);
        }
      } catch (err) {
        console.error("Failed to load saved marketplace state:", err);
      } finally {
        setHydrated(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // Save changes
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
      window.localStorage.setItem(STORAGE_KEYS.CURRENCIES, JSON.stringify(currenciesState));
      window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      window.localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
      window.localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
      window.localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      window.localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
      window.localStorage.setItem(STORAGE_KEYS.CURRENT_STORE, currentStoreId);
      window.localStorage.setItem(STORAGE_KEYS.MARKETING_POSTS, JSON.stringify(marketingPosts));
      window.localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(payouts));
      window.localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      window.localStorage.setItem(STORAGE_KEYS.CARRIERS, JSON.stringify(carriers));
      window.localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));
      if (appliedPromo) {
        window.localStorage.setItem(STORAGE_KEYS.PROMO, JSON.stringify(appliedPromo));
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.PROMO);
      }
    } catch (err) {
      console.error("Failed to persist marketplace state:", err);
    }
  }, [hydrated, currency, currenciesState, settings, wishlist, cartItems, products, stores, currentStoreId, marketingPosts, payouts, orders, carriers, shipments, appliedPromo]);

  // Currency helpers
  const setCurrency = useCallback((newCur: CurrencyCode) => {
    if (CURRENCIES[newCur]) setCurrencyState(newCur);
  }, []);

  const updateExchangeRate = useCallback((code: CurrencyCode, newRate: number) => {
    setCurrenciesState((prev) => ({
      ...prev,
      [code]: { ...prev[code], rateAgainstEGP: newRate },
    }));
  }, []);

  const convertPrice = useCallback(
    (amountInEGP: number, targetCurrency?: CurrencyCode): number => {
      const cur = targetCurrency || currency;
      const rate = currenciesState[cur]?.rateAgainstEGP ?? 1;
      const converted = amountInEGP * rate;
      // Round nicely according to currency
      if (cur === "KWD") return Math.round(converted * 100) / 100;
      if (cur === "USD" || cur === "EUR") return Math.round(converted * 100) / 100;
      return Math.round(converted * 10) / 10;
    },
    [currency, currenciesState]
  );

  const formatPrice = useCallback(
    (amountInEGP: number, customCurrency?: CurrencyCode): string => {
      const curCode = customCurrency || currency;
      const curInfo = currenciesState[curCode] || CURRENCIES.EGP;
      const val = convertPrice(amountInEGP, curCode);

      // Check current language snapshot
      const isArabic =
        typeof document !== "undefined"
          ? document.documentElement.lang !== "en"
          : true;

      const formattedVal = val.toLocaleString(isArabic ? "ar-EG" : "en-US", {
        minimumFractionDigits: curCode === "KWD" ? 2 : curCode === "USD" || curCode === "EUR" ? 2 : 0,
        maximumFractionDigits: 2,
      });

      const symbol = isArabic ? curInfo.symbolAr : curInfo.symbolEn;
      return isArabic ? `${formattedVal} ${symbol}` : `${symbol} ${formattedVal}`;
    },
    [currency, currenciesState, convertPrice]
  );

  // Settings
  const updateSettings = useCallback((partial: Partial<PlatformSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleGateway = useCallback((key: PaymentGatewayKey, enabled: boolean) => {
    setSettingsState((prev) => ({
      ...prev,
      gateways: {
        ...prev.gateways,
        [key]: { ...prev.gateways[key], enabled },
      },
    }));
  }, []);

  // Wishlist
  const toggleWishlist = useCallback((productId: string) => {
    setWishlistState((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  // Catalog
  const addProduct = useCallback((productData: Omit<Product, "id" | "created_at">): Product => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
      status: "active",
      rating: 5.0,
      reviews_count: 1,
    };
    setProductsState((prev) => [newProd, ...prev]);
    return newProd;
  }, []);

  const updateProductItem = useCallback((id: string, updates: Partial<Product>) => {
    setProductsState((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProductItem = useCallback((id: string) => {
    setProductsState((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const registerStore = useCallback(
    (storeData: {
      name: string;
      slug: string;
      description: string;
      country: string;
      plan?: string;
      cr_number?: string;
      tax_number?: string;
      bank_name?: string;
      iban?: string;
      contact_email?: string;
      contact_phone?: string;
      logo_url?: string;
      banner_url?: string;
    }) => {
      const cleanSlug = (storeData.slug || storeData.name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const autoApproved = settings.autoApproveStores ?? true;
      const newStore: Store = {
        id: `store-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        owner_id: `owner-${Date.now()}`,
        name: storeData.name,
        slug: cleanSlug || `store-${Date.now()}`,
        description: storeData.description,
        country: storeData.country,
        plan: storeData.plan || "professional",
        commission_rate: settings.defaultCommissionRate || 8,
        status: autoApproved ? "approved" : "pending",
        is_verified: autoApproved,
        rating: 5.0,
        total_sales: 0,
        cr_number: storeData.cr_number,
        tax_number: storeData.tax_number,
        bank_name: storeData.bank_name,
        iban: storeData.iban,
        contact_email: storeData.contact_email,
        contact_phone: storeData.contact_phone,
        logo_url:
          storeData.logo_url ||
          "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&auto=format&fit=crop&q=80",
        banner_url:
          storeData.banner_url ||
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
        created_at: new Date().toISOString(),
      };
      setStoresState((prev) => [newStore, ...prev]);
      return { store: newStore, autoApproved };
    },
    [settings]
  );

  const updateStoreProfile = useCallback((storeId: string, updates: Partial<Store>) => {
    setStoresState((prev) => prev.map((s) => (s.id === storeId ? { ...s, ...updates } : s)));
  }, []);

  const updateStoreStatusItem = useCallback((storeId: string, status: Store["status"]) => {
    setStoresState((prev) => prev.map((s) => (s.id === storeId ? { ...s, status } : s)));
  }, []);

  const deleteStoreItem = useCallback((storeId: string) => {
    setStoresState((prev) => prev.filter((s) => s.id !== storeId));
  }, []);

  const bulkUpdateStoresStatus = useCallback((storeIds: string[], status: Store["status"]) => {
    if (storeIds.length === 0) return;
    const idSet = new Set(storeIds);
    setStoresState((prev) =>
      prev.map((s) => (idSet.has(s.id) ? { ...s, status, is_verified: status === "approved" ? true : s.is_verified } : s))
    );
  }, []);

  const bulkDeleteStores = useCallback((storeIds: string[]) => {
    if (storeIds.length === 0) return;
    const idSet = new Set(storeIds);
    setStoresState((prev) => prev.filter((s) => !idSet.has(s.id)));
  }, []);

  const toggleStoreVerified = useCallback((storeId: string) => {
    setStoresState((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, is_verified: !s.is_verified } : s))
    );
  }, []);

  const updateStoreCommissionRate = useCallback((storeId: string, rate: number) => {
    setStoresState((prev) => prev.map((s) => (s.id === storeId ? { ...s, commission_rate: rate } : s)));
  }, []);

  const setCurrentStoreId = useCallback((storeId: string) => {
    setCurrentStoreIdState(storeId);
  }, []);

  const createOfficialStore = useCallback(
    (name: string, description: string, customSlug?: string): Store => {
      const cleanSlug = (customSlug || name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const newOfficialStore: Store = {
        id: `store-official-${Date.now()}`,
        owner_id: "owner-platform-admin",
        name: name || "متجر نورميكسا الرسمي (NOORMEXA Flagship Direct)",
        slug: cleanSlug || `noormexa-official-${Date.now()}`,
        description: description || "المتجر الرسمي لعلامة المنصة العالمية، منتجات أصلية وشحن فوري.",
        country: "المملكة العربية السعودية / مصر / الإمارات",
        plan: "platform_owner",
        commission_rate: 0,
        status: "approved",
        is_verified: true,
        is_official: true,
        rating: 5.0,
        total_sales: 0,
        cr_number: "CR-NRX-HQ-2026",
        tax_number: "VAT-NRX-310029384",
        bank_name: "حساب خزينة المنصة المركزي (Central Platform Treasury)",
        iban: "SA0000000000000000000000",
        contact_email: "direct@noormexa.com",
        contact_phone: "+966 800 124 6677",
        logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
        banner_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80",
        created_at: new Date().toISOString(),
      };
      setStoresState((prev) => [newOfficialStore, ...prev]);
      setCurrentStoreIdState(newOfficialStore.id);
      return newOfficialStore;
    },
    []
  );

  const addMarketingPost = useCallback(
    (postData: Omit<MarketingPost, "id" | "created_at" | "likes_count" | "views_count">): MarketingPost => {
      const newPost: MarketingPost = {
        ...postData,
        id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        likes_count: 0,
        views_count: 1,
        created_at: new Date().toISOString(),
      };
      setMarketingPostsState((prev) => [newPost, ...prev]);
      return newPost;
    },
    []
  );

  const updateMarketingPost = useCallback((id: string, updates: Partial<MarketingPost>) => {
    setMarketingPostsState((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteMarketingPost = useCallback((id: string) => {
    setMarketingPostsState((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const likeMarketingPost = useCallback((id: string) => {
    setMarketingPostsState((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p))
    );
  }, []);

  // Payout actions
  const requestStorePayout = useCallback(
    (storeId: string, amount: number, iban: string, bankName: string, notes?: string) => {
      const store = stores.find((s) => s.id === storeId);
      if (!store) {
        return { success: false, message: "المتجر غير موجود" };
      }
      if (amount <= 0) {
        return { success: false, message: "المبلغ المطلوب غير صالح" };
      }
      const newPayout: StorePayout = {
        id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        store_id: storeId,
        store_name: store.name,
        amount,
        status: "pending",
        requested_at: new Date().toISOString(),
        bank_name: bankName,
        iban: iban,
        notes: notes || "طلب تسوية أرباح مبيعات",
      };
      setPayoutsState((prev) => [newPayout, ...prev]);
      return {
        success: true,
        message: "تم إرسال طلب سحب الأرباح بنجاح إلى الإدارة للمراجعة والتحويل",
        payout: newPayout,
      };
    },
    [stores]
  );

  const updatePayoutStatus = useCallback(
    (payoutId: string, status: StorePayout["status"], transactionRef?: string) => {
      setPayoutsState((prev) =>
        prev.map((p) =>
          p.id === payoutId
            ? {
                ...p,
                status,
                processed_at:
                  status === "transferred" || status === "approved"
                    ? new Date().toISOString()
                    : p.processed_at,
                transaction_ref: transactionRef || p.transaction_ref,
              }
            : p
        )
      );
    },
    []
  );

  // Cart operations
  const addToCart = useCallback(
    (
      product: Product,
      quantity = 1,
      selectedVariants?: SelectedVariant,
      selectedVariantsLabel?: string
    ) => {
      setCartItemsState((prev) => {
        // Find if identical product with same variants is in cart
        const variantKey = selectedVariants ? JSON.stringify(selectedVariants) : "";
        const existingIdx = prev.findIndex(
          (i) =>
            i.productId === product.id &&
            (selectedVariants ? JSON.stringify(i.selectedVariants) === variantKey : true)
        );

        if (existingIdx > -1) {
          const next = [...prev];
          const current = next[existingIdx];
          const newQty = Math.min(current.quantity + quantity, product.stock || 99);
          next[existingIdx] = { ...current, quantity: newQty };
          return next;
        }

        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          nameEn: product.name_en,
          price: product.price,
          imageUrl: product.image_url,
          storeId: product.store_id,
          storeName: product.store_name || "NOORMEXA Verified Store",
          quantity: Math.min(quantity, product.stock || 99),
          maxStock: product.stock,
          selectedVariants,
          selectedVariantsLabel,
        };
        return [newItem, ...prev];
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string, variantKey?: string) => {
    setCartItemsState((prev) =>
      prev.filter((item) => {
        if (item.productId !== productId) return true;
        if (variantKey && item.selectedVariants) {
          return JSON.stringify(item.selectedVariants) !== variantKey;
        }
        return false;
      })
    );
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number, variantKey?: string) => {
    setCartItemsState((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          if (variantKey && item.selectedVariants && JSON.stringify(item.selectedVariants) !== variantKey) {
            return item;
          }
          const validQty = Math.max(1, Math.min(quantity, item.maxStock || 99));
          return { ...item, quantity: validQty };
        })
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItemsState([]);
    setAppliedPromo(null);
  }, []);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Promo code
  const applyPromoCode = useCallback(
    (inputCode: string) => {
      const clean = inputCode.trim().toUpperCase();
      const found = PROMO_CODES.find((p) => p.code === clean);
      if (!found) {
        return {
          success: false,
          messageAr: "كود الخصم غير صالح أو منتهي الصلاحية.",
          messageEn: "Invalid or expired promo code.",
        };
      }
      if (found.minOrderValue && cartSubtotal < found.minOrderValue) {
        return {
          success: false,
          messageAr: `هذا الكوبون يتطلب حد أدنى للطلب بقيمة ${found.minOrderValue} ج.م`,
          messageEn: `This promo requires a minimum order value of ${found.minOrderValue} EGP`,
        };
      }
      setAppliedPromo(found);
      return {
        success: true,
        messageAr: `تم تفعيل كود الخصم (${found.code}) بنجاح!`,
        messageEn: `Promo code (${found.code}) applied successfully!`,
      };
    },
    [cartSubtotal]
  );

  const removePromoCode = useCallback(() => setAppliedPromo(null), []);

  const calculatedDiscount = appliedPromo
    ? appliedPromo.discountType === "percentage"
      ? (cartSubtotal * appliedPromo.discountValue) / 100
      : appliedPromo.discountType === "fixed"
      ? appliedPromo.discountValue
      : 0
    : 0;

  const freeShippingProgress = {
    current: cartSubtotal,
    threshold: settings.freeShippingThreshold,
    percentage: Math.min(100, Math.round((cartSubtotal / settings.freeShippingThreshold) * 100)),
    needed: Math.max(0, settings.freeShippingThreshold - cartSubtotal),
  };

  const calculatedShipping = useCallback(
    (shippingSpeed: "standard" | "priority" = "standard") => {
      if (cartItems.length === 0) return 0;
      if (appliedPromo?.discountType === "free_shipping") {
        return shippingSpeed === "priority" ? settings.priorityShippingCost - settings.standardShippingCost : 0;
      }
      const isEligibleForFree = cartSubtotal >= settings.freeShippingThreshold;
      if (isEligibleForFree) {
        return shippingSpeed === "priority" ? settings.priorityShippingCost - settings.standardShippingCost : 0;
      }
      return shippingSpeed === "priority" ? settings.priorityShippingCost : settings.standardShippingCost;
    },
    [cartItems.length, cartSubtotal, appliedPromo, settings]
  );

  const calculatedVat = settings.vatEnabled
    ? Math.round(((cartSubtotal - calculatedDiscount) * settings.vatRate) / 100)
    : 0;

  const calculatedGrandTotal = useCallback(
    (shippingSpeed: "standard" | "priority" = "standard") => {
      if (cartItems.length === 0) return 0;
      const ship = calculatedShipping(shippingSpeed);
      return Math.max(0, cartSubtotal - calculatedDiscount + ship + calculatedVat);
    },
    [cartItems.length, cartSubtotal, calculatedDiscount, calculatedShipping, calculatedVat]
  );

  // Orders
  const createOrder = useCallback(
    (
      shipping: ShippingAddress,
      paymentMethod: PaymentGatewayKey,
      shippingSpeed: "standard" | "priority"
    ): { order: Order | null; error: string | null } => {
      if (cartItems.length === 0) {
        return { order: null, error: "السلة فارغة، لا يمكن إتمام الطلب." };
      }

      const orderNumber = `NRX-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const trackingNumber = `TRK-GLB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const now = new Date().toISOString();

      const shippingCost = calculatedShipping(shippingSpeed);
      const grandTotal = calculatedGrandTotal(shippingSpeed);

      // Estimate commission
      const commissionAmount = Math.round(cartSubtotal * (settings.defaultCommissionRate / 100));

      const trackingSteps = [
        {
          status: "placed" as const,
          titleAr: "تم استلام الطلب وتأكيده",
          titleEn: "Order Placed & Confirmed",
          timestamp: now,
          completed: true,
          current: false,
        },
        {
          status: "confirmed" as const,
          titleAr: "جاري تجهيز وتغليف المنتجات في المتجر",
          titleEn: "Processing & Packaging at Merchant Hub",
          timestamp: "قريباً",
          completed: true,
          current: true,
        },
        {
          status: "in_transit" as const,
          titleAr: "في الطريق للشحن الدولي / المحلي",
          titleEn: "Dispatched & In Transit",
          timestamp: "متوقع خلال 24-48 ساعة",
          completed: false,
        },
        {
          status: "delivered" as const,
          titleAr: "تم التسليم للعميل بنجاح",
          titleEn: "Delivered to Doorstep",
          timestamp: "متوقع خلال 3-5 أيام",
          completed: false,
        },
      ];

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        trackingNumber,
        buyer_id: "buyer-current",
        store_id: cartItems[0]?.storeId || "multi-store",
        store_name: cartItems[0]?.storeName || "NOORMEXA Verified Sellers",
        subtotal: cartSubtotal,
        discount_amount: calculatedDiscount,
        shipping_cost: shippingCost,
        vat_amount: calculatedVat,
        total_amount: grandTotal,
        commission_amount: commissionAmount,
        status: paymentMethod === "cod" ? "pending" : "paid",
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cod" ? "pending" : "paid",
        shipping_speed: shippingSpeed,
        shipping_info: shipping,
        carrier: "NOORMEXA Global Express Logistics",
        items: cartItems.map((item) => ({
          id: `item-${Math.random().toString(36).slice(2, 7)}`,
          product_id: item.productId,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          selected_variants_label: item.selectedVariantsLabel,
          image_url: item.imageUrl,
        })),
        tracking_steps: trackingSteps,
        created_at: now,
      };

      setOrdersState((prev) => [newOrder, ...prev]);
      clearCart();
      return { order: newOrder, error: null };
    },
    [cartItems, cartSubtotal, calculatedDiscount, calculatedShipping, calculatedVat, calculatedGrandTotal, settings, clearCart]
  );

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"], trackingNumber?: string) => {
    setOrdersState((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status,
          trackingNumber: trackingNumber || o.trackingNumber,
        };
      })
    );
  }, []);

  const getOrderById = useCallback(
    (orderId: string) => orders.find((o) => o.id === orderId || o.orderNumber === orderId),
    [orders]
  );

  const getOrderByTracking = useCallback(
    (trackingNum: string) => orders.find((o) => o.trackingNumber.toLowerCase() === trackingNum.toLowerCase().trim()),
    [orders]
  );

  // --- Logistics & Carriers Engine ---
  const registerCarrier = useCallback((data: Omit<ShippingCarrier, "id">) => {
    const newCarrier: ShippingCarrier = {
      ...data,
      id: `carrier-${Math.random().toString(36).slice(2, 8)}`,
    };
    setCarriersState((prev) => [newCarrier, ...prev]);
    return newCarrier;
  }, []);

  const updateCarrier = useCallback((id: string, updates: Partial<ShippingCarrier>) => {
    setCarriersState((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const toggleCarrierStatus = useCallback((id: string, status: CarrierStatus) => {
    setCarriersState((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }, []);

  const createShipment = useCallback(
    (data: Omit<Shipment, "id" | "awbNumber" | "created_at" | "checkpoints">) => {
      const now = new Date().toISOString();
      const carrier = carriers.find((c) => c.id === data.carrierId) || carriers[0];
      const awbNumber = `AWB-${carrier.code || "NRX"}-${Math.floor(100000 + Math.random() * 900000)}`;
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      const initialCheckpoint: TrackingCheckpoint = {
        id: `cp-${Math.random().toString(36).slice(2, 7)}`,
        status: "label_created",
        titleAr: `تم إنشاء بوليصة الشحن (${awbNumber}) لدى ${carrier.nameAr}`,
        titleEn: `Waybill created (${awbNumber}) via ${carrier.nameEn}`,
        locationAr: data.originCity,
        locationEn: data.originCity,
        timestamp: new Date().toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" }),
        detailsAr: "تم حجز الشحنة وجاري التجهيز للتسليم لمندوب شركة الشحن.",
        detailsEn: "Shipment registered and ready for carrier pickup.",
        passed: true,
        current: true,
      };

      const newShipment: Shipment = {
        ...data,
        id: `shp-${Math.random().toString(36).slice(2, 8)}`,
        awbNumber,
        deliveryOtp: otp,
        carrierName: carrier.nameAr,
        carrierLogo: carrier.logoUrl,
        checkpoints: [initialCheckpoint],
        created_at: now,
      };

      setShipmentsState((prev) => [newShipment, ...prev]);

      // Also update linked order if found
      if (data.orderId) {
        updateOrderStatus(data.orderId, "processing", awbNumber);
      }

      return newShipment;
    },
    [carriers, updateOrderStatus]
  );

  const updateShipmentStatus = useCallback(
    (id: string, status: ShipmentStatus, note?: string, location?: string) => {
      setShipmentsState((prev) =>
        prev.map((shp) => {
          if (shp.id !== id) return shp;

          const loc = location || shp.recipientCity;
          const statusTitles: Record<ShipmentStatus, { ar: string; en: string }> = {
            ready_to_ship: { ar: "جاهزة للشحن والتسليم للمندوب", en: "Ready for Carrier Pickup" },
            picked_up: { ar: "تم استلام الشحنة من المستودع", en: "Picked Up by Courier" },
            in_transit: { ar: "الشحنة في طريقها بين المحطات اللوجستية", en: "In Transit between Hubs" },
            out_for_delivery: { ar: "الشحنة مع مندوب التوصيل للتسليم النهائي", en: "Out for Final Doorstep Delivery" },
            delivered: { ar: "تم تسليم الشحنة للعميل بنجاح", en: "Successfully Delivered to Customer" },
            exception: { ar: "تأخير استثنائي / محاولة تسليم مؤجلة", en: "Delivery Exception / Rescheduled" },
            returned: { ar: "تم إرجاع الشحنة للمستودع", en: "Returned to Origin Warehouse" },
          };

          const newCp: TrackingCheckpoint = {
            id: `cp-${Math.random().toString(36).slice(2, 7)}`,
            status: status === "delivered" ? "delivered" : status === "out_for_delivery" ? "out_for_delivery" : "in_transit",
            titleAr: statusTitles[status]?.ar || status,
            titleEn: statusTitles[status]?.en || status,
            locationAr: loc,
            locationEn: loc,
            timestamp: new Date().toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" }),
            detailsAr: note || `تم تحديث مسار الشحنة (${shp.awbNumber}) في ${loc}.`,
            detailsEn: note || `Status updated for shipment (${shp.awbNumber}) at ${loc}.`,
            passed: true,
            current: true,
          };

          const updatedCheckpoints: TrackingCheckpoint[] = shp.checkpoints.map((cp) => ({ ...cp, current: false }));
          updatedCheckpoints.push(newCp);

          return {
            ...shp,
            status,
            deliveredAt: status === "delivered" ? new Date().toISOString() : shp.deliveredAt,
            dispatchedAt: status === "in_transit" || status === "picked_up" ? shp.dispatchedAt || new Date().toISOString() : shp.dispatchedAt,
            checkpoints: updatedCheckpoints,
          };
        })
      );
    },
    []
  );

  const addShipmentCheckpoint = useCallback(
    (shipmentId: string, checkpoint: Omit<TrackingCheckpoint, "id" | "passed">) => {
      setShipmentsState((prev) =>
        prev.map((shp) => {
          if (shp.id !== shipmentId) return shp;
          const newCp: TrackingCheckpoint = {
            ...checkpoint,
            id: `cp-${Math.random().toString(36).slice(2, 7)}`,
            passed: true,
            current: true,
          };
          const updatedCheckpoints: TrackingCheckpoint[] = shp.checkpoints.map((c) => ({ ...c, current: false }));
          updatedCheckpoints.push(newCp);
          return {
            ...shp,
            checkpoints: updatedCheckpoints,
          };
        })
      );
    },
    []
  );

  const assignShipmentDriver = useCallback(
    (shipmentId: string, driver: { name: string; phone: string; vehicle?: string; avatar?: string }) => {
      setShipmentsState((prev) =>
        prev.map((shp) => {
          if (shp.id !== shipmentId) return shp;
          return {
            ...shp,
            driverName: driver.name,
            driverPhone: driver.phone,
            driverVehicle: driver.vehicle || shp.driverVehicle,
            driverAvatar: driver.avatar || shp.driverAvatar,
          };
        })
      );
    },
    []
  );

  const dispatchBulkShipments = useCallback(
    (shipmentIds: string[], carrierId: string) => {
      const carrier = carriers.find((c) => c.id === carrierId) || carriers[0];
      const awbList: string[] = [];

      setShipmentsState((prev) =>
        prev.map((shp) => {
          if (!shipmentIds.includes(shp.id)) return shp;
          const awb = shp.awbNumber || `AWB-${carrier.code}-${Math.floor(100000 + Math.random() * 900000)}`;
          awbList.push(awb);

          const dispatchCp: TrackingCheckpoint = {
            id: `cp-${Math.random().toString(36).slice(2, 7)}`,
            status: "picked_up",
            titleAr: `تم التسليم لشركة الشحن ${carrier.nameAr}`,
            titleEn: `Dispatched to Carrier ${carrier.nameEn}`,
            locationAr: shp.originCity,
            locationEn: shp.originCity,
            timestamp: new Date().toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" }),
            detailsAr: `تم إدراج الشحنة في كشف الإرسال المجمع (Manifest) وجاري النقل.`,
            detailsEn: `Included in carrier bulk dispatch manifest.`,
            passed: true,
            current: true,
          };

          return {
            ...shp,
            status: "picked_up" as ShipmentStatus,
            carrierId: carrier.id,
            carrierName: carrier.nameAr,
            carrierLogo: carrier.logoUrl,
            dispatchedAt: new Date().toISOString(),
            checkpoints: [...shp.checkpoints.map((c) => ({ ...c, current: false })), dispatchCp],
          };
        })
      );

      return { count: shipmentIds.length, awbList };
    },
    [carriers]
  );

  const calculateShippingQuotes = useCallback(
    (originCountry: string, destCountry: string, weightKg = 1, speed: "standard" | "priority" | "same_day" = "standard") => {
      return getShippingQuotes(originCountry, destCountry, weightKg, speed);
    },
    []
  );

  const getShipmentByAwb = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return undefined;
      return shipments.find(
        (s) =>
          s.awbNumber.toLowerCase() === q ||
          s.orderNumber.toLowerCase() === q ||
          s.orderId.toLowerCase() === q ||
          s.recipientPhone.replace(/\s+/g, "").includes(q.replace(/\s+/g, ""))
      );
    },
    [shipments]
  );

  return (
    <MarketplaceContext.Provider
      value={{
        currency,
        setCurrency,
        currencies: currenciesState,
        updateExchangeRate,
        formatPrice,
        convertPrice,
        settings,
        updateSettings,
        toggleGateway,
        categories,
        stores,
        products,
        currentStoreId,
        setCurrentStoreId,
        createOfficialStore,
        addProduct,
        updateProductItem,
        deleteProductItem,
        registerStore,
        updateStoreProfile,
        updateStoreStatusItem,
        deleteStoreItem,
        bulkUpdateStoresStatus,
        bulkDeleteStores,
        toggleStoreVerified,
        updateStoreCommissionRate,
        marketingPosts,
        addMarketingPost,
        updateMarketingPost,
        deleteMarketingPost,
        likeMarketingPost,
        payouts,
        requestStorePayout,
        updatePayoutStatus,
        wishlist,
        toggleWishlist,
        isInWishlist,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        calculatedDiscount,
        calculatedShipping,
        calculatedVat,
        calculatedGrandTotal,
        freeShippingProgress,
        orders,
        createOrder,
        updateOrderStatus,
        getOrderById,
        getOrderByTracking,
        carriers,
        shipments,
        registerCarrier,
        updateCarrier,
        toggleCarrierStatus,
        createShipment,
        updateShipmentStatus,
        addShipmentCheckpoint,
        assignShipmentDriver,
        dispatchBulkShipments,
        calculateShippingQuotes,
        getShipmentByAwb,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within MarketplaceProvider");
  }
  return context;
}
