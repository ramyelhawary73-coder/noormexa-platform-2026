"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store as StoreIcon,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    title: "سلة التسوق الذكية",
    subtitle: "راجع منتجاتك المختارة وفعّل كوبونات الخصم قبل إتمام الطلب الآمن",
    emptyCartTitle: "سلة التسوق فارغة حالياً",
    emptyCartDesc: "لم تقم بإضافة أي منتجات إلى سلتك بعد. تصفح آلاف المنتجات المميزة في سوق NOORMEXA العالمي.",
    startShopping: "ابدأ التسوق الآن",
    freeShippingQualified: "🎉 تهانينا! لقد حصلت على شحن قياسي مجاني بالكامل على هذا الطلب!",
    freeShippingProgress: "أضف بقيمة",
    freeShippingMore: "للحصول على شحن مجاني!",
    itemQuantity: "الكمية",
    remove: "حذف",
    clearCart: "إفراغ السلة بالكامل",
    orderSummary: "ملخص الطلب المالي",
    subtotal: "المجموع الفرعي للمنتجات",
    discount: "خصم الكوبون الترويجي",
    shipping: "تكلفة الشحن التقديرية",
    vat: "ضريبة القيمة المضافة (VAT)",
    total: "الإجمالي النهائي الدقيق",
    promoPlaceholder: "أدخل كود الخصم (مثال: NOOR10)...",
    apply: "تطبيق",
    removePromo: "إلغاء الكود",
    proceedToCheckout: "الانتقال إلى الدفع الآمن (Checkout)",
    continueShopping: "متابعة التسوق",
    secureCheckoutBadge: "دفع دولي آمن ومشفر 100%",
  },
  en: {
    title: "Smart Shopping Cart",
    subtitle: "Review your selected items and apply promotional vouchers before checkout",
    emptyCartTitle: "Your Shopping Cart is Empty",
    emptyCartDesc: "You haven't added any products to your cart yet. Explore thousands of luxury goods in the NOORMEXA marketplace.",
    startShopping: "Start Shopping Now",
    freeShippingQualified: "🎉 Congratulations! You have unlocked 100% Free Standard Shipping on this order!",
    freeShippingProgress: "Add",
    freeShippingMore: "more to qualify for Free Shipping!",
    itemQuantity: "Quantity",
    remove: "Remove",
    clearCart: "Clear Entire Cart",
    orderSummary: "Order Summary",
    subtotal: "Items Subtotal",
    discount: "Promo Discount",
    shipping: "Estimated Shipping",
    vat: "Value Added Tax (VAT)",
    total: "Grand Total",
    promoPlaceholder: "Enter promo code (e.g., NOOR10)...",
    apply: "Apply",
    removePromo: "Remove Promo",
    proceedToCheckout: "Proceed to Secure Checkout",
    continueShopping: "Continue Shopping",
    secureCheckoutBadge: "100% Encrypted & Safe Global Checkout",
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

export default function CartPage() {
  const language = useNoormexaLanguage();
  const text = copy[language];

  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    formatPrice,
    cartSubtotal,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    calculatedDiscount,
    calculatedShipping,
    calculatedVat,
    calculatedGrandTotal,
    freeShippingProgress,
  } = useMarketplace();

  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMessage({
      success: res.success,
      text: language === "ar" ? res.messageAr : res.messageEn,
    });
    if (res.success) setPromoInput("");
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoMessage(null);
  };

  if (cartItems.length === 0) {
    return (
      <main className="noormexa-main py-16 text-center">
        <div className="noormexa-container max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-gold-soft text-gold-strong flex items-center justify-center mx-auto shadow-sm">
            <ShoppingCart size={36} />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">{text.emptyCartTitle}</h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">{text.emptyCartDesc}</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-navy text-gold hover:bg-gold hover:text-navy font-bold text-xs sm:text-sm transition-all shadow-md"
          >
            <ShoppingBag size={16} />
            <span>{text.startShopping}</span>
          </Link>
        </div>
      </main>
    );
  }

  const shippingCost = calculatedShipping("standard");
  const vatAmount = calculatedVat;
  const grandTotal = calculatedGrandTotal("standard");

  return (
    <main className="noormexa-main py-8 md:py-12">
      <div className="noormexa-container space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {text.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">{text.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 size={13} />
              <span>{text.clearCart}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Free Shipping Progress Bar */}
        <div className="p-4 rounded-3xl bg-surface border border-line shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span className="flex items-center gap-2">
              <Truck size={16} className="text-gold" />
              <span>
                {freeShippingProgress.percentage >= 100
                  ? text.freeShippingQualified
                  : `${text.freeShippingProgress} ${formatPrice(freeShippingProgress.needed)} ${text.freeShippingMore}`}
              </span>
            </span>
            <span className="text-gold font-extrabold">{freeShippingProgress.percentage}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-surface-soft overflow-hidden border border-line">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] to-[#e6c25f] rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress.percentage}%` }}
            />
          </div>
        </div>

        {/* Layout: Items Table (7 cols) + Financial Summary (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {cartItems.map((item, idx) => (
              <div
                key={`${item.productId}-${idx}`}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-surface border border-line shadow-sm hover:border-gold/40 transition-all"
              >
                {/* Thumbnail & Titles */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-surface-soft border border-line shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl || ""} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1 text-[11px] text-muted">
                      <StoreIcon size={11} className="text-gold" />
                      <span className="truncate">{item.storeName}</span>
                    </div>

                    <Link
                      href={`/marketplace/${item.productId}`}
                      className="font-bold text-sm text-foreground hover:text-gold transition-colors line-clamp-1 block"
                    >
                      {language === "ar" ? item.name : item.nameEn || item.name}
                    </Link>

                    {item.selectedVariantsLabel && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-surface-soft border border-line text-[10px] text-muted font-medium">
                        {item.selectedVariantsLabel}
                      </span>
                    )}

                    <div className="text-xs font-black text-gold block sm:hidden">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-line/60">
                  <div className="flex items-center border border-line rounded-xl overflow-hidden bg-surface-soft">
                    <button
                      type="button"
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        updateCartQuantity(
                          item.productId,
                          item.quantity - 1,
                          item.selectedVariants ? JSON.stringify(item.selectedVariants) : undefined
                        )
                      }
                      className="p-1.5 hover:bg-surface disabled:opacity-40 transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-foreground">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.maxStock}
                      onClick={() =>
                        updateCartQuantity(
                          item.productId,
                          item.quantity + 1,
                          item.selectedVariants ? JSON.stringify(item.selectedVariants) : undefined
                        )
                      }
                      className="p-1.5 hover:bg-surface disabled:opacity-40 transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="hidden sm:block text-end min-w-[90px]">
                    <span className="text-xs font-black text-foreground text-gold block">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <span className="text-[10px] text-muted">{formatPrice(item.price)} / للقطعة</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeFromCart(
                        item.productId,
                        item.selectedVariants ? JSON.stringify(item.selectedVariants) : undefined
                      )
                    }
                    className="p-2 text-muted hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
                    title={text.remove}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-gold transition-colors"
              >
                {language === "ar" ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                <span>{text.continueShopping}</span>
              </Link>
            </div>
          </div>

          {/* Financial Summary & Promo Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
                <CreditCard size={18} className="text-gold" />
                <span>{text.orderSummary}</span>
              </h2>

              {/* Promo Code Input */}
              <div className="space-y-2">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder={text.promoPlaceholder}
                      className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-surface-soft border border-line text-xs font-bold uppercase focus:outline-none focus:border-gold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-navy text-gold hover:bg-gold hover:text-navy text-xs font-bold transition-all shadow-sm"
                  >
                    {text.apply}
                  </button>
                </form>

                {/* Available Promo hints for testing */}
                <div className="text-[11px] text-muted flex flex-wrap gap-1.5 pt-1">
                  <span>كوبونات نشطة:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoInput("NOOR10");
                      applyPromoCode("NOOR10");
                    }}
                    className="underline text-gold font-bold hover:opacity-80"
                  >
                    NOOR10
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoInput("WELCOME20");
                      applyPromoCode("WELCOME20");
                    }}
                    className="underline text-gold font-bold hover:opacity-80"
                  >
                    WELCOME20
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoInput("FREESHIP");
                      applyPromoCode("FREESHIP");
                    }}
                    className="underline text-gold font-bold hover:opacity-80"
                  >
                    FREESHIP
                  </button>
                </div>

                {appliedPromo && (
                  <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Check size={14} />
                      <span>
                        {appliedPromo.code} ({language === "ar" ? appliedPromo.descriptionAr : appliedPromo.descriptionEn})
                      </span>
                    </span>
                    <button type="button" onClick={handleRemovePromo} className="text-red-500 hover:opacity-80">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {promoMessage && !promoMessage.success && (
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-medium">
                    {promoMessage.text}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-xs text-muted border-t border-line pt-4">
                <div className="flex justify-between">
                  <span>{text.subtotal}</span>
                  <span className="font-bold text-foreground">{formatPrice(cartSubtotal)}</span>
                </div>

                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{text.discount}</span>
                    <span>-{formatPrice(calculatedDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{text.shipping}</span>
                  <span className="font-bold text-foreground">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600 font-black">مجاناً</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>

                {vatAmount > 0 && (
                  <div className="flex justify-between">
                    <span>{text.vat} (14%)</span>
                    <span className="font-bold text-foreground">{formatPrice(vatAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm sm:text-base font-black text-foreground border-t border-line pt-3">
                  <span>{text.total}</span>
                  <span className="text-gold text-lg font-black">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className="space-y-3 pt-2">
                <Link
                  href="/checkout"
                  className="w-full py-4 rounded-2xl bg-gold text-navy hover:bg-gold-strong font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <ShoppingBag size={18} />
                  <span>{text.proceedToCheckout}</span>
                </Link>

                <div className="flex items-center justify-center gap-2 text-[11px] text-muted">
                  <ShieldCheck size={14} className="text-gold" />
                  <span>{text.secureCheckoutBadge}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
