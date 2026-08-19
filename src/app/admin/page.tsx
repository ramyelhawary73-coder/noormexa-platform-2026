"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Ban,
  BarChart3,
  LayoutDashboard,
  LayoutGrid,
  Megaphone,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store as StoreIcon,
  Trash2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import {
  createAnnouncement,
  createCategory,
  deleteAnnouncement,
  deleteCategory,
  getAllAdmins,
  getAllOrdersAdmin,
  getAllProductsAdmin,
  getAllStoresAdmin,
  getAnnouncements,
  getCategories,
  getPlatformStats,
  grantAdminByEmail,
  revokeAdmin,
  updateProductStatus,
  updateStoreCommission,
  updateStorePlan,
  updateStoreStatus,
  type AdminOrderRow,
  type AdminProductRow,
  type AdminProfile,
  type Announcement,
  type PlatformStats,
} from "@/lib/marketplace";
import type { Category, Store } from "@/types/marketplace";

const copy = {
  ar: {
    deniedTitle: "غير مصرح لك بالدخول",
    deniedText: "الصفحة دي مخصصة لمالك المنصة فقط.",
    back: "الرجوع للرئيسية",
    title: "لوحة تحكم المالك",
    subtitle: "التحكم الكامل في السوق: المتاجر، التصنيفات، والأرباح.",
    statsStores: "إجمالي المتاجر",
    statsPending: "بانتظار الموافقة",
    statsApproved: "متاجر معتمدة",
    statsProducts: "إجمالي المنتجات",
    statsOrders: "إجمالي الطلبات",
    statsRevenue: "أرباح المنصة (عمولات)",
    storesTitle: "إدارة المتاجر",
    colStore: "المتجر",
    colStatus: "الحالة",
    colPlan: "الباقة",
    colCommission: "العمولة %",
    colActions: "إجراءات",
    approve: "اعتماد",
    suspend: "إيقاف",
    pending: "قيد المراجعة",
    approved: "معتمد",
    suspended: "موقوف",
    save: "حفظ",
    basic: "أساسية",
    professional: "احترافية",
    storePlan: "متجر/علامة",
    categoriesTitle: "إدارة التصنيفات",
    addCategory: "إضافة تصنيف",
    nameAr: "الاسم بالعربي",
    nameEn: "الاسم بالإنجليزي",
    slug: "الرابط (slug)",
    delete: "حذف",
    noStores: "لا يوجد متاجر مسجلة بعد.",
    adminsTitle: "إدارة المالكين (Admins)",
    adminsHint: "امنح صلاحية إدارة المنصة الكاملة لأي حساب مسجّل بالفعل عن طريق إيميله.",
    annTitle: "المنشورات والإشعارات",
    annHint: "ابعت رسالة تظهر فورًا فى لوحة تحكم البائعين والمتاجر.",
    annTitlePlaceholder: "عنوان الرسالة",
    annBodyPlaceholder: "نص الرسالة",
    annAudienceLabel: "الجمهور",
    annAudienceAll: "الكل (كل الأنواع)",
    annAudienceSellers: "البائعين فقط",
    annAudienceStores: "المتاجر فقط",
    annAudienceAdvertisers: "المعلنين فقط",
    annPublish: "نشر الرسالة",
    annEmpty: "مفيش إعلانات منشورة لسه.",
    adminEmailPlaceholder: "إيميل الحساب المسجّل بالموقع",
    grantAdmin: "منح صلاحية مالك",
    revoke: "سحب الصلاحية",
    noAdmins: "مفيش مالكين تانيين لسه.",
    you: "(إنت)",
    developerBadge: "— مطوّر المنصة",
    navOverview: "نظرة عامة",
    navStores: "المتاجر",
    navProducts: "المنتجات",
    navOrders: "الطلبات",
    navCategories: "التصنيفات",
    navAdmins: "المالكين",
    navAnnouncements: "المنشورات",
    navFinance: "الإعدادات المالية",
    comingSoonTitle: "قريبًا",
    comingSoonText: "القسم ده جزء من المرحلة الجاية فى الخطة، هيتفعّل قريب.",
    productsTitle: "كل منتجات المنصة",
    colProduct: "المنتج",
    colStoreName: "المتجر",
    colPrice: "السعر",
    noProducts: "لا يوجد منتجات بعد.",
    active: "نشط",
    hidden: "مخفي",
    outOfStock: "غير متوفر",
    hide: "إخفاء",
    show: "إظهار",
    ordersTitle: "كل طلبات المنصة",
    colOrder: "رقم الطلب",
    colBuyer: "المشتري",
    colTotal: "الإجمالي",
    colDate: "التاريخ",
    noOrders: "لا يوجد طلبات بعد.",
  },
  en: {
    deniedTitle: "Access denied",
    deniedText: "This page is for the platform owner only.",
    back: "Back to home",
    title: "Owner dashboard",
    subtitle: "Full control over the market: stores, categories, and revenue.",
    statsStores: "Total stores",
    statsPending: "Pending approval",
    statsApproved: "Approved stores",
    statsProducts: "Total products",
    statsOrders: "Total orders",
    statsRevenue: "Platform revenue (commissions)",
    storesTitle: "Manage stores",
    colStore: "Store",
    colStatus: "Status",
    colPlan: "Plan",
    colCommission: "Commission %",
    colActions: "Actions",
    approve: "Approve",
    suspend: "Suspend",
    pending: "Pending",
    approved: "Approved",
    suspended: "Suspended",
    save: "Save",
    basic: "Basic",
    professional: "Professional",
    storePlan: "Store/Brand",
    categoriesTitle: "Manage categories",
    addCategory: "Add category",
    nameAr: "Name (Arabic)",
    nameEn: "Name (English)",
    slug: "Slug",
    delete: "Delete",
    noStores: "No stores registered yet.",
    adminsTitle: "Manage owners (Admins)",
    adminsHint: "Grant full platform management access to any already-registered account by email.",
    annTitle: "Announcements",
    annHint: "Send a message that appears instantly in sellers' and stores' dashboards.",
    annTitlePlaceholder: "Message title",
    annBodyPlaceholder: "Message body",
    annAudienceLabel: "Audience",
    annAudienceAll: "Everyone (all types)",
    annAudienceSellers: "Sellers only",
    annAudienceStores: "Stores only",
    annAudienceAdvertisers: "Advertisers only",
    annPublish: "Publish message",
    annEmpty: "No announcements published yet.",
    adminEmailPlaceholder: "Email of the registered account",
    grantAdmin: "Grant owner access",
    revoke: "Revoke access",
    noAdmins: "No other owners yet.",
    you: "(you)",
    developerBadge: "— Platform developer",
    navOverview: "Overview",
    navStores: "Stores",
    navProducts: "Products",
    navOrders: "Orders",
    navCategories: "Categories",
    navAdmins: "Owners",
    navAnnouncements: "Announcements",
    navFinance: "Financial settings",
    comingSoonTitle: "Coming soon",
    comingSoonText: "This section is part of the next phase of the plan and will be enabled soon.",
    productsTitle: "All platform products",
    colProduct: "Product",
    colStoreName: "Store",
    colPrice: "Price",
    noProducts: "No products yet.",
    active: "Active",
    hidden: "Hidden",
    outOfStock: "Out of stock",
    hide: "Hide",
    show: "Show",
    ordersTitle: "All platform orders",
    colOrder: "Order",
    colBuyer: "Buyer",
    colTotal: "Total",
    colDate: "Date",
    noOrders: "No orders yet.",
  },
} as const;

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const language = useNoormexaLanguage();
  const text = copy[language];

  const isAdmin = Boolean(profile?.is_admin);
  const isSuperAdmin = Boolean(profile?.is_super_admin);

  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [resolvedForId, setResolvedForId] = useState<string | null>(null);
  const loadingData = isAdmin && resolvedForId !== user?.id;

  const [catNameAr, setCatNameAr] = useState("");
  const [catNameEn, setCatNameEn] = useState("");
  const [catSlug, setCatSlug] = useState("");

  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [grantMessage, setGrantMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [grantBusy, setGrantBusy] = useState(false);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annAudience, setAnnAudience] = useState<Announcement["audience"]>("all");
  const [annBusy, setAnnBusy] = useState(false);

  const [adminProducts, setAdminProducts] = useState<AdminProductRow[]>([]);
  const [adminOrders, setAdminOrders] = useState<AdminOrderRow[]>([]);

  type Section = "overview" | "stores" | "products" | "orders" | "categories" | "admins" | "announcements" | "finance";
  const [activeSection, setActiveSection] = useState<Section>("overview");

  useEffect(() => {
    if (!user || !isAdmin) return;
    let active = true;
    Promise.all([
      getAllStoresAdmin(),
      getCategories(),
      getPlatformStats(),
      getAllAdmins(),
      getAnnouncements(),
      getAllProductsAdmin(),
      getAllOrdersAdmin(),
    ]).then(([s, c, st, ad, an, prod, ord]) => {
      if (!active) return;
      setStores(s);
      setCategories(c);
      setStats(st);
      setAdmins(ad);
      setAnnouncements(an);
      setAdminProducts(prod);
      setAdminOrders(ord);
      setResolvedForId(user.id);
    });
    return () => {
      active = false;
    };
  }, [user, isAdmin]);

  const handlePublishAnnouncement = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !annTitle.trim() || !annBody.trim()) return;
    setAnnBusy(true);
    const { announcement } = await createAnnouncement({
      title: annTitle.trim(),
      body: annBody.trim(),
      audience: annAudience,
      createdBy: user.id,
    });
    setAnnBusy(false);
    if (announcement) {
      setAnnouncements((prev) => [announcement, ...prev]);
      setAnnTitle("");
      setAnnBody("");
      setAnnAudience("all");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const ok = await deleteAnnouncement(id);
    if (ok) setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const handleStatus = async (store: Store, status: "approved" | "suspended") => {
    const ok = await updateStoreStatus(store.id, status);
    if (ok) setStores((prev) => prev.map((s) => (s.id === store.id ? { ...s, status } : s)));
  };

  const handleCommission = async (store: Store, value: string) => {
    const rate = Number(value);
    if (Number.isNaN(rate)) return;
    setStores((prev) => prev.map((s) => (s.id === store.id ? { ...s, commission_rate: rate } : s)));
  };

  const handleCommissionSave = async (store: Store) => {
    await updateStoreCommission(store.id, store.commission_rate);
  };

  const handlePlan = async (store: Store, plan: string) => {
    setStores((prev) => prev.map((s) => (s.id === store.id ? { ...s, plan } : s)));
    await updateStorePlan(store.id, plan);
  };

  const handleAddCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!catNameAr.trim() || !catNameEn.trim() || !catSlug.trim()) return;
    const { category } = await createCategory({
      name_ar: catNameAr.trim(),
      name_en: catNameEn.trim(),
      slug: catSlug.trim().toLowerCase(),
      icon: "Package",
      sort_order: categories.length + 1,
    });
    if (category) {
      setCategories((prev) => [...prev, category]);
      setCatNameAr("");
      setCatNameEn("");
      setCatSlug("");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const ok = await deleteCategory(id);
    if (ok) setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleGrantAdmin = async (event: FormEvent) => {
    event.preventDefault();
    if (!newAdminEmail.trim()) return;
    setGrantBusy(true);
    setGrantMessage(null);
    const result = await grantAdminByEmail(newAdminEmail.trim());
    setGrantBusy(false);
    if (result.success) {
      setGrantMessage({ ok: true, text: language === "ar" ? "تم منح الصلاحية بنجاح ✅" : "Access granted ✅" });
      setNewAdminEmail("");
      const updated = await getAllAdmins();
      setAdmins(updated);
    } else {
      setGrantMessage({ ok: false, text: result.error || (language === "ar" ? "حصل خطأ" : "Something went wrong") });
    }
  };

  const handleRevokeAdmin = async (adminId: string) => {
    const ok = await revokeAdmin(adminId);
    if (ok) setAdmins((prev) => prev.filter((a) => a.id !== adminId));
  };

  const handleToggleProductStatus = async (product: AdminProductRow) => {
    const nextStatus = product.status === "active" ? "hidden" : "active";
    const ok = await updateProductStatus(product.id, nextStatus);
    if (ok) setAdminProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p)));
  };

  if (authLoading || (isAdmin && loadingData)) {
    return (
      <main className="noormexa-main">
        <section className="noormexa-section" />
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="noormexa-main">
        <section className="noormexa-section">
          <div className="noormexa-container noormexa-empty-state">
            <ShieldCheck size={32} />
            <h1>{text.deniedTitle}</h1>
            <p>{text.deniedText}</p>
            <Link href="/" className="noormexa-primary-button">
              {text.back}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const navItems: { key: Section; label: string; icon: typeof BarChart3 }[] = [
    { key: "overview", label: text.navOverview, icon: BarChart3 },
    { key: "stores", label: text.navStores, icon: StoreIcon },
    { key: "products", label: text.navProducts, icon: LayoutGrid },
    { key: "orders", label: text.navOrders, icon: ShoppingBag },
    { key: "categories", label: text.navCategories, icon: Package },
    { key: "announcements", label: text.navAnnouncements, icon: Megaphone },
    { key: "finance", label: text.navFinance, icon: Wallet },
    ...(isSuperAdmin ? [{ key: "admins" as Section, label: text.navAdmins, icon: Users }] : []),
  ];

  return (
    <main className="noormexa-main">
      <section className="noormexa-section">
        <div className="noormexa-container">
          <div className="noormexa-store-header">
            <span className="noormexa-card-icon">
              <LayoutDashboard size={26} />
            </span>
            <div>
              <h1>{text.title}</h1>
              <p>{text.subtitle}</p>
            </div>
          </div>

          <div className="noormexa-admin-layout">
            <nav className="noormexa-admin-sidebar">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={key === activeSection ? "noormexa-admin-nav-active" : ""}
                  onClick={() => setActiveSection(key)}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </nav>

            <div className="noormexa-admin-content">
              {activeSection === "overview" && stats && (
            <div className="noormexa-stats-grid noormexa-admin-stats">
              <div className="noormexa-stat-card">
                <strong>{stats.totalStores}</strong>
                <span>{text.statsStores}</span>
              </div>
              <div className="noormexa-stat-card">
                <strong>{stats.pendingStores}</strong>
                <span>{text.statsPending}</span>
              </div>
              <div className="noormexa-stat-card">
                <strong>{stats.approvedStores}</strong>
                <span>{text.statsApproved}</span>
              </div>
              <div className="noormexa-stat-card">
                <strong>{stats.totalProducts}</strong>
                <span>{text.statsProducts}</span>
              </div>
              <div className="noormexa-stat-card">
                <strong>{stats.totalOrders}</strong>
                <span>{text.statsOrders}</span>
              </div>
              <div className="noormexa-stat-card">
                <strong>{stats.totalRevenue.toFixed(2)}</strong>
                <span>{text.statsRevenue}</span>
              </div>
            </div>
          )}

          {activeSection === "announcements" && (
          <div className="noormexa-dashboard-form-card">
            <div className="noormexa-section-heading">
              <h2>{text.annTitle}</h2>
              <p>{text.annHint}</p>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="noormexa-form noormexa-form-grid">
              <label className="noormexa-field noormexa-form-full">
                <span>{text.annTitlePlaceholder}</span>
                <input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required />
              </label>
              <label className="noormexa-field noormexa-form-full">
                <span>{text.annBodyPlaceholder}</span>
                <textarea rows={3} value={annBody} onChange={(e) => setAnnBody(e.target.value)} required />
              </label>
              <label className="noormexa-field">
                <span>{text.annAudienceLabel}</span>
                <select value={annAudience} onChange={(e) => setAnnAudience(e.target.value as Announcement["audience"])}>
                  <option value="all">{text.annAudienceAll}</option>
                  <option value="sellers">{text.annAudienceSellers}</option>
                  <option value="stores">{text.annAudienceStores}</option>
                  <option value="advertisers">{text.annAudienceAdvertisers}</option>
                </select>
              </label>
              <button type="submit" className="noormexa-primary-button noormexa-form-full" disabled={annBusy}>
                <Megaphone size={16} />
                {text.annPublish}
              </button>
            </form>

            {announcements.length === 0 ? (
              <p className="noormexa-empty-state">{text.annEmpty}</p>
            ) : (
              <div className="noormexa-admin-list" style={{ marginTop: 16 }}>
                {announcements.map((a) => (
                  <div key={a.id} className="noormexa-admin-store-row">
                    <div className="noormexa-admin-store-main">
                      <strong>{a.title}</strong>
                      <span>{a.body}</span>
                    </div>
                    <div className="noormexa-admin-store-actions">
                      <button
                        type="button"
                        className="noormexa-icon-text-button noormexa-danger-text"
                        onClick={() => handleDeleteAnnouncement(a.id)}
                      >
                        <Trash2 size={14} />
                        {text.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {activeSection === "products" && (
            <div className="noormexa-dashboard-form-card">
              <div className="noormexa-section-heading">
                <h2>{text.productsTitle}</h2>
              </div>
              {adminProducts.length === 0 ? (
                <p className="noormexa-empty-state">{text.noProducts}</p>
              ) : (
                <div className="noormexa-admin-table-wrap">
                  <table className="noormexa-admin-table">
                    <thead>
                      <tr>
                        <th>{text.colProduct}</th>
                        <th>{text.colStoreName}</th>
                        <th>{text.colPrice}</th>
                        <th>{text.colStatus}</th>
                        <th>{text.colActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminProducts.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.store_name || "—"}</td>
                          <td>{product.price}</td>
                          <td>
                            <span className={`noormexa-badge noormexa-badge-${product.status === "active" ? "approved" : "suspended"}`}>
                              {product.status === "active" ? text.active : product.status === "hidden" ? text.hidden : text.outOfStock}
                            </span>
                          </td>
                          <td className="noormexa-admin-actions">
                            <button type="button" className="noormexa-icon-text-button" onClick={() => handleToggleProductStatus(product)}>
                              {product.status === "active" ? text.hide : text.show}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === "orders" && (
            <div className="noormexa-dashboard-form-card">
              <div className="noormexa-section-heading">
                <h2>{text.ordersTitle}</h2>
              </div>
              {adminOrders.length === 0 ? (
                <p className="noormexa-empty-state">{text.noOrders}</p>
              ) : (
                <div className="noormexa-admin-table-wrap">
                  <table className="noormexa-admin-table">
                    <thead>
                      <tr>
                        <th>{text.colOrder}</th>
                        <th>{text.colStoreName}</th>
                        <th>{text.colBuyer}</th>
                        <th>{text.colTotal}</th>
                        <th>{text.colStatus}</th>
                        <th>{text.colDate}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id.slice(0, 8)}</td>
                          <td>{order.store_name || "—"}</td>
                          <td>{order.buyer_email || "—"}</td>
                          <td>{order.total_amount}</td>
                          <td>
                            <span className="noormexa-status-pill noormexa-status-pending">{order.status}</span>
                          </td>
                          <td>{new Date(order.created_at).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === "finance" && (
            <div className="noormexa-empty-state">
              <Sparkles size={28} />
              <h3>{text.comingSoonTitle}</h3>
              <p>{text.comingSoonText}</p>
            </div>
          )}

          {activeSection === "stores" && (
          <div className="noormexa-dashboard-form-card">
            <div className="noormexa-section-heading">
              <h2>{text.storesTitle}</h2>
            </div>

            {stores.length === 0 ? (
              <div className="noormexa-empty-state">
                <StoreIcon size={28} />
                <p>{text.noStores}</p>
              </div>
            ) : (
              <div className="noormexa-admin-table-wrap">
                <table className="noormexa-admin-table">
                  <thead>
                    <tr>
                      <th>{text.colStore}</th>
                      <th>{text.colStatus}</th>
                      <th>{text.colPlan}</th>
                      <th>{text.colCommission}</th>
                      <th>{text.colActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store) => (
                      <tr key={store.id}>
                        <td>{store.name}</td>
                        <td>
                          <span className={`noormexa-badge noormexa-badge-${store.status}`}>
                            {store.status === "approved" ? text.approved : store.status === "suspended" ? text.suspended : text.pending}
                          </span>
                        </td>
                        <td>
                          <select value={store.plan} onChange={(e) => handlePlan(store, e.target.value)}>
                            <option value="basic">{text.basic}</option>
                            <option value="professional">{text.professional}</option>
                            <option value="store">{text.storePlan}</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="100"
                            value={store.commission_rate}
                            onChange={(e) => handleCommission(store, e.target.value)}
                            onBlur={() => handleCommissionSave(store)}
                            className="noormexa-admin-commission-input"
                          />
                        </td>
                        <td className="noormexa-admin-actions">
                          {store.status !== "approved" && (
                            <button type="button" onClick={() => handleStatus(store, "approved")} className="noormexa-icon-text-button">
                              <BadgeCheck size={16} />
                              {text.approve}
                            </button>
                          )}
                          {store.status !== "suspended" && (
                            <button type="button" onClick={() => handleStatus(store, "suspended")} className="noormexa-icon-text-button noormexa-danger-text">
                              <Ban size={16} />
                              {text.suspend}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}

          {activeSection === "categories" && (
          <div className="noormexa-dashboard-form-card">
            <div className="noormexa-section-heading">
              <h2>{text.categoriesTitle}</h2>
            </div>

            <form onSubmit={handleAddCategory} className="noormexa-form noormexa-form-grid">
              <label className="noormexa-field">
                <span>{text.nameAr}</span>
                <input value={catNameAr} onChange={(e) => setCatNameAr(e.target.value)} required />
              </label>
              <label className="noormexa-field">
                <span>{text.nameEn}</span>
                <input value={catNameEn} onChange={(e) => setCatNameEn(e.target.value)} required />
              </label>
              <label className="noormexa-field">
                <span>{text.slug}</span>
                <input value={catSlug} onChange={(e) => setCatSlug(e.target.value)} required />
              </label>
              <button type="submit" className="noormexa-primary-button noormexa-form-full">
                <Plus size={16} />
                {text.addCategory}
              </button>
            </form>

            <div className="noormexa-admin-category-list">
              {categories.map((cat) => (
                <div key={cat.id} className="noormexa-admin-category-pill">
                  <Package size={14} />
                  <span>
                    {cat.name_ar} / {cat.name_en}
                  </span>
                  <button type="button" onClick={() => handleDeleteCategory(cat.id)} aria-label={text.delete}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          )}

          {activeSection === "admins" && isSuperAdmin && (
            <div className="noormexa-dashboard-form-card">
              <div className="noormexa-section-heading">
                <h2>{text.adminsTitle}</h2>
                <p>{text.adminsHint}</p>
              </div>

              <form onSubmit={handleGrantAdmin} className="noormexa-form">
                <label className="noormexa-field noormexa-form-full">
                  <span>{text.adminEmailPlaceholder}</span>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder={text.adminEmailPlaceholder}
                    required
                  />
                </label>
                <button type="submit" className="noormexa-primary-button noormexa-form-full" disabled={grantBusy}>
                  <UserPlus size={16} />
                  {text.grantAdmin}
                </button>
              </form>

              {grantMessage && (
                <p className={grantMessage.ok ? "noormexa-form-success" : "noormexa-form-error"}>{grantMessage.text}</p>
              )}

              {admins.length === 0 ? (
                <p className="noormexa-empty-state">{text.noAdmins}</p>
              ) : (
                <div className="noormexa-admin-category-list">
                  {admins.map((admin) => (
                    <div key={admin.id} className="noormexa-admin-category-pill">
                      <ShieldCheck size={14} />
                      <span>
                        {admin.full_name || admin.email}{" "}
                        {admin.is_super_admin ? text.developerBadge : ""} {admin.id === user?.id && text.you}
                      </span>
                      {admin.id !== user?.id && !admin.is_super_admin && (
                        <button type="button" onClick={() => handleRevokeAdmin(admin.id)} aria-label={text.revoke}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
