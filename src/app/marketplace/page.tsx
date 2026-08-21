"use client";

import { useState, useMemo, useSyncExternalStore, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Filter,
  Flame,
  Heart,
  Package,
  Search,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [freeShippingOnly, setFreeShippingOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [wishlistOnly, setWishlistOnly] = useState<boolean>(initialWishlistOnly);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating" | "newest">("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStore("all");
    setMaxPrice(10000);
    setMinRating(0);
    setInStockOnly(false);
    setFreeShippingOnly(false);
    setVerifiedOnly(false);
    setWishlistOnly(false);
    setSortBy("featured");
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = prod.name.toLowerCase().includes(q) || (prod.name_en && prod.name_en.toLowerCase().includes(q));
          const matchDesc = prod.description?.toLowerCase().includes(q) || prod.description_en?.toLowerCase().includes(q);
          const matchStore = prod.store_name?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchStore) return false;
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
    searchQuery,
    selectedCategory,
    selectedStore,
    maxPrice,
    minRating,
    inStockOnly,
    freeShippingOnly,
    verifiedOnly,
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
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === "all"
                  ? "bg-gold text-navy border-gold shadow-sm font-extrabold"
                  : "bg-surface text-muted border-line hover:border-gold/60"
              }`}
            >
              {text.allCategories}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.slug
                    ? "bg-gold text-navy border-gold shadow-sm font-extrabold"
                    : "bg-surface text-muted border-line hover:border-gold/60"
                }`}
              >
                {language === "ar" ? cat.name_ar : cat.name_en}
              </button>
            ))}
          </div>
        </div>

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
                  className="text-xs text-muted hover:text-gold transition-colors font-medium"
                >
                  {text.resetFilters}
                </button>
              </div>

              {/* Price Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>{text.priceRange}</span>
                  <span className="text-gold font-bold">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="15000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#d4af37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>{formatPrice(200)}</span>
                  <span>{formatPrice(15000)}</span>
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
                  className="bg-surface-soft border border-line rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-gold"
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
                              ? "bg-gold text-navy hover:bg-gold-strong dark:bg-gold dark:text-navy dark:hover:bg-amber-400 border border-gold/40"
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

            {/* Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-foreground">
                <span>{text.priceRange}</span>
                <span className="text-gold font-bold">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="200"
                max="15000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#d4af37]"
              />
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
