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
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import type { CurrencyCode, Store, Order } from "@/types/marketplace";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    hubTitle: "مركز تحكم المالك الشامل (Super Admin Hub)",
    hubSubtitle: "إدارة المؤشرات المالية، إعدادات المنصة، بوابات الدفع، وتوثيق المتاجر والطلبات",
    tabOverview: "لوحة المؤشرات",
    tabSettings: "إعدادات المنصة",
    tabGateways: "بوابات الدفع",
    tabCurrencies: "أسعار الصرف",
    tabStores: "توثيق المتاجر",
    tabProducts: "كتالوج المنتجات",
    tabOrders: "إدارة الطلبات",
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
    hubSubtitle: "Manage platform financials, global settings, payment gateways, stores, and order logistics",
    tabOverview: "Overview & Analytics",
    tabSettings: "Platform Settings & Fees",
    tabGateways: "Payment Gateways",
    tabCurrencies: "Currency Exchange Rates",
    tabStores: "Store Verification & Merchants",
    tabProducts: "Catalog & Products",
    tabOrders: "Orders & Shipping Dispatch",
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
  const text = copy[language];

  const {
    products,
    stores,
    orders,
    settings,
    updateSettings,
    toggleGateway,
    currencies,
    updateExchangeRate,
    formatPrice,
    updateStoreStatusItem,
    toggleStoreVerified,
    updateProductItem,
    deleteProductItem,
    updateOrderStatus,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<
    "overview" | "settings" | "gateways" | "currencies" | "stores" | "products" | "orders" | "promotions"
  >("overview");

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
    if (!newCouponCode.trim()) return;
    const newCoupon = {
      id: `c_${Date.now()}`,
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
              <span>Super Administrator Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {text.hubTitle}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">{text.hubSubtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/marketplace"
              className="px-4 py-2.5 rounded-2xl bg-surface border border-line hover:border-gold text-xs sm:text-sm font-bold text-foreground flex items-center gap-2 transition-all shadow-xs"
            >
              <ShoppingBag size={15} className="text-amber-600 dark:text-gold" />
              <span>عرض المتجر</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs Bar - 100% Symmetrical 8-Tab Grid on Desktop (4x2) and Mobile (2x4) */}
        <div className="bg-surface/90 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-line shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {[
              { id: "overview", label: text.tabOverview, icon: Activity, count: null },
              { id: "settings", label: text.tabSettings, icon: Settings, count: null },
              { id: "gateways", label: text.tabGateways, icon: CreditCard, count: null },
              { id: "currencies", label: text.tabCurrencies, icon: Coins, count: `${Object.keys(currencies).length}` },
              { id: "stores", label: text.tabStores, icon: StoreIcon, count: `${stores.length}` },
              { id: "products", label: text.tabProducts, icon: Boxes, count: `${products.length}` },
              { id: "orders", label: text.tabOrders, icon: Truck, count: `${totalOrdersCount}` },
              { id: "promotions", label: text.tabPromotions, icon: Megaphone, count: `${coupons.length}` },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all border select-none w-full min-h-[48px] sm:min-h-[52px] ${
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
                  <span className="p-2 rounded-xl bg-gold-soft text-gold-strong">
                    <TrendingUp size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground tracking-tight">
                  {formatPrice(gmv)}
                </div>
                <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <span>+18.4% نمو شهري</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{text.netCommissionLabel}</span>
                  <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600">
                    <Percent size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-gold tracking-tight">
                  {formatPrice(netCommission)}
                </div>
                <div className="text-[11px] text-muted">عمولة المنصة الصافية المحصلة</div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{text.activeStoresLabel}</span>
                  <span className="p-2 rounded-xl bg-surface-soft text-foreground">
                    <StoreIcon size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground tracking-tight">
                  {activeStoresCount} / {stores.length}
                </div>
                <div className="text-[11px] text-muted">متاجر معتمدة بعلامة التوثيق</div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{text.totalOrdersLabel}</span>
                  <span className="p-2 rounded-xl bg-surface-soft text-foreground">
                    <ShoppingBag size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground tracking-tight">
                  {totalOrdersCount}
                </div>
                <div className="text-[11px] text-muted">طلبات منفذة مع تتبع مباشر</div>
              </div>
            </div>

            {/* Quick Status Cards & Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Payment Gateways Health */}
              <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CreditCard size={17} className="text-gold" />
                  <span>حالة بوابات الدفع العالمية الفعالة</span>
                </h3>
                <div className="space-y-2.5">
                  {Object.values(settings.gateways).map((gw) => (
                    <div
                      key={gw.key}
                      className="p-3 rounded-2xl bg-surface-soft border border-line flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${gw.enabled ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span className="font-bold text-foreground">{gw.nameAr}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        gw.enabled ? "bg-emerald-600/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                      }`}>
                        {gw.enabled ? "مفعّلة" : "معطلة"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Currency Rates Health */}
              <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Coins size={17} className="text-gold" />
                  <span>أسعار الصرف اللحظية للعملات العالمية</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {Object.entries(currencies).map(([code, c]) => (
                    <div key={code} className="p-3 rounded-2xl bg-surface-soft border border-line text-center space-y-1">
                      <span className="font-bold text-gold">{code}</span>
                      <p className="text-[10px] text-muted">{c.nameAr}</p>
                      <p className="text-[11px] font-mono font-bold text-foreground">
                        {c.rateAgainstEGP} مقابل EGP
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Platform Settings & Fees */}
        {activeTab === "settings" && (
          <form onSubmit={handleSavePlatformSettings} className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
              <Sliders size={18} className="text-gold" />
              <span>{text.tabSettings}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">نسبة عمولة المنصة الافتراضية (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={localCommission}
                  onChange={(e) => setLocalCommission(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line font-bold text-foreground focus:outline-none focus:border-gold"
                />
                <span className="text-[10px] text-muted">تستقطع تلقائياً من إجمالي كل طلب لصالح المنصة</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">حد الشحن المجاني (Free Shipping Threshold EGP)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={localFreeShip}
                  onChange={(e) => setLocalFreeShip(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line font-bold text-foreground focus:outline-none focus:border-gold"
                />
                <span className="text-[10px] text-muted">الطلبات التي تتجاوز هذا المبلغ تحصل على شحن مجاني</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">تكلفة الشحن القياسي الافتراضية (EGP)</label>
                <input
                  type="number"
                  min="0"
                  value={localStdShip}
                  onChange={(e) => setLocalStdShip(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line font-bold text-foreground focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">تكلفة الشحن السريع ذو الأولوية (Priority EGP)</label>
                <input
                  type="number"
                  min="0"
                  value={localPrioShip}
                  onChange={(e) => setLocalPrioShip(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line font-bold text-foreground focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">نسبة ضريبة القيمة المضافة (VAT %)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={localVatRate}
                  onChange={(e) => setLocalVatRate(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line font-bold text-foreground focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-3 pt-4">
                <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localVatEnabled}
                    onChange={(e) => setLocalVatEnabled(e.target.checked)}
                    className="accent-[#d4af37] rounded"
                  />
                  <span>تفعيل حساب ضريبة القيمة المضافة (VAT)</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localAutoProd}
                    onChange={(e) => setLocalAutoProd(e.target.checked)}
                    className="accent-[#d4af37] rounded"
                  />
                  <span>الموافقة التلقائية على المنتجات الجديدة فور إضافتها</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localAutoStore}
                    onChange={(e) => setLocalAutoStore(e.target.checked)}
                    className="accent-[#d4af37] rounded"
                  />
                  <span>الموافقة التلقائية على تسجيل المتاجر الجديدة</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-line flex items-center justify-between">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gold text-navy hover:bg-gold-strong font-bold text-xs shadow-sm transition-all"
              >
                {text.saveChanges}
              </button>

              {savedNotice && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                  <Check size={16} />
                  <span>{text.savedSuccess}</span>
                </span>
              )}
            </div>
          </form>
        )}

        {/* Tab 3: Payment Gateways Toggle Manager */}
        {activeTab === "gateways" && (
          <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
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

        {/* Tab 4: Currency Exchange Rates Engine */}
        {activeTab === "currencies" && (
          <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
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

        {/* Tab 5: Stores Management & Verification Badges */}
        {activeTab === "stores" && (
          <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
              <StoreIcon size={18} className="text-gold" />
              <span>{text.tabStores}</span>
            </h2>

            <div className="divide-y divide-line">
              {stores.map((s) => (
                <div key={s.id} className="py-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-surface-soft border border-line shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.logo_url || ""} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{s.name}</span>
                        {s.is_verified && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600/10 text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                            <BadgeCheck size={12} />
                            <span>موثق</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted line-clamp-1">{s.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted mt-1">
                        <span>الخطة: <strong className="text-foreground">{s.plan}</strong></span>
                        <span>•</span>
                        <span>البلد: <strong className="text-foreground">{s.country || "عالمي"}</strong></span>
                        <span>•</span>
                        <span>العمولة: <strong className="text-gold">{s.commission_rate}%</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
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
                      {s.is_verified ? "إلغاء التوثيق" : "منح شارة التوثيق"}
                    </button>

                    {/* Status selector */}
                    <select
                      value={s.status}
                      onChange={(e) => updateStoreStatusItem(s.id, e.target.value as Store["status"])}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-line text-foreground font-bold"
                    >
                      <option value="approved">معتمد (Approved)</option>
                      <option value="pending">قيد المراجعة (Pending)</option>
                      <option value="suspended">موقوف (Suspended)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Products & Catalog Oversight */}
        {activeTab === "products" && (
          <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
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

        {/* Tab 7: Orders & Dispatch Management */}
        {activeTab === "orders" && (
          <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
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
          </div>
        )}
      </div>
    </main>
  );
}
