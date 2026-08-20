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
  Percent,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Smartphone,
  Sparkles,
  Store as StoreIcon,
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
    tabOverview: "لوحة المؤشرات العامة",
    tabSettings: "إعدادات المنصة والعمولات",
    tabGateways: "بوابات الدفع العالمية",
    tabCurrencies: "محول أسعار الصرف",
    tabStores: "إدارة وتوثيق المتاجر",
    tabProducts: "الكتالوج والمنتجات",
    tabOrders: "إدارة الطلبات والشحن",
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
    "overview" | "settings" | "gateways" | "currencies" | "stores" | "products" | "orders"
  >("overview");

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy text-gold border border-gold/30 text-xs font-black mb-2 shadow-xs">
              <ShieldCheck size={14} className="text-gold" />
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
              className="px-4 py-2 rounded-xl bg-surface border border-line hover:border-gold text-xs font-bold text-foreground flex items-center gap-1.5 transition-all shadow-xs"
            >
              <ShoppingBag size={14} />
              <span>عرض المتجر</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-line scrollbar-none">
          {[
            { id: "overview", label: text.tabOverview, icon: Activity },
            { id: "settings", label: text.tabSettings, icon: Settings },
            { id: "gateways", label: text.tabGateways, icon: CreditCard },
            { id: "currencies", label: text.tabCurrencies, icon: Coins },
            { id: "stores", label: text.tabStores, icon: StoreIcon },
            { id: "products", label: text.tabProducts, icon: Boxes },
            { id: "orders", label: text.tabOrders, icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border ${
                  active
                    ? "bg-navy text-gold border-gold shadow-sm font-black"
                    : "bg-surface text-muted border-line hover:border-gold/50"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
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
      </div>
    </main>
  );
}
