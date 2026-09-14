"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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
  MapPin,
  Search,
  UserCheck,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";
import { requestUserGpsLocation } from "@/lib/locationService";
import type { PaymentGatewayKey, ShippingAddress, Order } from "@/types/marketplace";
import ProductImage from "@/components/ProductImage";

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
  const { user, profile } = useAuth();

  // Form State
  const [shippingSpeed, setShippingSpeed] = useState<"standard" | "priority">("standard");
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayKey>("applePayMada");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Address search & GPS states
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [gpsFeedback, setGpsFeedback] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // Initialize address cleanly with NO hardcoded developer data
  const [address, setAddress] = useState<ShippingAddress>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("noormexa_saved_shipping_address");
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            fullName: parsed.fullName || "",
            email: parsed.email || "",
            phone: parsed.phone || "",
            country: parsed.country || "المملكة العربية السعودية",
            city: parsed.city || "الرياض",
            address: parsed.address || "",
            postalCode: parsed.postalCode || "",
            notes: parsed.notes || "",
          };
        }
      } catch {}
    }
    return {
      fullName: "",
      email: "",
      phone: "",
      country: "المملكة العربية السعودية",
      city: "الرياض",
      address: "",
      postalCode: "",
      notes: "",
    };
  });

  // Auto-populate customer information dynamically from authenticated user / profile
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active || (!user && !profile)) return;

      setAddress((prev) => {
        const updated = { ...prev };
        const userEmail = user?.email || "";
        const meta = (user?.user_metadata || {}) as Record<string, unknown>;
        const userName =
          (profile?.full_name as string) ||
          (meta.full_name as string) ||
          (userEmail ? userEmail.split("@")[0] : "");
        const userPhone =
          (profile?.phone as string) ||
          (meta.phone as string) ||
          "";

        let changed = false;
        if (!updated.email && userEmail) {
          updated.email = userEmail;
          changed = true;
        }
        if (!updated.fullName && userName) {
          updated.fullName = userName;
          changed = true;
        }
        if (!updated.phone && userPhone) {
          updated.phone = userPhone;
          changed = true;
        }
        return changed ? updated : prev;
      });
    });

    return () => {
      active = false;
    };
  }, [user, profile]);

  // Sync detected country & city if address city is still default
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active || !globalLocation) return;

      setAddress((prev) => {
        if (!prev.city || prev.city === "الرياض") {
          return {
            ...prev,
            country: globalLocation.countryAr || prev.country,
            city: globalLocation.cityAr || prev.city,
          };
        }
        return prev;
      });
    });

    return () => {
      active = false;
    };
  }, [globalLocation]);

  // Non-blocking high-speed GPS Geolocation auto-fill via Google Maps & Server Geocoding
  const handleGpsAutoFill = async () => {
    setIsLocatingGps(true);
    setGpsFeedback(null);

    try {
      const result = await requestUserGpsLocation(language);
      setIsLocatingGps(false);

      if (result.success && result.location) {
        const loc = result.location;
        const accuracyText = loc.accuracyMeters ? `(±${Math.round(loc.accuracyMeters)}متر)` : "";

        // Construct complete detailed address
        let resolvedAddress = loc.formattedAddress || "";
        if (!resolvedAddress) {
          const parts = [loc.street, loc.district, loc.cityAr].filter(Boolean);
          resolvedAddress = parts.length > 0 ? parts.join("، ") : `${loc.cityAr}، ${loc.countryAr}`;
        }

        setAddress((prev) => ({
          ...prev,
          country: loc.countryAr || prev.country,
          city: loc.cityAr || prev.city,
          address: resolvedAddress,
          postalCode: loc.postalCode || prev.postalCode,
        }));

        setGpsFeedback({
          type: "success",
          message: language === "ar"
            ? `تم التقاط وتعبئة العنوان بدقة من الخريطة: ${resolvedAddress} ${accuracyText}`
            : `Location resolved from map: ${resolvedAddress} ${accuracyText}`,
        });
      } else {
        setGpsFeedback({
          type: result.isPermissionDenied ? "warning" : "error",
          message:
            (language === "ar" ? result.errorMessageAr : result.errorMessageEn) ||
            (language === "ar" ? "تعذر استقبال إشارة GPS، يرجى كتابة العنوان أو البحث عنه بالخريطة." : "Could not acquire GPS signal. You can type or search on map."),
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

  // Google Maps / Geocoding Search by text/district/street
  const handleAddressSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = addressSearchQuery.trim();
    if (!query) return;

    setIsSearchingAddress(true);
    setGpsFeedback(null);

    try {
      const res = await fetch(`/api/geocode?query=${encodeURIComponent(query)}&locale=${language}`);
      setIsSearchingAddress(false);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.formattedAddress) {
          setAddress((prev) => ({
            ...prev,
            address: data.formattedAddress,
          }));
          setShowAddressSearch(false);
          setAddressSearchQuery("");
          setGpsFeedback({
            type: "success",
            message: language === "ar"
              ? `تم العثور على العنوان وتحديده: ${data.formattedAddress}`
              : `Address located: ${data.formattedAddress}`,
          });
          return;
        }
      }

      setGpsFeedback({
        type: "warning",
        message: language === "ar"
          ? "لم نتمكن من العثور على هذا العنوان بدقة، يرجى كتابته يدوياً في خانة العنوان."
          : "Could not find this exact location. Please type it in the address field.",
      });
    } catch {
      setIsSearchingAddress(false);
      setGpsFeedback({
        type: "error",
        message: language === "ar" ? "تعذر الاتصال بخدمة الخرائط حالياً." : "Could not reach map search service.",
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

    // Save shipping address for user future sessions
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("noormexa_saved_shipping_address", JSON.stringify(address));
      }
    } catch {}

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                    <Truck size={17} className="text-gold" />
                    <span>{text.shippingSection}</span>
                  </h2>
                  {user && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/10 text-gold text-[11px] font-semibold border border-gold/20">
                      <UserCheck size={12} />
                      <span className="max-w-[200px] truncate">{user.email}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Map Search Action Button */}
                  <button
                    type="button"
                    onClick={() => setShowAddressSearch((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-400 font-bold text-xs transition-all cursor-pointer"
                    title={language === "ar" ? "البحث بالخريطة وتعبئة العنوان" : "Search address on map"}
                  >
                    <MapPin size={13} className="text-sky-500" />
                    <span>{language === "ar" ? "البحث بالخريطة" : "Search Map"}</span>
                  </button>

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
                        ? language === "ar" ? "جاري التقاط الموقع..." : "Detecting GPS..."
                        : language === "ar" ? "تحديد العنوان عبر GPS" : "Auto-fill with GPS"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Map Address Search Bar */}
              {showAddressSearch && (
                <div className="p-3.5 rounded-2xl bg-surface-soft border border-sky-500/30 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <MapPin size={13} className="text-sky-500" />
                      <span>{language === "ar" ? "البحث عن العنوان عبر خرائط جوجل والمنظومة الجغرافية" : "Search address via Google Maps"}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddressSearch(false)}
                      className="text-muted hover:text-foreground text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={addressSearchQuery}
                      onChange={(e) => setAddressSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddressSearch();
                        }
                      }}
                      placeholder={language === "ar" ? "اكتب اسم الحي أو الشارع أو المعلم (مثال: برج المملكة، حي العليا الرياض، المعادي)..." : "Type district, street, or landmark (e.g. Al Olaya Riyadh)..."}
                      className="flex-1 p-2.5 rounded-xl bg-surface border border-line text-xs text-foreground focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddressSearch()}
                      disabled={isSearchingAddress || !addressSearchQuery.trim()}
                      className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {isSearchingAddress ? (
                        <span className="animate-spin text-xs">⏳</span>
                      ) : (
                        <Search size={14} />
                      )}
                      <span>{language === "ar" ? "بحث وتعبئة" : "Search"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Real-time GPS/Map Detection Feedback Banner */}
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
                    placeholder={language === "ar" ? "الاسم الكامل للمستلم" : "Recipient full name"}
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
                    placeholder="name@example.com"
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
                    placeholder="+966 5X XXX XXXX"
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
                    placeholder={language === "ar" ? "الرياض، جدة، القاهرة..." : "City"}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.postalCode}</label>
                  <input
                    type="text"
                    value={address.postalCode}
                    placeholder="12214"
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
                    placeholder={language === "ar" ? "رقم المبنى، اسم الشارع، الحي، رقم الشقة..." : "Building number, Street name, District..."}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-foreground">{text.notes}</label>
                  <input
                    type="text"
                    value={address.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder={language === "ar" ? "ملاحظات المندوب لتسهيل الاستلام (اختياري)..." : "Delivery instructions (optional)..."}
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
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-soft border border-line shrink-0 relative">
                        <ProductImage
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="40px"
                          className="w-full h-full object-cover"
                        />
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
                  className="w-full py-4 rounded-2xl bg-gold text-navy hover:bg-gold-strong font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer"
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

      {/* Mobile Sticky Confirm Order Bar (Fixed above bottom nav with safe area) */}
      <div className="sm:hidden fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px))] inset-x-0 z-35 bg-surface/95 dark:bg-[#0b1322]/95 backdrop-blur-xl border-t border-line px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] text-muted block leading-tight">{text.grandTotal}</span>
          <span className="text-base font-black text-gold truncate block">
            {formatPrice(grandTotal)}
          </span>
        </div>

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => {
            const form = document.querySelector("form");
            if (form) form.requestSubmit();
          }}
          className="h-11 px-5 rounded-xl bg-gold text-navy hover:bg-gold-strong flex items-center justify-center gap-2 text-xs font-black shadow-md active:scale-95 disabled:opacity-60 shrink-0 cursor-pointer"
        >
          <Lock size={15} />
          <span>{isProcessing ? text.processing : text.confirmOrder}</span>
        </button>
      </div>
    </main>
  );
}
