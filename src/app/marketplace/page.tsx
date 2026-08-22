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
  Percent,
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
  const initialWishlistOnly = searchParams.get("wishlist") === "true";
  const initialBrand = searchParams.get("brand") || "all";
  const initialSearch = searchParams.get("search") || "";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [selectedBrandSection, setSelectedBrandSection] = useState<string>("all");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(500000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [freeShippingOnly, setFreeShippingOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [wishlistOnly, setWishlistOnly] = useState<boolean>(initialWishlistOnly);
  const [dealsOnly, setDealsOnly] = useState<boolean>(false);
  const [officialOnly, setOfficialOnly] = useState<boolean>(false);
  const [showBrandsDirectory, setShowBrandsDirectory] = useState<boolean>(false);
  const [couponsModalOpen, setCouponsModalOpen] = useState<boolean>(false);
  const [b2bModalOpen, setB2bModalOpen] = useState<boolean>(false);
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

  // Sync navigation actions, hash links and searchParams dynamically
  useEffect(() => {
    const handleUrlTarget = (urlTarget?: string) => {
      const currentUrl = urlTarget || (typeof window !== "undefined" ? window.location.href : "");
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const search = typeof window !== "undefined" ? window.location.search : "";

      if (
        hash === "#coupons" ||
        hash === "#coupon" ||
        search.includes("view=coupons") ||
        currentUrl.includes("#coupons")
      ) {
        setCouponsModalOpen(true);
      } else if (
        hash === "#b2b" ||
        hash === "#wholesale" ||
        search.includes("view=b2b") ||
        currentUrl.includes("#b2b")
      ) {
        setB2bModalOpen(true);
      } else if (
        hash === "#brands" ||
        hash === "#brand" ||
        search.includes("view=brands") ||
        currentUrl.includes("#brands")
      ) {
        setShowBrandsDirectory(true);
        setTimeout(() => {
          const el = document.getElementById("brands-section");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      } else if (
        search.includes("filter=deals") ||
        hash === "#deals" ||
        hash === "#flash" ||
        currentUrl.includes("filter=deals")
      ) {
        setDealsOnly(true);
        setTimeout(() => {
          const el = document.getElementById("deals-section");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      } else if (
        search.includes("official=true") ||
        hash === "#official" ||
        currentUrl.includes("official=true")
      ) {
        setOfficialOnly(true);
      } else if (currentUrl.endsWith("/marketplace") || currentUrl.endsWith("/marketplace/")) {
        // "جميع الأقسام" clicked: reset specific views
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

  // Listen for Next.js searchParams changes
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    const officialParam = searchParams.get("official");
    const viewParam = searchParams.get("view");
    const catParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");
    const searchParam = searchParams.get("search");

    if (filterParam === "deals") {
      setDealsOnly(true);
    }
    if (officialParam === "true") {
      setOfficialOnly(true);
    }
    if (viewParam === "coupons") {
      setCouponsModalOpen(true);
    }
    if (viewParam === "b2b") {
      setB2bModalOpen(true);
    }
    if (viewParam === "brands") {
      setShowBrandsDirectory(true);
    }
    if (catParam) {
      setSelectedCategory(catParam);
    }
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

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

  // Available Brands list
  const availableBrands = [
    { id: "apple", name: "Apple", nameAr: "أبل", icon: "🍎" },
    { id: "nike", name: "Nike", nameAr: "نايكي", icon: "⚡" },
    { id: "rolex", name: "Rolex", nameAr: "رولكس", icon: "👑" },
    { id: "dior", name: "Dior", nameAr: "ديور", icon: "✨" },
    { id: "samsung", name: "Samsung", nameAr: "سامسونج", icon: "📱" },
    { id: "sony", name: "Sony", nameAr: "سوني", icon: "🎧" },
    { id: "chanel", name: "Chanel", nameAr: "شانيل", icon: "💎" },
    { id: "adidas", name: "Adidas", nameAr: "أديداس", icon: "👟" },
    { id: "gucci", name: "Gucci", nameAr: "غوتشي", icon: "👜" },
    { id: "louis-vuitton", name: "Louis Vuitton", nameAr: "لويس فيتون", icon: "💼" },
    { id: "dyson", name: "Dyson", nameAr: "دايسون", icon: "💨" },
    { id: "zara", name: "ZARA", nameAr: "زارا", icon: "👗" },
  ];

  const currentBrandInfo = availableBrands.find((b) => b.id === selectedBrand);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Brand filter
        if (selectedBrand !== "all") {
          const brandMatch =
            prod.brand_id === selectedBrand ||
            prod.name.toLowerCase().includes(selectedBrand) ||
            (prod.name_en && prod.name_en.toLowerCase().includes(selectedBrand));
          if (!brandMatch) return false;

          // Brand Section sub-filter
          if (selectedBrandSection !== "all") {
            const sec = selectedBrandSection.toLowerCase();
            const prodText = `${prod.name} ${prod.name_en || ""} ${prod.description || ""}`.toLowerCase();
            if (!prodText.includes(sec)) {
              // check common sub-keys
              if (sec === "iphone" && !prodText.includes("iphone")) return false;
              if (sec === "watch" && !prodText.includes("watch") && !prodText.includes("ساعة")) return false;
              if (sec === "airpods" && !prodText.includes("airpod") && !prodText.includes("سماعة")) return false;
              if (sec === "jordan" && !prodText.includes("jordan")) return false;
              if (sec === "submariner" && !prodText.includes("submariner")) return false;
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
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-soft text-gold-strong text-xs font-bold mb-2">
              <Sparkles size={14} />
              <span>NOORMEXA Global Exchange</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              {text.title}
            </h1>
            <p className="text-sm sm:text-base text-muted mt-1 max-w-2xl">
              {text.subtitle}
            </p>
          </div>

          {/* Quick Wishlist / Total Counts badge */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                wishlistOnly
                  ? "bg-red-500 text-white border-red-500 shadow-sm"
                  : "bg-surface text-foreground border-line hover:border-red-400"
              }`}
              onClick={() => setWishlistOnly(!wishlistOnly)}
            >
              <Heart size={15} className={wishlistOnly ? "fill-white" : "text-red-500"} />
              <span>
                {language === "ar" ? "المفضلة" : "Wishlist"} ({wishlist.length})
              </span>
            </button>

            <button
              type="button"
              className="md:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white dark:bg-navy dark:text-gold border border-amber-600 dark:border-gold/30 shadow-xs"
              onClick={() => setMobileFilterOpen(true)}
            >
              <Filter size={15} />
              <span>{text.filterTitle}</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Category Pills Bar */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search size={20} className="absolute start-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={text.searchPlaceholder}
              className="w-full ps-12 pe-10 py-3.5 rounded-2xl bg-surface border border-line focus:outline-none focus:border-gold shadow-sm text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Quick Scroll Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm font-extrabold"
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
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedCategory === cat.slug
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm font-extrabold"
                    : "bg-surface text-muted border-line hover:border-orange-500/50 hover:text-foreground"
                }`}
              >
                {language === "ar" ? cat.name_ar : cat.name_en}
              </button>
            ))}
          </div>

          {/* Official Brands Quick Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-line/60 pt-2">
            <span className="text-[11px] font-bold text-muted whitespace-nowrap shrink-0 flex items-center gap-1">
              <BadgeCheck size={13} className="text-emerald-500" />
              <span>{language === "ar" ? "الماركات المعتمدة:" : "Official Brands:"}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedBrand("all");
                setSelectedBrandSection("all");
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedBrand === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 shadow-2xs font-extrabold"
                  : "bg-surface text-muted border-line hover:border-slate-400"
              }`}
            >
              {language === "ar" ? "الكل" : "All Brands"}
            </button>
            {availableBrands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setSelectedBrand(b.id);
                  setSelectedBrandSection("all");
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1 ${
                  selectedBrand === b.id
                    ? "bg-orange-500 text-white border-orange-500 shadow-xs font-extrabold"
                    : "bg-surface text-muted border-line hover:border-orange-500/40 hover:text-foreground"
                }`}
              >
                <span>{b.icon}</span>
                <span>{language === "ar" ? b.nameAr : b.name}</span>
              </button>
            ))}
          </div>

          {/* Quick Sub-Navigation Feature Badges Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <button
              type="button"
              id="deals"
              onClick={() => setDealsOnly(!dealsOnly)}
              className={`p-3 rounded-2xl border transition-all text-start flex items-center gap-3 cursor-pointer ${
                dealsOnly
                  ? "bg-red-500/15 border-red-500/50 text-red-600 dark:text-red-400 shadow-xs"
                  : "bg-surface border-line hover:border-red-400/40"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <Flame size={18} className="animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black truncate">{language === "ar" ? "عروض الفلاش 50%" : "Flash Deals 50%"}</div>
                <div className="text-[10px] text-muted truncate">{dealsOnly ? (language === "ar" ? "مفعل (انقر للإلغاء)" : "Active (Click to reset)") : (language === "ar" ? "خصومات حصرية محدودة" : "Limited Discounts")}</div>
              </div>
            </button>

            <button
              type="button"
              id="official"
              onClick={() => setOfficialOnly(!officialOnly)}
              className={`p-3 rounded-2xl border transition-all text-start flex items-center gap-3 cursor-pointer ${
                officialOnly
                  ? "bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 shadow-xs"
                  : "bg-surface border-line hover:border-amber-400/40"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Crown size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black truncate">{language === "ar" ? "المتجر المعتمد" : "Flagship Store"}</div>
                <div className="text-[10px] text-muted truncate">{officialOnly ? (language === "ar" ? "مفعل (انقر للإلغاء)" : "Active (Click to reset)") : (language === "ar" ? "ضمان أصالة 100%" : "100% Guaranteed")}</div>
              </div>
            </button>

            <button
              type="button"
              id="coupons"
              onClick={() => setCouponsModalOpen(true)}
              className="p-3 rounded-2xl border bg-surface border-line hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-start flex items-center gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Tag size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black truncate text-emerald-600 dark:text-emerald-400">{language === "ar" ? "نادي الكوبونات" : "Coupons Club"}</div>
                <div className="text-[10px] text-muted truncate">{language === "ar" ? "5 قسائم نشطة للنسخ" : "5 Active Vouchers"}</div>
              </div>
            </button>

            <button
              type="button"
              id="b2b"
              onClick={() => setB2bModalOpen(true)}
              className="p-3 rounded-2xl border bg-surface border-line hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-start flex items-center gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Building2 size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black truncate text-blue-600 dark:text-blue-400">{language === "ar" ? "تجارة الجملة B2B" : "B2B Wholesale"}</div>
                <div className="text-[10px] text-muted truncate">{language === "ar" ? "خصم يصل إلى 35%" : "Up to 35% Discount"}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Top Brands Directory Showcase (#brands-section) */}
        {(showBrandsDirectory || selectedBrand !== "all") && (
          <section id="brands-section" className="mb-8 p-5 sm:p-6 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
              <div className="flex items-center gap-2 font-black text-base text-foreground">
                <Sparkles size={18} className="text-purple-500" />
                <span>{language === "ar" ? "دليل الماركات العالمية الفاخرة (Top Brands Hub)" : "Luxury Global Brands Hub"}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedBrand !== "all" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand("all");
                      setSelectedBrandSection("all");
                    }}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-surface-soft text-orange-500 border border-orange-500/30 hover:bg-orange-500/10 cursor-pointer"
                  >
                    {language === "ar" ? "عرض كل المنتجات" : "View All Products"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowBrandsDirectory(false)}
                  className="p-1 rounded-lg text-muted hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availableBrands.map((b) => {
                const isActive = selectedBrand === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBrand(b.id);
                      setSelectedBrandSection("all");
                    }}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-purple-500/15 border-purple-500 text-purple-600 dark:text-purple-300 shadow-xs ring-2 ring-purple-500/30"
                        : "bg-surface-soft/60 hover:bg-surface-soft border-line hover:border-purple-400/40 text-foreground"
                    }`}
                  >
                    <span className="text-3xl">{b.icon}</span>
                    <div className="text-xs font-extrabold">{b.name}</div>
                    <div className="text-[10px] text-muted">{b.nameAr}</div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface border border-line text-muted font-bold">
                      {isActive ? (language === "ar" ? "محدد حالياً" : "Selected") : (language === "ar" ? "تصفح الماركة" : "Explore")}
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
                  {availableBrands.map((b) => (
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
          <div className="md:col-span-3 space-y-6">
            {/* Brand Flagship Official Banner (Shown when a brand is active) */}
            {selectedBrand !== "all" && currentBrandInfo && (
              <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/60 p-6 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{currentBrandInfo.icon}</span>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        {language === "ar" ? `متجر ${currentBrandInfo.nameAr} (${currentBrandInfo.name}) الرسمي` : `${currentBrandInfo.name} Official Flagship`}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                        <BadgeCheck size={13} className="text-emerald-400" />
                        <span>{language === "ar" ? "وكيل معتمد وموثق" : "Verified Authorized Store"}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-xl">
                      {language === "ar"
                        ? `تصفح تشكيلة منتجات ${currentBrandInfo.nameAr} الأصلية بنسبة 100% مع ضمان الوكيل المعتمد، شحن دولي ومحلي سريع، وشهادات فحص ومطابقة حقيقية.`
                        : `Explore 100% genuine ${currentBrandInfo.name} flagship products with authorized warranty, fast global shipping, and certified authenticity.`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand("all");
                      setSelectedBrandSection("all");
                    }}
                    className="self-start md:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {language === "ar" ? "عرض جميع الماركات" : "View All Brands"}
                  </button>
                </div>

                {/* Sub-sections quick tabs for the selected brand */}
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
                  {selectedBrand === "apple" && (
                    <>
                      {["iPhone", "Watch", "AirPods"].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setSelectedBrandSection(sec)}
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedBrandSection === sec
                              ? "bg-orange-500 text-white shadow-xs"
                              : "bg-white/10 text-slate-300 hover:bg-white/20"
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </>
                  )}
                  {selectedBrand === "nike" && (
                    <>
                      {["Jordan", "Dunk"].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setSelectedBrandSection(sec)}
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedBrandSection === sec
                              ? "bg-orange-500 text-white shadow-xs"
                              : "bg-white/10 text-slate-300 hover:bg-white/20"
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </>
                  )}
                  {selectedBrand === "rolex" && (
                    <>
                      {["Submariner"].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setSelectedBrandSection(sec)}
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedBrandSection === sec
                              ? "bg-orange-500 text-white shadow-xs"
                              : "bg-white/10 text-slate-300 hover:bg-white/20"
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </>
                  )}
                </div>
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

            {/* Products Grid */}
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
                  className="px-6 py-2.5 rounded-full bg-gold text-navy text-xs font-bold hover:bg-gold-strong transition-all shadow-sm"
                >
                  {text.resetFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                      className="group relative flex flex-col justify-between rounded-3xl bg-surface border border-line p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gold/50"
                    >
                      {/* Product Image & Badges */}
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-soft mb-3.5">
                        <Link href={`/marketplace/${product.id}`} className="block w-full h-full">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image_url}
                              alt={product.name}
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              <Package size={36} />
                            </div>
                          )}
                        </Link>

                        {/* Top Badges (Discount & Featured) */}
                        <div className="absolute top-2.5 start-2.5 flex flex-col gap-1.5">
                          {discountPercent && (
                            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold shadow-sm">
                              {discountPercent}% {text.saveDiscount}
                            </span>
                          )}
                          {product.is_featured && (
                            <span className="px-2 py-0.5 rounded-full bg-navy text-gold border border-gold/40 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                              <Flame size={11} className="text-gold" />
                              <span>مميز</span>
                            </span>
                          )}
                          {product.free_shipping && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
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
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-2.5 end-2.5 p-2 rounded-full bg-surface/80 backdrop-blur-md text-foreground hover:text-red-500 shadow-sm transition-all"
                          aria-label="Wishlist"
                        >
                          <Heart size={15} className={inWish ? "fill-red-500 text-red-500" : ""} />
                        </button>
                      </div>

                      {/* Store Name & Rating */}
                      <div className="space-y-1.5 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <StoreIcon size={12} className="text-gold" />
                            <span className="truncate">{product.store_name}</span>
                          </span>
                          <span className="flex items-center gap-1 text-gold font-bold">
                            <Star size={12} className="fill-gold" />
                            <span>{product.rating?.toFixed(1) || "5.0"}</span>
                          </span>
                        </div>

                        {/* Product Title */}
                        <Link
                          href={`/marketplace/${product.id}`}
                          className="font-bold text-sm text-foreground hover:text-gold line-clamp-2 transition-colors flex-1"
                        >
                          {language === "ar" ? product.name : product.name_en || product.name}
                        </Link>

                        {/* Price Row */}
                        <div className="pt-2 flex items-baseline justify-between gap-2 border-t border-line/60 mt-2">
                          <div>
                            <span className="text-base font-extrabold text-foreground tracking-tight">
                              {formatPrice(product.price)}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="ms-1.5 text-xs text-muted line-through">
                                {formatPrice(product.original_price)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted font-medium">
                            {product.stock > 0 ? `${product.stock} متاح` : text.outOfStock}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-3">
                        <button
                          type="button"
                          disabled={product.stock <= 0}
                          onClick={(e) => handleQuickAdd(product, e)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 whitespace-nowrap min-h-[40px] ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : product.stock > 0
                              ? "bg-orange-500 hover:bg-orange-600 !text-white shadow-xs active:scale-[0.98]"
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
                              <Tag size={13} />
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-surface border border-line rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-surface border border-line rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end md:hidden">
          <div className="w-4/5 max-w-sm h-full bg-surface p-6 overflow-y-auto space-y-6 animate-in slide-in-from-end">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2 font-bold text-foreground text-base">
                <Filter size={18} className="text-gold" />
                <span>{text.filterTitle}</span>
              </div>
              <button type="button" onClick={() => setMobileFilterOpen(false)} className="p-1 text-muted">
                <X size={20} />
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
                    className="text-[10px] text-orange-500 font-bold hover:underline"
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
                {availableBrands.map((b) => (
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
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-[10px] text-muted">
                <span>{formatPrice(200)}</span>
                <span>{formatPrice(500000)}</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 border-t border-line pt-4">
              <label className="flex items-center gap-2 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-[#d4af37]"
                />
                <span>{text.inStockOnly}</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={freeShippingOnly}
                  onChange={(e) => setFreeShippingOnly(e.target.checked)}
                  className="accent-[#d4af37]"
                />
                <span>{text.freeShippingOnly}</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="accent-[#d4af37]"
                />
                <span>{text.verifiedStoresOnly}</span>
              </label>
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-gold text-navy font-bold text-xs shadow-sm"
              >
                {language === "ar" ? "تطبيق الفلاتر" : "Apply Filters"}
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 rounded-xl border border-line text-muted font-medium text-xs"
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
