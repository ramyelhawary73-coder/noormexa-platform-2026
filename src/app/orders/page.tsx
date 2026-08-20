"use client";

import { useState, useSyncExternalStore, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Package,
  Printer,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import type { Order } from "@/types/marketplace";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    title: "متابعة الطلبات وتتبع الشحنات الحي",
    subtitle: "تتبع مسار شحناتك المباشر مع شركات الشحن المعتمدة واستعرض فواتيرك السابقة",
    searchPlaceholder: "ابحث برقم التتبع (مثل: TRK-GLB-...) أو رقم الطلب...",
    searchBtn: "تتبع الشحنة",
    allOrders: "سجل طلباتي السابقة",
    noOrdersTitle: "لم يتم العثور على طلبات مطابقة",
    noOrdersDesc: "تأكد من كتابة كود التتبع بالشكل الصحيح أو تصفح السوق لبدء أول تجربة تسوق.",
    backToMarket: "الذهاب إلى السوق",
    statusPlaced: "تم تأكيد الطلب",
    statusPacked: "تجهيز الشحنة",
    statusInTransit: "في الطريق (In Transit)",
    statusOutForDelivery: "خرج للتسليم",
    statusDelivered: "تم التسليم بنجاح",
    carrierLabel: "شركة الشحن الناقلة:",
    trackingCodeLabel: "رقم التتبع الدولي:",
    destinationLabel: "عنوان الوصول:",
    recipientLabel: "المستلم:",
    orderTotalLabel: "إجمالي الفاتورة:",
    printInvoice: "طباعة الفاتورة الرسمية",
  },
  en: {
    title: "Order Tracking & Live Dispatch",
    subtitle: "Track real-time shipment progress with verified carriers and view historical tax invoices",
    searchPlaceholder: "Search by tracking code (e.g., TRK-GLB-...) or order reference...",
    searchBtn: "Track Order",
    allOrders: "My Order History",
    noOrdersTitle: "No Matching Orders Found",
    noOrdersDesc: "Verify your tracking reference code or start shopping in the NOORMEXA marketplace.",
    backToMarket: "Go to Marketplace",
    statusPlaced: "Order Placed",
    statusPacked: "Packed & Ready",
    statusInTransit: "In Transit",
    statusOutForDelivery: "Out for Delivery",
    statusDelivered: "Delivered",
    carrierLabel: "Logistics Carrier:",
    trackingCodeLabel: "International Tracking Code:",
    destinationLabel: "Destination Address:",
    recipientLabel: "Recipient:",
    orderTotalLabel: "Order Total:",
    printInvoice: "Print Invoice",
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

function OrdersTrackingContent() {
  const searchParams = useSearchParams();
  const initialTrackParam = searchParams.get("track") || "";
  const language = useNoormexaLanguage();
  const text = copy[language];

  const { orders, formatPrice } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState(initialTrackParam);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders or find specific tracked order
  const matchedOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter(
      (o) =>
        o.trackingNumber.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.shipping_info.fullName.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  // Selected or first matched order for active stepper view
  const activeOrder = selectedOrder || matchedOrders[0] || orders[0];

  const getStepIndex = (status: Order["status"]) => {
    switch (status) {
      case "pending":
      case "paid":
        return 1;
      case "processing":
        return 2;
      case "shipped":
        return 3;
      case "delivered":
        return 5;
      default:
        return 2;
    }
  };

  const currentStep = activeOrder ? getStepIndex(activeOrder.status) : 1;

  const steps = [
    { id: 1, title: text.statusPlaced, desc: "تم تأكيد الدفع وإرسال بيانات الطلب للمتجر" },
    { id: 2, title: text.statusPacked, desc: "تم تغليف المنتج وفحصه بمستودع التاجر" },
    { id: 3, title: text.statusInTransit, desc: "الشحنة في مركز الفرز الدولي" },
    { id: 4, title: text.statusOutForDelivery, desc: "الشحنة مع مندوب التوصيل النهائي" },
    { id: 5, title: text.statusDelivered, desc: "تم استلام الشحنة والتوقيع" },
  ];

  return (
    <main className="noormexa-main py-8 md:py-12">
      <div className="noormexa-container space-y-8">
        {/* Header */}
        <div className="border-b border-line pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-soft text-gold-strong text-xs font-bold mb-2">
            <Truck size={14} />
            <span>NOORMEXA Global Logistics Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {text.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">{text.subtitle}</p>
        </div>

        {/* Search / Track Box */}
        <div className="p-4 rounded-3xl bg-surface border border-line shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text.searchPlaceholder}
                className="w-full ps-11 pe-4 py-3 rounded-2xl bg-surface-soft border border-line text-xs sm:text-sm focus:outline-none focus:border-gold font-mono"
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
          </div>
        </div>

        {/* Layout: Tracking Stepper (7 cols) + Orders History List (5 cols) */}
        {orders.length === 0 ? (
          <div className="text-center py-16 px-4 bg-surface rounded-3xl border border-line space-y-4">
            <Package size={48} className="mx-auto text-muted" />
            <h2 className="text-lg font-bold text-foreground">{text.noOrdersTitle}</h2>
            <p className="text-xs text-muted max-w-md mx-auto">{text.noOrdersDesc}</p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold text-navy font-bold text-xs shadow-sm hover:bg-gold-strong transition-all"
            >
              <ShoppingBag size={15} />
              <span>{text.backToMarket}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Active Order Live Tracker */}
            {activeOrder && (
              <div className="lg:col-span-7 space-y-6">
                <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6">
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                    <div>
                      <span className="text-[10px] text-muted block uppercase">{text.trackingCodeLabel}</span>
                      <span className="font-mono text-base font-black text-gold tracking-wider">
                        {activeOrder.trackingNumber}
                      </span>
                    </div>

                    <div className="text-end">
                      <span className="text-[10px] text-muted block">{text.carrierLabel}</span>
                      <span className="font-bold text-xs text-foreground flex items-center gap-1">
                        <Truck size={14} className="text-gold" />
                        <span>{activeOrder.carrier}</span>
                      </span>
                    </div>
                  </div>

                  {/* 5-Step Visual Progress Stepper */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      حالة مسار الشحن الحي
                    </h3>

                    <div className="relative ps-6 space-y-6 border-s-2 border-line ms-3">
                      {steps.map((st) => {
                        const isDone = currentStep >= st.id;
                        const isCurrent = currentStep === st.id;

                        return (
                          <div key={st.id} className="relative group">
                            {/* Step Bullet */}
                            <div
                              className={`absolute -start-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : "bg-surface-soft border border-line text-muted"
                              } ${isCurrent ? "ring-4 ring-emerald-600/20 scale-110" : ""}`}
                            >
                              {isDone ? <CheckCircle2 size={14} /> : st.id}
                            </div>

                            <div className="space-y-0.5">
                              <h4
                                className={`text-xs font-bold ${
                                  isCurrent
                                    ? "text-gold font-black"
                                    : isDone
                                    ? "text-foreground"
                                    : "text-muted"
                                }`}
                              >
                                {st.title}
                              </h4>
                              <p className="text-[11px] text-muted leading-relaxed">{st.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Details & Summary Card */}
                  <div className="p-4 rounded-2xl bg-surface-soft border border-line space-y-3 text-xs">
                    <div className="flex justify-between border-b border-line pb-2 font-bold text-foreground">
                      <span>المنتجات المطلوبة ({activeOrder.items.length})</span>
                      <span className="text-gold">{formatPrice(activeOrder.total_amount)}</span>
                    </div>

                    <div className="space-y-2">
                      {activeOrder.items.map((it) => (
                        <div key={it.id} className="flex justify-between items-center text-muted">
                          <div>
                            <span className="font-bold text-foreground">{it.product_name}</span>
                            <span className="text-[10px] block">الكمية: {it.quantity}</span>
                          </div>
                          <span className="font-bold text-foreground text-gold">
                            {formatPrice(it.unit_price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-line text-[11px] text-muted space-y-1">
                      <p>
                        <strong>{text.recipientLabel}</strong> {activeOrder.shipping_info.fullName} (
                        {activeOrder.shipping_info.phone})
                      </p>
                      <p>
                        <strong>{text.destinationLabel}</strong> {activeOrder.shipping_info.country} -{" "}
                        {activeOrder.shipping_info.city} - {activeOrder.shipping_info.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") window.print();
                      }}
                      className="px-4 py-2 rounded-xl bg-surface border border-line hover:border-gold text-foreground font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Printer size={14} className="text-gold" />
                      <span>{text.printInvoice}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Past Orders History List Column */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-line pb-2">
                <Clock size={16} className="text-gold" />
                <span>{text.allOrders} ({matchedOrders.length})</span>
              </h3>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pe-1">
                {matchedOrders.map((ord) => {
                  const isSelected = activeOrder?.id === ord.id;
                  return (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => setSelectedOrder(ord)}
                      className={`w-full p-4 rounded-2xl border text-start space-y-2 transition-all ${
                        isSelected
                          ? "bg-navy text-gold border-gold shadow-md"
                          : "bg-surface text-foreground border-line hover:border-gold/50"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="font-mono">{ord.orderNumber}</span>
                        <span className="text-gold">{formatPrice(ord.total_amount)}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] opacity-80">
                        <span>{ord.shipping_info.fullName}</span>
                        <span>{new Date(ord.created_at).toLocaleDateString("ar-EG")}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-line/40 text-[10px]">
                        <span className="font-mono">تتبع: {ord.trackingNumber}</span>
                        <span className="font-bold uppercase">{ord.status}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function OrdersTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-muted flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <span>جاري تحميل بيانات التتبع...</span>
        </div>
      }
    >
      <OrdersTrackingContent />
    </Suspense>
  );
}
