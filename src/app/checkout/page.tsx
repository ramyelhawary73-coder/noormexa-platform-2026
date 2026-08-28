"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Check,
  CreditCard,
  Lock,
  Package,
  Printer,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Wallet,
  Zap,
  LocateFixed,
  AlertTriangle,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLocation } from "@/context/LocationContext";
import { requestUserGpsLocation } from "@/lib/locationService";
import type { PaymentGatewayKey, ShippingAddress, Order } from "@/types/marketplace";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    title: "الدفع الآمن وإتمام الطلب",
    subtitle: "أدخل بيانات الشحن الدولية واختر وسيلة الدفع المناسبة لإصدار الفاتورة الرسمية",
    shippingSection: "1. بيانات العميل وعنوان الشحن",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني للإشعار وتتبع الطلب",
    phone: "رقم الهاتف / واتساب",
    country: "الدولة",
    city: "المدينة / الإمارة",
    address: "العنوان بالتفصيل (اسم الشارع، البناية، الشقة)",
    postalCode: "الرمز البريدي (اختياري)",
    notes: "ملاحظات خاصة بمندوب الشحن (اختياري)",
    speedSection: "2. سرعة وطريقة الشحن",
    standardSpeed: "الشحن القياسي المعتمد (3-5 أيام عمل)",
    prioritySpeed: "الشحن السريع ذو الأولوية (Priority Express 24-48 ساعة)",
    paymentSection: "3. اختيار بوابة الدفع الآمنة",
    orderSummary: "ملخص الطلب والفاتورة",
    itemsCount: "منتجات",
    subtotal: "المجموع الفرعي",
    discount: "الخصم المطبق",
    shipping: "تكلفة الشحن",
    vat: "ضريبة القيمة المضافة",
    grandTotal: "المبلغ الإجمالي المطلوب",
    confirmOrder: "تأكيد الطلب وإصدار الفاتورة الفورية",
    processing: "جاري معالجة الطلب الآمن...",
    successTitle: "تم تأكيد طلبك بنجاح!",
    successSubtitle: "تم تسجيل الطلب وتعيين رقم تتبع للشحنة وفاتورة إلكترونية رسمية.",
    orderNumber: "رقم الطلب المرجعي:",
    trackingNumber: "رقم تتبع الشحنة:",
    carrier: "شركة الشحن:",
    trackOrderBtn: "تتبع حالة شحنتك الآن",
    printInvoice: "طباعة الفاتورة الإلكترونية",
    backToMarket: "العودة للتسوق",
  },
  en: {
    title: "Secure International Checkout",
    subtitle: "Provide international shipping details and select your preferred payment gateway",
    shippingSection: "1. Customer & Shipping Address",
    fullName: "Full Name",
    email: "Email for Order Notifications",
    phone: "Phone / WhatsApp Number",
    country: "Country",
    city: "City / State",
    address: "Detailed Street Address & Apartment",
    postalCode: "Postal Code (Optional)",
    notes: "Delivery Instructions (Optional)",
    speedSection: "2. Shipping Speed & Logistics",
    standardSpeed: "Standard International Delivery (3-5 Business Days)",
    prioritySpeed: "Priority Express Dispatch (24-48 Hours Delivery)",
    paymentSection: "3. Secure Payment Gateway Selection",
    orderSummary: "Order & Invoice Summary",
    itemsCount: "items",
    subtotal: "Subtotal",
    discount: "Discount",
    shipping: "Shipping Cost",
    vat: "Value Added Tax (VAT)",
    grandTotal: "Grand Total Due",
    confirmOrder: "Confirm Order & Generate Invoice",
    processing: "Processing secure order...",
    successTitle: "Order Confirmed Successfully!",
    successSubtitle: "Your order has been placed with official tracking code and digital tax invoice.",
    orderNumber: "Order Reference:",
    trackingNumber: "Tracking Code:",
    carrier: "Logistics Carrier:",
    trackOrderBtn: "Track Order Status Live",
    printInvoice: "Print Official Invoice",
    backToMarket: "Return to Marketplace",
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

export default function CheckoutPage() {
  const router = useRouter();
  const language = useNoormexaLanguage();
  const text = copy[language];

  const {
    cartItems,
    cartSubtotal,
    calculatedDiscount,
    calculatedShipping,
    calculatedVat,
    calculatedGrandTotal,
    formatPrice,
    settings,
    createOrder,
  } = useMarketplace();

  const { location: globalLocation } = useLocation();

  // Form State
  const [shippingSpeed, setShippingSpeed] = useState<"standard" | "priority">("standard");
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayKey>("applePayMada");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // GPS Auto-Fill feedback state
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsFeedback, setGpsFeedback] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "رامي الهواري",
    email: "ramy@example.com",
    phone: "+966 50 123 4567",
    country: globalLocation?.countryAr || "المملكة العربية السعودية",
    city: globalLocation?.cityAr || "الرياض",
    address: "طريق الملك فهد، برج الفيصلية، حي العليا",
    postalCode: "12214",
    notes: "يرجى الاتصال قبل الوصول بنصف ساعة",
  });

  const handleGpsAutoFill = async () => {
    setIsLocatingGps(true);
    setGpsFeedback(null);

    try {
      const result = await requestUserGpsLocation(language);
      setIsLocatingGps(false);

      if (result.success && result.location) {
        const loc = result.location;
        const accuracyText = loc.accuracyMeters ? `(±${Math.round(loc.accuracyMeters)}متر)` : "";
        
        setAddress((prev) => ({
          ...prev,
          country: loc.countryAr || prev.country,
          city: loc.cityAr || prev.city,
          address: `${loc.cityAr} - موقع محدد بدقة GPS`,
        }));

        setGpsFeedback({
          type: "success",
          message: language === "ar"
            ? `تم التقاط وتعبئة الموقع بدقة عبر GPS: ${loc.cityAr}، ${loc.countryAr} ${accuracyText}`
            : `GPS Location detected and populated: ${loc.cityEn}, ${loc.countryEn} (accuracy: ±${Math.round(loc.accuracyMeters || 10)}m)`,
        });
      } else {
        setGpsFeedback({
          type: result.isPermissionDenied ? "warning" : "error",
          message:
            (language === "ar" ? result.errorMessageAr : result.errorMessageEn) ||
            (language === "ar" ? "تعذر استقبال إشارة GPS." : "Could not acquire GPS signal."),
        });
      }
    } catch {
      setIsLocatingGps(false);
      setGpsFeedback({
        type: "error",
        message: language === "ar" ? "حدث خطأ غير متوقع أثناء تحديد الموقع." : "Unexpected error during geolocation.",
      });
    }
  };

  const availableGateways = Object.values(settings.gateways).filter((g) => g.enabled);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 && !completedOrder) {
      router.push("/cart");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const res = createOrder(address, selectedGateway, shippingSpeed);
      setIsProcessing(false);
      if (res.order) {
        setCompletedOrder(res.order);
      }
    }, 1200);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // If order is completed, display the Luxury Confirmation & Invoice Screen
  if (completedOrder) {
    return (
      <main className="noormexa-main py-10 md:py-16">
        <div className="noormexa-container max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95">
          {/* Success Banner */}
          <div className="text-center p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Check size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{text.successTitle}</h1>
            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">{text.successSubtitle}</p>

            <div className="p-4 rounded-2xl bg-surface-soft border border-line grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-start">
              <div>
                <span className="text-muted block text-[10px]">{text.orderNumber}</span>
                <span className="font-mono font-bold text-foreground">{completedOrder.orderNumber}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">{text.trackingNumber}</span>
                <span className="font-mono font-bold text-gold">{completedOrder.trackingNumber}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">{text.carrier}</span>
                <span className="font-bold text-foreground">{completedOrder.carrier}</span>
              </div>
            </div>
          </div>

          {/* Official Invoice Card */}
          <div className="p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 print:border-none print:shadow-none">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-lg font-black text-gold tracking-widest font-sans">NOORMEXA</span>
                <span className="block text-[10px] text-muted">فاتورة إلكترونية ضريبية معتمدة</span>
              </div>
              <div className="text-end text-xs text-muted">
                <span>التاريخ: {new Date(completedOrder.created_at).toLocaleDateString("ar-EG")}</span>
              </div>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-surface-soft border border-line space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase">بيانات العميل المستلم:</span>
                <p className="font-bold text-foreground">{completedOrder.shipping_info.fullName}</p>
                <p className="text-muted">{completedOrder.shipping_info.phone}</p>
                <p className="text-muted">{completedOrder.shipping_info.email}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-soft border border-line space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase">عنوان التوصيل:</span>
                <p className="font-bold text-foreground">{completedOrder.shipping_info.country} - {completedOrder.shipping_info.city}</p>
                <p className="text-muted">{completedOrder.shipping_info.address}</p>
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="border border-line rounded-2xl overflow-hidden text-xs">
              <div className="bg-surface-soft p-3 font-bold text-foreground border-b border-line flex justify-between">
                <span>المنتج والوصف</span>
                <span>المجموع</span>
              </div>
              <div className="divide-y divide-line">
                {completedOrder.items.map((it) => (
                  <div key={it.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{it.product_name}</p>
                      {it.selected_variants_label && (
                        <p className="text-[10px] text-muted">{it.selected_variants_label}</p>
                      )}
                      <p className="text-[11px] text-muted">
                        الكمية: {it.quantity} × {formatPrice(it.unit_price)}
                      </p>
                    </div>
                    <span className="font-bold text-foreground text-gold">
                      {formatPrice(it.unit_price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice Financial Total */}
            <div className="p-4 rounded-2xl bg-surface-soft border border-line space-y-2 text-xs text-muted">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-foreground">{formatPrice(completedOrder.subtotal)}</span>
              </div>
              {completedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>الخصم المطبق:</span>
                  <span>-{formatPrice(completedOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>تكلفة الشحن ({completedOrder.shipping_speed === "priority" ? "أولوية سريعة" : "شحن قياسي"}):</span>
                <span className="font-bold text-foreground">{formatPrice(completedOrder.shipping_cost)}</span>
              </div>
              {completedOrder.vat_amount > 0 && (
                <div className="flex justify-between">
                  <span>ضريبة القيمة المضافة (14% VAT):</span>
                  <span className="font-bold text-foreground">{formatPrice(completedOrder.vat_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-foreground border-t border-line pt-2">
                <span>الإجمالي النهائي المدفوع:</span>
                <span className="text-gold">{formatPrice(completedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2 print:hidden">
              <Link
                href={`/shipping?track=${completedOrder.trackingNumber}`}
                className="flex-1 py-3 px-4 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all text-center"
              >
                <Truck size={15} />
                <span>{text.trackOrderBtn} ({completedOrder.carrier || "Global Logistics Hub"})</span>
              </Link>

              <button
                type="button"
                onClick={handlePrint}
                className="py-3 px-5 rounded-xl bg-surface border border-line text-foreground hover:border-gold font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Printer size={15} />
                <span>{text.printInvoice}</span>
              </button>

              <Link
                href="/marketplace"
                className="py-3 px-5 rounded-xl bg-surface border border-line text-muted hover:text-foreground font-bold text-xs flex items-center gap-2 transition-all"
              >
                <span>{text.backToMarket}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <main className="noormexa-main py-16 text-center">
        <div className="noormexa-container max-w-md mx-auto space-y-4">
          <Package size={48} className="mx-auto text-muted" />
          <h2 className="text-xl font-bold text-foreground">السلة فارغة</h2>
          <p className="text-xs text-muted">يرجى إضافة منتجات إلى السلة للمتابعة إلى صفحة الدفع.</p>
          <Link href="/marketplace" className="inline-block px-6 py-2.5 bg-gold text-navy font-bold rounded-full text-xs">
            الذهاب إلى السوق
          </Link>
        </div>
      </main>
    );
  }

  const shippingCost = calculatedShipping(shippingSpeed);
  const grandTotal = calculatedGrandTotal(shippingSpeed);

  return (
    <main className="noormexa-main py-8 md:py-12">
      <div className="noormexa-container space-y-8">
        {/* Header */}
        <div className="border-b border-line pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {text.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">{text.subtitle}</p>
        </div>

        <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Customer & Address */}
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Truck size={17} className="text-gold" />
                  <span>{text.shippingSection}</span>
                </h2>

                {/* GPS Auto-Fill Action Button */}
                <button
                  type="button"
                  onClick={handleGpsAutoFill}
                  disabled={isLocatingGps}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                  title={language === "ar" ? "تحديد الموقع وتعبئة العنوان تلقائياً عبر GPS" : "Detect and auto-fill address via GPS"}
                >
                  <LocateFixed size={14} className={isLocatingGps ? "animate-spin text-orange-500" : "text-orange-500"} />
                  <span>
                    {isLocatingGps
                      ? language === "ar" ? "جاري التقاط GPS..." : "Detecting GPS..."
                      : language === "ar" ? "تحديد العنوان عبر GPS" : "Auto-fill with GPS"}
                  </span>
                </button>
              </div>

              {/* Real-time GPS Detection Feedback Banner */}
              {gpsFeedback && (
                <div
                  className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                    gpsFeedback.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : gpsFeedback.type === "warning"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                      : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                  }`}
                >
                  {gpsFeedback.type === "success" ? (
                    <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{gpsFeedback.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGpsFeedback(null)}
                    className="text-muted hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.fullName} *</label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.email} *</label>
                  <input
                    type="email"
                    required
                    value={address.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.phone} *</label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.country} *</label>
                  <select
                    value={address.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  >
                    <option value="المملكة العربية السعودية">المملكة العربية السعودية (KSA)</option>
                    <option value="الإمارات العربية المتحدة">الإمارات العربية المتحدة (UAE)</option>
                    <option value="جمهورية مصر العربية">جمهورية مصر العربية (Egypt)</option>
                    <option value="دولة الكويت">دولة الكويت (Kuwait)</option>
                    <option value="دولة قطر">دولة قطر (Qatar)</option>
                    <option value="مملكة البحرين">مملكة البحرين (Bahrain)</option>
                    <option value="سلطنة عمان">سلطنة عمان (Oman)</option>
                    <option value="الولايات المتحدة / أوروبا">الولايات المتحدة / أوروبا (Global)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.city} *</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.postalCode}</label>
                  <input
                    type="text"
                    value={address.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-foreground">{text.address} *</label>
                  <input
                    type="text"
                    required
                    value={address.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="رقم المبنى، اسم الشارع، الطابق..."
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-foreground">{text.notes}</label>
                  <input
                    type="text"
                    value={address.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="ملاحظات المندوب لتسهيل الاستلام..."
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Shipping Speed Selector */}
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
                <Zap size={17} className="text-gold" />
                <span>{text.speedSection}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setShippingSpeed("standard")}
                  className={`p-4 rounded-2xl border text-start transition-all ${
                    shippingSpeed === "standard"
                      ? "bg-gold-soft border-gold text-foreground shadow-sm"
                      : "bg-surface-soft border-line hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{text.standardSpeed}</span>
                    {shippingSpeed === "standard" && <Check size={16} className="text-gold-strong" />}
                  </div>
                  <p className="text-[11px] text-muted mt-1">تسليم اعتيادي مأمون خلال 3-5 أيام</p>
                  <span className="font-black text-xs text-gold mt-2 block">
                    {calculatedShipping("standard") === 0 ? "مجاناً" : formatPrice(calculatedShipping("standard"))}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingSpeed("priority")}
                  className={`p-4 rounded-2xl border text-start transition-all ${
                    shippingSpeed === "priority"
                      ? "bg-gold-soft border-gold text-foreground shadow-sm"
                      : "bg-surface-soft border-line hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles size={13} className="text-gold" />
                      <span>{text.prioritySpeed}</span>
                    </span>
                    {shippingSpeed === "priority" && <Check size={16} className="text-gold-strong" />}
                  </div>
                  <p className="text-[11px] text-muted mt-1">معالجة فورية وأولوية شحن طيران خلال 24-48 ساعة</p>
                  <span className="font-black text-xs text-gold mt-2 block">
                    {formatPrice(calculatedShipping("priority"))}
                  </span>
                </button>
              </div>
            </div>

            {/* Section 3: Payment Gateways Selector */}
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
                <CreditCard size={17} className="text-gold" />
                <span>{text.paymentSection}</span>
              </h2>

              <div className="space-y-3">
                {availableGateways.map((gw) => {
                  const active = selectedGateway === gw.key;
                  return (
                    <button
                      key={gw.key}
                      type="button"
                      onClick={() => setSelectedGateway(gw.key)}
                      className={`w-full p-4 rounded-2xl border text-start flex items-center justify-between gap-3 transition-all ${
                        active
                          ? "bg-amber-500 text-white border-amber-600 shadow-md scale-101 dark:bg-navy dark:text-gold dark:border-gold"
                          : "bg-surface-soft border-line text-foreground hover:border-amber-500/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${
                          active
                            ? "bg-white/20 text-white border-white/30 dark:bg-surface dark:border-line dark:text-gold"
                            : "bg-surface border border-line text-amber-600 dark:text-gold"
                        }`}>
                          {gw.key === "applePayMada" ? (
                            <Smartphone size={18} />
                          ) : gw.key === "stripe" ? (
                            <CreditCard size={18} />
                          ) : gw.key === "tabbyTamara" ? (
                            <Sparkles size={18} />
                          ) : gw.key === "paypal" ? (
                            <Wallet size={18} />
                          ) : (
                            <Banknote size={18} />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm">
                              {language === "ar" ? gw.nameAr : gw.nameEn}
                            </span>
                            {gw.badge && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                active
                                  ? "bg-white/25 text-white dark:bg-gold-soft dark:text-gold-strong"
                                  : "bg-amber-500/10 text-amber-800 dark:bg-gold-soft dark:text-gold-strong"
                              }`}>
                                {gw.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] line-clamp-1 mt-0.5 ${
                            active ? "text-white/90 dark:text-gold/80" : "text-muted"
                          }`}>
                            {language === "ar" ? gw.descriptionAr : gw.descriptionEn}
                          </p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        active ? "border-white bg-white text-amber-600 dark:border-gold dark:bg-gold dark:text-navy" : "border-line"
                      }`}>
                        {active && <Check size={12} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Submit (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6 sticky top-24">
              <h2 className="text-base font-bold text-foreground flex items-center justify-between border-b border-line pb-3">
                <span>{text.orderSummary}</span>
                <span className="text-xs text-muted font-normal">
                  ({cartItems.length} {text.itemsCount})
                </span>
              </h2>

              {/* Items Compact Preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pe-1 divide-y divide-line/60">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-soft border border-line shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl || ""} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate max-w-[170px]">
                        <p className="font-bold text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2.5 text-xs text-muted border-t border-line pt-4">
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
                    {shippingCost === 0 ? "مجاناً" : formatPrice(shippingCost)}
                  </span>
                </div>

                {calculatedVat > 0 && (
                  <div className="flex justify-between">
                    <span>{text.vat} (14%)</span>
                    <span className="font-bold text-foreground">{formatPrice(calculatedVat)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-black text-foreground border-t border-line pt-3">
                  <span>{text.grandTotal}</span>
                  <span className="text-gold text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Confirm Order Button */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-gold text-navy hover:bg-gold-strong font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-60"
                >
                  <Lock size={16} />
                  <span>{isProcessing ? text.processing : text.confirmOrder}</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-muted">
                  <ShieldCheck size={14} className="text-gold" />
                  <span>شهادة أمان تشفير المعاملات SSL 256-bit</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
