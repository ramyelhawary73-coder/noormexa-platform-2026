"use client";

import { useState, useSyncExternalStore, useMemo } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Boxes,
  Check,
  DollarSign,
  Eye,
  EyeOff,
  Plus,
  Settings,
  Sparkles,
  Store as StoreIcon,
  Trash2,
  TrendingUp,
  Truck,
  X,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    title: "بوابة التجار ولوحة تحكم المتجر",
    subtitle: "إدارة المنتجات، متابعة المبيعات الصافية، وتجهيز طلبات العملاء",
    tabAnalytics: "المؤشرات والأرباح",
    tabProducts: "منتجات المتجر",
    tabOrders: "طلبات المتجر",
    tabSettings: "إعدادات المتجر",
    addNewProduct: "إضافة منتج جديد",
    netSales: "صافي مبيعات المتجر",
    storeOrders: "طلبات المتجر الواردة",
    activeProducts: "المنتجات النشطة",
    commissionRate: "نسبة عمولة المنصة",
    productName: "اسم المنتج (عربي)",
    productNameEn: "اسم المنتج (إنجليزي)",
    category: "القسم",
    price: "السعر الأساسي (EGP)",
    originalPrice: "السعر قبل الخصم (اختياري)",
    stock: "الكمية المتاحة في المخزون",
    imageUrl: "رابط الصورة الرئيسية للمنتج",
    description: "الوصف التفصيلي للمنتج",
    freeShipping: "توفير شحن مجاني لهذا المنتج",
    featured: "طلب إبراز كمنتج مميز (Featured)",
    cancel: "إلغاء",
    saveProduct: "حفظ ونشر المنتج",
    productAddedSuccess: "تمت إضافة المنتج ونشره في السوق بنجاح!",
  },
  en: {
    title: "Merchant Hub & Store Portal",
    subtitle: "Manage catalog inventory, monitor net earnings, and fulfill customer orders",
    tabAnalytics: "Analytics & Payouts",
    tabProducts: "My Store Products",
    tabOrders: "Store Orders",
    tabSettings: "Store Profile Settings",
    addNewProduct: "Add New Product",
    netSales: "Store Net Sales",
    storeOrders: "Store Orders",
    activeProducts: "Active Products",
    commissionRate: "Platform Commission",
    productName: "Product Name (Arabic)",
    productNameEn: "Product Name (English)",
    category: "Category",
    price: "Base Price (EGP)",
    originalPrice: "Original Price (Optional)",
    stock: "Available Inventory Units",
    imageUrl: "Main Image URL",
    description: "Detailed Description",
    freeShipping: "Offer Free Shipping on this item",
    featured: "Mark as Featured",
    cancel: "Cancel",
    saveProduct: "Save & Publish Product",
    productAddedSuccess: "Product successfully added and published to the marketplace!",
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

export default function SellerDashboardPage() {
  const language = useNoormexaLanguage();
  const text = copy[language];

  const {
    products,
    stores,
    orders,
    categories,
    formatPrice,
    addProduct,
    updateProductItem,
    deleteProductItem,
  } = useMarketplace();

  // Current active merchant store (default to store-1: "نورمكسا للأناقة الفاخرة")
  const currentStore = stores[0] || {
    id: "store-1",
    name: "متجر نورمكسا المعتمد",
    commission_rate: 8,
    is_verified: true,
  };

  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "settings">("analytics");
  const [showAddModal, setShowAddModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // New Product Form State
  const [newProdName, setNewProdName] = useState("");
  const [newProdNameEn, setNewProdNameEn] = useState("");
  const [newProdCat, setNewProdCat] = useState(categories[0]?.id || "cat-1");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("10");
  const [newProdImageUrl, setNewProdImageUrl] = useState("https://picsum.photos/seed/luxitem99/800/800");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdFreeShip, setNewProdFreeShip] = useState(false);
  const [newProdFeatured, setNewProdFeatured] = useState(false);

  // Store's products & orders
  const storeProducts = useMemo(() => {
    return products.filter((p) => p.store_id === currentStore.id);
  }, [products, currentStore.id]);

  const storeOrders = useMemo(() => {
    return orders.filter((o) => o.store_id === currentStore.id);
  }, [orders, currentStore.id]);

  // Financial stats
  const totalStoreGross = storeOrders.reduce((acc, o) => acc + o.total_amount, 0) + 48200;
  const storeCommissionAmount = (totalStoreGross * (currentStore.commission_rate || 8)) / 100;
  const storeNetEarnings = totalStoreGross - storeCommissionAmount;

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
      reviews_count: 0,
      status: "active",
    });

    setShowAddModal(false);
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 3000);

    // Reset Form
    setNewProdName("");
    setNewProdNameEn("");
    setNewProdPrice("");
    setNewProdOriginalPrice("");
    setNewProdDesc("");
  };

  return (
    <main className="noormexa-main py-8 md:py-12">
      <div className="noormexa-container space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-surface border border-line">
                <StoreIcon size={18} className="text-gold" />
              </span>
              <h1 className="text-2xl font-extrabold text-foreground">{currentStore.name}</h1>
              {currentStore.is_verified && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-600 font-bold text-xs border border-emerald-600/20">
                  <BadgeCheck size={13} />
                  <span>متجر موثق</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted">{text.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gold text-navy hover:bg-gold-strong font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus size={16} />
              <span>{text.addNewProduct}</span>
            </button>
          </div>
        </div>

        {successNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
            <Check size={16} />
            <span>{text.productAddedSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs - 100% Symmetrical 4-Column Grid */}
        <div className="bg-surface/90 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-line shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {[
              { id: "analytics", label: text.tabAnalytics, icon: TrendingUp, count: null },
              { id: "products", label: text.tabProducts, icon: Boxes, count: `${storeProducts.length}` },
              { id: "orders", label: text.tabOrders, icon: Truck, count: `${storeOrders.length}` },
              { id: "settings", label: text.tabSettings, icon: Settings, count: null },
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

        {/* Tab 1: Analytics & Net Payouts */}
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{text.netSales}</span>
                  <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600">
                    <DollarSign size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground">{formatPrice(storeNetEarnings)}</div>
                <div className="text-[11px] text-muted">بعد استقطاع عمولة المنصة</div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{text.commissionRate}</span>
                  <span className="p-2 rounded-xl bg-gold-soft text-gold-strong">
                    <Sparkles size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-gold">{currentStore.commission_rate}%</div>
                <div className="text-[11px] text-muted">عمولة المنصة المفروضة على المتجر</div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{text.activeProducts}</span>
                  <span className="p-2 rounded-xl bg-surface-soft text-foreground">
                    <Boxes size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground">{storeProducts.length}</div>
                <div className="text-[11px] text-muted">منتجات معروضة في السوق</div>
              </div>

              <div className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{text.storeOrders}</span>
                  <span className="p-2 rounded-xl bg-surface-soft text-foreground">
                    <Truck size={16} />
                  </span>
                </div>
                <div className="text-2xl font-black text-foreground">{storeOrders.length + 8}</div>
                <div className="text-[11px] text-muted">طلبات تم تنفيذها وشحنها</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Store Products Management */}
        {activeTab === "products" && (
          <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Boxes size={18} className="text-gold" />
                <span>{text.tabProducts}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-gold text-navy font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={14} />
                <span>{text.addNewProduct}</span>
              </button>
            </div>

            <div className="divide-y divide-line">
              {storeProducts.map((p) => (
                <div key={p.id} className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-soft border border-line shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image_url || ""} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <Link href={`/marketplace/${p.id}`} className="font-bold text-sm text-foreground hover:text-gold line-clamp-1">
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-muted">
                        <span className="font-bold text-gold">{formatPrice(p.price)}</span>
                        <span>•</span>
                        <span>المخزون: <strong className="text-foreground">{p.stock}</strong></span>
                        {p.free_shipping && <span>• <strong className="text-emerald-600">شحن مجاني</strong></span>}
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
                      title="تبديل الظهور"
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

        {/* Tab 3: Store Orders Fulfillment */}
        {activeTab === "orders" && (
          <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
              <Truck size={18} className="text-gold" />
              <span>{text.tabOrders}</span>
            </h2>

            {storeOrders.length === 0 ? (
              <div className="text-center py-10 text-muted text-xs">
                لا توجد طلبات جديدة لمتجرك حالياً.
              </div>
            ) : (
              <div className="space-y-4">
                {storeOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl bg-surface-soft border border-line space-y-2 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>الطلب {ord.orderNumber}</span>
                      <span className="text-gold">{formatPrice(ord.total_amount)}</span>
                    </div>
                    <p className="text-muted">العميل: {ord.shipping_info.fullName} - {ord.shipping_info.city}</p>
                    <div className="text-[11px] text-muted">كود التتبع: <strong className="font-mono text-foreground">{ord.trackingNumber}</strong></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Store Profile Settings */}
        {activeTab === "settings" && (
          <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6 animate-in fade-in">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
              <Settings size={18} className="text-gold" />
              <span>{text.tabSettings}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">اسم المتجر الرسمي</label>
                <input
                  type="text"
                  defaultValue={currentStore.name}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">الدولة / المقر الرئيسي</label>
                <input
                  type="text"
                  defaultValue={currentStore.country || "المملكة العربية السعودية"}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-foreground">نبذة عن المتجر وعلامته التجارية</label>
                <textarea
                  rows={3}
                  defaultValue={currentStore.description || ""}
                  className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-surface rounded-3xl border border-line shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 font-bold text-foreground text-base">
                <Plus size={18} className="text-gold" />
                <span>{text.addNewProduct}</span>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.productName} *</label>
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
                  <label className="font-bold text-foreground">{text.productNameEn}</label>
                  <input
                    type="text"
                    value={newProdNameEn}
                    onChange={(e) => setNewProdNameEn(e.target.value)}
                    placeholder="e.g. Luxury Automatic Watch..."
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.category} *</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {language === "ar" ? c.name_ar : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.stock} *</label>
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
                  <label className="font-bold text-foreground">{text.price} *</label>
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
                  <label className="font-bold text-foreground">{text.originalPrice}</label>
                  <input
                    type="number"
                    value={newProdOriginalPrice}
                    onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                    placeholder="3200"
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-foreground">{text.imageUrl} *</label>
                  <input
                    type="url"
                    required
                    value={newProdImageUrl}
                    onChange={(e) => setNewProdImageUrl(e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-foreground">{text.description} *</label>
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
                    <span>{text.freeShipping}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-foreground">
                    <input
                      type="checkbox"
                      checked={newProdFeatured}
                      onChange={(e) => setNewProdFeatured(e.target.checked)}
                      className="accent-[#d4af37]"
                    />
                    <span>{text.featured}</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-line text-muted hover:text-foreground font-bold text-xs"
                >
                  {text.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold text-navy hover:bg-gold-strong font-bold text-xs shadow-sm transition-all"
                >
                  {text.saveProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
