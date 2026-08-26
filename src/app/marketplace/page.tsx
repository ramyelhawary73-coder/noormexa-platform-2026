"use client";

import { useState, useMemo, useEffect, useSyncExternalStore, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  Check,
  Copy,
  Crown,
  Filter,
  Flame,
  Gift,
  Heart,
  Package,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store as StoreIcon,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import type { Product } from "@/types/marketplace";
import { BrandLogo } from "@/components/marketplace/BrandLogo";

// Available Brands list (module-level constant)
export const AVAILABLE_BRANDS = [
  {
    id: "apple",
    name: "Apple",
    nameAr: "أبل",
    tag: "Tech & Mobile",
    category: "tech",
    flag: "🇺🇸",
    originAr: "أمريكا",
    color: "from-slate-800 to-slate-950",
    glowBorder: "hover:border-slate-400/60 dark:hover:border-slate-300/40",
    activeGlow: "ring-slate-500/50 border-slate-500 bg-slate-900/10 dark:bg-slate-800/40",
    badgeBg: "bg-slate-900/10 text-slate-800 dark:bg-white/10 dark:text-white",
  },
  {
    id: "nike",
    name: "Nike",
    nameAr: "نايكي",
    tag: "Sport & Lifestyle",
    category: "sports",
    flag: "🇺🇸",
    originAr: "أمريكا",
    color: "from-amber-700 to-slate-900",
    glowBorder: "hover:border-orange-500/60",
    activeGlow: "ring-orange-500/50 border-orange-500 bg-orange-500/10 dark:bg-orange-950/40",
    badgeBg: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  },
  {
    id: "rolex",
    name: "Rolex",
    nameAr: "رولكس",
    tag: "Haute Horlogerie",
    category: "watches",
    flag: "🇨🇭",
    originAr: "سويسرا",
    color: "from-emerald-900 to-slate-950",
    glowBorder: "hover:border-amber-500/60",
    activeGlow: "ring-amber-500/50 border-amber-500 bg-amber-500/10 dark:bg-amber-950/40",
    badgeBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    id: "dior",
    name: "Dior",
    nameAr: "ديور",
    tag: "Paris Haute Couture",
    category: "luxury",
    flag: "🇫🇷",
    originAr: "فرنسا",
    color: "from-slate-900 to-zinc-950",
    glowBorder: "hover:border-amber-400/60",
    activeGlow: "ring-amber-400/50 border-amber-400 bg-amber-400/10 dark:bg-stone-900/60",
    badgeBg: "bg-amber-400/15 text-amber-700 dark:text-amber-300",
  },
  {
    id: "samsung",
    name: "Samsung",
    nameAr: "سامسونج",
    tag: "Galaxy AI Devices",
    category: "tech",
    flag: "🇰🇷",
    originAr: "كوريا",
    color: "from-blue-900 to-slate-950",
    glowBorder: "hover:border-blue-500/60",
    activeGlow: "ring-blue-500/50 border-blue-500 bg-blue-500/10 dark:bg-blue-950/40",
    badgeBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  {
    id: "sony",
    name: "Sony",
    nameAr: "سوني",
    tag: "Audio & PlayStation",
    category: "tech",
    flag: "🇯🇵",
    originAr: "اليابان",
    color: "from-slate-900 to-neutral-950",
    glowBorder: "hover:border-indigo-400/60",
    activeGlow: "ring-indigo-500/50 border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/40",
    badgeBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "chanel",
    name: "Chanel",
    nameAr: "شانيل",
    tag: "Paris Luxury",
    category: "luxury",
    flag: "🇫🇷",
    originAr: "فرنسا",
    color: "from-zinc-900 to-black",
    glowBorder: "hover:border-neutral-400/60",
    activeGlow: "ring-neutral-400/50 border-neutral-400 bg-neutral-500/10 dark:bg-neutral-900/60",
    badgeBg: "bg-neutral-500/15 text-neutral-700 dark:text-neutral-300",
  },
  {
    id: "adidas",
    name: "Adidas",
    nameAr: "أديداس",
    tag: "Originals & Sports",
    category: "sports",
    flag: "🇩🇪",
    originAr: "ألمانيا",
    color: "from-blue-950 to-slate-900",
    glowBorder: "hover:border-sky-500/60",
    activeGlow: "ring-sky-500/50 border-sky-500 bg-sky-500/10 dark:bg-sky-950/40",
    badgeBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    id: "gucci",
    name: "Gucci",
    nameAr: "غوتشي",
    tag: "Firenze Luxury",
    category: "luxury",
    flag: "🇮🇹",
    originAr: "إيطاليا",
    color: "from-stone-900 to-neutral-950",
    glowBorder: "hover:border-amber-600/60",
    activeGlow: "ring-amber-600/50 border-amber-600 bg-amber-600/10 dark:bg-stone-900/60",
    badgeBg: "bg-amber-600/15 text-amber-700 dark:text-amber-400",
  },
  {
    id: "louis-vuitton",
    name: "Louis Vuitton",
    nameAr: "لويس فيتون",
    tag: "Maison Paris 1854",
    category: "luxury",
    flag: "🇫🇷",
    originAr: "فرنسا",
    color: "from-amber-950 to-slate-950",
    glowBorder: "hover:border-amber-700/60",
    activeGlow: "ring-amber-700/50 border-amber-700 bg-amber-700/10 dark:bg-amber-950/40",
    badgeBg: "bg-amber-700/15 text-amber-800 dark:text-amber-300",
  },
  {
    id: "dyson",
    name: "Dyson",
    nameAr: "دايسون",
    tag: "Smart Hair & Care",
    category: "tech",
    flag: "🇬🇧",
    originAr: "بريطانيا",
    color: "from-purple-950 to-slate-950",
    glowBorder: "hover:border-fuchsia-500/60",
    activeGlow: "ring-fuchsia-500/50 border-fuchsia-500 bg-fuchsia-500/10 dark:bg-fuchsia-950/40",
    badgeBg: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  },
  {
    id: "zara",
    name: "ZARA",
    nameAr: "زارا",
    tag: "European Fashion",
    category: "luxury",
    flag: "🇪🇸",
    originAr: "إسبانيا",
    color: "from-neutral-900 to-stone-950",
    glowBorder: "hover:border-slate-400/60",
    activeGlow: "ring-slate-400/50 border-slate-400 bg-slate-500/10 dark:bg-slate-900/60",
    badgeBg: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  },
];

// Specific sub-sections for every brand (module-level constant)
export const BRAND_SECTIONS: Record<string, { id: string; nameAr: string; nameEn: string; keywords: string[] }[]> = {
  apple: [
    { id: "iphone", nameAr: "هواتف iPhone", nameEn: "iPhones", keywords: ["iphone", "ايفون", "آيفون"] },
    { id: "watch", nameAr: "ساعات Apple Watch", nameEn: "Apple Watch", keywords: ["watch", "ساعة", "الترا"] },
    { id: "airpods", nameAr: "سماعات AirPods", nameEn: "AirPods", keywords: ["airpod", "سماعة", "برو"] },
  ],
  nike: [
    { id: "jordan", nameAr: "أحذية Jordan", nameEn: "Air Jordan", keywords: ["jordan", "جوردان"] },
    { id: "dunk", nameAr: "أحذية Dunk Low", nameEn: "Dunk Low", keywords: ["dunk", "دانك"] },
    { id: "running", nameAr: "أحذية Pegasus للجري", nameEn: "Pegasus Running", keywords: ["pegasus", "running", "جري", "حذاء"] },
  ],
  rolex: [
    { id: "submariner", nameAr: "صبمارينر Submariner", nameEn: "Submariner", keywords: ["submariner", "صبمارينر"] },
    { id: "daytona", nameAr: "دايتونا Daytona", nameEn: "Daytona", keywords: ["daytona", "دايتونا"] },
  ],
  dior: [
    { id: "sauvage", nameAr: "عطور Sauvage Elixir", nameEn: "Sauvage Fragrance", keywords: ["sauvage", "سواج", "عطر", "elixir"] },
    { id: "saddle", nameAr: "حقائب Saddle Bag", nameEn: "Saddle Bags", keywords: ["saddle", "حقيبة"] },
  ],
  samsung: [
    { id: "s24", nameAr: "جالكسي S24 Ultra", nameEn: "Galaxy S24 Ultra", keywords: ["s24", "ultra", "الترا", "galaxy s24"] },
    { id: "fold", nameAr: "جالكسي Z Fold 6", nameEn: "Galaxy Z Fold 6", keywords: ["fold", "فولد", "طي"] },
  ],
  sony: [
    { id: "audio", nameAr: "سماعات WH-1000XM5", nameEn: "WH-1000XM5 ANC", keywords: ["wh1000xm5", "wh-1000xm5", "1000xm5", "سماعة", "عزل"] },
    { id: "ps5", nameAr: "بلايستيشن PlayStation 5 Pro", nameEn: "PS5 Pro Edition", keywords: ["ps5", "playstation", "بلايستيشن", "ألعاب"] },
  ],
  chanel: [
    { id: "bleu", nameAr: "عطور Bleu de Chanel", nameEn: "Bleu de Chanel", keywords: ["bleu", "عطر", "parfum"] },
    { id: "flap", nameAr: "حقائب Classic Flap", nameEn: "Classic Flap Bags", keywords: ["flap", "حقيبة", "classic"] },
  ],
  adidas: [
    { id: "samba", nameAr: "أحذية Samba OG", nameEn: "Samba OG", keywords: ["samba", "سامبا"] },
    { id: "ultraboost", nameAr: "أحذية Ultraboost Light", nameEn: "Ultraboost Light", keywords: ["ultraboost", "الترا بوست", "boost"] },
  ],
  gucci: [
    { id: "marmont-bag", nameAr: "حقائب GG Marmont", nameEn: "GG Marmont Shoulder Bags", keywords: ["marmont", "حقيبة", "matelassé"] },
    { id: "belt", nameAr: "أحزمة جلد GG Marmont", nameEn: "GG Leather Belts", keywords: ["belt", "حزام"] },
  ],
  "louis-vuitton": [
    { id: "neverfull", nameAr: "حقائب Neverfull MM", nameEn: "Neverfull MM Bags", keywords: ["neverfull", "توت", "كانفاس"] },
    { id: "keepall", nameAr: "حقائب سفر Keepall 50", nameEn: "Keepall 50 Duffle", keywords: ["keepall", "سفر", "دفل"] },
  ],
  dyson: [
    { id: "airwrap", nameAr: "مصفف Airwrap Complete", nameEn: "Airwrap Styler", keywords: ["airwrap", "مصفف", "coanda"] },
    { id: "supersonic", nameAr: "مجفف Supersonic Nural", nameEn: "Supersonic Nural", keywords: ["supersonic", "مجفف", "شعر"] },
  ],
  zara: [
    { id: "blazer", nameAr: "بليزرات صوف مهيكلة", nameEn: "Wool Blazers", keywords: ["blazer", "بليزر", "صوف"] },
    { id: "dress", nameAr: "فساتين حرير Studio", nameEn: "Silk Studio Dresses", keywords: ["dress", "فستان", "حرير"] },
  ],
};

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    title: "السوق العالمي المفتوح",
    subtitle: "تصفح آلاف المنتجات الفاخرة والأصلية من متاجر موثوقة حول العالم",
    searchPlaceholder: "ابحث بالاسم، الماركة، أو المواصفات...",
    filterTitle: "تصفية المنتجات",
    allCategories: "جميع الأقسام",
    priceRange: "نطاق السعر",
    minRating: "التقييم الأدنى",
    allRatings: "الكل",
    starsAndUp: "نجوم فأكثر",
    availability: "التوفر والشحن",
    inStockOnly: "المتوفر في المخزون فقط",
    freeShippingOnly: "شحن مجاني فقط",
    verifiedStoresOnly: "متاجر موثقة ومعتمدة",
    sortBy: "الترتيب حسب",
    sortFeatured: "المميزة والموصى بها",
    sortPriceAsc: "السعر: من الأقل للأعلى",
    sortPriceDesc: "السعر: من الأعلى للأقل",
    sortRating: "الأعلى تقييماً",
    sortNewest: "الأحدث وصولاً",
    resetFilters: "إعادة ضبط الفلاتر",
    showingResults: "عرض",
    from: "من أصل",
    productsCount: "منتج",
    quickAdd: "أضف للسلة",
    addedToCart: "تمت الإضافة!",
    outOfStock: "نفد المخزون",
    freeShippingBadge: "شحن مجاني",
    verifiedMerchant: "متجر موثق",
    noProducts: "لم نتمكن من العثور على منتجات مطابقة لمعايير البحث.",
    wishlistActive: "عرض قائمة الرغبات والمفضلة فقط",
    viewProduct: "تفاصيل المنتج",
    saveDiscount: "خصم",
  },
  en: {
    title: "Global Open Marketplace",
    subtitle: "Discover authentic luxury products from verified merchants worldwide",
    searchPlaceholder: "Search by title, brand, or specifications...",
    filterTitle: "Filter Products",
    allCategories: "All Categories",
    priceRange: "Price Range",
    minRating: "Minimum Rating",
    allRatings: "All",
    starsAndUp: "Stars & Up",
    availability: "Availability & Logistics",
    inStockOnly: "In-Stock Only",
    freeShippingOnly: "Free Shipping Only",
    verifiedStoresOnly: "Verified Stores Only",
    sortBy: "Sort By",
    sortFeatured: "Featured & Recommended",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortRating: "Top Rated",
    sortNewest: "Newest Arrivals",
    resetFilters: "Reset Filters",
    showingResults: "Showing",
    from: "of",
    productsCount: "products",
    quickAdd: "Add to Cart",
    addedToCart: "Added!",
    outOfStock: "Out of Stock",
    freeShippingBadge: "Free Shipping",
    verifiedMerchant: "Verified Store",
    noProducts: "No products match your current search and filter criteria.",
    wishlistActive: "Showing Wishlist items only",
    viewProduct: "View Details",
    saveDiscount: "OFF",
  },
} as const;

function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") return "ar";
  return window.localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar";
}

function subscribeToLanguage(callback: () => void) {
  window.addEventListener("noormexa-language-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("noormexa-language-change", callback);
    window.removeEventListener("storage", callback);
  };
}

function useNoormexaLanguage() {
  return useSyncExternalStore<Language>(subscribeToLanguage, getLanguageSnapshot, () => "ar");
}

function MarketplaceContent() {
  const language = useNoormexaLanguage();
  const text = copy[language];
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialBrand = searchParams.get("brand") || "all";
  const initialWishlistOnly = searchParams.get("wishlist") === "true";
  const initialDealsOnly = searchParams.get("filter") === "deals";
  const initialOfficialOnly = searchParams.get("official") === "true";
  const initialCouponsModal = searchParams.get("view") === "coupons";
  const initialB2bModal = searchParams.get("view") === "b2b";
  const initialBrandsDirectory = searchParams.get("view") === "brands" || initialBrand !== "all";

  const {
    products,
    categories,
    stores,
    formatPrice,
    addToCart,
    wishlist,
    toggleWishlist,
    isInWishlist,
  } = useMarketplace();

  // Local Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [selectedBrandSection, setSelectedBrandSection] = useState<string>("all");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(500000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [freeShippingOnly, setFreeShippingOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [wishlistOnly, setWishlistOnly] = useState<boolean>(initialWishlistOnly);
  const [dealsOnly, setDealsOnly] = useState<boolean>(initialDealsOnly);
  const [officialOnly, setOfficialOnly] = useState<boolean>(initialOfficialOnly);
  const [showBrandsDirectory, setShowBrandsDirectory] = useState<boolean>(initialBrandsDirectory);
  const [couponsModalOpen, setCouponsModalOpen] = useState<boolean>(initialCouponsModal);
  const [b2bModalOpen, setB2bModalOpen] = useState<boolean>(initialB2bModal);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [b2bSuccess, setB2bSuccess] = useState<boolean>(false);
  const [b2bForm, setB2bForm] = useState({
    companyName: "",
    category: "all",
    quantity: "50",
    phone: "",
    notes: "",
  });
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating" | "newest">("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedBrandSection("all");
    setSelectedStore("all");
    setMaxPrice(500000);
    setMinRating(0);
    setInStockOnly(false);
    setFreeShippingOnly(false);
    setVerifiedOnly(false);
    setWishlistOnly(false);
    setDealsOnly(false);
    setOfficialOnly(false);
    setShowBrandsDirectory(false);
    setSortBy("featured");
  };

  // Sync navigation actions, hash links dynamically
  useEffect(() => {
    const handleUrlTarget = (urlTarget?: string) => {
      const currentUrl = urlTarget || (typeof window !== "undefined" ? window.location.href : "");
      
      const isBrands =
        currentUrl.includes("#brands") ||
        currentUrl.includes("#brand") ||
        currentUrl.includes("view=brands") ||
        currentUrl.includes("brand=");

      const isCoupons =
        !isBrands &&
        (currentUrl.includes("#coupons") ||
          currentUrl.includes("#coupon") ||
          currentUrl.includes("view=coupons"));

      const isB2b =
        !isBrands &&
        (currentUrl.includes("#b2b") ||
          currentUrl.includes("#wholesale") ||
          currentUrl.includes("view=b2b"));

      const isDeals =
        !isBrands &&
        (currentUrl.includes("filter=deals") ||
          currentUrl.includes("#deals") ||
          currentUrl.includes("#flash"));

      const isOfficial =
        !isBrands &&
        (currentUrl.includes("official=true") ||
          currentUrl.includes("#official"));

      if (isBrands) {
        setCouponsModalOpen(false);
        setB2bModalOpen(false);
        setShowBrandsDirectory(true);
        setDealsOnly(false);
        setTimeout(() => {
          const el = document.getElementById("brands-section") || document.getElementById("brands-quick-bar");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      } else if (isCoupons) {
        setCouponsModalOpen(true);
        setB2bModalOpen(false);
      } else if (isB2b) {
        setB2bModalOpen(true);
        setCouponsModalOpen(false);
      } else if (isDeals) {
        setCouponsModalOpen(false);
        setB2bModalOpen(false);
        setDealsOnly(true);
        setShowBrandsDirectory(false);
        setTimeout(() => {
          const el = document.getElementById("products-catalog-section");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      } else if (isOfficial) {
        setCouponsModalOpen(false);
        setB2bModalOpen(false);
        setOfficialOnly(true);
        setShowBrandsDirectory(false);
      } else if (
        currentUrl.endsWith("/marketplace") ||
        currentUrl.endsWith("/marketplace/") ||
        currentUrl.includes("/marketplace?") === false
      ) {
        // Reset specific views when opening pure marketplace
        setCouponsModalOpen(false);
        setB2bModalOpen(false);
        setShowBrandsDirectory(false);
        setDealsOnly(false);
        setOfficialOnly(false);
        setSelectedBrand("all");
      }
    };

    handleUrlTarget();

    const onHashChange = () => handleUrlTarget();
    const onNavAction = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      handleUrlTarget(customEvent.detail);
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("noormexa-nav-action", onNavAction);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("noormexa-nav-action", onNavAction);
    };
  }, []);

  // Copy coupon handler
  const handleCopyCoupon = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  // Submit B2B RFQ
  const handleB2bSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setB2bSuccess(true);
    setTimeout(() => {
      setB2bSuccess(false);
      setB2bModalOpen(false);
      setB2bForm({ companyName: "", category: "all", quantity: "50", phone: "", notes: "" });
    }, 2800);
  };

  // Active Promo Coupons List
  const activeCoupons = [
    {
      code: "NOOR20",
      discount: "20%",
      titleAr: "خصم 20% على جميع المنتجات الفاخرة",
      titleEn: "20% OFF on all luxury products",
      minSpend: "200 ر.س",
      badge: "الأكثر استخداماً",
      badgeEn: "Most Popular",
      color: "from-amber-500/20 to-orange-500/20 border-orange-500/40 text-orange-500",
    },
    {
      code: "WELCOME10",
      discount: "10%",
      titleAr: "خصم ترحيبي 10% للعملاء الجدد",
      titleEn: "10% Welcome discount for new members",
      minSpend: "لا يوجد حد أدنى",
      badge: "هدية تسجيل",
      badgeEn: "Welcome Gift",
      color: "from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-500",
    },
    {
      code: "VIP50",
      discount: "50 ر.س",
      titleAr: "قسيمة فورية 50 ر.س للطلبات المؤهلة",
      titleEn: "Instant 50 SAR/AED voucher on qualified orders",
      minSpend: "500 ر.س",
      badge: "عملاء VIP",
      badgeEn: "VIP Exclusive",
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-500",
    },
    {
      code: "FREESHIP",
      discount: "100%",
      titleAr: "شحن جوي ودولي مجاني بالكامل",
      titleEn: "100% Free Express Global & Local Shipping",
      minSpend: "150 ر.س",
      badge: "شحن مجاني",
      badgeEn: "Free Shipping",
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-500",
    },
    {
      code: "FLASH35",
      discount: "35%",
      titleAr: "كود إضافي 35% خاص بعروض الفلاش",
      titleEn: "Extra 35% OFF on Flash Deals items",
      minSpend: "300 ر.س",
      badge: "عرض محدود",
      badgeEn: "Flash Special",
      color: "from-red-500/20 to-rose-500/20 border-red-500/40 text-red-500",
    },
  ];

  const currentBrandInfo = AVAILABLE_BRANDS.find((b) => b.id === selectedBrand);

  // Dedicated brand selector with auto smooth scroll
  const handleSelectBrand = (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedBrandSection("all");
    setShowBrandsDirectory(true);
    if (selectedCategory !== "all") {
      setSelectedCategory("all");
    }
    if (dealsOnly) {
      setDealsOnly(false);
    }
    // Smooth scroll to catalog section so user sees filtered brand items immediately
    setTimeout(() => {
      const el = document.getElementById("products-catalog-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Brand filter
        if (selectedBrand !== "all") {
          const bId = selectedBrand.toLowerCase();
          const prodBrandId = (prod.brand_id || "").toLowerCase();
          const prodBrandName = (prod.brand_name || "").toLowerCase();
          const prodName = prod.name.toLowerCase();
          const prodNameEn = (prod.name_en || "").toLowerCase();

          const brandMatch =
            prodBrandId === bId ||
            (bId === "louis-vuitton" && (prodBrandId === "lv" || prodBrandName.includes("louis"))) ||
            (bId === "lv" && (prodBrandId === "louis-vuitton" || prodBrandName.includes("louis"))) ||
            prodBrandName.includes(bId) ||
            prodName.includes(bId) ||
            prodNameEn.includes(bId);

          if (!brandMatch) return false;

          // Brand Section sub-filter
          if (selectedBrandSection !== "all") {
            const sectionsForBrand = BRAND_SECTIONS[bId] || (bId === "lv" ? BRAND_SECTIONS["louis-vuitton"] : []);
            const targetSec = sectionsForBrand.find((s) => s.id === selectedBrandSection);
            const fullProdText = `${prod.name} ${prod.name_en || ""} ${prod.description || ""} ${prod.description_en || ""}`.toLowerCase();

            if (targetSec) {
              const matched = targetSec.keywords.some((kw) => fullProdText.includes(kw.toLowerCase()));
              if (!matched && !fullProdText.includes(selectedBrandSection.toLowerCase())) {
                return false;
              }
            } else {
              if (!fullProdText.includes(selectedBrandSection.toLowerCase())) {
                return false;
              }
            }
          }
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = prod.name.toLowerCase().includes(q) || (prod.name_en && prod.name_en.toLowerCase().includes(q));
          const matchDesc = prod.description?.toLowerCase().includes(q) || prod.description_en?.toLowerCase().includes(q);
          const matchStore = prod.store_name?.toLowerCase().includes(q);
          const matchBrand = prod.brand_name?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchStore && !matchBrand) return false;
        }

        // Category filter
        if (selectedCategory !== "all") {
          const cat = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
          if (cat && prod.category_id !== cat.id && prod.category_slug !== cat.slug) return false;
        }

        // Store filter
        if (selectedStore !== "all" && prod.store_id !== selectedStore) {
          return false;
        }

        // Price filter (in base EGP)
        if (prod.price > maxPrice) return false;

        // Rating filter
        if (minRating > 0 && (prod.rating || 0) < minRating) return false;

        // Stock filter
        if (inStockOnly && prod.stock <= 0) return false;

        // Free shipping filter
        if (freeShippingOnly && !prod.free_shipping) return false;

        // Verified store filter
        if (verifiedOnly) {
          const store = stores.find((s) => s.id === prod.store_id);
          if (!store?.is_verified) return false;
        }

        // Flash Deals 50% filter
        if (dealsOnly) {
          const hasDiscount = prod.original_price && prod.original_price > prod.price;
          const isDeal = prod.is_featured || hasDiscount;
          if (!isDeal) return false;
        }

        // Official Flagship filter
        if (officialOnly) {
          const store = stores.find((s) => s.id === prod.store_id);
          const isOfficial =
            prod.store_id === "store-noormexa-official" ||
            store?.is_official ||
            store?.is_verified ||
            prod.is_featured;
          if (!isOfficial) return false;
        }

        // Wishlist filter
        if (wishlistOnly && !wishlist.includes(prod.id)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        // Featured default
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [
    products,
    selectedBrand,
    selectedBrandSection,
    searchQuery,
    selectedCategory,
    selectedStore,
    maxPrice,
    minRating,
    inStockOnly,
    freeShippingOnly,
    verifiedOnly,
    dealsOnly,
    officialOnly,
    wishlistOnly,
    sortBy,
    categories,
    stores,
    wishlist,
  ]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedItemMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  return (
    <main className="noormexa-main py-8 md:py-12">
      <div className="noormexa-container">
        {/* Marketplace Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-line pb-4 sm:pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-soft text-gold-strong text-xs font-bold mb-1.5">
              <Sparkles size={13} />
              <span>NOORMEXA Global Exchange</span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              {text.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5 max-w-2xl hidden sm:block">
              {text.subtitle}
            </p>
          </div>

          {/* Quick Action Bar for Filters & Wishlist */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all touch-manipulation active:scale-95 cursor-pointer min-h-[40px] ${
                wishlistOnly
                  ? "bg-red-500 text-white border-red-500 shadow-sm font-extrabold"
                  : "bg-surface text-foreground border-line hover:border-red-400"
              }`}
              onClick={() => setWishlistOnly(!wishlistOnly)}
            >
              <Heart size={16} className={wishlistOnly ? "fill-white" : "text-red-500"} />
              <span>
                {language === "ar" ? "المفضلة" : "Wishlist"} ({wishlist.length})
              </span>
            </button>

            <button
              type="button"
              className="flex-1 sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-orange-500 text-white border border-orange-600 shadow-sm touch-manipulation active:scale-95 cursor-pointer min-h-[40px]"
              onClick={() => setMobileFilterOpen(true)}
            >
              <Filter size={16} />
              <span>{text.filterTitle}</span>
              {(selectedBrand !== "all" || selectedCategory !== "all" || dealsOnly || officialOnly) && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar & Category Pills Bar */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={text.searchPlaceholder}
              className="w-full ps-11 pe-10 py-3 rounded-2xl bg-surface border border-line focus:outline-none focus:border-orange-500 shadow-sm text-sm sm:text-sm text-foreground touch-manipulation"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground touch-manipulation p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Quick Scroll Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar touch-manipulation overscroll-contain select-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer touch-manipulation active:scale-95 shrink-0 ${
                selectedCategory === "all"
                  ? "bg-orange-500 text-white border-orange-500 shadow-xs font-extrabold"
                  : "bg-surface text-muted border-line hover:border-orange-500/50 hover:text-foreground"
              }`}
            >
              {text.allCategories}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer touch-manipulation active:scale-95 shrink-0 ${
                  selectedCategory === cat.slug
                    ? "bg-orange-500 text-white border-orange-500 shadow-xs font-extrabold"
                    : "bg-surface text-muted border-line hover:border-orange-500/50 hover:text-foreground"
                }`}
              >
                {language === "ar" ? cat.name_ar : cat.name_en}
              </button>
            ))}
          </div>

          {/* Official Brands Quick Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar border-t border-line/60 pt-2.5 touch-manipulation overscroll-contain select-none">
            <span className="text-[11px] font-bold text-muted whitespace-nowrap shrink-0 flex items-center gap-1">
              <BadgeCheck size={13} className="text-emerald-500" />
              <span>{language === "ar" ? "الماركات:" : "Brands:"}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedBrand("all");
                setSelectedBrandSection("all");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer touch-manipulation active:scale-95 shrink-0 ${
                selectedBrand === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 shadow-2xs font-extrabold"
                  : "bg-surface text-muted border-line hover:border-slate-400"
              }`}
            >
              {language === "ar" ? "الكل" : "All"}
            </button>
            {AVAILABLE_BRANDS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelectBrand(b.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer touch-manipulation active:scale-95 shrink-0 flex items-center gap-1.5 ${
                  selectedBrand === b.id
                    ? "bg-orange-500 text-white border-orange-500 shadow-xs font-extrabold ring-1 ring-orange-500/40"
                    : "bg-surface text-muted border-line hover:border-orange-500/40 hover:text-foreground"
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0 overflow-hidden">
                  <BrandLogo brandId={b.id} className="w-3.5 h-3.5" />
                </div>
                <span>{language === "ar" ? b.nameAr : b.name}</span>
              </button>
            ))}
          </div>

          {/* Quick Sub-Navigation Feature Badges Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5">
            <button
              type="button"
              id="deals"
              onClick={() => setDealsOnly(!dealsOnly)}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-start flex items-center gap-2 sm:gap-2.5 cursor-pointer touch-manipulation active:scale-95 ${
                dealsOnly
                  ? "bg-red-500/15 border-red-500/50 text-red-600 dark:text-red-400 shadow-xs"
                  : "bg-surface border-line hover:border-red-400/40"
              }`}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <Flame size={16} className="animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black truncate">{language === "ar" ? "عروض الفلاش 50%" : "Flash Deals 50%"}</div>
                <div className="text-[10px] text-muted truncate">{dealsOnly ? (language === "ar" ? "مفعل" : "Active") : (language === "ar" ? "خصومات حصرية" : "Discounts")}</div>
              </div>
            </button>

            <button
              type="button"
              id="official"
              onClick={() => setOfficialOnly(!officialOnly)}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-start flex items-center gap-2 sm:gap-2.5 cursor-pointer touch-manipulation active:scale-95 ${
                officialOnly
                  ? "bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "bg-surface border-line hover:border-amber-400/40"
              }`}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Crown size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black truncate">{language === "ar" ? "المتجر المعتمد" : "Flagship Store"}</div>
                <div className="text-[10px] text-muted truncate">{officialOnly ? (language === "ar" ? "مفعل" : "Active") : (language === "ar" ? "ضمان أصالة 100%" : "Guaranteed")}</div>
              </div>
            </button>

            <button
              type="button"
              id="coupons"
              onClick={() => setCouponsModalOpen(true)}
              className="p-2.5 sm:p-3 rounded-2xl border bg-surface border-line hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-start flex items-center gap-2 sm:gap-2.5 cursor-pointer touch-manipulation active:scale-95"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Tag size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black truncate text-emerald-600 dark:text-emerald-400">{language === "ar" ? "نادي الكوبونات" : "Coupons Club"}</div>
                <div className="text-[10px] text-muted truncate">{language === "ar" ? "5 قسائم نشطة" : "5 Active Vouchers"}</div>
              </div>
            </button>

            <button
              type="button"
              id="b2b"
              onClick={() => setB2bModalOpen(true)}
              className="p-2.5 sm:p-3 rounded-2xl border bg-surface border-line hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-start flex items-center gap-2 sm:gap-2.5 cursor-pointer touch-manipulation active:scale-95"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Building2 size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black truncate text-blue-600 dark:text-blue-400">{language === "ar" ? "تجارة الجملة B2B" : "B2B Wholesale"}</div>
                <div className="text-[10px] text-muted truncate">{language === "ar" ? "خصم حتى 35%" : "Up to 35% Off"}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Top Brands Directory Showcase (#brands-section) */}
        {(showBrandsDirectory || selectedBrand !== "all") && (
          <section id="brands-section" className="mb-8 p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs space-y-4 relative overflow-hidden">
            {/* Background subtle luxury aura */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20 shadow-xs">
                  <Sparkles size={16} className="text-orange-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-foreground flex items-center gap-2">
                    <span>{language === "ar" ? "دليل الماركات العالمية الفاخرة (Top Brands Hub)" : "Luxury Global Brands Hub"}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                      {language === "ar" ? "وكلاء معتمدون 100%" : "100% Authorized"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-muted">
                    {language === "ar"
                      ? "تسوق مباشرة من متاجر العلامات التجارية الأصلية مع الضمان الرسمي والأرقام التسلسلية الموثقة"
                      : "Direct shopping from official verified flagship houses with manufacturer warranties and serial verifications"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedBrand !== "all" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand("all");
                      setSelectedBrandSection("all");
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-orange-500 text-white shadow-xs hover:bg-orange-600 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{language === "ar" ? "عرض كل المنتجات" : "View All Products"}</span>
                    <X size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowBrandsDirectory(false)}
                  className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-surface-soft transition-colors cursor-pointer"
                  aria-label="Close Brand Hub"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
              {AVAILABLE_BRANDS.map((b) => {
                const isActive = selectedBrand === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBrand(b.id)}
                    className={`group p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border text-center transition-all duration-200 flex flex-col items-center justify-between gap-3 cursor-pointer relative overflow-hidden active:scale-96 select-none ${
                      isActive
                        ? `${b.activeGlow} shadow-lg ring-2`
                        : `bg-surface dark:bg-slate-900/60 border-line/90 ${b.glowBorder} hover:shadow-md hover:-translate-y-0.5`
                    }`}
                  >
                    {/* Top Row: Origin Flag & Verified Status */}
                    <div className="w-full flex items-center justify-between gap-1">
                      <span className="text-[10px] text-muted flex items-center gap-1 font-semibold bg-surface-soft dark:bg-slate-800/80 px-1.5 py-0.5 rounded-md border border-line/60">
                        <span>{b.flag}</span>
                        <span className="text-[9px]">{language === "ar" ? b.originAr : b.id.toUpperCase()}</span>
                      </span>

                      <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                        <BadgeCheck size={11} className="fill-emerald-500 text-white" />
                        <span className="hidden sm:inline">{language === "ar" ? "أصلي" : "Auth"}</span>
                      </span>
                    </div>

                    {/* 3D Embossed Emblem Podium */}
                    <div
                      className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center p-2.5 transition-all duration-200 group-hover:scale-108 relative overflow-hidden ${
                        isActive
                          ? "bg-surface dark:bg-slate-950 border-2 border-orange-500 shadow-md ring-2 ring-orange-500/30"
                          : "bg-surface dark:bg-slate-950/80 border border-line/80 shadow-xs group-hover:shadow-md group-hover:border-slate-400 dark:group-hover:border-slate-600"
                      }`}
                    >
                      {/* Specular rim lighting */}
                      <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
                      <BrandLogo brandId={b.id} className="w-10 h-10 sm:w-11 sm:h-11" />
                    </div>

                    {/* Brand Name & Tag */}
                    <div className="space-y-0.5 min-w-0 w-full">
                      <div className="text-xs sm:text-sm font-black truncate text-foreground group-hover:text-orange-500 transition-colors">
                        {b.name}
                      </div>
                      <div className="text-[10px] font-bold text-muted truncate">
                        {b.nameAr}
                      </div>
                    </div>

                    {/* Action Pill Badge */}
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-xl font-bold transition-all w-full truncate flex items-center justify-center gap-1 ${
                        isActive
                          ? "bg-orange-500 text-white shadow-xs font-black"
                          : "bg-surface-soft text-muted border border-line group-hover:bg-orange-500/10 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:border-orange-500/30"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <BadgeCheck size={12} />
                          <span>{language === "ar" ? "المتجر نشط" : "Active Store"}</span>
                        </>
                      ) : (
                        <span>{language === "ar" ? "تصفح المنتجات" : "Explore Store"}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Flash Deals Active Banner (#deals-section) */}
        {dealsOnly && (
          <div id="deals-section" className="mb-8 p-5 sm:p-6 rounded-3xl bg-linear-to-r from-red-600 via-rose-600 to-orange-600 text-white shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black backdrop-blur-md">
                  <Flame size={14} className="animate-bounce text-amber-300" />
                  <span>{language === "ar" ? "عروض الفلاش الحصرية نشطة الآن" : "Flash Deals 50% Active Now"}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">{language === "ar" ? "تخفيضات كبرى تصل إلى 50% لفترة محدودة" : "Mega Discounts Up To 50% OFF For A Limited Time"}</h2>
                <p className="text-xs text-white/90 max-w-xl">
                  {language === "ar"
                    ? "يتم الآن عرض جميع المنتجات التي تحتوي على خصومات كبرى ومميزات ترويجية خاصة مع إمكانية استخدام كود FLASH35 الإضافي."
                    : "Showing all items with high discounts and special promotions. You can combine coupon FLASH35 at checkout."}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setCouponsModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white text-red-600 font-extrabold text-xs shadow-md hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Tag size={13} />
                  <span>{language === "ar" ? "نسخ كوبون الفلاش" : "Copy Flash Coupon"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDealsOnly(false)}
                  className="px-4 py-2.5 rounded-xl bg-black/30 hover:bg-black/40 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                >
                  {language === "ar" ? "عرض كل المنتجات" : "View All"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flagship Store Active Banner */}
        {officialOnly && (
          <div id="official-section" className="mb-8 p-5 sm:p-6 rounded-3xl bg-linear-to-r from-amber-600 via-amber-700 to-slate-900 text-white shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black backdrop-blur-md">
                  <Crown size={14} className="text-amber-300" />
                  <span>{language === "ar" ? "تصفية المتاجر الرسمية المعتمدة" : "Official Flagship Stores Only"}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">{language === "ar" ? "منتجات معتمدة وموثقة 100% مع ضمان الوكالة" : "100% Certified Authentic with Official Warranty"}</h2>
                <p className="text-xs text-white/90 max-w-xl">
                  {language === "ar"
                    ? "تصفح حصري لمنتجات متاجر NOORMEXA Flagship والمتاجر العالمية المعتمدة مع فحص دقيق للجودة وشحن سريع ومؤمّن."
                    : "Exclusively browsing products from verified flagship stores with quality certification and insured express delivery."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOfficialOnly(false)}
                className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 transition-all cursor-pointer whitespace-nowrap"
              >
                {language === "ar" ? "إلغاء التصفية" : "Clear Filter"}
              </button>
            </div>
          </div>
        )}

        {/* Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block md:col-span-1 space-y-6">
            <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <SlidersHorizontal size={16} className="text-gold" />
                  <span>{text.filterTitle}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-muted hover:text-gold transition-colors font-medium cursor-pointer"
                >
                  {text.resetFilters}
                </button>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>{language === "ar" ? "الماركة العالمية" : "Global Brand"}</span>
                  {selectedBrand !== "all" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrand("all");
                        setSelectedBrandSection("all");
                      }}
                      className="text-[10px] text-orange-500 font-bold hover:underline cursor-pointer"
                    >
                      {language === "ar" ? "إلغاء التحديد" : "Clear"}
                    </button>
                  )}
                </span>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setSelectedBrandSection("all");
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-surface border border-line text-foreground focus:outline-none focus:border-orange-500"
                >
                  <option value="all">{language === "ar" ? "جميع الماركات" : "All Brands"}</option>
                  {AVAILABLE_BRANDS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {language === "ar" ? `${b.nameAr} (${b.name})` : b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Slider */}
              <div className="space-y-2 border-t border-line pt-4">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>{text.priceRange}</span>
                  <span className="text-orange-500 font-bold">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="500000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>{formatPrice(200)}</span>
                  <span>{formatPrice(500000)}</span>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2 border-t border-line pt-4">
                <span className="text-xs font-semibold text-foreground">{text.minRating}</span>
                <div className="space-y-1.5">
                  {[0, 4, 4.5, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMinRating(val)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${
                        minRating === val
                          ? "bg-gold-soft text-gold-strong font-bold"
                          : "hover:bg-surface-soft text-muted"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {val === 0 ? (
                          text.allRatings
                        ) : (
                          <>
                            <Star size={13} className="fill-gold text-gold" />
                            <span>
                              {val}+ {text.starsAndUp}
                            </span>
                          </>
                        )}
                      </span>
                      {minRating === val && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability & Badges Toggles */}
              <div className="space-y-2.5 border-t border-line pt-4">
                <span className="text-xs font-semibold text-foreground">{text.availability}</span>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-[#d4af37] rounded"
                  />
                  <span>{text.inStockOnly}</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={freeShippingOnly}
                    onChange={(e) => setFreeShippingOnly(e.target.checked)}
                    className="accent-[#d4af37] rounded"
                  />
                  <span>{text.freeShippingOnly}</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="accent-[#d4af37] rounded"
                  />
                  <span>{text.verifiedStoresOnly}</span>
                </label>
              </div>

              {/* Stores Filter */}
              <div className="space-y-2 border-t border-line pt-4">
                <span className="text-xs font-semibold text-foreground">
                  {language === "ar" ? "المتاجر المعتمدة" : "Stores"}
                </span>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-surface border border-line text-foreground focus:outline-none focus:border-gold"
                >
                  <option value="all">{language === "ar" ? "كل المتاجر" : "All Stores"}</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Main Products Grid Column */}
          <div id="products-catalog-section" className="md:col-span-3 space-y-6">
            {/* Brand Flagship Official Banner (Shown when a brand is active) */}
            {selectedBrand !== "all" && currentBrandInfo && (
              <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/60 p-6 text-white shadow-xl">
                {/* Specular ambient shine */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 flex items-center justify-center text-white shrink-0 shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-b from-white/15 to-transparent pointer-events-none" />
                      <BrandLogo brandId={currentBrandInfo.id} className="w-11 h-11 sm:w-13 sm:h-13 text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base">{currentBrandInfo.flag}</span>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                          {language === "ar" ? `متجر ${currentBrandInfo.nameAr} (${currentBrandInfo.name}) الرسمي` : `${currentBrandInfo.name} Official Flagship`}
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                          <BadgeCheck size={13} className="text-emerald-400" />
                          <span>{language === "ar" ? "وكيل معتمد وموثق 100%" : "Verified Authorized Store"}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 max-w-xl">
                        {language === "ar"
                          ? `تصفح تشكيلة منتجات ${currentBrandInfo.nameAr} الأصلية بنسبة 100% مع ضمان الوكيل المعتمد، شحن دولي ومحلي سريع، وشهادات فحص ومطابقة حقيقية.`
                          : `Explore 100% genuine ${currentBrandInfo.name} flagship products with authorized warranty, fast global shipping, and certified authenticity.`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand("all");
                      setSelectedBrandSection("all");
                    }}
                    className="self-start md:self-auto px-4 py-2.5 rounded-xl text-xs font-black bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer whitespace-nowrap shadow-xs hover:scale-102 active:scale-98"
                  >
                    {language === "ar" ? "عرض جميع الماركات" : "View All Brands"}
                  </button>
                </div>

                {/* Sub-sections quick tabs for the selected brand */}
                {BRAND_SECTIONS[selectedBrand] && BRAND_SECTIONS[selectedBrand].length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                      {language === "ar" ? "الأقسام المتاحة:" : "Sections:"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedBrandSection("all")}
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedBrandSection === "all"
                          ? "bg-orange-500 text-white shadow-xs"
                          : "bg-white/10 text-slate-300 hover:bg-white/20"
                      }`}
                    >
                      {language === "ar" ? "جميع منتجات الماركة" : "All Brand Items"}
                    </button>
                    {BRAND_SECTIONS[selectedBrand].map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setSelectedBrandSection(sec.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          selectedBrandSection === sec.id
                            ? "bg-orange-500 text-white shadow-xs"
                            : "bg-white/10 text-slate-300 hover:bg-white/20"
                        }`}
                      >
                        {language === "ar" ? sec.nameAr : sec.nameEn}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sorting & Result Counts Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface border border-line text-xs">
              <span className="text-muted">
                {text.showingResults} <strong className="text-foreground">{filteredProducts.length}</strong> {text.from}{" "}
                <strong className="text-foreground">{products.length}</strong> {text.productsCount}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-muted">{text.sortBy}:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-surface-soft border border-line rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="featured">{text.sortFeatured}</option>
                  <option value="price-asc">{text.sortPriceAsc}</option>
                  <option value="price-desc">{text.sortPriceDesc}</option>
                  <option value="rating">{text.sortRating}</option>
                  <option value="newest">{text.sortNewest}</option>
                </select>
              </div>
            </div>

            {/* Products Grid - 2 columns on mobile, 3 columns on desktop */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 px-4 bg-surface rounded-3xl border border-line space-y-4">
                <Package size={48} className="mx-auto text-muted" />
                <h3 className="text-lg font-bold text-foreground">{text.noProducts}</h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  {language === "ar"
                    ? "جرّب تغيير كلمات البحث أو إعادة تعيين الفلاتر لعرض كل المنتجات المتاحة."
                    : "Try adjusting your search query or reset the filters to see all available products."}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-full bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-all shadow-sm touch-manipulation active:scale-95 cursor-pointer"
                >
                  {text.resetFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
                {filteredProducts.map((product) => {
                  const inWish = isInWishlist(product.id);
                  const isAdded = addedItemMap[product.id];
                  const discountPercent =
                    product.original_price && product.original_price > product.price
                      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                      : null;

                  return (
                    <div
                      key={product.id}
                      className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-surface border border-line p-2.5 sm:p-4 shadow-2xs hover:shadow-md transition-all duration-200 hover:border-orange-500/50"
                    >
                      {/* Product Image & Badges */}
                      <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-surface-soft mb-2 sm:mb-3.5">
                        <Link href={`/marketplace/${product.id}`} className="block w-full h-full">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image_url}
                              alt={product.name}
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              <Package size={28} />
                            </div>
                          )}
                        </Link>

                        {/* Top Badges (Discount & Featured) */}
                        <div className="absolute top-1.5 start-1.5 sm:top-2.5 sm:start-2.5 flex flex-col gap-1">
                          {discountPercent && (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full bg-red-600 text-white text-[9px] sm:text-[10px] font-extrabold shadow-sm">
                              {discountPercent}% {text.saveDiscount}
                            </span>
                          )}
                          {product.is_featured && (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full bg-navy text-gold border border-gold/40 text-[9px] sm:text-[10px] font-extrabold flex items-center gap-0.5 sm:gap-1 shadow-sm">
                              <Flame size={10} className="text-gold" />
                              <span>مميز</span>
                            </span>
                          )}
                          {product.free_shipping && (
                            <span className="hidden sm:flex px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold items-center gap-1 shadow-sm">
                              <Truck size={10} />
                              <span>{text.freeShippingBadge}</span>
                            </span>
                          )}
                        </div>

                        {/* Wishlist Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-1.5 end-1.5 sm:top-2.5 sm:end-2.5 p-1.5 sm:p-2 rounded-full bg-surface/90 backdrop-blur-md text-foreground hover:text-red-500 shadow-xs transition-all touch-manipulation active:scale-90 cursor-pointer z-10"
                          aria-label="Wishlist"
                        >
                          <Heart size={14} className={inWish ? "fill-red-500 text-red-500" : "text-muted"} />
                        </button>
                      </div>

                      {/* Store Name & Rating */}
                      <div className="space-y-1 sm:space-y-1.5 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted">
                          <span className="flex items-center gap-1 truncate max-w-[90px] sm:max-w-[150px]">
                            <StoreIcon size={11} className="text-orange-500" />
                            <span className="truncate">{product.store_name}</span>
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star size={11} className="fill-amber-500" />
                            <span>{product.rating?.toFixed(1) || "5.0"}</span>
                          </span>
                        </div>

                        {/* Product Title */}
                        <Link
                          href={`/marketplace/${product.id}`}
                          className="font-bold text-xs sm:text-sm text-foreground hover:text-orange-500 line-clamp-2 transition-colors flex-1 leading-snug"
                        >
                          {language === "ar" ? product.name : product.name_en || product.name}
                        </Link>

                        {/* Price Row */}
                        <div className="pt-1.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-t border-line/60 mt-1 sm:mt-2">
                          <div>
                            <span className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">
                              {formatPrice(product.price)}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="block sm:inline sm:ms-1.5 text-[10px] sm:text-xs text-muted line-through">
                                {formatPrice(product.original_price)}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] sm:text-[10px] text-muted font-medium">
                            {product.stock > 0 ? `${product.stock} ${language === "ar" ? "متاح" : "left"}` : text.outOfStock}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 sm:pt-3">
                        <button
                          type="button"
                          disabled={product.stock <= 0}
                          onClick={(e) => handleQuickAdd(product, e)}
                          className={`w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-xs shrink-0 whitespace-nowrap min-h-[38px] sm:min-h-[40px] touch-manipulation active:scale-95 cursor-pointer ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : product.stock > 0
                              ? "bg-orange-500 hover:bg-orange-600 !text-white shadow-xs"
                              : "bg-surface-soft text-muted cursor-not-allowed border border-line"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check size={14} />
                              <span>{text.addedToCart}</span>
                            </>
                          ) : (
                            <>
                              <Tag size={12} className="shrink-0" />
                              <span>{product.stock > 0 ? text.quickAdd : text.outOfStock}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Coupons Club Modal */}
      {couponsModalOpen && (
        <div 
          onClick={() => setCouponsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-surface border border-line rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Gift size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    {language === "ar" ? "نادي الكوبونات وقسائم التخفيض" : "Coupons & Promo Codes Club"}
                  </h3>
                  <p className="text-xs text-muted">
                    {language === "ar" ? "انسخ أي كود وطبّقه مباشرة عند إتمام الطلب للحصول على خصم إضافي" : "Copy any code and apply at checkout for instant extra savings"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCouponsModalOpen(false)}
                className="p-1.5 rounded-xl bg-surface-soft text-muted hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {activeCoupons.map((c) => {
                const isCopied = copiedCoupon === c.code;
                return (
                  <div
                    key={c.code}
                    className={`p-4 rounded-2xl border bg-linear-to-r ${c.color} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black tracking-wider bg-surface px-3 py-1 rounded-xl border border-line text-foreground">
                          {c.code}
                        </span>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-surface text-foreground border border-line">
                          {language === "ar" ? c.badge : c.badgeEn}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-foreground">
                        {language === "ar" ? c.titleAr : c.titleEn}
                      </div>
                      <div className="text-[10px] text-muted">
                        {language === "ar" ? `الحد الأدنى للطلب: ${c.minSpend}` : `Min spend: ${c.minSpend}`}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCoupon(c.code)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 ${
                        isCopied
                          ? "bg-emerald-600 text-white"
                          : "bg-surface hover:bg-surface-soft text-foreground border border-line"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} />
                          <span>{language === "ar" ? "تم النسخ بنجاح!" : "Copied!"}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>{language === "ar" ? "نسخ الكود" : "Copy Code"}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-surface-soft border border-line text-xs text-muted flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>
                {language === "ar"
                  ? "جميع الكوبونات معتمدة وتعمل بنسبة 100% على كافة المنتجات المؤهلة في السوق العالمي مع ضمان استرداد فوري وتوفير مضمون."
                  : "All coupons are verified and 100% operational on eligible global marketplace items with immediate discount."}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setCouponsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-extrabold text-xs shadow-xs hover:bg-orange-600 transition-all cursor-pointer"
              >
                {language === "ar" ? "متابعة التسوق" : "Continue Shopping"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive B2B Wholesale Hub Modal */}
      {b2bModalOpen && (
        <div 
          onClick={() => setB2bModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-surface border border-line rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    {language === "ar" ? "بوابة تجارة الجملة والشركات (B2B Wholesale Hub)" : "B2B Wholesale & Enterprise Hub"}
                  </h3>
                  <p className="text-xs text-muted">
                    {language === "ar" ? "أسعار خاصة للكميات، فواتير ضريبية معتمدة، وتوريد مباشر من المصانع العالمية" : "Volume tiered discounts, tax-compliant invoicing, and direct factory procurement"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setB2bModalOpen(false)}
                className="p-1.5 rounded-xl bg-surface-soft text-muted hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Wholesale Tier Discounts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl border border-line bg-surface-soft space-y-1 text-center">
                <div className="text-xs font-bold text-muted">{language === "ar" ? "كميات 10 - 49 قطعة" : "Tier 1: 10 - 49 pcs"}</div>
                <div className="text-xl font-black text-blue-500">15% {language === "ar" ? "خصم مباشر" : "OFF"}</div>
                <div className="text-[10px] text-muted">{language === "ar" ? "شحن قياسي سريع" : "Fast Standard Shipping"}</div>
              </div>

              <div className="p-3.5 rounded-2xl border border-blue-500/40 bg-blue-500/10 space-y-1 text-center">
                <div className="text-xs font-bold text-blue-500">{language === "ar" ? "كميات 50 - 99 قطعة" : "Tier 2: 50 - 99 pcs"}</div>
                <div className="text-xl font-black text-blue-600 dark:text-blue-400">25% {language === "ar" ? "خصم جملة" : "OFF"}</div>
                <div className="text-[10px] text-muted">{language === "ar" ? "شحن جوي مجاني" : "Free Air Freight"}</div>
              </div>

              <div className="p-3.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 space-y-1 text-center">
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400">{language === "ar" ? "كميات 100+ قطعة" : "Tier 3: 100+ pcs"}</div>
                <div className="text-xl font-black text-amber-600 dark:text-amber-300">35% {language === "ar" ? "خصم توريد VIP" : "OFF"}</div>
                <div className="text-[10px] text-muted">{language === "ar" ? "مدير حساب مخصص" : "Dedicated Account Manager"}</div>
              </div>
            </div>

            {/* RFQ Quotation Form */}
            <form onSubmit={handleB2bSubmit} className="space-y-4 border-t border-line pt-4">
              <h4 className="text-sm font-extrabold text-foreground">
                {language === "ar" ? "طلب عرض سعر رسمي (RFQ Instant Quotation)" : "Request Formal Quote (RFQ)"}
              </h4>

              {b2bSuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-center space-y-2 animate-in zoom-in-95">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <Check size={24} />
                  </div>
                  <div className="text-base font-black">
                    {language === "ar" ? "تم استلام طلب التوريد بنجاح!" : "Quotation Request Received!"}
                  </div>
                  <p className="text-xs max-w-md mx-auto">
                    {language === "ar"
                      ? "سيقوم مستشار توريد الشركات بالتواصل معك خلال 4 ساعات مع عرض السعر المفصل والفاتورة المبدئية."
                      : "Our B2B corporate specialist will contact you within 4 hours with detailed pricing."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        {language === "ar" ? "اسم المؤسسة / الشركة / التاجر" : "Company / Business Name"}
                      </label>
                      <input
                        type="text"
                        required
                        value={b2bForm.companyName}
                        onChange={(e) => setB2bForm({ ...b2bForm, companyName: e.target.value })}
                        placeholder={language === "ar" ? "مثال: مؤسسة النور التجارية" : "e.g. Al Noor Enterprises"}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-line text-xs text-foreground focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        {language === "ar" ? "رقم الهاتف / الواتساب للتواصل" : "Phone / WhatsApp Contact"}
                      </label>
                      <input
                        type="tel"
                        required
                        value={b2bForm.phone}
                        onChange={(e) => setB2bForm({ ...b2bForm, phone: e.target.value })}
                        placeholder="+966 5x xxx xxxx"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-line text-xs text-foreground focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        {language === "ar" ? "الفئة المستهدفة للتوريد" : "Target Category"}
                      </label>
                      <select
                        value={b2bForm.category}
                        onChange={(e) => setB2bForm({ ...b2bForm, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-line text-xs text-foreground focus:outline-none focus:border-blue-500"
                      >
                        <option value="all">{language === "ar" ? "جميع المنتجات المتنوعة" : "General Multi-category"}</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {language === "ar" ? c.name_ar : c.name_en}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        {language === "ar" ? "الكمية التقديرية (قطعة)" : "Estimated Quantity (Units)"}
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="50000"
                        required
                        value={b2bForm.quantity}
                        onChange={(e) => setB2bForm({ ...b2bForm, quantity: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-line text-xs text-foreground focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      {language === "ar" ? "مواصفات أو ملاحظات إضافية (اختياري)" : "Additional Requirements / Specifications"}
                    </label>
                    <textarea
                      rows={2}
                      value={b2bForm.notes}
                      onChange={(e) => setB2bForm({ ...b2bForm, notes: e.target.value })}
                      placeholder={language === "ar" ? "حدد أرقام الموديلات أو متطلبات التخليص الجمركي والتغليف..." : "Specify model numbers, custom packaging, or clearance needs..."}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface border border-line text-xs text-foreground focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setB2bModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-line text-xs font-bold text-muted hover:text-foreground cursor-pointer"
                    >
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                    >
                      {language === "ar" ? "إرسال طلب عرض السعر" : "Submit RFQ"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end md:hidden animate-in fade-in duration-200">
          <div className="w-4/5 max-w-sm h-full bg-surface dark:bg-slate-900 p-5 overflow-y-auto space-y-5 animate-in slide-in-from-end duration-200 border-s border-line flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-line pb-3.5">
                <div className="flex items-center gap-2 font-black text-foreground text-base">
                  <Filter size={18} className="text-orange-500" />
                  <span>{text.filterTitle}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-full bg-surface-soft text-muted hover:text-foreground touch-manipulation active:scale-90"
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-foreground">
                  {language === "ar" ? "القسم الرئيسي" : "Main Category"}
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-surface-soft border border-line text-foreground focus:outline-none focus:border-orange-500 touch-manipulation"
                >
                  <option value="all">{text.allCategories}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {language === "ar" ? c.name_ar : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {language === "ar" ? "الماركة العالمية" : "Global Brand"}
                  </span>
                  {selectedBrand !== "all" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrand("all");
                        setSelectedBrandSection("all");
                      }}
                      className="text-[10px] text-orange-500 font-bold hover:underline touch-manipulation"
                    >
                      {language === "ar" ? "إلغاء التحديد" : "Clear"}
                    </button>
                  )}
                </div>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setSelectedBrandSection("all");
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-surface-soft border border-line text-foreground focus:outline-none focus:border-orange-500 touch-manipulation"
                >
                  <option value="all">{language === "ar" ? "جميع الماركات" : "All Brands"}</option>
                  {AVAILABLE_BRANDS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {language === "ar" ? `${b.nameAr} (${b.name})` : b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Slider */}
              <div className="space-y-2 border-t border-line pt-3.5">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>{text.priceRange}</span>
                  <span className="text-orange-500 font-black">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="500000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-orange-500 touch-manipulation"
                />
                <div className="flex justify-between text-[10px] text-muted font-bold">
                  <span>{formatPrice(200)}</span>
                  <span>{formatPrice(500000)}</span>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2.5 border-t border-line pt-3.5">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer select-none touch-manipulation">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-orange-500 rounded w-4 h-4"
                  />
                  <span>{text.inStockOnly}</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer select-none touch-manipulation">
                  <input
                    type="checkbox"
                    checked={freeShippingOnly}
                    onChange={(e) => setFreeShippingOnly(e.target.checked)}
                    className="accent-orange-500 rounded w-4 h-4"
                  />
                  <span>{text.freeShippingOnly}</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer select-none touch-manipulation">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="accent-orange-500 rounded w-4 h-4"
                  />
                  <span>{text.verifiedStoresOnly}</span>
                </label>
              </div>
            </div>

            <div className="pt-4 space-y-2 border-t border-line">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md touch-manipulation active:scale-95 cursor-pointer"
              >
                {language === "ar" ? "تطبيق الفلاتر" : "Apply Filters"} ({filteredProducts.length})
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 rounded-xl border border-line text-muted hover:text-foreground font-bold text-xs touch-manipulation active:scale-95 cursor-pointer"
              >
                {text.resetFilters}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-muted flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <span>جاري تحميل السوق العالمي...</span>
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
