"use client";

import { useState, useMemo, useSyncExternalStore, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Flame,
  Heart,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store as StoreIcon,
  Truck,
  Zap,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import type { SelectedVariant } from "@/types/marketplace";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    backToMarket: "العودة إلى السوق",
    freeShipping: "شحن مجاني على هذا المنتج",
    stockAvailable: "قطعة متبقية في المخزون",
    outOfStock: "نفد المخزون حالياً",
    verifiedStore: "متجر موثق ومعتمد",
    warrantyInfo: "ضمان أصلي 100% واسترجاع مجاني خلال 14 يوم",
    quantity: "الكمية:",
    subtotal: "الإجمالي الفرعي:",
    addToCart: "إضافة إلى السلة",
    buyNow: "شراء فوري مباشر (Buy Now)",
    addedToCartMsg: "تمت إضافة المنتج إلى سلتك بنجاح!",
    tabSpecs: "المواصفات التقنية",
    tabDesc: "تفاصيل المنتج الكاملة",
    tabReviews: "تقييمات المشترين الموثقين",
    relatedProducts: "منتجات مقترحة ومشابهة",
    writeReview: "أضف تقييمك وتجربتك",
    ratingScore: "التقييم العام",
    submitReview: "إرسال التقييم",
    reviewSuccess: "شكرًا لك! تم تسجيل تقييمك بنجاح.",
    shareSuccess: "تم نسخ رابط المنتج للمشاركة!",
    saveDiscount: "خصم",
  },
  en: {
    backToMarket: "Back to Marketplace",
    freeShipping: "Free Shipping on this item",
    stockAvailable: "units in stock",
    outOfStock: "Currently Out of Stock",
    verifiedStore: "Verified & Certified Merchant",
    warrantyInfo: "100% Genuine Guarantee & 14-day Free Returns",
    quantity: "Quantity:",
    subtotal: "Subtotal:",
    addToCart: "Add to Cart",
    buyNow: "Buy Now (Fast Checkout)",
    addedToCartMsg: "Product successfully added to your cart!",
    tabSpecs: "Technical Specs",
    tabDesc: "Detailed Description",
    tabReviews: "Verified Customer Reviews",
    relatedProducts: "Recommended & Related Products",
    writeReview: "Write a Review",
    ratingScore: "Overall Rating",
    submitReview: "Submit Review",
    reviewSuccess: "Thank you! Your verified review has been submitted.",
    shareSuccess: "Product link copied to clipboard!",
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

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();
  const language = useNoormexaLanguage();
  const text = copy[language];

  const {
    products,
    stores,
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useMarketplace();

  // Find product by id
  const product = products.find((p) => p.id === productId) || products[0];
  const store = stores.find((s) => s.id === product?.store_id);

  // Gallery state
  const gallery = useMemo(() => {
    if (!product) return [];
    if (product.gallery_images && product.gallery_images.length > 0) return product.gallery_images;
    return product.image_url ? [product.image_url] : [];
  }, [product]);

  const [activeImage, setActiveImage] = useState<string>(gallery[0] || "");
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant>({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "desc" | "reviews">("specs");
  const [addedNotice, setAddedNotice] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Reviews Mock / Local state
  const [reviewsList, setReviewsList] = useState([
    {
      id: "rev-1",
      author: "أحمد س. (مشترٍ موثق)",
      rating: 5,
      date: "منذ 3 أيام",
      comment: "المنتج يفوق التوقعات، الجودة ممتازة وسرعة التوصيل كانت مبهرة. التغليف فخم جداً.",
    },
    {
      id: "rev-2",
      author: "سارة م. (مشترية موثقة)",
      rating: 5,
      date: "منذ أسبوع",
      comment: "أنصح به بشدة، مطابق للمواصفات 100% وخامات عالية الجودة.",
    },
  ]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Calculate price delta from selected variants
  const calculatedPrice = useMemo(() => {
    if (!product) return 0;
    let base = product.price;
    if (product.variants) {
      product.variants.forEach((v) => {
        const chosenOptId = selectedVariants[v.id];
        if (chosenOptId) {
          const opt = v.options.find((o) => o.id === chosenOptId);
          if (opt?.priceDelta) base += opt.priceDelta;
        }
      });
    }
    return base;
  }, [product, selectedVariants]);

  if (!product) {
    return (
      <main className="noormexa-main py-16 text-center">
        <div className="noormexa-container space-y-4">
          <Package size={48} className="mx-auto text-muted" />
          <h2 className="text-xl font-bold">المنتج غير موجود</h2>
          <Link href="/marketplace" className="inline-block px-6 py-2 bg-gold text-navy rounded-full font-bold">
            {text.backToMarket}
          </Link>
        </div>
      </main>
    );
  }

  const inWish = isInWishlist(product.id);
  const discountPercent =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  const handleVariantChange = (variantId: string, optionId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [variantId]: optionId }));
  };

  const getVariantLabel = () => {
    if (!product.variants || Object.keys(selectedVariants).length === 0) return undefined;
    const parts: string[] = [];
    product.variants.forEach((v) => {
      const optId = selectedVariants[v.id];
      const opt = v.options.find((o) => o.id === optId);
      if (opt) {
        parts.push(`${language === "ar" ? v.nameAr : v.nameEn}: ${language === "ar" ? opt.labelAr : opt.labelEn}`);
      }
    });
    return parts.join(" | ");
  };

  const handleAddToCart = () => {
    addToCart(
      { ...product, price: calculatedPrice },
      quantity,
      selectedVariants,
      getVariantLabel()
    );
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setReviewsList((prev) => [
      {
        id: `rev-${Date.now()}`,
        author: language === "ar" ? "أنت (مشترٍ موثق)" : "You (Verified Buyer)",
        rating: newRating,
        date: language === "ar" ? "الآن" : "Just now",
        comment: newComment,
      },
      ...prev,
    ]);
    setNewComment("");
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  // Related products from same category or store
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category_id === product.category_id || p.store_id === product.store_id))
    .slice(0, 4);

  return (
    <main className="noormexa-main py-8 md:py-12">
      <div className="noormexa-container space-y-10">
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex items-center justify-between text-xs text-muted border-b border-line pb-4">
          <Link
            href="/marketplace"
            className="flex items-center gap-1.5 font-bold text-foreground hover:text-gold transition-colors"
          >
            {language === "ar" ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
            <span>{text.backToMarket}</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-line hover:border-gold transition-colors"
          >
            <Share2 size={13} className="text-gold" />
            <span>{copiedShare ? text.shareSuccess : language === "ar" ? "مشاركة" : "Share"}</span>
          </button>
        </div>

        {/* Top Product Hero: Gallery + Purchasing Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left / Gallery Column (5 cols on lg) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Highlight Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface border border-line shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage || product.image_url || ""}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 start-4 flex flex-col gap-2">
                {discountPercent && (
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black shadow-md">
                    {discountPercent}% {text.saveDiscount}
                  </span>
                )}
                {product.is_featured && (
                  <span className="px-3 py-1 rounded-full bg-navy text-gold border border-gold/40 text-xs font-black flex items-center gap-1.5 shadow-md">
                    <Flame size={13} className="text-gold" />
                    <span>مميز</span>
                  </span>
                )}
              </div>

              {/* Wishlist button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 end-4 p-3 rounded-full bg-surface/90 backdrop-blur-md text-foreground hover:text-red-500 shadow-md transition-transform active:scale-90"
              >
                <Heart size={20} className={inWish ? "fill-red-500 text-red-500" : ""} />
              </button>
            </div>

            {/* Thumbnail selector */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      (activeImage || gallery[0]) === imgUrl ? "border-gold scale-105 shadow-md" : "border-line opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right / Product Info Column (7 cols on lg) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Store & Rating row */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-surface border border-line">
                  <StoreIcon size={16} className="text-gold" />
                </span>
                <span className="font-bold text-xs text-foreground">{product.store_name}</span>
                {store?.is_verified && (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-600/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-600/20">
                    <BadgeCheck size={11} />
                    <span>{text.verifiedStore}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-gold font-bold text-xs">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating || 5) ? "fill-gold text-gold" : "text-muted"}
                    />
                  ))}
                </div>
                <span>({product.reviews_count || 12} تقييم)</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground leading-snug">
                {language === "ar" ? product.name : product.name_en || product.name}
              </h1>
            </div>

            {/* Price section */}
            <div className="p-4 rounded-2xl bg-surface-soft border border-line flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    {formatPrice(calculatedPrice)}
                  </span>
                  {product.original_price && product.original_price > calculatedPrice && (
                    <span className="text-sm text-muted line-through font-medium">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
                {product.free_shipping && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
                    <Truck size={13} />
                    <span>{text.freeShipping}</span>
                  </div>
                )}
              </div>

              <div className="text-end">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  product.stock > 0 ? "bg-emerald-600/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                }`}>
                  {product.stock > 0 ? `${product.stock} ${text.stockAvailable}` : text.outOfStock}
                </span>
              </div>
            </div>

            {/* Variants Selectors (e.g. Colors, Sizes, Editions) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 border-y border-line py-4">
                {product.variants.map((v) => {
                  const currentSelected = selectedVariants[v.id] || v.options[0]?.id;
                  return (
                    <div key={v.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-foreground">
                        <span>{language === "ar" ? v.nameAr : v.nameEn}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {v.options.map((opt) => {
                          const active = currentSelected === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleVariantChange(v.id, opt.id)}
                              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                                active
                                  ? "bg-navy text-gold border-gold shadow-sm scale-102"
                                  : "bg-surface text-foreground border-line hover:border-gold/50"
                              }`}
                            >
                              {opt.colorCode && (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-line shadow-xs"
                                  style={{ backgroundColor: opt.colorCode }}
                                />
                              )}
                              <span>{language === "ar" ? opt.labelAr : opt.labelEn}</span>
                              {opt.priceDelta !== undefined && opt.priceDelta !== 0 && (
                                <span className="text-[10px] opacity-80">
                                  ({opt.priceDelta > 0 ? `+${formatPrice(opt.priceDelta)}` : formatPrice(opt.priceDelta)})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quantity Picker & Subtotal */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-surface border border-line">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-foreground">{text.quantity}</span>
                <div className="flex items-center border border-line rounded-xl overflow-hidden bg-surface-soft">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-surface disabled:opacity-40 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-extrabold text-sm text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2 hover:bg-surface disabled:opacity-40 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="text-end">
                <span className="text-[11px] text-muted block">{text.subtotal}</span>
                <span className="text-lg font-black text-foreground text-gold">
                  {formatPrice(calculatedPrice * quantity)}
                </span>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-6 rounded-2xl bg-surface border-2 border-gold text-foreground hover:bg-gold-soft font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
                >
                  <ShoppingCart size={17} className="text-gold" />
                  <span>{text.addToCart}</span>
                </button>

                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 dark:bg-navy dark:text-gold dark:hover:bg-gold dark:hover:text-navy"
                >
                  <Zap size={17} />
                  <span>{text.buyNow}</span>
                </button>
              </div>

              {addedNotice && (
                <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between animate-in fade-in">
                  <span className="flex items-center gap-2">
                    <Check size={16} />
                    <span>{text.addedToCartMsg}</span>
                  </span>
                  <Link href="/cart" className="underline font-black">
                    عرض السلة
                  </Link>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="p-4 rounded-2xl bg-surface-soft border border-line grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-gold shrink-0" />
                <span>{text.warrantyInfo}</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={18} className="text-gold shrink-0" />
                <span>شحن سريع مأمون عبر ناقلين دوليين معتمدين</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Specs / Description / Customer Reviews */}
        <div className="rounded-3xl bg-surface border border-line p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("specs")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === "specs"
                  ? "bg-amber-500 text-white border border-amber-600 shadow-sm dark:bg-navy dark:text-gold dark:border-gold/30"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {text.tabSpecs}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("desc")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === "desc"
                  ? "bg-amber-500 text-white border border-amber-600 shadow-sm dark:bg-navy dark:text-gold dark:border-gold/30"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {text.tabDesc}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === "reviews"
                  ? "bg-amber-500 text-white border border-amber-600 shadow-sm dark:bg-navy dark:text-gold dark:border-gold/30"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {text.tabReviews} ({reviewsList.length})
            </button>
          </div>

          {/* Tab 1: Specs */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.specs && product.specs.length > 0 ? (
                  product.specs.map((spec, i) => (
                    <div key={i} className="flex justify-between p-3.5 rounded-xl bg-surface-soft border border-line text-xs">
                      <span className="text-muted font-medium">{language === "ar" ? spec.labelAr : spec.labelEn}</span>
                      <span className="text-foreground font-bold">{language === "ar" ? spec.valueAr : spec.valueEn}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between p-3.5 rounded-xl bg-surface-soft border border-line text-xs">
                      <span className="text-muted font-medium">القسم</span>
                      <span className="text-foreground font-bold">{product.category_slug || "عام"}</span>
                    </div>
                    <div className="flex justify-between p-3.5 rounded-xl bg-surface-soft border border-line text-xs">
                      <span className="text-muted font-medium">رمز المنتج (SKU)</span>
                      <span className="text-foreground font-bold">{product.id}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Full Description */}
          {activeTab === "desc" && (
            <div className="text-sm leading-relaxed text-foreground space-y-4 max-w-3xl">
              <p>{language === "ar" ? product.description : product.description_en || product.description}</p>
              <p className="text-xs text-muted">
                جميع المنتجات المعروضة في منصة NOORMEXA تخضع لسياسة التحقق الفوري والفحص الدوري لضمان أعلى معايير الجودة والأصالة.
              </p>
            </div>
          )}

          {/* Tab 3: Reviews & Add Review */}
          {activeTab === "reviews" && (
            <div className="space-y-8">
              {/* Existing reviews */}
              <div className="space-y-3">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-surface-soft border border-line space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{rev.author}</span>
                      <span className="text-muted text-[11px]">{rev.date}</span>
                    </div>
                    <div className="flex items-center text-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} className={i < rev.rating ? "fill-gold text-gold" : "text-muted"} />
                      ))}
                    </div>
                    <p className="text-xs text-foreground">{rev.comment}</p>
                  </div>
                ))}
              </div>

              {/* Add Review Form */}
              <div className="p-5 rounded-2xl bg-surface border border-line space-y-4">
                <h4 className="font-bold text-sm text-foreground">{text.writeReview}</h4>
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{text.ratingScore}:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setNewRating(val)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            size={18}
                            className={val <= newRating ? "fill-gold text-gold" : "text-muted"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="اكتب تفاصيل تجربتك الصادقة مع هذا المنتج لمساعدة المتسوقين الآخرين..."
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line text-xs focus:outline-none focus:border-gold"
                    required
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-gold text-navy font-bold text-xs hover:bg-gold-strong shadow-sm transition-all"
                    >
                      {text.submitReview}
                    </button>
                  </div>

                  {reviewSubmitted && (
                    <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 text-xs font-bold">
                      {text.reviewSuccess}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-line">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles size={20} className="text-gold" />
              <span>{text.relatedProducts}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/marketplace/${rel.id}`}
                  className="group rounded-3xl bg-surface border border-line p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-surface-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={rel.image_url || ""} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="font-bold text-xs text-foreground line-clamp-2">{rel.name}</h4>
                  <div className="font-black text-sm text-gold">{formatPrice(rel.price)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
