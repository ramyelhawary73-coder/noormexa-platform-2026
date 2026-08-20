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
  Product,
  PlatformSettings,
  CartItem,
  Order,
  PromoCode,
  PaymentGatewayKey,
  ShippingAddress,
  SelectedVariant,
} from "@/types/marketplace";

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
    created_at: "2026-02-12T14:30:00Z",
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
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80",
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
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
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
    image_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80",
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

  // Catalog
  categories: Category[];
  stores: Store[];
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "created_at">) => Product;
  updateProductItem: (id: string, updates: Partial<Product>) => void;
  deleteProductItem: (id: string) => void;
  updateStoreStatusItem: (storeId: string, status: Store["status"]) => void;
  toggleStoreVerified: (storeId: string) => void;
  updateStoreCommissionRate: (storeId: string, rate: number) => void;

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
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENCY: "noormexa_active_currency",
  SETTINGS: "noormexa_platform_settings",
  WISHLIST: "noormexa_wishlist",
  CART: "noormexa_smart_cart",
  PROMO: "noormexa_applied_promo",
  PRODUCTS: "noormexa_products_v2",
  STORES: "noormexa_stores_v2",
  ORDERS: "noormexa_orders_v2",
  CURRENCIES: "noormexa_currencies_v2",
};

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("EGP");
  const [currenciesState, setCurrenciesState] = useState<Record<CurrencyCode, CurrencyInfo>>(CURRENCIES);
  const [settings, setSettingsState] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [stores, setStoresState] = useState<Store[]>(INITIAL_STORES);
  const [products, setProductsState] = useState<Product[]>(INITIAL_PRODUCTS);
  const [wishlist, setWishlistState] = useState<string[]>([]);
  const [cartItems, setCartItemsState] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [orders, setOrdersState] = useState<Order[]>([]);
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

        const savedOrders = window.localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (savedOrders) setOrdersState(JSON.parse(savedOrders));
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
      window.localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      if (appliedPromo) {
        window.localStorage.setItem(STORAGE_KEYS.PROMO, JSON.stringify(appliedPromo));
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.PROMO);
      }
    } catch (err) {
      console.error("Failed to persist marketplace state:", err);
    }
  }, [hydrated, currency, currenciesState, settings, wishlist, cartItems, products, stores, orders, appliedPromo]);

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

  const updateStoreStatusItem = useCallback((storeId: string, status: Store["status"]) => {
    setStoresState((prev) => prev.map((s) => (s.id === storeId ? { ...s, status } : s)));
  }, []);

  const toggleStoreVerified = useCallback((storeId: string) => {
    setStoresState((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, is_verified: !s.is_verified } : s))
    );
  }, []);

  const updateStoreCommissionRate = useCallback((storeId: string, rate: number) => {
    setStoresState((prev) => prev.map((s) => (s.id === storeId ? { ...s, commission_rate: rate } : s)));
  }, []);

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
        addProduct,
        updateProductItem,
        deleteProductItem,
        updateStoreStatusItem,
        toggleStoreVerified,
        updateStoreCommissionRate,
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
