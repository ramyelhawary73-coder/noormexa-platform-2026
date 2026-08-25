"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  Crown,
  Globe,
  Heart,
  Key,
  LayoutGrid,
  LogOut,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store as StoreIcon,
  Trash2,
  Truck,
  User,
  UserCheck,
  UserRound,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import { useMarketplace } from "@/context/MarketplaceContext";
import { getUserRole } from "@/lib/authHelpers";
import { supabase } from "@/lib/supabaseClient";
import {
  getStoreOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
  createProduct,
  createStore,
  deleteProduct,
  getAnnouncements,
  getCategories,
  getMyProducts,
  getMyStore,
  updateProduct,
  updateProductStatus,
  updateStoreProfile,
  uploadProductImage,
  uploadStoreImage,
} from "@/lib/marketplace";
import type { Category, Product, Store } from "@/types/marketplace";

const copy = {
  ar: {
    loginPrompt: "يجب تسجيل الدخول أولاً للوصول إلى لوحة التحكم وحسابك الشخصي.",
    loginCta: "تسجيل الدخول",
    profileTitle: "الملف الشخصي وإدارة الحساب",
    profileSubtitle: "تحكم في بياناتك الشخصية، تتبع طلباتك، أمان الحساب وإعدادات التاجر",
    logoutBtn: "تسجيل الخروج",
    logoutConfirmTitle: "هل أنت متأكد من تسجيل الخروج؟",
    logoutConfirmDesc: "يمكنك إعادة تسجيل الدخول في أي وقت ببيانات اعتمادك.",
    confirmLogout: "نعم، خروج",
    cancel: "إلغاء",
    personalInfoTab: "بياناتي الشخصية",
    ordersTab: "طلباتي وتتبع الشحنات",
    securityTab: "الأمان وكلمة المرور",
    sellerPortalTab: "إدارة متجري والمنتجات",
    becomeSellerTab: "الترقية لحساب تاجر",
    fullName: "الاسم الكامل",
    emailAddress: "البريد الإلكتروني",
    phoneNumber: "رقم الهاتف",
    cityAddress: "المدينة / العنوان",
    preferredCurrency: "العملة المفضلة",
    saveChanges: "حفظ التعديلات",
    saving: "جارٍ الحفظ...",
    savedSuccess: "تم تحديث بيانات ملفك الشخصي بنجاح!",
    accountSecurity: "حماية وأمان الحساب",
    securityDesc: "حسابك محمي بنظام التشفير السحابي والتحقق المزدوج من NOORMEXA.",
    resetPassword: "إعادة تعيين كلمة المرور",
    resetPasswordDesc: "سنرسل لك رابطاً آمناً عبر بريدك الإلكتروني لتعيين كلمة مرور جديدة.",
    sendResetLink: "إرسال رابط إعادة التعيين",
    resetLinkSent: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.",
    myOrdersTitle: "سجل طلباتي ومشترياتي",
    viewAllOrders: "استعراض جميع الطلبات مع التتبع المباشر",
    noCustomerOrders: "لم تقم بإجراء أي طلبات حتى الآن. استكشف آلاف المنتجات والعروض في السوق!",
    browseMarket: "تصفح السوق الآن",
    wishlistStat: "قائمة المفضلة",
    ordersStat: "إجمالي الطلبات",
    walletStat: "نقاط المكافآت",
    securityStat: "حالة الحساب",
    verifiedShopper: "عضو متسوق موثق",
    verifiedSeller: "تاجر معتمد",
    superAdmin: "مالك المنصة (Super Admin)",
    becomeSellerTitle: "هل تريد بيع منتجاتك في NOORMEXA؟",
    becomeSellerDesc: "انضم إلى آلاف التجار والبراندات في أكبر منصة تجارة إلكترونية ذكية واستفد من ملايين الزوار وتغطية الشحن الشاملة.",
    createStoreTitle: "إنشاء وتفعيل المتجر",
    storeName: "اسم المتجر",
    storeDesc: "وصف المتجر",
    createStoreBtn: "إنشاء المتجر فوراً",
    genericError: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.",
    dashboardTitle: "لوحة تحكم المتجر",
    pendingNotice: "متجرك حاليًا قيد المراجعة من إدارة المنصة. هتقدر تعرض منتجاتك، لكن هتظهر للعملاء بعد الموافقة.",
    yourProducts: "منتجات متجرك",
    addProduct: "إضافة منتج جديد",
    productName: "اسم المنتج",
    productDesc: "وصف المنتج",
    productPrice: "السعر",
    productStock: "الكمية المتاحة",
    productImage: "صورة المنتج",
    uploading: "جاري رفع الصورة...",
    productCategory: "التصنيف",
    saveProduct: "حفظ المنتج",
    noProducts: "لا توجد منتجات حتى الآن. أضف أول منتج من النموذج أعلاه.",
    ordersTitle: "طلبات متجري المستلمة",
    noOrders: "لا توجد طلبات مستلمة حتى الآن.",
    orderNumber: "طلب رقم",
    total: "الإجمالي",
    currency: "ج.م",
    orderStatus: {
      pending: "قيد المراجعة",
      paid: "مدفوع",
      shipped: "تم الشحن",
      completed: "تم التسليم",
      cancelled: "ملغي",
    } as Record<string, string>,
    hide: "إخفاء",
    show: "إظهار",
    delete: "حذف",
    price: "ج.م",
    tabOverview: "نظرة عامة",
    tabSettings: "إعدادات المتجر",
    tabProducts: "المنتجات",
    tabOrders: "طلبات المتجر",
    statRevenue: "إجمالي المبيعات",
    statOrders: "إجمالي الطلبات",
    statPending: "طلبات قيد المراجعة",
    statProducts: "المنتجات",
    settingsTitle: "هوية متجرك",
    settingsHint: "الاسم، الوصف، الشعار، والبانر الذي يظهر للعملاء في صفحة متجرك.",
    logoLabel: "شعار المتجر",
    bannerLabel: "بانر المتجر (صورة عريضة)",
    saveSettings: "حفظ التعديلات",
    settingsSaved: "تم حفظ بيانات متجرك بنجاح.",
    editProduct: "تعديل",
    cancelEdit: "إلغاء",
    saveEdit: "حفظ التعديل",
  },
  en: {
    loginPrompt: "You need to sign in first to access your profile and dashboard.",
    loginCta: "Sign In",
    profileTitle: "User Profile & Account Hub",
    profileSubtitle: "Manage your personal information, track orders, security, and seller options",
    logoutBtn: "Sign Out",
    logoutConfirmTitle: "Are you sure you want to sign out?",
    logoutConfirmDesc: "You can sign back in anytime using your registered credentials.",
    confirmLogout: "Yes, Sign Out",
    cancel: "Cancel",
    personalInfoTab: "Personal Information",
    ordersTab: "Orders & Live Tracking",
    securityTab: "Security & Credentials",
    sellerPortalTab: "My Store & Products",
    becomeSellerTab: "Upgrade to Seller",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    cityAddress: "City / Address",
    preferredCurrency: "Preferred Currency",
    saveChanges: "Save Changes",
    saving: "Saving...",
    savedSuccess: "Your profile information has been updated successfully!",
    accountSecurity: "Account Security & Protection",
    securityDesc: "Your account is secured with NOORMEXA Cloud encryption and 2FA protocols.",
    resetPassword: "Reset Password",
    resetPasswordDesc: "We will send a secure link to your email to configure a new password.",
    sendResetLink: "Send Reset Link",
    resetLinkSent: "Password reset instructions have been sent to your email.",
    myOrdersTitle: "My Orders & Purchase History",
    viewAllOrders: "View All Orders with Live GPS Tracking",
    noCustomerOrders: "You have not placed any orders yet. Discover thousands of trending products and deals!",
    browseMarket: "Browse Marketplace",
    wishlistStat: "Wishlist Items",
    ordersStat: "Total Orders",
    walletStat: "Reward Points",
    securityStat: "Account Status",
    verifiedShopper: "Verified Shopper",
    verifiedSeller: "Certified Seller",
    superAdmin: "Platform Owner (Super Admin)",
    becomeSellerTitle: "Want to sell products on NOORMEXA?",
    becomeSellerDesc: "Join thousands of sellers and verified brands on the premier smart commerce platform and expand your reach.",
    createStoreTitle: "Create Your Store",
    storeName: "Store Name",
    storeDesc: "Store Description",
    createStoreBtn: "Create Store Now",
    genericError: "An unexpected error occurred. Please try again shortly.",
    dashboardTitle: "Store Dashboard",
    pendingNotice: "Your store is under review by the platform team. You can add products, but they'll be visible to customers after approval.",
    yourProducts: "Your Products",
    addProduct: "Add New Product",
    productName: "Product Name",
    productDesc: "Product Description",
    productPrice: "Price",
    productStock: "Stock Quantity",
    productImage: "Product Image",
    uploading: "Uploading image...",
    productCategory: "Category",
    saveProduct: "Save Product",
    noProducts: "No products added yet. Add your first product from the form above.",
    ordersTitle: "Store Orders",
    noOrders: "No orders received yet.",
    orderNumber: "Order #",
    total: "Total",
    currency: "EGP",
    orderStatus: {
      pending: "Pending Review",
      paid: "Paid",
      shipped: "Shipped",
      completed: "Delivered",
      cancelled: "Cancelled",
    } as Record<string, string>,
    hide: "Hide",
    show: "Show",
    delete: "Delete",
    price: "EGP",
    tabOverview: "Overview",
    tabSettings: "Store Settings",
    tabProducts: "Products",
    tabOrders: "Store Orders",
    statRevenue: "Total Sales",
    statOrders: "Total Orders",
    statPending: "Pending Review",
    statProducts: "Products",
    settingsTitle: "Store Identity",
    settingsHint: "Name, description, logo, and banner visible to customers on your store page.",
    logoLabel: "Store Logo",
    bannerLabel: "Store Banner (wide image)",
    saveSettings: "Save Changes",
    settingsSaved: "Store details saved successfully.",
    editProduct: "Edit",
    cancelEdit: "Cancel",
    saveEdit: "Save Changes",
  },
} as const;

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const language = useNoormexaLanguage();
  const isAr = language === "ar";
  const text = copy[language];
  const { wishlist, currency, setCurrency } = useMarketplace();

  const userRole = getUserRole(user, profile);
  const isAdmin = userRole === "admin";
  const isSeller = userRole === "seller";

  // Logout modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Profile Edit State
  const initialName = (profile?.full_name as string) || (user?.user_metadata?.full_name as string) || "";
  const initialPhone = (profile?.phone as string) || (user?.user_metadata?.phone as string) || "";
  const initialAddress = (profile?.city as string) || (profile?.address as string) || "";

  const [editFullName, setEditFullName] = useState(initialName);
  const [editPhone, setEditPhone] = useState(initialPhone);
  const [editAddress, setEditAddress] = useState(initialAddress);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");
  const [resetSending, setResetSending] = useState(false);

  // Store Management State
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [resolvedForId, setResolvedForId] = useState<string | null>(null);
  const checking = Boolean(user) && resolvedForId !== user?.id;
  const [saving, setSaving] = useState(false);
  const [storeError, setStoreError] = useState("");

  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");

  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productImage, setProductImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [productCategory, setProductCategory] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);

  // Navigation tab state
  const [profileTab, setProfileTab] = useState<"profile" | "orders" | "security" | "seller">("profile");
  const [sellerTab, setSellerTab] = useState<"overview" | "settings" | "products" | "orders">("overview");

  const [settingsName, setSettingsName] = useState("");
  const [settingsDesc, setSettingsDesc] = useState("");
  const [settingsLogo, setSettingsLogo] = useState("");
  const [settingsBanner, setSettingsBanner] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([getMyStore(user.id), getCategories(), getAnnouncements()]).then(
      async ([s, cats]) => {
        if (!active) return;
        setStore(s);
        setCategories(cats);
        if (s) {
          setSettingsName(s.name);
          setSettingsDesc(s.description || "");
          setSettingsLogo(s.logo_url || "");
          setSettingsBanner(s.banner_url || "");
          const [prods, storeOrders] = await Promise.all([getMyProducts(s.id), getStoreOrders(s.id)]);
          if (active) {
            setProducts(prods);
            setOrders(storeOrders);
          }
        }
        setResolvedForId(user.id);
      }
    );
    return () => {
      active = false;
    };
  }, [user]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch {
      setLoggingOut(false);
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    setProfileSuccessMsg("");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editFullName.trim(),
          phone: editPhone.trim(),
          city: editAddress.trim(),
        })
        .eq("id", user.id);

      if (!error) {
        await refreshProfile();
        setProfileSuccessMsg(text.savedSuccess);
        setTimeout(() => setProfileSuccessMsg(""), 4000);
      }
    } catch {
      // Ignored
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email || resetSending) return;
    setResetSending(true);
    setResetSuccessMsg("");

    try {
      await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      setResetSuccessMsg(text.resetLinkSent);
      setTimeout(() => setResetSuccessMsg(""), 6000);
    } catch {
      // Ignored
    } finally {
      setResetSending(false);
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    const ok = await updateOrderStatus(orderId, status);
    if (ok) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    }
  };

  const handleCreateStore = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !storeName.trim() || saving) return;
    setSaving(true);
    setStoreError("");
    const { store: newStore, error } = await createStore(user.id, storeName.trim(), storeDesc.trim());
    if (newStore) {
      setStore(newStore);
      setSaving(false);
      return;
    }

    const existing = await getMyStore(user.id);
    setSaving(false);
    if (existing) {
      setStore(existing);
    } else {
      setStoreError(error || text.genericError);
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploadError("");
    setUploadingImage(true);
    const { url, error } = await uploadProductImage(file, user.id);
    setUploadingImage(false);
    if (url) {
      setProductImage(url);
    } else {
      setUploadError(error || "");
    }
  };

  const handleAddProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!store || !productName.trim() || !productPrice) return;
    setSaving(true);
    const { product } = await createProduct({
      store_id: store.id,
      category_id: productCategory || null,
      name: productName.trim(),
      description: productDesc.trim(),
      price: Number(productPrice),
      image_url: productImage.trim() || null,
      stock: Number(productStock) || 0,
    });
    setSaving(false);
    if (product) {
      setProducts((prev) => [product, ...prev]);
      setProductName("");
      setProductDesc("");
      setProductPrice("");
      setProductStock("");
      setProductImage("");
      setUploadError("");
      setProductCategory("");
    }
  };

  const toggleProductVisibility = async (product: Product) => {
    const nextStatus = product.status === "active" ? "hidden" : "active";
    const ok = await updateProductStatus(product.id, nextStatus);
    if (ok) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p)));
    }
  };

  const removeProduct = async (product: Product) => {
    const ok = await deleteProduct(product.id);
    if (ok) setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploadingLogo(true);
    const { url } = await uploadStoreImage(file, user.id, "logo");
    setUploadingLogo(false);
    if (url) setSettingsLogo(url);
  };

  const handleBannerUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploadingBanner(true);
    const { url } = await uploadStoreImage(file, user.id, "banner");
    setUploadingBanner(false);
    if (url) setSettingsBanner(url);
  };

  const handleSaveSettings = async (event: FormEvent) => {
    event.preventDefault();
    if (!store) return;
    setSettingsSaving(true);
    setSettingsMessage("");
    const { store: updated } = await updateStoreProfile(store.id, {
      name: settingsName.trim(),
      description: settingsDesc.trim() || null,
      logo_url: settingsLogo || null,
      banner_url: settingsBanner || null,
    });
    setSettingsSaving(false);
    if (updated) {
      setStore(updated);
      setSettingsMessage(text.settingsSaved);
    }
  };

  const handleStartEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditName(product.name);
    setEditPrice(String(product.price));
  };

  const handleCancelEdit = () => setEditingProductId(null);

  const handleSaveEdit = async (productId: string) => {
    if (!editName.trim() || !editPrice) return;
    setEditSaving(true);
    const { product } = await updateProduct(productId, {
      name: editName.trim(),
      price: Number(editPrice),
    });
    setEditSaving(false);
    if (product) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? product : p)));
      setEditingProductId(null);
    }
  };

  if (authLoading || checking) {
    return (
      <main className="min-h-screen bg-surface-soft/60 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-muted">
          <RefreshCw className="animate-spin text-orange-500" size={32} />
          <span className="text-sm font-bold">{isAr ? "جارٍ تحميل حسابك..." : "Loading your profile..."}</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center p-6 bg-surface-soft/40 dark:bg-slate-950">
        <div className="max-w-md w-full p-8 rounded-3xl bg-surface dark:bg-slate-900 border border-line shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 mx-auto flex items-center justify-center">
            <UserRound size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-foreground">{text.profileTitle}</h1>
            <p className="text-xs text-muted leading-relaxed">{text.loginPrompt}</p>
          </div>
          <Link
            href="/auth"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 !text-white font-black text-sm shadow-md transition-all active:scale-98"
          >
            <UserRound size={16} />
            <span>{text.loginCta}</span>
          </Link>
        </div>
      </main>
    );
  }

  const displayName =
    (profile?.full_name as string) ||
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "User";

  const avatarInitial = displayName.charAt(0).toUpperCase();

  const totalRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "shipped" || o.status === "completed")
    .reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;

  return (
    <main className="min-h-screen bg-surface-soft/40 dark:bg-slate-950 text-foreground pb-20 transition-colors">
      
      {/* 1. Header Profile Banner */}
      <section className="bg-surface dark:bg-[#090f1d] border-b border-line pt-8 pb-8 px-4 sm:px-6 lg:px-10">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* User Details */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/20">
                  {avatarInitial}
                </div>
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-surface dark:border-slate-900 flex items-center justify-center text-[9px] text-white font-bold" title="Online">
                  ✓
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-foreground">{displayName}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                    isAdmin
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      : isSeller
                      ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                      : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                  }`}>
                    {isAdmin && <Crown size={12} />}
                    {isSeller && <StoreIcon size={12} />}
                    {!isAdmin && !isSeller && <UserCheck size={12} />}
                    <span>{isAdmin ? text.superAdmin : isSeller ? text.verifiedSeller : text.verifiedShopper}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted font-mono flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail size={13} className="text-orange-500" />
                    <span>{user.email}</span>
                  </span>
                  {initialPhone && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-emerald-500" />
                      <span>{initialPhone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Top Action Buttons (Admin / Seller / Sign Out) */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs shadow-xs transition-all"
                >
                  <Crown size={14} />
                  <span>{isAr ? "مركز الإدارة الشامل" : "Super Admin"}</span>
                </Link>
              )}

              {isSeller && (
                <Link
                  href="/seller/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-bold text-xs shadow-xs transition-all"
                >
                  <StoreIcon size={14} />
                  <span>{isAr ? "بوابة التجار" : "Seller Portal"}</span>
                </Link>
              )}

              {/* Master Sign-Out Button */}
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 font-black text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
                title={text.logoutBtn}
              >
                <LogOut size={15} />
                <span>{text.logoutBtn}</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <Link
              href="/orders"
              className="p-3.5 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line hover:border-orange-500/50 transition-all flex items-center justify-between"
            >
              <div>
                <div className="text-[11px] font-bold text-muted">{text.ordersStat}</div>
                <div className="text-lg font-black text-foreground">{orders.length > 0 ? orders.length : "0"}</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Truck size={18} />
              </div>
            </Link>

            <Link
              href="/marketplace?wishlist=true"
              className="p-3.5 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line hover:border-red-500/50 transition-all flex items-center justify-between"
            >
              <div>
                <div className="text-[11px] font-bold text-muted">{text.wishlistStat}</div>
                <div className="text-lg font-black text-foreground">{wishlist.length}</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <Heart size={18} />
              </div>
            </Link>

            <div className="p-3.5 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-muted">{text.walletStat}</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">100 {isAr ? "نقطة" : "Pts"}</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-muted">{text.securityStat}</div>
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">{isAr ? "محمي وموثق" : "Protected"}</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Main Navigation Tabs & Contents */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 mt-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-line pb-3">
          <button
            type="button"
            onClick={() => setProfileTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer shrink-0 ${
              profileTab === "profile"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-surface dark:bg-slate-900 text-muted hover:text-foreground border border-line"
            }`}
          >
            <User size={15} />
            <span>{text.personalInfoTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setProfileTab("orders")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer shrink-0 ${
              profileTab === "orders"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-surface dark:bg-slate-900 text-muted hover:text-foreground border border-line"
            }`}
          >
            <Truck size={15} />
            <span>{text.ordersTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setProfileTab("security")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer shrink-0 ${
              profileTab === "security"
                ? "bg-orange-500 text-white shadow-md"
                : "bg-surface dark:bg-slate-900 text-muted hover:text-foreground border border-line"
            }`}
          >
            <Shield size={15} />
            <span>{text.securityTab}</span>
          </button>

          {isSeller || store ? (
            <button
              type="button"
              onClick={() => setProfileTab("seller")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer shrink-0 ${
                profileTab === "seller"
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-surface dark:bg-slate-900 text-muted hover:text-foreground border border-line"
              }`}
            >
              <StoreIcon size={15} />
              <span>{text.sellerPortalTab}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setProfileTab("seller")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer shrink-0 ${
                profileTab === "seller"
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-surface dark:bg-slate-900 text-muted hover:text-foreground border border-line"
              }`}
            >
              <StoreIcon size={15} />
              <span>{text.becomeSellerTab}</span>
            </button>
          )}
        </div>

        {/* Tab 1: Personal Profile Information */}
        {profileTab === "profile" && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-3xl bg-surface dark:bg-slate-900 border border-line shadow-xs space-y-5">
              <div className="space-y-1 border-b border-line pb-3">
                <h2 className="text-base font-black text-foreground">{text.personalInfoTab}</h2>
                <p className="text-xs text-muted">{text.profileSubtitle}</p>
              </div>

              {profileSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={16} />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">{text.fullName}</label>
                    <div className="relative">
                      <User size={16} className="absolute start-3 top-3 text-muted" />
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="w-full ps-9 pe-4 py-2.5 rounded-xl bg-surface-soft dark:bg-slate-800 border border-line text-xs font-medium focus:border-orange-500 outline-none"
                        placeholder={isAr ? "أدخل اسمك الكامل" : "Enter your full name"}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">{text.emailAddress}</label>
                    <div className="relative">
                      <Mail size={16} className="absolute start-3 top-3 text-muted" />
                      <input
                        type="email"
                        value={user.email || ""}
                        disabled
                        className="w-full ps-9 pe-4 py-2.5 rounded-xl bg-surface-soft/60 dark:bg-slate-800/50 border border-line text-xs font-medium text-muted cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">{text.phoneNumber}</label>
                    <div className="relative">
                      <Phone size={16} className="absolute start-3 top-3 text-muted" />
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full ps-9 pe-4 py-2.5 rounded-xl bg-surface-soft dark:bg-slate-800 border border-line text-xs font-medium focus:border-orange-500 outline-none"
                        placeholder="01xxxxxxxxx / +966..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">{text.cityAddress}</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute start-3 top-3 text-muted" />
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full ps-9 pe-4 py-2.5 rounded-xl bg-surface-soft dark:bg-slate-800 border border-line text-xs font-medium focus:border-orange-500 outline-none"
                        placeholder={isAr ? "القاهرة، المعادي / الرياض..." : "City, district, address"}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-line flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Save size={15} />
                    <span>{profileSaving ? text.saving : text.saveChanges}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Preferences Card */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-surface dark:bg-slate-900 border border-line shadow-xs space-y-4">
                <h3 className="text-xs font-black text-foreground flex items-center gap-2">
                  <Globe size={16} className="text-orange-500" />
                  <span>{isAr ? "تفضيلات العرض والتسوق" : "Preferences"}</span>
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted">{text.preferredCurrency}</span>
                    <div className="flex items-center gap-1">
                      {(["EGP", "SAR", "AED", "USD"] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCurrency(c)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            currency === c
                              ? "bg-orange-500 text-white shadow-xs"
                              : "bg-surface-soft dark:bg-slate-800 text-muted hover:text-foreground border border-line"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dedicated Sign Out Box */}
              <div className="p-5 rounded-3xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 space-y-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-xs">
                  <LogOut size={16} />
                  <span>{text.logoutBtn}</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  {isAr
                    ? "هل ترغب في إنهاء جلستك الحالية على هذا الجهاز؟"
                    : "End your current session on this device securely."}
                </p>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {text.logoutBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders & Live Shipment Tracking */}
        {profileTab === "orders" && (
          <div className="mt-6 p-6 rounded-3xl bg-surface dark:bg-slate-900 border border-line shadow-xs space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-line pb-3">
              <div>
                <h2 className="text-base font-black text-foreground">{text.myOrdersTitle}</h2>
                <p className="text-xs text-muted">{text.viewAllOrders}</p>
              </div>
              <Link
                href="/orders"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-black text-xs transition-colors"
              >
                <Truck size={14} />
                <span>{text.viewAllOrders}</span>
              </Link>
            </div>

            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-500 mx-auto flex items-center justify-center">
                <Package size={32} />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-black text-foreground">{text.noCustomerOrders}</h3>
                <p className="text-xs text-muted">{isAr ? "يمكنك تتبع شحناتك الحية وطباعة فواتيرك فور تأكيد أي طلب." : "Track live deliveries and print invoices anytime."}</p>
              </div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs shadow-md transition-all"
              >
                <ShoppingBag size={15} />
                <span>{text.browseMarket}</span>
              </Link>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Credentials */}
        {profileTab === "security" && (
          <div className="mt-6 max-w-2xl mx-auto p-6 rounded-3xl bg-surface dark:bg-slate-900 border border-line shadow-xs space-y-6">
            <div className="space-y-1 border-b border-line pb-3">
              <h2 className="text-base font-black text-foreground flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-500" />
                <span>{text.accountSecurity}</span>
              </h2>
              <p className="text-xs text-muted">{text.securityDesc}</p>
            </div>

            {resetSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={16} />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-surface-soft dark:bg-slate-800 border border-line space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Key size={18} />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-black text-foreground">{text.resetPassword}</div>
                  <p className="text-[11px] text-muted leading-relaxed">{text.resetPasswordDesc}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resetSending}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {resetSending ? (isAr ? "جارٍ الإرسال..." : "Sending...") : text.sendResetLink}
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black text-red-600 dark:text-red-400">{text.logoutBtn}</div>
                <div className="text-[11px] text-muted">{isAr ? "إنهاء الجلسة والخروج من الحساب" : "Sign out from this session"}</div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs shadow-xs transition-all cursor-pointer"
              >
                {text.logoutBtn}
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Seller Hub / Upgrade to Seller */}
        {profileTab === "seller" && (
          <div className="mt-6 space-y-6">
            {!store ? (
              <div className="p-8 rounded-3xl bg-surface dark:bg-slate-900 border border-line shadow-xs space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white mx-auto flex items-center justify-center shadow-lg">
                    <StoreIcon size={32} />
                  </div>
                  <h2 className="text-xl font-black text-foreground">{text.becomeSellerTitle}</h2>
                  <p className="text-xs text-muted leading-relaxed">{text.becomeSellerDesc}</p>
                </div>

                <div className="max-w-md mx-auto p-6 rounded-2xl bg-surface-soft dark:bg-slate-800 border border-line space-y-4">
                  <div className="text-xs font-black text-foreground border-b border-line pb-2">
                    {text.createStoreTitle}
                  </div>
                  <form onSubmit={handleCreateStore} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">{text.storeName}</label>
                      <input
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface dark:bg-slate-900 border border-line text-xs font-medium focus:border-orange-500 outline-none"
                        placeholder={isAr ? "مثال: متجر الإلكترونيات العصرية" : "e.g. Modern Tech Store"}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">{text.storeDesc}</label>
                      <textarea
                        value={storeDesc}
                        onChange={(e) => setStoreDesc(e.target.value)}
                        rows={2}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface dark:bg-slate-900 border border-line text-xs font-medium focus:border-orange-500 outline-none"
                        placeholder={isAr ? "وصف مختصر لمنتجات متجرك" : "Short description of your products"}
                      />
                    </div>

                    {storeError && <p className="text-xs text-red-500 font-bold">{storeError}</p>}

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {saving ? text.saving : text.createStoreBtn}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Seller Store Management View */
              <div className="space-y-6">
                <div className="p-5 rounded-3xl bg-surface dark:bg-slate-900 border border-line shadow-xs flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                      <StoreIcon size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-foreground">{store.name}</h2>
                      <p className="text-xs text-muted">{text.dashboardTitle}</p>
                    </div>
                  </div>

                  <Link
                    href="/seller/dashboard"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs shadow-xs"
                  >
                    <StoreIcon size={14} />
                    <span>{isAr ? "لوحة التاجر الاحترافية" : "Advanced Seller Hub"}</span>
                  </Link>
                </div>

                {store.status === "pending" && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{text.pendingNotice}</span>
                  </div>
                )}

                {/* Sub-tabs for Store */}
                <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setSellerTab("overview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      sellerTab === "overview" ? "bg-orange-500 text-white" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <BarChart3 size={14} />
                    <span>{text.tabOverview}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSellerTab("products")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      sellerTab === "products" ? "bg-orange-500 text-white" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <LayoutGrid size={14} />
                    <span>{text.tabProducts}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSellerTab("orders")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      sellerTab === "orders" ? "bg-orange-500 text-white" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <ShoppingBag size={14} />
                    <span>{text.tabOrders}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSellerTab("settings")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      sellerTab === "settings" ? "bg-orange-500 text-white" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Settings size={14} />
                    <span>{text.tabSettings}</span>
                  </button>
                </div>

                {sellerTab === "overview" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-surface dark:bg-slate-900 border border-line shadow-xs">
                      <div className="text-xs font-bold text-muted">{text.statRevenue}</div>
                      <div className="text-xl font-black text-orange-500 mt-1">
                        {totalRevenue.toFixed(2)} {text.currency}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface dark:bg-slate-900 border border-line shadow-xs">
                      <div className="text-xs font-bold text-muted">{text.statOrders}</div>
                      <div className="text-xl font-black text-foreground mt-1">{orders.length}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface dark:bg-slate-900 border border-line shadow-xs">
                      <div className="text-xs font-bold text-muted">{text.statPending}</div>
                      <div className="text-xl font-black text-amber-500 mt-1">{pendingOrdersCount}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface dark:bg-slate-900 border border-line shadow-xs">
                      <div className="text-xs font-bold text-muted">{text.statProducts}</div>
                      <div className="text-xl font-black text-foreground mt-1">{products.length}</div>
                    </div>
                  </div>
                )}

                {sellerTab === "products" && (
                  <div className="space-y-6">
                    {/* Add Product Form */}
                    <div className="p-6 rounded-3xl bg-surface dark:bg-slate-900 border border-line shadow-xs space-y-4">
                      <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                        <Plus size={16} className="text-orange-500" />
                        <span>{text.addProduct}</span>
                      </h3>

                      <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">{text.productName}</label>
                          <input
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft dark:bg-slate-800 border border-line text-xs font-medium focus:border-orange-500 outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">{text.productPrice}</label>
                          <input
                            type="number"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft dark:bg-slate-800 border border-line text-xs font-medium focus:border-orange-500 outline-none"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-bold text-foreground">{text.productDesc}</label>
                          <textarea
                            value={productDesc}
                            onChange={(e) => setProductDesc(e.target.value)}
                            rows={2}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft dark:bg-slate-800 border border-line text-xs font-medium focus:border-orange-500 outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">{text.productCategory}</label>
                          <select
                            value={productCategory}
                            onChange={(e) => setProductCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft dark:bg-slate-800 border border-line text-xs font-medium focus:border-orange-500 outline-none"
                          >
                            <option value="">{isAr ? "اختر التصنيف..." : "Select category..."}</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {isAr ? c.name_ar || c.name_en : c.name_en}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">{text.productStock}</label>
                          <input
                            type="number"
                            value={productStock}
                            onChange={(e) => setProductStock(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft dark:bg-slate-800 border border-line text-xs font-medium focus:border-orange-500 outline-none"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-bold text-foreground">{text.productImage}</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full text-xs text-muted"
                          />
                          {uploadingImage && <small className="text-xs text-orange-500">{text.uploading}</small>}
                          {uploadError && <small className="text-xs text-red-500">{uploadError}</small>}
                        </div>

                        <div className="sm:col-span-2 flex justify-end">
                          <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                          >
                            {saving ? text.saving : text.saveProduct}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Products Grid */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-foreground">{text.yourProducts} ({products.length})</h3>
                      {products.length === 0 ? (
                        <p className="text-xs text-muted text-center py-6">{text.noProducts}</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {products.map((p) => (
                            <div key={p.id} className="p-4 rounded-2xl bg-surface dark:bg-slate-900 border border-line shadow-xs space-y-3">
                              {editingProductId === p.id ? (
                                <div className="space-y-2">
                                  <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full p-2 text-xs rounded-lg border border-line"
                                  />
                                  <input
                                    type="number"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="w-full p-2 text-xs rounded-lg border border-line"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(p.id)}
                                      disabled={editSaving}
                                      className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold"
                                    >
                                      {text.saveEdit}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCancelEdit}
                                      className="px-3 py-1 bg-slate-700 text-white rounded-lg text-xs font-bold"
                                    >
                                      {text.cancelEdit}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h4 className="text-xs font-black text-foreground truncate">{p.name}</h4>
                                      <div className="text-xs font-bold text-orange-500">{p.price} {text.currency}</div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      p.status === "active" ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-500/15 text-muted"
                                    }`}>
                                      {p.status === "active" ? (isAr ? "نشط" : "Active") : (isAr ? "مخفي" : "Hidden")}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 pt-2 border-t border-line/60">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(p)}
                                      className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-soft"
                                      title={text.editProduct}
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => toggleProductVisibility(p)}
                                      className="text-[11px] font-bold text-muted hover:text-foreground px-2 py-1 rounded-lg border border-line"
                                    >
                                      {p.status === "active" ? text.hide : text.show}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeProduct(p)}
                                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 ms-auto"
                                      title={text.delete}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {sellerTab === "orders" && (
                  <div className="p-6 rounded-3xl bg-surface dark:bg-slate-900 border border-line shadow-xs space-y-4">
                    <h3 className="text-sm font-black text-foreground">{text.ordersTitle}</h3>
                    {orders.length === 0 ? (
                      <p className="text-xs text-muted text-center py-6">{text.noOrders}</p>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((o) => (
                          <div key={o.id} className="p-4 rounded-2xl bg-surface-soft dark:bg-slate-800 border border-line flex items-center justify-between flex-wrap gap-3">
                            <div>
                              <div className="text-xs font-black text-foreground">{text.orderNumber} #{o.id.slice(0, 8)}</div>
                              <div className="text-[11px] text-muted">{text.total}: {o.total_amount} {text.currency}</div>
                            </div>
                            <select
                              value={o.status}
                              onChange={(e) => handleOrderStatusChange(o.id, e.target.value as OrderStatus)}
                              className="px-3 py-1.5 rounded-xl bg-surface dark:bg-slate-900 border border-line text-xs font-bold"
                            >
                              {Object.entries(text.orderStatus).map(([val, lbl]) => (
                                <option key={val} value={val}>{lbl}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {sellerTab === "settings" && (
                  <div className="p-6 rounded-3xl bg-surface dark:bg-slate-900 border border-line shadow-xs space-y-4">
                    <div className="border-b border-line pb-2">
                      <h3 className="text-sm font-black text-foreground">{text.settingsTitle}</h3>
                      <p className="text-xs text-muted">{text.settingsHint}</p>
                    </div>

                    {settingsMessage && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                        {settingsMessage}
                      </div>
                    )}

                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">{text.storeName}</label>
                        <input
                          value={settingsName}
                          onChange={(e) => setSettingsName(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft dark:bg-slate-800 border border-line text-xs font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">{text.storeDesc}</label>
                        <textarea
                          value={settingsDesc}
                          onChange={(e) => setSettingsDesc(e.target.value)}
                          rows={3}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface-soft dark:bg-slate-800 border border-line text-xs font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">{text.logoLabel}</label>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} className="w-full text-xs text-muted" />
                          {uploadingLogo && <small className="text-xs text-orange-500">{text.uploading}</small>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">{text.bannerLabel}</label>
                          <input type="file" accept="image/*" onChange={handleBannerUpload} disabled={uploadingBanner} className="w-full text-xs text-muted" />
                          {uploadingBanner && <small className="text-xs text-orange-500">{text.uploading}</small>}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={settingsSaving}
                          className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          {settingsSaving ? text.saving : text.saveSettings}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </section>

      {/* 3. Luxury Sign-Out Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-sm w-full p-6 rounded-3xl bg-surface dark:bg-slate-900 border border-line shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
              <LogOut size={28} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-foreground">{text.logoutConfirmTitle}</h3>
              <p className="text-xs text-muted leading-relaxed">{text.logoutConfirmDesc}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 rounded-xl bg-surface-soft dark:bg-slate-800 border border-line text-foreground font-black text-xs hover:border-slate-400 transition-all cursor-pointer"
              >
                {text.cancel}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {loggingOut ? (isAr ? "جارٍ الخروج..." : "Signing out...") : text.confirmLogout}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
