"use client";

import { use, useState, useSyncExternalStore, useMemo } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Check,
  Copy,
  Heart,
  Megaphone,
  Package,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store as StoreIcon,
  Tag,
  Truck,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { NoormexaEmblemSvg } from "@/components/BrandLogo";
import { useTheme } from "@/context/ThemeContext";
import type { Product } from "@/types/marketplace";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

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

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const language = useNoormexaLanguage();
  const isAr = language === "ar";
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { stores, products, marketingPosts, formatPrice, addToCart, likeMarketingPost } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [addedAlert, setAddedAlert] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Find store by slug
  const store = useMemo(() => {
    return stores.find((s) => s.slug.toLowerCase() === slug.toLowerCase() || s.id === slug);
  }, [stores, slug]);

  // Find products belonging to this store
  const storeProducts = useMemo(() => {
    if (!store) return [];
    return products.filter((p) => (p.store_id === store.id || p.store_name === store.name) && p.status === "active");
  }, [products, store]);

  // Find marketing posts belonging to this store
  const storePosts = useMemo(() => {
    if (!store) return [];
    return marketingPosts.filter((p) => p.store_id === store.id && p.status === "published");
  }, [marketingPosts, store]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return storeProducts
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.name_en && p.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory || p.category_slug === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return (b.rating || 5) - (a.rating || 5);
      });
  }, [storeProducts, searchQuery, selectedCategory, sortBy]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedAlert(isAr ? `تمت إضافة "${product.name}" إلى السلة` : `Added "${product.name}" to cart`);
    setTimeout(() => setAddedAlert(null), 2500);
  };

  const handleCopyPromo = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setAddedAlert(isAr ? `تم نسخ كود الخصم (${code}) بنجاح!` : `Promo code (${code}) copied to clipboard!`);
    setTimeout(() => {
      setCopiedCode(null);
      setAddedAlert(null);
    }, 2500);
  };

  if (!store) {
    return (
      <main className="noormexa-main py-16">
        <div className="noormexa-container max-w-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface-soft border border-line flex items-center justify-center mx-auto text-muted">
            <StoreIcon size={32} />
          </div>
          <h1 className="text-xl font-black text-foreground">
            {isAr ? "عذراً، لم يتم العثور على هذا المتجر" : "Store Not Found"}
          </h1>
          <p className="text-xs text-muted">
            {isAr ? "قد يكون رابط المتجر غير صحيح أو تم تعديله." : "The requested store does not exist or has been removed."}
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-navy font-bold text-xs shadow-xs"
          >
            <span>{isAr ? "العودة إلى السوق العام" : "Return to Marketplace"}</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="noormexa-main pb-16">
      {/* Toast Alert */}
      {addedAlert && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
          <Check size={16} />
          <span>{addedAlert}</span>
        </div>
      )}

      {/* Store Banner Hero */}
      <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden bg-navy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={store.banner_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80"}
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="noormexa-container relative -mt-16 sm:-mt-20 space-y-8">
        {/* Store Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {store.is_official ? (
              <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center p-3 rounded-3xl bg-surface-soft border border-line shadow-md">
                <NoormexaEmblemSvg size={54} isDark={isDark} />
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-surface-soft border border-line shadow-md shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={store.logo_url || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&auto=format&fit=crop&q=80"}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground">
                  {store.is_official ? (isAr ? "متجر نورميكسا الرسمي" : "NOORMEXA Flagship Direct") : store.name}
                </h1>
                
                {store.is_official ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-gold font-black text-xs border border-amber-500/20 shadow-xs">
                    <BadgeCheck size={14} className="text-emerald-500" />
                    <span>{isAr ? "المتجر الرسمي المعتمد للمنصة" : "Official Flagship Direct"}</span>
                  </span>
                ) : store.is_verified ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-600 font-bold text-xs border border-emerald-600/20">
                    <BadgeCheck size={14} />
                    <span>{isAr ? "بائع موثق" : "Verified Merchant"}</span>
                  </span>
                ) : null}
              </div>

              {store.description && (
                <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">{store.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                <span className="flex items-center gap-1 text-amber-600 dark:text-gold font-bold">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <span>{store.rating || 5.0} / 5.0</span>
                </span>
                <span>•</span>
                <span>{store.country || (isAr ? "المملكة العربية السعودية" : "Saudi Arabia")}</span>
                <span>•</span>
                <span>{storeProducts.length} {isAr ? "منتج متوفر" : "products listed"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {store.contact_phone && (
              <a
                href={`tel:${store.contact_phone}`}
                className="px-4 py-2.5 rounded-xl border border-line hover:border-gold/50 bg-surface text-foreground font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                <Phone size={14} className="text-amber-600 dark:text-gold" />
                <span>{isAr ? "اتصال بالبائع" : "Call Store"}</span>
              </a>
            )}

            <Link
              href="/seller/dashboard"
              className="noormexa-primary-button px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-xs"
            >
              <StoreIcon size={14} />
              <span>{isAr ? "لوحة التاجر" : "Merchant Central"}</span>
            </Link>
          </div>
        </div>

        {/* Marketing Posts & Promotions Feed (Amazon Style Posts) */}
        {storePosts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-gold" />
                <h2 className="text-sm sm:text-base font-black text-foreground">
                  {isAr ? "عروض ومنشورات المتجر الحصرية" : "Exclusive Store Campaigns & Promos"}
                </h2>
              </div>
              <span className="text-xs font-bold text-muted">
                {storePosts.length} {isAr ? "عروض نشطة" : "active offers"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storePosts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-3xl bg-surface border border-line shadow-xs hover:border-gold/60 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {post.is_pinned && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-gold font-black text-[10px] flex items-center gap-1">
                            <Sparkles size={11} />
                            <span>{isAr ? "عرض مميز مثبت" : "Featured Deal"}</span>
                          </span>
                        )}
                        <span className="text-[11px] text-muted">
                          {new Date(post.created_at).toLocaleDateString(isAr ? "ar-EG" : "en-US")}
                        </span>
                      </div>

                      {post.promo_code && (
                        <button
                          type="button"
                          onClick={() => handleCopyPromo(post.promo_code!)}
                          className="px-3 py-1 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-600 font-mono font-black text-xs flex items-center gap-1.5 transition-colors"
                          title={isAr ? "انقر لنسخ كود الخصم" : "Click to copy code"}
                        >
                          <Tag size={12} />
                          <span>{post.promo_code}</span>
                          {copiedCode === post.promo_code ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      )}
                    </div>

                    <div>
                      <h3 className="font-black text-sm text-foreground">{post.title}</h3>
                      <p className="text-xs text-muted mt-1 leading-relaxed">{post.content}</p>
                    </div>

                    {post.image_url && (
                      <div className="rounded-2xl overflow-hidden border border-line/60 aspect-video relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {post.featured_product_id && (
                      <div className="p-3 rounded-2xl bg-surface-soft border border-line flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-foreground truncate">
                          {products.find((p) => p.id === post.featured_product_id)?.name || (isAr ? "منتج العرض" : "Featured item")}
                        </span>
                        <Link
                          href={`/product/${post.featured_product_id}`}
                          className="px-3 py-1 rounded-lg bg-gold text-navy font-black text-[11px] shrink-0"
                        >
                          {isAr ? "شراء العرض" : "Shop Deal"}
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-line/60 text-xs text-muted">
                    <button
                      type="button"
                      onClick={() => likeMarketingPost(post.id)}
                      className="flex items-center gap-1.5 text-rose-500 hover:scale-105 transition-transform font-bold"
                    >
                      <Heart size={14} className="fill-rose-500 text-rose-500" />
                      <span>{post.likes_count || 0} {isAr ? "إعجاب" : "likes"}</span>
                    </button>

                    <span className="text-[11px]">
                      {post.views_count || 1} {isAr ? "مشاهدة" : "views"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Value Trust Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-surface border border-line shadow-xs flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 shrink-0">
              <ShieldCheck size={18} />
            </span>
            <div className="text-xs">
              <div className="font-bold text-foreground">{isAr ? "منتجات أصلية 100%" : "100% Authentic"}</div>
              <div className="text-muted text-[11px]">{isAr ? "مفحوصة ومعتمدة من منصة نورميكسا" : "Inspected by NOORMEXA"}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-line shadow-xs flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-gold shrink-0">
              <Truck size={18} />
            </span>
            <div className="text-xs">
              <div className="font-bold text-foreground">{isAr ? "شحن آمن وسريع" : "Express Shipping"}</div>
              <div className="text-muted text-[11px]">{isAr ? "توصيل وتتبع حي حتى باب المنزل" : "Live door-to-door tracking"}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-line shadow-xs flex items-center gap-3">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-500 shrink-0">
              <Sparkles size={18} />
            </span>
            <div className="text-xs">
              <div className="font-bold text-foreground">{isAr ? "ضمان استرجاع 14 يوم" : "14-Day Free Returns"}</div>
              <div className="text-muted text-[11px]">{isAr ? "حماية كاملة لأموال المشتري" : "Buyer payment protection"}</div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar inside store */}
        <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? `ابحث داخل منتجات ${store.name}...` : `Search inside ${store.name}...`}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-surface-soft border border-line text-xs font-bold focus:outline-none focus:border-gold text-foreground"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2.5 rounded-xl bg-surface-soft border border-line text-xs font-bold text-foreground focus:outline-none focus:border-gold"
            >
              <option value="featured">{isAr ? "الأعلى تقييماً والمميز" : "Featured & Top Rated"}</option>
              <option value="price-asc">{isAr ? "السعر: من الأقل للأعلى" : "Price: Low to High"}</option>
              <option value="price-desc">{isAr ? "السعر: من الأعلى للأقل" : "Price: High to Low"}</option>
            </select>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["all", "electronics", "fashion", "perfumes", "home", "beauty"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all border shrink-0 ${
                  selectedCategory === cat
                    ? "bg-gold text-navy border-gold shadow-xs"
                    : "bg-surface-soft text-muted border-line hover:border-gold"
                }`}
              >
                {cat === "all"
                  ? isAr ? "جميع منتجات المتجر" : "All Items"
                  : cat === "electronics"
                  ? isAr ? "إلكترونيات" : "Electronics"
                  : cat === "fashion"
                  ? isAr ? "أزياء وموضة" : "Fashion"
                  : cat === "perfumes"
                  ? isAr ? "عطور فاخرة" : "Perfumes"
                  : cat === "home"
                  ? isAr ? "المنزل والديكور" : "Home & Living"
                  : isAr ? "عناية وجمال" : "Beauty & Care"}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-surface rounded-3xl border border-line">
            <Package size={36} className="text-muted mx-auto" />
            <h3 className="text-sm font-bold text-foreground">
              {isAr ? "لا توجد منتجات مطابقة لخيارات البحث" : "No matching products found"}
            </h3>
            <p className="text-xs text-muted">
              {isAr ? "جرّب تغيير كلمات البحث أو تصفح باقي الأقسام." : "Try adjusting your search terms."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="group relative rounded-3xl bg-surface border border-line overflow-hidden shadow-xs hover:shadow-lg hover:border-gold/60 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image Container */}
                  <Link href={`/marketplace/${prod.id}`} className="block relative aspect-square overflow-hidden bg-surface-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.image_url || ""}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {prod.free_shipping && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] shadow-xs">
                        {isAr ? "شحن مجاني" : "Free Ship"}
                      </span>
                    )}

                    {prod.original_price && prod.original_price > prod.price && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-red-500 text-white font-black text-[10px] shadow-xs">
                        -{Math.round(((prod.original_price - prod.price) / prod.original_price) * 100)}%
                      </span>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-1 text-gold text-xs font-bold">
                      <Star size={13} className="fill-gold" />
                      <span>{prod.rating || 5.0}</span>
                      <span className="text-muted text-[10px]">({prod.reviews_count || 1})</span>
                    </div>

                    <Link href={`/marketplace/${prod.id}`} className="font-bold text-xs text-foreground line-clamp-2 hover:text-gold block leading-snug">
                      {prod.name}
                    </Link>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="font-black text-sm text-amber-600 dark:text-gold">
                        {formatPrice(prod.price)}
                      </span>
                      {prod.original_price && (
                        <span className="line-through text-muted text-xs">
                          {formatPrice(prod.original_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(prod)}
                    className="w-full py-2.5 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <ShoppingBag size={14} />
                    <span>{isAr ? "إضافة للسلة" : "Add to Cart"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
