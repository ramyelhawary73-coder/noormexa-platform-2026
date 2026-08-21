"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  Banknote,
  Boxes,
  Check,
  ChevronRight,
  Coins,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  Megaphone,
  Percent,
  Plus,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Smartphone,
  Sparkles,
  Store as StoreIcon,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import type { CurrencyCode, Store, Order } from "@/types/marketplace";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    hubTitle: "مركز تحكم المالك الشامل (Super Admin Hub)",
    hubSubtitle: "إدارة المؤشرات المالية، إعدادات المنصة، بوابات الدفع، وتوثيق المتاجر والطلبات وتسويات الأرباح",
    tabOverview: "لوحة المؤشرات",
    tabSettings: "إعدادات المنصة",
    tabGateways: "بوابات الدفع",
    tabCurrencies: "أسعار الصرف",
    tabStores: "المتاجر والتوثيق (KYC)",
    tabProducts: "كتالوج المنتجات",
    tabOrders: "إدارة الطلبات",
    tabPayouts: "تسويات وسحب الأرباح",
    tabPromotions: "العروض والخصومات",
    gmvLabel: "إجمالي قيمة التداول (GMV)",
    netCommissionLabel: "صافي أرباح المنصة (Commissions)",
    activeStoresLabel: "المتاجر المعتمدة النشطة",
    totalOrdersLabel: "إجمالي الطلبات المسجلة",
    totalProductsLabel: "المنتجات المعروضة",
    avgOrderValue: "متوسط قيمة الطلب (AOV)",
    saveChanges: "حفظ التعديلات",
    savedSuccess: "تم حفظ التعديلات بنجاح!",
  },
  en: {
    hubTitle: "Super Admin Hub & Control Center",
    hubSubtitle: "Manage platform financials, global settings, payment gateways, stores, order logistics, and vendor payouts",
    tabOverview: "Overview & Analytics",
    tabSettings: "Platform Settings & Fees",
    tabGateways: "Payment Gateways",
    tabCurrencies: "Currency Exchange Rates",
    tabStores: "Stores & KYC Verification",
    tabProducts: "Catalog & Products",
    tabOrders: "Orders & Shipping Dispatch",
    tabPayouts: "Payouts & Settlements",
    tabPromotions: "Promotions & Marketing",
    gmvLabel: "Gross Merchandise Value (GMV)",
    netCommissionLabel: "Platform Net Commission",
    activeStoresLabel: "Active Verified Stores",
    totalOrdersLabel: "Total Logged Orders",
    totalProductsLabel: "Catalog Products",
    avgOrderValue: "Average Order Value (AOV)",
    saveChanges: "Save Changes",
    savedSuccess: "Settings saved successfully!",
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

export default function SuperAdminPage() {
  const language = useNoormexaLanguage();
  const isAr = language === "ar";
  const text = copy[language];

  const {
    products,
    stores,
    orders,
    payouts,
    marketingPosts,
    settings,
    updateSettings,
    toggleGateway,
    currencies,
    updateExchangeRate,
    formatPrice,
    updateStoreStatusItem,
    toggleStoreVerified,
    updateStoreCommissionRate,
    updateProductItem,
    deleteProductItem,
    updateOrderStatus,
    updatePayoutStatus,
    createOfficialStore,
    deleteMarketingPost,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<
    "overview" | "settings" | "gateways" | "currencies" | "stores" | "products" | "orders" | "payouts" | "promotions"
  >("overview");

  // Official Flagship Store Modal State
  const [showOfficialModal, setShowOfficialModal] = useState(false);
  const [newOfficialName, setNewOfficialName] = useState("متجر نورمكسا بريميوم المباشر (NOORMEXA Direct)");
  const [newOfficialDesc, setNewOfficialDesc] = useState("المتجر الرسمي المباشر للمنصة - أعلى معايير الجودة وشحن فوري");

  // Promotional Codes & Marketing State
  const [coupons, setCoupons] = useState([
    { id: "c1", code: "NOORMEXA2026", discount: 20, type: "percent", usageCount: 142, maxUsage: 500, active: true, minOrder: 50 },
    { id: "c2", code: "RAMADAN20", discount: 20, type: "percent", usageCount: 88, maxUsage: 200, active: true, minOrder: 100 },
    { id: "c3", code: "WELCOME50", discount: 50, type: "fixed", usageCount: 231, maxUsage: 1000, active: true, minOrder: 150 },
    { id: "c4", code: "FREESHIP", discount: 100, type: "shipping", usageCount: 64, maxUsage: 300, active: true, minOrder: 200 },
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);
  const [newCouponType, setNewCouponType] = useState<"percent" | "fixed">("percent");

  const [promoBannerText, setPromoBannerText] = useState("عروض الموسم الكبرى: خصم يصل إلى 40% + شحن مجاني للطلبات فوق 200 ج.م!");
  const [promoBannerActive, setPromoBannerActive] = useState(true);

  const toggleCouponStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    const newCoupon = {
      id: `c-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discount: Number(newCouponDiscount),
      type: newCouponType,
      usageCount: 0,
      maxUsage: 500,
      active: true,
      minOrder: 50,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    setNewCouponCode("");
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  // Local Form state for settings
  const [localCommission, setLocalCommission] = useState(settings.defaultCommissionRate);
  const [localVatRate, setLocalVatRate] = useState(settings.vatRate);
  const [localVatEnabled, setLocalVatEnabled] = useState(settings.vatEnabled);
  const [localFreeShip, setLocalFreeShip] = useState(settings.freeShippingThreshold);
  const [localStdShip, setLocalStdShip] = useState(settings.standardShippingCost);
  const [localPrioShip, setLocalPrioShip] = useState(settings.priorityShippingCost);
  const [localAutoProd, setLocalAutoProd] = useState(settings.autoApproveProducts);
  const [localAutoStore, setLocalAutoStore] = useState(settings.autoApproveStores);

  const [savedNotice, setSavedNotice] = useState(false);

  // Financial KPIs
  const gmv = orders.reduce((sum, o) => sum + o.total_amount, 0) + 185400; // base demo GMV + live
  const netCommission = orders.reduce((sum, o) => sum + o.commission_amount, 0) + 16800;
  const totalOrdersCount = orders.length + 42;
  const activeStoresCount = stores.filter((s) => s.status === "approved").length;

  // Payout Transaction Ref helper state
  const [payoutTrxRefs, setPayoutTrxRefs] = useState<Record<string, string>>({});

  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      defaultCommissionRate: Number(localCommission),
      vatRate: Number(localVatRate),
      vatEnabled: localVatEnabled,
      freeShippingThreshold: Number(localFreeShip),
      standardShippingCost: Number(localStdShip),
      priorityShippingCost: Number(localPrioShip),
      autoApproveProducts: localAutoProd,
      autoApproveStores: localAutoStore,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <main className="noormexa-main py-8 md:py-12">
      <div className="noormexa-container space-y-8">
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-900 dark:bg-navy dark:text-gold border border-amber-500/30 dark:border-gold/30 text-xs font-black mb-2 shadow-xs">
              <ShieldCheck size={14} className="text-amber-600 dark:text-gold" />
              <span>Super Administrator Access (Multi-Vendor Marketplace)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {text.hubTitle}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">{text.hubSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/seller/dashboard"
              className="px-4 py-2.5 rounded-2xl bg-surface border border-line hover:border-gold text-xs sm:text-sm font-bold text-foreground flex items-center gap-2 transition-all shadow-xs"
            >
              <StoreIcon size={15} className="text-amber-600 dark:text-gold" />
              <span>{isAr ? "لوحة التاجر" : "Seller Central"}</span>
            </Link>
            <Link
              href="/marketplace"
              className="px-4 py-2.5 rounded-2xl bg-surface border border-line hover:border-gold text-xs sm:text-sm font-bold text-foreground flex items-center gap-2 transition-all shadow-xs"
            >
              <ShoppingBag size={15} className="text-amber-600 dark:text-gold" />
              <span>{isAr ? "عرض المتجر" : "Marketplace"}</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs Bar - Symmetrical Grid */}
        <div className="bg-surface/90 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-line shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {[
              { id: "overview", label: text.tabOverview, icon: Activity, count: null },
              { id: "stores", label: text.tabStores, icon: StoreIcon, count: `${stores.length}` },
              { id: "payouts", label: text.tabPayouts, icon: Wallet, count: `${payouts.length}` },
              { id: "orders", label: text.tabOrders, icon: Truck, count: `${totalOrdersCount}` },
              { id: "products", label: text.tabProducts, icon: Boxes, count: `${products.length}` },
              { id: "gateways", label: text.tabGateways, icon: CreditCard, count: null },
              { id: "currencies", label: text.tabCurrencies, icon: Coins, count: `${Object.keys(currencies).length}` },
              { id: "promotions", label: text.tabPromotions, icon: Megaphone, count: `${coupons.length}` },
              { id: "settings", label: text.tabSettings, icon: Settings, count: null },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center justify-between gap-1.5 sm:gap-2 px-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all border select-none w-full min-h-[48px] sm:min-h-[52px] ${
                    active
                      ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20 font-black dark:bg-navy dark:text-gold dark:border-gold dark:shadow-none ring-2 ring-amber-500/20 dark:ring-gold/20"
                      : "bg-surface text-foreground/90 border-line hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 text-start">
                    <Icon size={16} className={`shrink-0 ${active ? "text-white dark:text-gold" : "text-amber-600 dark:text-gold"}`} />
                    <span className="text-[11px] sm:text-xs font-bold leading-tight whitespace-nowrap">{tab.label}</span>
                  </div>
                  {tab.count !== null && (
                    <span
                      className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-lg font-black shrink-0 ${
                        active
                          ? "bg-white/25 text-white dark:bg-gold dark:text-navy"
                          : "bg-surface-soft text-muted border border-line"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Financial Overview & KPIs */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{text.gmvLabel}</span>
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-gold">
                    <TrendingUp size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground tracking-tight">
                  {formatPrice(gmv)}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <span>+18.4% {isAr ? "نمو شهري في المبيعات" : "MoM Growth"}</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{text.netCommissionLabel}</span>
                  <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600">
                    <Percent size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-gold tracking-tight">
                  {formatPrice(netCommission)}
                </div>
                <div className="text-[11px] text-muted">
                  {isAr ? `متوسط عمولة المنصة: ${settings.defaultCommissionRate}%` : `Avg Fee: ${settings.defaultCommissionRate}%`}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{text.activeStoresLabel}</span>
                  <span className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                    <StoreIcon size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground">
                  {activeStoresCount} / {stores.length}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold">
                  {isAr ? "متاجر موثقة ومعتمدة" : "Verified Stores"}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{text.totalOrdersLabel}</span>
                  <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                    <Truck size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground">
                  {totalOrdersCount}
                </div>
                <div className="text-[11px] text-muted">
                  {isAr ? "متوسط قيمة الطلب: 1,850 ج.م" : "Avg Order: 1,850 EGP"}
                </div>
              </div>
            </div>

            {/* Quick Actions & Store Health Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-surface border border-line space-y-4">
                <h3 className="font-black text-sm text-foreground flex items-center gap-2 border-b border-line pb-3">
                  <StoreIcon size={16} className="text-gold" />
                  <span>{isAr ? "أحدث المتاجر المنضمة حديثاً" : "Recently Registered Merchants"}</span>
                </h3>
                <div className="divide-y divide-line">
                  {stores.slice(0, 4).map((s) => (
                    <div key={s.id} className="py-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-soft overflow-hidden border border-line shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.logo_url || ""} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span>{s.name}</span>
                            {s.is_verified && <BadgeCheck size={13} className="text-emerald-600" />}
                          </div>
                          <div className="text-[11px] text-muted">{s.country || "السعودية"} • {s.plan}</div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-amber-600 dark:text-gold text-xs">{s.commission_rate}% عمولة</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-surface border border-line space-y-4">
                <h3 className="font-black text-sm text-foreground flex items-center gap-2 border-b border-line pb-3">
                  <Wallet size={16} className="text-gold" />
                  <span>{isAr ? "أحدث طلبات سحب الأرباح (Payouts)" : "Recent Merchant Payout Requests"}</span>
                </h3>
                <div className="divide-y divide-line">
                  {payouts.slice(0, 4).map((p) => (
                    <div key={p.id} className="py-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-foreground">{p.store_name}</div>
                        <div className="text-[11px] text-muted">{p.bank_name} • <span className="font-mono">{p.iban?.slice(0, 12)}...</span></div>
                      </div>
                      <div className="text-end">
                        <div className="font-black text-emerald-600">{formatPrice(p.amount)}</div>
                        <span className="text-[10px] uppercase font-bold text-muted">{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Stores Management & KYC Verification Badges */}
        {activeTab === "stores" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <StoreIcon size={18} className="text-gold" />
                  <span>{isAr ? "إدارة وتوثيق بائعي ومتاجر السوق (Store KYC Center)" : "Store KYC & Verification"}</span>
                </h2>
                <p className="text-xs text-muted">{isAr ? "فحص السجلات التجارية، الحسابات البنكية، وتعيين عمولات المتاجر" : "Inspect merchant legal records, bank accounts, and set custom fee rates"}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowOfficialModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all"
                >
                  <Crown size={14} className="fill-white" />
                  <span>{isAr ? "إنشاء متجر رسمي للمنصة" : "Create Official Store"}</span>
                </button>

                <Link
                  href="/seller/register"
                  className="px-4 py-2 rounded-xl bg-surface border border-line hover:border-gold text-foreground font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
                >
                  <Plus size={14} />
                  <span>{isAr ? "تسجيل بائع يدوي" : "Manual Onboard"}</span>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {stores.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-surface-soft border border-line space-y-4 text-xs">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface border border-line shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.logo_url || ""} alt="" className="w-full h-full object-cover" />
                        {s.is_official && (
                          <div className="absolute top-0.5 right-0.5 bg-amber-500 text-white p-0.5 rounded-full shadow-xs">
                            <Crown size={10} className="fill-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-foreground">{s.name}</span>
                          {s.is_official ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-gold font-black text-[10px] flex items-center gap-1 border border-amber-500/30">
                              <Crown size={11} className="fill-amber-500 text-amber-500" />
                              <span>{isAr ? "متجر المنصة الرسمي" : "Official Flagship"}</span>
                            </span>
                          ) : s.is_verified ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                              <BadgeCheck size={12} />
                              <span>{isAr ? "بائع موثق" : "Verified"}</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-gold font-bold text-[10px]">
                              {isAr ? "غير موثق" : "Unverified"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">{s.description}</p>
                        <div className="text-[11px] text-muted mt-0.5 flex items-center gap-2">
                          <Link href={`/store/${s.slug}`} className="text-gold hover:underline font-semibold">
                            noormexa.com/store/{s.slug}
                          </Link>
                          {s.is_official && (
                            <span className="text-[10px] bg-gold/10 text-navy dark:text-gold px-2 py-0.5 rounded font-black">
                              {isAr ? "عمولة 0% (متجر المالك)" : "0% Commission (Owner Store)"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/store/${s.slug}`}
                        className="px-3 py-1.5 rounded-xl font-bold text-xs bg-surface border border-line hover:border-gold text-foreground transition-all"
                      >
                        {isAr ? "معاينة الواجهة" : "Visit Store"}
                      </Link>

                      {/* Toggle Verified Badge */}
                      <button
                        type="button"
                        onClick={() => toggleStoreVerified(s.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                          s.is_verified
                            ? "bg-emerald-600/10 text-emerald-600 border-emerald-600/30"
                            : "bg-surface text-muted border-line hover:border-gold"
                        }`}
                      >
                        {s.is_verified ? (isAr ? "إلغاء التوثيق" : "Revoke Badge") : (isAr ? "منح شارة التوثيق" : "Grant Verified Badge")}
                      </button>

                      {/* Status selector */}
                      <select
                        value={s.status}
                        onChange={(e) => updateStoreStatusItem(s.id, e.target.value as Store["status"])}
                        className="px-3 py-1.5 rounded-xl bg-surface border border-line text-foreground font-bold text-xs focus:outline-none"
                      >
                        <option value="approved">{isAr ? "معتمد (Approved)" : "Approved"}</option>
                        <option value="pending">{isAr ? "قيد المراجعة (Pending)" : "Pending"}</option>
                        <option value="suspended">{isAr ? "موقوف (Suspended)" : "Suspended"}</option>
                      </select>
                    </div>
                  </div>

                  {/* KYC & Banking Data Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-xl bg-surface border border-line/60 text-xs">
                    <div>
                      <span className="text-muted text-[11px] block">{isAr ? "السجل التجاري / الوثيقة:" : "CR / License:"}</span>
                      <strong className="font-mono text-foreground">{s.cr_number || "CR-1010-88992"}</strong>
                    </div>

                    <div>
                      <span className="text-muted text-[11px] block">{isAr ? "الرقم الضريبي:" : "Tax Number:"}</span>
                      <strong className="font-mono text-foreground">{s.tax_number || "30012938400003"}</strong>
                    </div>

                    <div>
                      <span className="text-muted text-[11px] block">{isAr ? "الحساب البنكي (IBAN):" : "Bank & IBAN:"}</span>
                      <strong className="font-mono text-foreground truncate block">{s.iban || "SA12 1000 0001 2345 6789"}</strong>
                      <span className="text-[10px] text-muted">{s.bank_name || "مصرف الراجحي"}</span>
                    </div>

                    <div>
                      <span className="text-muted text-[11px] block">{isAr ? "عمولة المنصة المخصصة:" : "Commission Rate:"}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={s.commission_rate || 0}
                          onChange={(e) => updateStoreCommissionRate(s.id, Number(e.target.value))}
                          className="w-14 p-1 rounded-lg bg-surface-soft border border-line font-mono font-bold text-center text-xs text-foreground focus:outline-none focus:border-gold"
                        />
                        <span className="text-xs font-bold text-gold">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Payouts & Settlement Hub */}
        {activeTab === "payouts" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-line pb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Wallet size={18} className="text-gold" />
                <span>{isAr ? "مركز تسويات وتحويلات أرباح التجار (Payouts Settlement Hub)" : "Vendor Payouts & Settlements"}</span>
              </h2>
              <p className="text-xs text-muted">{isAr ? "مراجعة طلبات سحب الأرباح واعتماد الحوالات البنكية وإدخال أرقام المرجع" : "Review merchant withdrawal requests and record bank wire transaction reference numbers"}</p>
            </div>

            {payouts.length === 0 ? (
              <div className="text-center py-12 text-muted text-xs bg-surface-soft rounded-2xl border border-line">
                {isAr ? "لا توجد طلبات سحب أرباح معلقة حالياً." : "No payout requests found."}
              </div>
            ) : (
              <div className="space-y-4">
                {payouts.map((p) => (
                  <div key={p.id} className="p-5 rounded-2xl bg-surface-soft border border-line space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-3">
                      <div>
                        <div className="font-black text-sm text-foreground flex items-center gap-2">
                          <StoreIcon size={16} className="text-gold" />
                          <span>{p.store_name}</span>
                        </div>
                        <div className="text-[11px] text-muted">
                          {isAr ? "تاريخ الطلب:" : "Requested:"} {new Date(p.requested_at).toLocaleDateString(isAr ? "ar-EG" : "en-US")}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-emerald-600">{formatPrice(p.amount)}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] uppercase ${
                            p.status === "transferred"
                              ? "bg-emerald-600/15 text-emerald-600"
                              : p.status === "approved"
                              ? "bg-sky-500/15 text-sky-500"
                              : "bg-amber-500/15 text-amber-600 dark:text-gold"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-muted text-[11px] block">{isAr ? "اسم البنك:" : "Bank:"}</span>
                        <strong className="text-foreground">{p.bank_name}</strong>
                      </div>
                      <div>
                        <span className="text-muted text-[11px] block">{isAr ? "رقم الآيبان (IBAN):" : "IBAN:"}</span>
                        <strong className="font-mono text-foreground">{p.iban}</strong>
                      </div>
                      <div>
                        <span className="text-muted text-[11px] block">{isAr ? "ملاحظات التاجر:" : "Merchant Note:"}</span>
                        <span className="text-muted italic">{p.notes || "لا توجد ملاحظات"}</span>
                      </div>
                    </div>

                    {/* Action Panel for Super Admin */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line/60">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={isAr ? "رقم الحوالة (مثال: TRX-8821)" : "Bank Wire Ref..."}
                          value={payoutTrxRefs[p.id] || p.transaction_ref || ""}
                          onChange={(e) => setPayoutTrxRefs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                          className="px-3 py-1.5 rounded-xl bg-surface border border-line font-mono text-xs text-foreground focus:outline-none focus:border-gold"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const ref = payoutTrxRefs[p.id] || p.transaction_ref || `TRX-${Math.floor(100000 + Math.random() * 900000)}`;
                            updatePayoutStatus(p.id, "transferred", ref);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-xs"
                        >
                          {isAr ? "تأكيد التحويل البنكي (Transferred)" : "Mark Transferred"}
                        </button>

                        <button
                          type="button"
                          onClick={() => updatePayoutStatus(p.id, "approved")}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-all"
                        >
                          {isAr ? "موافقة مبدئية" : "Approve"}
                        </button>

                        <button
                          type="button"
                          onClick={() => updatePayoutStatus(p.id, "rejected")}
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-xs hover:bg-red-500 hover:text-white transition-all"
                        >
                          {isAr ? "رفض الطلب" : "Reject"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Orders & Dispatch Management */}
        {activeTab === "orders" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
              <Truck size={18} className="text-gold" />
              <span>{text.tabOrders}</span>
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-10 text-muted text-xs">
                لم يتم تسجيل أي طلبات بعد في الجلسة الحالية.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl bg-surface-soft border border-line space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2">
                      <div>
                        <span className="font-mono font-bold text-foreground">{ord.orderNumber}</span>
                        <span className="text-muted ms-2 text-[11px]">
                          تتبع: <strong className="text-gold">{ord.trackingNumber}</strong>
                        </span>
                      </div>
                      <span className="text-gold font-black">{formatPrice(ord.total_amount)}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-muted text-[11px]">
                      <div>العميل: <strong className="text-foreground">{ord.shipping_info.fullName}</strong></div>
                      <div>الهاتف: <strong className="text-foreground">{ord.shipping_info.phone}</strong></div>
                      <div>المدينة: <strong className="text-foreground">{ord.shipping_info.city}</strong></div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line/60">
                      <div className="flex items-center gap-2">
                        <span className="text-muted">حالة الشحن:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as Order["status"])}
                          className="px-2.5 py-1 rounded-xl bg-surface border border-line text-foreground font-bold"
                        >
                          <option value="pending">قيد الانتظار (Pending)</option>
                          <option value="paid">مدفوع ومؤكد (Paid)</option>
                          <option value="processing">جاري التجهيز والتغليف (Processing)</option>
                          <option value="shipped">تم الشحن في الطريق (Shipped)</option>
                          <option value="delivered">تم التسليم بنجاح (Delivered)</option>
                          <option value="cancelled">ملغي (Cancelled)</option>
                        </select>
                      </div>

                      <Link
                        href={`/orders?track=${ord.trackingNumber}`}
                        className="text-gold hover:underline font-bold flex items-center gap-1"
                      >
                        <span>عرض تتبع الشحنة الحي</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Products & Catalog Oversight */}
        {activeTab === "products" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Boxes size={18} className="text-gold" />
                <span>{text.tabProducts} ({products.length})</span>
              </h2>
            </div>

            <div className="divide-y divide-line">
              {products.map((p) => (
                <div key={p.id} className="py-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-soft border border-line shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image_url || ""} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <Link href={`/marketplace/${p.id}`} className="font-bold text-foreground hover:text-gold line-clamp-1">
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
                        <span className="text-gold font-bold">{formatPrice(p.price)}</span>
                        <span>•</span>
                        <span>المخزون: {p.stock}</span>
                        <span>•</span>
                        <span>المتجر: {p.store_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateProductItem(p.id, {
                          status: p.status === "active" ? "hidden" : "active",
                        })
                      }
                      className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                        p.status === "active"
                          ? "bg-emerald-600/10 text-emerald-600 border-emerald-600/20"
                          : "bg-surface-soft text-muted border-line"
                      }`}
                      title="تبديل حالة العرض"
                    >
                      {p.status === "active" ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteProductItem(p.id)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                      title="حذف المنتج"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Payment Gateways Toggle Manager */}
        {activeTab === "gateways" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
              <CreditCard size={18} className="text-gold" />
              <span>{text.tabGateways}</span>
            </h2>

            <div className="space-y-4">
              {Object.values(settings.gateways).map((gw) => (
                <div
                  key={gw.key}
                  className="p-5 rounded-2xl bg-surface-soft border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-surface border border-line text-gold">
                      {gw.key === "applePayMada" ? (
                        <Smartphone size={22} />
                      ) : gw.key === "stripe" ? (
                        <CreditCard size={22} />
                      ) : gw.key === "tabbyTamara" ? (
                        <Sparkles size={22} />
                      ) : gw.key === "paypal" ? (
                        <Wallet size={22} />
                      ) : (
                        <Banknote size={22} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {language === "ar" ? gw.nameAr : gw.nameEn}
                        </span>
                        {gw.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-gold-soft text-gold-strong text-[10px] font-black">
                            {gw.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        {language === "ar" ? gw.descriptionAr : gw.descriptionEn}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleGateway(gw.key, !gw.enabled)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        gw.enabled
                          ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                          : "bg-surface text-muted border border-line hover:border-gold/50"
                      }`}
                    >
                      {gw.enabled ? "مفعّلة ونشطة بالسوق" : "معطلة مؤقتاً"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Currency Exchange Rates Engine */}
        {activeTab === "currencies" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
              <Coins size={18} className="text-gold" />
              <span>{text.tabCurrencies}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currencies).map(([code, cur]) => (
                <div
                  key={code}
                  className="p-4 rounded-2xl bg-surface-soft border border-line flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-gold">{code}</span>
                      <span className="text-muted">({cur.symbolAr} / {cur.symbolEn})</span>
                    </div>
                    <p className="text-foreground font-semibold mt-0.5">{cur.nameAr}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted">1 EGP =</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={cur.rateAgainstEGP}
                      onChange={(e) => updateExchangeRate(code as CurrencyCode, Number(e.target.value))}
                      className="w-24 p-2 rounded-xl bg-surface border border-line font-mono font-bold text-foreground focus:outline-none focus:border-gold text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Promotions, Coupons & Marketing Campaigns */}
        {activeTab === "promotions" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Promo KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>كوبونات الخصم النشطة</span>
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-gold">
                    <Tag size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground">
                  {coupons.filter((c) => c.active).length} / {coupons.length}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold">
                  متاحة للاستخدام الفوري
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>إجمالي الاستخدامات</span>
                  <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                    <TrendingUp size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground">
                  {coupons.reduce((sum, c) => sum + c.usageCount, 0)} عملية
                </div>
                <div className="text-[11px] text-blue-600 font-bold">
                  +34 عملية هذا الأسبوع
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>شريط الإعلانات العام</span>
                  <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                    <Megaphone size={16} />
                  </span>
                </div>
                <div className="text-lg font-black text-foreground">
                  {promoBannerActive ? "مفعل وظاهر للزوار" : "معطل مؤقتاً"}
                </div>
                <div className="text-[11px] text-muted font-bold">
                  شريط أعلى الموقع
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>مبيعات الحملات</span>
                  <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600">
                    <Percent size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground">
                  {formatPrice(48200)}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold">
                  عائد تسويقي 12.8x
                </div>
              </div>
            </div>

            {/* Create New Coupon Form */}
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
                <Plus size={18} className="text-amber-600 dark:text-gold" />
                <span>إصدار كود خصم جديد (Promo Code)</span>
              </h2>

              <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">رمز الكوبون (Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: EID2026"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-mono font-bold text-xs focus:border-amber-500 focus:outline-hidden uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted mb-1">نوع الخصم</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as "percent" | "fixed")}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-bold text-xs focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="percent">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ مالي ثابت (ج.م / ر.س)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted mb-1">قيمة الخصم</label>
                  <input
                    type="number"
                    min="1"
                    max={newCouponType === "percent" ? 100 : 10000}
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-soft border border-line text-foreground font-bold text-xs focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus size={15} />
                    <span>إضافة الكوبون</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Coupons List */}
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center justify-between border-b border-line pb-3">
                <span className="flex items-center gap-2">
                  <Tag size={18} className="text-amber-600 dark:text-gold" />
                  <span>قائمة الكوبونات النشطة والمؤرشفة ({coupons.length})</span>
                </span>
              </h2>

              <div className="divide-y divide-line">
                {coupons.map((c) => (
                  <div key={c.id} className="py-3.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-gold font-mono font-black text-sm tracking-wider border border-amber-500/20">
                        {c.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-foreground">
                            {c.type === "percent" ? `خصم ${c.discount}%` : c.type === "shipping" ? "شحن مجاني 100%" : `خصم ${c.discount} ج.م`}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.active ? "bg-emerald-600/10 text-emerald-600" : "bg-surface-soft text-muted border border-line"
                          }`}>
                            {c.active ? "نشط ومتاح" : "معطل"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted mt-0.5">
                          <span>الاستخدام: <strong className="text-foreground">{c.usageCount} / {c.maxUsage}</strong></span>
                          <span>•</span>
                          <span>الحد الأدنى للطلب: <strong className="text-foreground">{c.minOrder} ج.م</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCouponStatus(c.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                          c.active
                            ? "bg-emerald-600/10 text-emerald-600 border-emerald-600/30 hover:bg-emerald-600/20"
                            : "bg-surface text-muted border-line hover:border-amber-500"
                        }`}
                      >
                        {c.active ? "تعطيل الكوبون" : "تفعيل الكوبون"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                        title="حذف الكوبون"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Announcement Banner Manager */}
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center justify-between border-b border-line pb-3">
                <span className="flex items-center gap-2">
                  <Megaphone size={18} className="text-amber-600 dark:text-gold" />
                  <span>إدارة البانر الترويجي العام (Top Announcement Banner)</span>
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={promoBannerActive}
                    onChange={(e) => setPromoBannerActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                  />
                  <span>إظهار البانر أعلى الموقع</span>
                </label>
              </h2>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-muted">نص الإعلان الترويجي</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={promoBannerText}
                    onChange={(e) => setPromoBannerText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-soft border border-line text-foreground text-xs font-bold focus:border-amber-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSavedNotice(true);
                      setTimeout(() => setSavedNotice(false), 2000);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    تحديث البانر
                  </button>
                </div>

                {/* Live Banner Preview */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-muted block mb-1">معاينة حية لشريط الإعلان:</span>
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs text-center">
                    <Sparkles size={14} className="shrink-0" />
                    <span>{promoBannerText}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Marketing Posts Oversight */}
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center justify-between border-b border-line pb-3">
                <span className="flex items-center gap-2">
                  <Megaphone size={18} className="text-gold" />
                  <span>{isAr ? `منشورات وعروض المتاجر التسويقية (${marketingPosts.length})` : `Store Marketing Campaigns (${marketingPosts.length})`}</span>
                </span>
              </h2>

              {marketingPosts.length === 0 ? (
                <div className="text-center py-8 text-muted text-xs bg-surface-soft rounded-2xl border border-line">
                  {isAr ? "لا توجد منشورات تسويقية مسجلة حالياً." : "No store marketing campaigns active."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketingPosts.map((post) => {
                    const postStore = stores.find((s) => s.id === post.store_id);
                    return (
                      <div key={post.id} className="p-4 rounded-2xl bg-surface-soft border border-line space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{postStore?.name || post.store_id}</span>
                            {postStore?.is_official && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-gold font-bold text-[10px] flex items-center gap-1">
                                <Crown size={10} className="fill-amber-500" />
                                <span>{isAr ? "رسمي" : "Official"}</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted">{new Date(post.created_at).toLocaleDateString(isAr ? "ar-EG" : "en-US")}</span>
                        </div>

                        <div>
                          <h4 className="font-bold text-foreground">{post.title}</h4>
                          <p className="text-muted text-[11px] mt-0.5 line-clamp-2">{post.content}</p>
                        </div>

                        {post.promo_code && (
                          <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-600/15 text-emerald-600 font-mono font-bold text-xs">
                            {isAr ? "كود خصم:" : "Code:"} {post.promo_code}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-line/60">
                          <span className="text-muted text-[11px]">
                            {post.likes_count || 0} {isAr ? "إعجاب" : "likes"} • {post.views_count || 0} {isAr ? "مشاهدة" : "views"}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteMarketingPost(post.id)}
                            className="text-red-500 hover:text-red-600 font-bold text-[11px] flex items-center gap-1"
                          >
                            <Trash2 size={13} />
                            <span>{isAr ? "حذف المنشور" : "Delete Post"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 9: Platform Global Settings & Logistics */}
        {activeTab === "settings" && (
          <form onSubmit={handleSavePlatformSettings} className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sliders size={18} className="text-gold" />
                <span>{text.tabSettings}</span>
              </h2>
              {savedNotice && (
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1">
                  <Check size={14} />
                  <span>{text.savedSuccess}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-foreground block">
                  العمولة الافتراضية للمنصة من المبيعات (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={localCommission}
                  onChange={(e) => setLocalCommission(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line text-foreground font-mono font-bold focus:outline-none focus:border-gold"
                />
                <span className="text-[11px] text-muted block">تقتطع تلقائياً من إجمالي قيمة طلبات المتاجر</span>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-foreground block">
                  الحد الأدنى للشحن المجاني (EGP)
                </label>
                <input
                  type="number"
                  min="0"
                  value={localFreeShip}
                  onChange={(e) => setLocalFreeShip(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line text-foreground font-mono font-bold focus:outline-none focus:border-gold"
                />
                <span className="text-[11px] text-muted block">إذا تجاوزت سلة العميل هذا الرقم يصبح الشحن مجاناً</span>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-foreground block">
                  تكلفة الشحن القياسي الافتراضية (EGP)
                </label>
                <input
                  type="number"
                  min="0"
                  value={localStdShip}
                  onChange={(e) => setLocalStdShip(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line text-foreground font-mono font-bold focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-foreground block">
                  تكلفة الشحن السريع الفائق (EGP)
                </label>
                <input
                  type="number"
                  min="0"
                  value={localPrioShip}
                  onChange={(e) => setLocalPrioShip(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line text-foreground font-mono font-bold focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-foreground block">
                  نسبة ضريبة القيمة المضافة VAT (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={localVatRate}
                  onChange={(e) => setLocalVatRate(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line text-foreground font-mono font-bold focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex flex-col justify-center space-y-3 pt-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-foreground">
                  <input
                    type="checkbox"
                    checked={localVatEnabled}
                    onChange={(e) => setLocalVatEnabled(e.target.checked)}
                    className="accent-[#d4af37]"
                  />
                  <span>تفعيل حساب ضريبة القيمة المضافة عند الدفع</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-foreground">
                  <input
                    type="checkbox"
                    checked={localAutoStore}
                    onChange={(e) => setLocalAutoStore(e.target.checked)}
                    className="accent-[#d4af37]"
                  />
                  <span>الموافقة والتوثيق الآلي الفوري للمتاجر المسجلة حديثاً</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-foreground">
                  <input
                    type="checkbox"
                    checked={localAutoProd}
                    onChange={(e) => setLocalAutoProd(e.target.checked)}
                    className="accent-[#d4af37]"
                  />
                  <span>نشر المنتجات المضافة في السوق مباشرة دون حظر</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-line">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs shadow-xs transition-all"
              >
                {text.saveChanges}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Super Admin Create Official Platform Store Modal */}
      {showOfficialModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-line p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-amber-500 fill-amber-500" />
                <h3 className="font-black text-base text-foreground">
                  {isAr ? "تدشين متجر رسمي معتمد للمنصة" : "Establish Official Flagship Store"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOfficialModal(false)}
                className="text-muted hover:text-foreground p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              {isAr
                ? "سوف يتم إنشاء متجر رسمي يحمل شارة التاج الذهبي وتعيين نسبة عمولة المنصة 0% تلقائياً، ليكون الواجهة التجارية الحصرية لمنتجات المنصة المباشرة مع ميزات الترويج الأولوية."
                : "This creates an Official Flagship Store with a Crown badge, 0% platform commission, and priority catalog placement for direct sales."}
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1.5">
                  {isAr ? "اسم المتجر الرسمي للمنصة:" : "Official Store Name:"}
                </label>
                <input
                  type="text"
                  value={newOfficialName}
                  onChange={(e) => setNewOfficialName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line text-foreground font-bold focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1.5">
                  {isAr ? "الوصف التعريفي والشعار:" : "Description & Slogan:"}
                </label>
                <textarea
                  rows={3}
                  value={newOfficialDesc}
                  onChange={(e) => setNewOfficialDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line text-foreground text-xs leading-relaxed focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={() => setShowOfficialModal(false)}
                className="px-5 py-2.5 rounded-xl border border-line text-muted hover:text-foreground text-xs font-bold transition-all"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={() => {
                  createOfficialStore(newOfficialName, newOfficialDesc);
                  setShowOfficialModal(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Crown size={15} className="fill-white" />
                <span>{isAr ? "تأكيد وإنشاء المتجر" : "Confirm & Launch Store"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
