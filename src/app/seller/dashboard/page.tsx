"use client";

import { useState, useSyncExternalStore, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Boxes,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Plus,
  Printer,
  Search,
  Settings,
  Sparkles,
  Trash2,
  TrendingUp,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import type { Order } from "@/types/marketplace";

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

export default function SellerDashboardPage() {
  const language = useNoormexaLanguage();
  const isAr = language === "ar";

  const {
    stores,
    products,
    orders,
    categories,
    payouts,
    formatPrice,
    addProduct,
    updateProductItem,
    deleteProductItem,
    updateStoreProfile,
    updateOrderStatus,
    requestStorePayout,
  } = useMarketplace();

  // Active Selected Store State (defaults to first store)
  const [selectedStoreId, setSelectedStoreId] = useState<string>(stores[0]?.id || "store-techcraft");
  const currentStore = useMemo(() => {
    return stores.find((s) => s.id === selectedStoreId) || stores[0] || {
      id: "store-default",
      name: "متجر نورمكسا المعتمد",
      slug: "noormexa-store",
      commission_rate: 8,
      plan: "professional",
      status: "approved" as const,
      is_verified: true,
      country: "السعودية",
      description: "المتجر الافتراضي",
      created_at: new Date().toISOString(),
      owner_id: "owner-1",
      logo_url: null,
      banner_url: null,
    };
  }, [stores, selectedStoreId]);

  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "payouts" | "settings">("analytics");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Search & Filter in Products Tab
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");

  // Orders Tab Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // New Product Form State
  const [newProdName, setNewProdName] = useState("");
  const [newProdNameEn, setNewProdNameEn] = useState("");
  const [newProdCat, setNewProdCat] = useState(categories[0]?.id || "cat-1");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("15");
  const [newProdImageUrl, setNewProdImageUrl] = useState("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdFreeShip, setNewProdFreeShip] = useState(true);
  const [newProdFeatured, setNewProdFeatured] = useState(false);

  // Payout Request Form State
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutIban, setPayoutIban] = useState(currentStore.iban || "SA12 1000 0001 2345 6789 0123");
  const [payoutBank, setPayoutBank] = useState(currentStore.bank_name || "مصرف الراجحي");
  const [payoutNotes, setPayoutNotes] = useState("");

  // Store Profile Edit State
  const [profileName, setProfileName] = useState(currentStore.name);
  const [profileDesc, setProfileDesc] = useState(currentStore.description || "");
  const [profileCountry, setProfileCountry] = useState(currentStore.country || "");
  const [profileEmail, setProfileEmail] = useState(currentStore.contact_email || "");
  const [profilePhone, setProfilePhone] = useState(currentStore.contact_phone || "");
  const [profileIban, setProfileIban] = useState(currentStore.iban || "");
  const [profileBank, setProfileBank] = useState(currentStore.bank_name || "");

  // Filter products for active store
  const storeProducts = useMemo(() => {
    return products.filter((p) => p.store_id === currentStore.id);
  }, [products, currentStore.id]);

  const filteredStoreProducts = useMemo(() => {
    return storeProducts.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.name_en && p.name_en.toLowerCase().includes(productSearch.toLowerCase()));
      const matchCat = productCategoryFilter === "all" || p.category_id === productCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [storeProducts, productSearch, productCategoryFilter]);

  // Filter orders for active store
  const storeOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStore = o.store_id === currentStore.id || o.store_id === "multi-store";
      if (!matchesStore) return false;
      if (orderStatusFilter === "all") return true;
      return o.status === orderStatusFilter;
    });
  }, [orders, currentStore.id, orderStatusFilter]);

  // Payouts for active store
  const storePayouts = useMemo(() => {
    return payouts.filter((p) => p.store_id === currentStore.id);
  }, [payouts, currentStore.id]);

  // Financial Calculations
  const totalStoreGross = useMemo(() => {
    const fromOrders = storeOrders.reduce((acc, o) => acc + o.total_amount, 0);
    return fromOrders > 0 ? fromOrders : 34800;
  }, [storeOrders]);

  const commissionRate = currentStore.commission_rate || 8;
  const totalCommissionDeducted = Math.round((totalStoreGross * commissionRate) / 100);
  const netEarnings = totalStoreGross - totalCommissionDeducted;

  const totalTransferredPayouts = useMemo(() => {
    return storePayouts
      .filter((p) => p.status === "transferred" || p.status === "approved")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [storePayouts]);

  const availableBalanceForWithdrawal = Math.max(0, netEarnings - totalTransferredPayouts);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Handlers
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === newProdCat);

    addProduct({
      name: newProdName,
      name_en: newProdNameEn || newProdName,
      description: newProdDesc,
      price: Number(newProdPrice),
      original_price: newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined,
      category_id: newProdCat,
      category_slug: cat?.slug,
      stock: Number(newProdStock),
      image_url: newProdImageUrl,
      store_id: currentStore.id,
      store_name: currentStore.name,
      free_shipping: newProdFreeShip,
      is_featured: newProdFeatured,
      rating: 5.0,
      reviews_count: 1,
      status: "active",
    });

    setShowAddModal(false);
    showToast(isAr ? "تم نشر المنتج الجديد في المتجر بنجاح!" : "Product published to store successfully!");

    // Reset Form
    setNewProdName("");
    setNewProdNameEn("");
    setNewProdPrice("");
    setNewProdOriginalPrice("");
    setNewProdDesc("");
  };

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payoutAmount);
    if (amountNum <= 0 || amountNum > availableBalanceForWithdrawal) {
      alert(isAr ? "المبلغ المطلوب يتجاوز الرصيد المتاح للسحب" : "Amount exceeds available withdrawal balance");
      return;
    }

    const res = requestStorePayout(currentStore.id, amountNum, payoutIban, payoutBank, payoutNotes);
    if (res.success) {
      setShowPayoutModal(false);
      setPayoutAmount("");
      setPayoutNotes("");
      showToast(isAr ? "تم تقديم طلب سحب الأرباح بنجاح!" : "Payout request submitted successfully!");
    } else {
      alert(res.message);
    }
  };

  const handleSaveStoreProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreProfile(currentStore.id, {
      name: profileName,
      description: profileDesc,
      country: profileCountry,
      contact_email: profileEmail,
      contact_phone: profilePhone,
      iban: profileIban,
      bank_name: profileBank,
    });
    showToast(isAr ? "تم حفظ إعدادات وهوية المتجر بنجاح!" : "Store profile updated successfully!");
  };

  return (
    <main className="noormexa-main py-8 md:py-12">
      <div className="noormexa-container space-y-8">
        {/* Top Header & Store Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-line pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Store Switcher Dropdown */}
              <div className="relative inline-block">
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="appearance-none bg-surface border border-line hover:border-gold px-4 py-2 pr-9 rounded-2xl font-black text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 shadow-xs cursor-pointer"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.country || "المتجر"})
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
              </div>

              {currentStore.is_verified && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-600 font-bold text-xs border border-emerald-600/20 shadow-xs">
                  <BadgeCheck size={14} />
                  <span>{isAr ? "بائع موثق معتمد" : "Verified Merchant"}</span>
                </span>
              )}

              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-gold font-bold text-xs border border-amber-500/20">
                {isAr ? `العمولة: ${commissionRate}%` : `Fee: ${commissionRate}%`}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted">
              {isAr
                ? "لوحة التحكم المتكاملة لإدارة كتالوج المنتجات، فحص الطلبات، ومعالجة التسويات المالية وسحب الأرباح"
                : "Manage multi-vendor catalog, fulfill incoming orders, and track your financial payouts"}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/store/${currentStore.slug}`}
              className="px-4 py-2.5 rounded-xl border border-line hover:border-gold bg-surface text-foreground font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
            >
              <Globe size={15} className="text-gold" />
              <span>{isAr ? "واجهة المتجر العامة" : "View Storefront"}</span>
            </Link>

            <Link
              href="/seller/register"
              className="px-4 py-2.5 rounded-xl border border-line bg-surface text-foreground hover:bg-surface-soft font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Building2 size={15} className="text-muted" />
              <span>{isAr ? "تسجيل متجر جديد" : "Onboard New Store"}</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus size={16} />
              <span>{isAr ? "إضافة منتج جديد" : "Add New Product"}</span>
            </button>
          </div>
        </div>

        {/* Global Notification */}
        {notification && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-md animate-in fade-in">
            <Check size={18} />
            <span>{notification}</span>
          </div>
        )}

        {/* Navigation Tabs - Symmetrical Grid */}
        <div className="bg-surface/90 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-line shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {[
              { id: "analytics", labelAr: "المؤشرات والأرباح", labelEn: "Analytics & Stats", icon: TrendingUp, count: null },
              { id: "products", labelAr: "كتالوج المنتجات", labelEn: "Catalog Products", icon: Boxes, count: `${storeProducts.length}` },
              { id: "orders", labelAr: "طلبات المتجر", labelEn: "Store Orders", icon: Truck, count: `${storeOrders.length}` },
              { id: "payouts", labelAr: "التسويات والسحب", labelEn: "Payouts & Ledger", icon: Wallet, count: `${storePayouts.length}` },
              { id: "settings", labelAr: "إعدادات وهوية المتجر", labelEn: "Store Settings", icon: Settings, count: null },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center justify-between gap-2 px-3 py-3 rounded-xl sm:rounded-2xl font-bold text-xs transition-all border select-none w-full min-h-[50px] ${
                    active
                      ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20 font-black dark:bg-navy dark:text-gold dark:border-gold dark:shadow-none ring-2 ring-amber-500/20 dark:ring-gold/20"
                      : "bg-surface text-foreground/90 border-line hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 text-start">
                    <Icon size={16} className={`shrink-0 ${active ? "text-white dark:text-gold" : "text-amber-600 dark:text-gold"}`} />
                    <span className="text-xs font-bold leading-tight truncate">{isAr ? tab.labelAr : tab.labelEn}</span>
                  </div>
                  {tab.count !== null && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-lg font-black shrink-0 ${
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

        {/* Tab 1: Performance & Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-in fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{isAr ? "إجمالي المبيعات (GMV)" : "Gross Merchandise Value"}</span>
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-gold">
                    <TrendingUp size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground">{formatPrice(totalStoreGross)}</div>
                <div className="text-[11px] text-muted">{isAr ? "إجمالي قيمة طلبات المتجر" : "Total store customer orders"}</div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{isAr ? "صافي أرباح المتجر" : "Net Store Earnings"}</span>
                  <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600">
                    <Wallet size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-600">{formatPrice(netEarnings)}</div>
                <div className="text-[11px] text-muted">{isAr ? `بعد استقطاع عمولة المنصة (${commissionRate}%)` : `After ${commissionRate}% platform fee`}</div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{isAr ? "الرصيد المتاح للسحب" : "Available for Payout"}</span>
                  <span className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                    <CreditCard size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground">{formatPrice(availableBalanceForWithdrawal)}</div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted">{isAr ? "جاهز للتحويل البنكي" : "Ready to transfer"}</span>
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(true)}
                    className="text-xs font-bold text-gold hover:underline flex items-center gap-0.5"
                  >
                    <span>{isAr ? "طلب سحب" : "Withdraw"}</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{isAr ? "المنتجات ومعدل الرضا" : "Products & Rating"}</span>
                  <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                    <Boxes size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground">{storeProducts.length} <span className="text-xs font-normal text-muted">منتج ({currentStore.rating || 5.0} ★)</span></div>
                <div className="text-[11px] text-muted">{isAr ? "تقييم ممتاز من المشترين" : "High buyer satisfaction"}</div>
              </div>
            </div>

            {/* Quick Actions and Growth Banner */}
            <div className="p-6 rounded-3xl bg-surface-soft border border-line flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-start">
                <div className="font-black text-sm text-foreground flex items-center gap-2">
                  <Sparkles size={16} className="text-gold" />
                  <span>{isAr ? "برنامج الشحن السريع وحماية المتاجر NOORMEXA Fulfillment" : "NOORMEXA Logistics & Seller Protection"}</span>
                </div>
                <p className="text-xs text-muted max-w-xl">
                  {isAr
                    ? "منتجات متجرك مؤهلة لخدمة الشحن السريع والتسليم خلال 24-48 ساعة لزيادة المبيعات بنسبة تصل إلى 40%."
                    : "Your products are eligible for 24-48h express delivery across the region, boosting conversion by up to 40%."}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs flex items-center gap-2 shadow-xs transition-all"
                >
                  <Wallet size={15} />
                  <span>{isAr ? "سحب الأرباح الآن" : "Request Payout"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Catalog Products */}
        {activeTab === "products" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <h2 className="text-base font-black text-foreground flex items-center gap-2">
                  <Boxes size={18} className="text-gold" />
                  <span>{isAr ? "كتالوج منتجات المتجر وإدارة المخزون" : "Catalog & Inventory Management"}</span>
                </h2>
                <p className="text-xs text-muted">{isAr ? `إجمالي ${storeProducts.length} منتج مسجل في هذا المتجر` : `${storeProducts.length} total products listed`}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs flex items-center gap-2 shadow-xs self-start sm:self-auto"
              >
                <Plus size={15} />
                <span>{isAr ? "إضافة منتج جديد" : "Add New Product"}</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={isAr ? "ابحث بالاسم العربي أو الإنجليزي للمنتج..." : "Search products..."}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-surface-soft border border-line text-xs focus:outline-none focus:border-gold"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-surface-soft border border-line text-xs font-bold text-foreground focus:outline-none focus:border-gold"
              >
                <option value="all">{isAr ? "جميع الأقسام" : "All Categories"}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isAr ? c.name_ar : c.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Product List */}
            {filteredStoreProducts.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-surface-soft rounded-2xl border border-line">
                <Boxes size={32} className="text-muted mx-auto" />
                <div className="text-xs font-bold text-foreground">{isAr ? "لم يتم العثور على منتجات مطابقة" : "No products found"}</div>
                <p className="text-[11px] text-muted">{isAr ? "أضف منتجك الأول لبدء استقبال الطلبات" : "Add your first product to start selling"}</p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {filteredStoreProducts.map((p) => (
                  <div key={p.id} className="py-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-soft border border-line shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image_url || ""} alt="" className="w-full h-full object-cover" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <Link href={`/marketplace/${p.id}`} className="font-black text-sm text-foreground hover:text-gold truncate block">
                          {p.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-muted">
                          <span className="font-black text-amber-600 dark:text-gold text-xs">{formatPrice(p.price)}</span>
                          {p.original_price && <span className="line-through text-muted">{formatPrice(p.original_price)}</span>}
                          <span>•</span>
                          <span>{isAr ? "المخزون:" : "Stock:"} <strong className="text-foreground">{p.stock}</strong></span>
                          {p.free_shipping && <span>• <strong className="text-emerald-600">{isAr ? "شحن مجاني" : "Free Shipping"}</strong></span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Stock inline adjuster */}
                      <div className="flex items-center rounded-xl bg-surface-soft border border-line overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateProductItem(p.id, { stock: Math.max(0, p.stock - 1) })}
                          className="px-2.5 py-1.5 hover:bg-surface text-muted hover:text-foreground font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono font-bold text-foreground text-xs">{p.stock}</span>
                        <button
                          type="button"
                          onClick={() => updateProductItem(p.id, { stock: p.stock + 1 })}
                          className="px-2.5 py-1.5 hover:bg-surface text-muted hover:text-foreground font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Visibility Toggle */}
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
                        title={isAr ? "تبديل حالة العرض بالسوق" : "Toggle Market Visibility"}
                      >
                        {p.status === "active" ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(isAr ? "هل أنت متأكد من حذف هذا المنتج؟" : "Delete this product?")) {
                            deleteProductItem(p.id);
                            showToast(isAr ? "تم حذف المنتج" : "Product deleted");
                          }
                        }}
                        className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                        title={isAr ? "حذف المنتج" : "Delete Product"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Store Orders Fulfillment */}
        {activeTab === "orders" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <h2 className="text-base font-black text-foreground flex items-center gap-2">
                  <Truck size={18} className="text-gold" />
                  <span>{isAr ? "طلبات المتجر وعمليات الشحن والتسليم" : "Orders & Fulfillment Logistics"}</span>
                </h2>
                <p className="text-xs text-muted">{isAr ? "معالجة بوالص الشحن وتحديث حالة تتبع الشحنات للعملاء" : "Manage customer orders and generate packing slips"}</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-surface-soft border border-line text-xs font-bold text-foreground focus:outline-none focus:border-gold"
                >
                  <option value="all">{isAr ? "جميع الحالات" : "All Statuses"}</option>
                  <option value="pending">{isAr ? "قيد الانتظار (Pending)" : "Pending"}</option>
                  <option value="paid">{isAr ? "مدفوع (Paid)" : "Paid"}</option>
                  <option value="processing">{isAr ? "جاري التجهيز (Processing)" : "Processing"}</option>
                  <option value="shipped">{isAr ? "تم الشحن (Shipped)" : "Shipped"}</option>
                  <option value="delivered">{isAr ? "تم التسليم (Delivered)" : "Delivered"}</option>
                </select>
              </div>
            </div>

            {storeOrders.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-surface-soft rounded-2xl border border-line">
                <Truck size={32} className="text-muted mx-auto" />
                <div className="text-xs font-bold text-foreground">{isAr ? "لا توجد طلبات جديدة لمتجرك حالياً" : "No orders found"}</div>
                <p className="text-[11px] text-muted">{isAr ? "ستظهر الطلبات الجديدة هنا فور قيام المشترين بإتمام الدفع" : "New orders will appear here automatically"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {storeOrders.map((ord) => (
                  <div key={ord.id} className="p-5 rounded-2xl bg-surface-soft border border-line space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/60 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-sm text-foreground">{ord.orderNumber}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] uppercase ${
                            ord.status === "delivered"
                              ? "bg-emerald-600/15 text-emerald-600"
                              : ord.status === "shipped"
                              ? "bg-sky-500/15 text-sky-500"
                              : "bg-amber-500/15 text-amber-600 dark:text-gold"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="text-xs font-black text-amber-600 dark:text-gold">
                        {formatPrice(ord.total_amount)}
                      </div>
                    </div>

                    {/* Customer & Shipping Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-muted block text-[11px]">{isAr ? "العميل:" : "Buyer:"}</span>
                        <strong className="text-foreground">{ord.shipping_info.fullName}</strong>
                        <div className="text-muted text-[11px]">{ord.shipping_info.phone}</div>
                      </div>

                      <div>
                        <span className="text-muted block text-[11px]">{isAr ? "عنوان الشحن:" : "Delivery Address:"}</span>
                        <div className="text-foreground">{ord.shipping_info.city} - {ord.shipping_info.address}</div>
                        <div className="text-muted text-[11px]">{ord.shipping_info.country}</div>
                      </div>

                      <div>
                        <span className="text-muted block text-[11px]">{isAr ? "رقم التتبع والناقل:" : "Tracking & Logistics:"}</span>
                        <div className="font-mono text-foreground font-bold">{ord.trackingNumber}</div>
                        <div className="text-muted text-[11px]">{ord.carrier || "NOORMEXA Logistics"}</div>
                      </div>
                    </div>

                    {/* Ordered Items summary */}
                    <div className="p-3 rounded-xl bg-surface border border-line/60 space-y-1.5">
                      <span className="text-[11px] font-bold text-muted block">{isAr ? "محتويات الطلب:" : "Order Items:"}</span>
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                          <span className="text-foreground font-medium">{it.product_name} (x{it.quantity})</span>
                          <span className="font-mono text-muted">{formatPrice(it.unit_price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted text-[11px]">{isAr ? "تحديث الحالة:" : "Update Status:"}</span>
                        <select
                          value={ord.status}
                          onChange={(e) => {
                            updateOrderStatus(ord.id, e.target.value as Order["status"]);
                            showToast(isAr ? `تم تحديث حالة الطلب إلى ${e.target.value}` : `Order updated to ${e.target.value}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-surface border border-line text-xs font-bold text-foreground focus:outline-none"
                        >
                          <option value="pending">{isAr ? "قيد المراجعة (Pending)" : "Pending"}</option>
                          <option value="paid">{isAr ? "تم الدفع (Paid)" : "Paid"}</option>
                          <option value="processing">{isAr ? "جاري التجهيز والتغليف (Processing)" : "Processing"}</option>
                          <option value="shipped">{isAr ? "تم الشحن مع المندوب (Shipped)" : "Shipped"}</option>
                          <option value="delivered">{isAr ? "تم التسليم بنجاح (Delivered)" : "Delivered"}</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedOrderForInvoice(ord)}
                        className="px-3.5 py-1.5 rounded-xl bg-surface border border-line hover:border-gold text-foreground font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Printer size={14} className="text-gold" />
                        <span>{isAr ? "طباعة بوليصة الشحن والفاتورة" : "Packing Slip & Invoice"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Financial Payouts & Settlement Hub */}
        {activeTab === "payouts" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <h2 className="text-base font-black text-foreground flex items-center gap-2">
                  <Wallet size={18} className="text-gold" />
                  <span>{isAr ? "التسويات المالية ومستحقات الأرباح البنكية" : "Payouts & Financial Settlements"}</span>
                </h2>
                <p className="text-xs text-muted">{isAr ? "سجل التحويلات البنكية المباشرة وعمليات سحب الرصيد" : "Direct bank wire transfers and withdrawal history"}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowPayoutModal(true)}
                disabled={availableBalanceForWithdrawal <= 0}
                className="px-5 py-2.5 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <Plus size={15} />
                <span>{isAr ? "طلب سحب أرباح جديد" : "Request Payout"}</span>
              </button>
            </div>

            {/* Payout Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-surface-soft border border-line space-y-1.5">
                <div className="text-muted text-[11px]">{isAr ? "الرصيد المتاح للسحب الآن" : "Available for Payout"}</div>
                <div className="text-2xl font-black text-emerald-600">{formatPrice(availableBalanceForWithdrawal)}</div>
                <div className="text-[10px] text-muted">{isAr ? "محسوب بعد استقطاع عمولة المنصة" : "After platform commission"}</div>
              </div>

              <div className="p-5 rounded-2xl bg-surface-soft border border-line space-y-1.5">
                <div className="text-muted text-[11px]">{isAr ? "إجمالي الأرباح المحولة سابقاً" : "Lifetime Transferred"}</div>
                <div className="text-2xl font-black text-foreground">{formatPrice(totalTransferredPayouts)}</div>
                <div className="text-[10px] text-muted">{isAr ? "تم تحويلها لحسابك البنكي" : "Deposited to your bank"}</div>
              </div>

              <div className="p-5 rounded-2xl bg-surface-soft border border-line space-y-1.5">
                <div className="text-muted text-[11px]">{isAr ? "حسابك البنكي المعتمد (IBAN)" : "Registered Bank IBAN"}</div>
                <div className="text-xs font-mono font-bold text-foreground truncate">{currentStore.iban || "SA12 1000 0001 2345 6789 0123"}</div>
                <div className="text-[10px] text-muted">{currentStore.bank_name || "مصرف الراجحي"}</div>
              </div>
            </div>

            {/* Payout History Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-foreground">{isAr ? "سجل طلبات السحب والتحويلات:" : "Payout Requests History:"}</h3>
              {storePayouts.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted bg-surface-soft rounded-2xl border border-line">
                  {isAr ? "لا توجد طلبات سحب سابقة لهذا المتجر." : "No payout requests recorded."}
                </div>
              ) : (
                <div className="divide-y divide-line rounded-2xl border border-line bg-surface-soft overflow-hidden text-xs">
                  {storePayouts.map((p) => (
                    <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{formatPrice(p.amount)}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
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
                        <div className="text-muted text-[11px]">
                          {p.bank_name} - <span className="font-mono">{p.iban}</span>
                        </div>
                        {p.transaction_ref && (
                          <div className="text-[10px] font-mono text-muted">
                            {isAr ? "رقم الحوالة البنكية:" : "Ref:"} {p.transaction_ref}
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-muted text-start sm:text-end">
                        <div>{new Date(p.requested_at).toLocaleDateString(isAr ? "ar-EG" : "en-US")}</div>
                        {p.notes && <div className="text-[10px] text-muted italic">{p.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Store Profile & Identity Settings */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveStoreProfile} className="p-6 sm:p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-line pb-4">
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <Settings size={18} className="text-gold" />
                <span>{isAr ? "إعدادات وهوية المتجر والبيانات التجارية" : "Store Profile & Settings"}</span>
              </h2>
              <p className="text-xs text-muted">{isAr ? "تعديل البيانات العامة لمتجرك ومعلومات التواصل والحساب البنكي" : "Update public brand info, contact details, and bank account"}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">{isAr ? "اسم المتجر التجاري" : "Store Brand Name"}</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">{isAr ? "الدولة والمقر الرئيسي" : "Country"}</label>
                <input
                  type="text"
                  value={profileCountry}
                  onChange={(e) => setProfileCountry(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">{isAr ? "البريد الإلكتروني التجاري" : "Business Email"}</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">{isAr ? "رقم الهاتف / واتساب" : "Contact Phone"}</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-foreground">{isAr ? "نبذة عن المتجر والعلامة التجارية" : "Store Description"}</label>
                <textarea
                  rows={3}
                  value={profileDesc}
                  onChange={(e) => setProfileDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">{isAr ? "اسم البنك لتحويل الأرباح" : "Bank Name"}</label>
                <input
                  type="text"
                  value={profileBank}
                  onChange={(e) => setProfileBank(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">{isAr ? "رقم الآيبان البنكي (IBAN)" : "Bank IBAN"}</label>
                <input
                  type="text"
                  value={profileIban}
                  onChange={(e) => setProfileIban(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold font-mono uppercase"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-line">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs shadow-xs transition-all"
              >
                {isAr ? "حفظ التعديلات" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-surface rounded-3xl border border-line shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 font-black text-foreground text-base">
                <Plus size={18} className="text-gold" />
                <span>{isAr ? "إضافة منتج جديد لكتالوج المتجر" : "Add Product to Store Catalog"}</span>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">{isAr ? "اسم المنتج (عربي) *" : "Product Name (Arabic) *"}</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="مثال: ساعة يد رجالية فاخرة..."
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{isAr ? "اسم المنتج (إنجليزي)" : "Product Name (English)"}</label>
                  <input
                    type="text"
                    value={newProdNameEn}
                    onChange={(e) => setNewProdNameEn(e.target.value)}
                    placeholder="e.g. Luxury Automatic Watch..."
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{isAr ? "القسم والتصنيف *" : "Category *"}</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr ? c.name_ar : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{isAr ? "الكمية المتاحة بالمخزون *" : "Stock Quantity *"}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{isAr ? "السعر الأساسي (EGP) *" : "Price (EGP) *"}</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="2500"
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{isAr ? "السعر قبل الخصم (اختياري)" : "Original Price"}</label>
                  <input
                    type="number"
                    value={newProdOriginalPrice}
                    onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                    placeholder="3200"
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-foreground">{isAr ? "رابط الصورة الرئيسية للمنتج *" : "Main Image URL *"}</label>
                  <input
                    type="url"
                    required
                    value={newProdImageUrl}
                    onChange={(e) => setNewProdImageUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-foreground">{isAr ? "الوصف التفصيلي للمنتج *" : "Description *"}</label>
                  <textarea
                    rows={3}
                    required
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="اكتب مواصفات وتفاصيل المنتج الفاخر..."
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-foreground">
                    <input
                      type="checkbox"
                      checked={newProdFreeShip}
                      onChange={(e) => setNewProdFreeShip(e.target.checked)}
                      className="accent-[#d4af37]"
                    />
                    <span>{isAr ? "توفير شحن مجاني لهذا المنتج" : "Free Shipping"}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-foreground">
                    <input
                      type="checkbox"
                      checked={newProdFeatured}
                      onChange={(e) => setNewProdFeatured(e.target.checked)}
                      className="accent-[#d4af37]"
                    />
                    <span>{isAr ? "إبراز كمنتج مميز (Featured)" : "Mark as Featured"}</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-line text-muted hover:text-foreground font-bold text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs shadow-xs transition-all"
                >
                  {isAr ? "حفظ ونشر المنتج" : "Save & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface rounded-3xl border border-line shadow-2xl p-6 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 font-black text-foreground text-base">
                <Wallet size={18} className="text-gold" />
                <span>{isAr ? "طلب سحب أرباح وتحويل بنكي" : "Request Bank Payout"}</span>
              </div>
              <button type="button" onClick={() => setShowPayoutModal(false)} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-surface-soft border border-line space-y-1">
                <div className="text-muted text-[11px]">{isAr ? "الرصيد المتاح للسحب:" : "Available Balance:"}</div>
                <div className="text-xl font-black text-emerald-600">{formatPrice(availableBalanceForWithdrawal)}</div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">{isAr ? "المبلغ المطلوب سحبه (EGP) *" : "Withdrawal Amount (EGP) *"}</label>
                <input
                  type="number"
                  required
                  min="100"
                  max={availableBalanceForWithdrawal}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold font-bold text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">{isAr ? "اسم البنك *" : "Bank Name *"}</label>
                <input
                  type="text"
                  required
                  value={payoutBank}
                  onChange={(e) => setPayoutBank(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">{isAr ? "رقم الآيبان (IBAN) *" : "Bank IBAN *"}</label>
                <input
                  type="text"
                  required
                  value={payoutIban}
                  onChange={(e) => setPayoutIban(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">{isAr ? "ملاحظات إضافية (اختياري)" : "Notes (Optional)"}</label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder={isAr ? "مثال: تسوية مبيعات الأسبوع الأول" : "e.g. Week 1 sales settlement"}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-line text-muted hover:text-foreground font-bold text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs shadow-xs transition-all"
                >
                  {isAr ? "إرسال طلب السحب" : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Packing Slip & Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-surface rounded-3xl border border-line shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 font-black text-foreground text-base">
                <Printer size={18} className="text-gold" />
                <span>{isAr ? "بوليصة الشحن والفاتورة الضريبية الرسمية" : "Official Packing Slip & Tax Invoice"}</span>
              </div>
              <button type="button" onClick={() => setSelectedOrderForInvoice(null)} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            {/* Printable Area */}
            <div className="p-6 rounded-2xl bg-surface-soft border border-line space-y-6 text-xs text-foreground font-sans">
              <div className="flex justify-between items-start border-b border-line pb-4">
                <div>
                  <div className="text-lg font-black text-foreground">NOORMEXA EXPRESS</div>
                  <div className="text-muted text-[11px]">{isAr ? "بوليصة شحن واستلام وتوصيل معتمدة" : "Verified Logistics Dispatch"}</div>
                </div>
                <div className="text-end">
                  <div className="font-mono font-black text-sm text-gold">{selectedOrderForInvoice.orderNumber}</div>
                  <div className="font-mono text-muted text-[11px]">{selectedOrderForInvoice.trackingNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-muted text-[11px] font-bold block">{isAr ? "المرسل (المتجر):" : "Sender (Store):"}</span>
                  <div className="font-bold text-foreground">{currentStore.name}</div>
                  <div className="text-muted text-[11px]">{currentStore.country}</div>
                  <div className="text-muted text-[11px]">{currentStore.contact_phone}</div>
                </div>

                <div className="space-y-1 text-end">
                  <span className="text-muted text-[11px] font-bold block">{isAr ? "المستلم (العميل):" : "Recipient (Customer):"}</span>
                  <div className="font-bold text-foreground">{selectedOrderForInvoice.shipping_info.fullName}</div>
                  <div className="text-muted text-[11px]">{selectedOrderForInvoice.shipping_info.address}, {selectedOrderForInvoice.shipping_info.city}</div>
                  <div className="text-muted text-[11px]">{selectedOrderForInvoice.shipping_info.phone}</div>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-line rounded-xl overflow-hidden">
                <table className="w-full text-xs text-start">
                  <thead className="bg-surface border-b border-line text-muted">
                    <tr>
                      <th className="p-2.5 text-start">{isAr ? "المنتج" : "Item"}</th>
                      <th className="p-2.5 text-center">{isAr ? "الكمية" : "Qty"}</th>
                      <th className="p-2.5 text-end">{isAr ? "السعر" : "Price"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {selectedOrderForInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold">{it.product_name}</td>
                        <td className="p-2.5 text-center font-mono">{it.quantity}</td>
                        <td className="p-2.5 text-end font-mono font-bold text-gold">{formatPrice(it.unit_price * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2 font-black text-sm">
                <span>{isAr ? "إجمالي الفاتورة:" : "Total Amount:"}</span>
                <span className="text-gold">{formatPrice(selectedOrderForInvoice.total_amount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-6 py-2.5 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                <Printer size={15} />
                <span>{isAr ? "طباعة الفاتورة الآن" : "Print Invoice"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
