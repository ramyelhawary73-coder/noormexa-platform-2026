"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, useRef, useEffect } from "react";
import {
  Coins,
  Crown,
  Globe2,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store as StoreIcon,
  Sun,
  Truck,
  UserRound,
  X,
  ChevronDown,
  Download,
  Flame,
  Tag,
  Building2,
  Sparkles,
  Package,
  Search,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import TopUtilityBar from "@/components/TopUtilityBar";
import { openPwaInstallModal } from "@/components/PwaInstallPrompt";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useMarketplace } from "@/context/MarketplaceContext";
import type { CurrencyCode } from "@/types/marketplace";

import { getUserRole } from "@/lib/authHelpers";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    tagline: "سوق ومنظومة التجارة العالمية",
    marketplace: "السوق المفتوح",
    sellerHub: "بوابة التجار",
    adminHub: "مركز الإدارة",
    orders: "تتبع الشحنات",
    wishlist: "المفضلة",
    account: "تسجيل الدخول",
    accountSub: "حسابي والطلبات",
    dashboard: "لوحة حسابي",
    myOrders: "طلباتي وشحناتي",
    myProfile: "الملف الشخصي",
    cart: "السلة",
    logout: "تسجيل الخروج",
    language: "EN",
    currency: "العملة",
    menu: "القائمة",
    close: "إغلاق",
    categories: "جميع الأقسام",
    flashDeals: "عروض الفلاش 50%",
    officialStore: "المتجر الرسمي",
    brands: "الماركات المعتمدة",
    coupons: "كوبونات التوفير",
    b2b: "الجملة B2B",
    searchPlaceholder: "ابحث في آلاف المنتجات والعلامات التجارية...",
  },
  en: {
    tagline: "Global Marketplace & Commerce Hub",
    marketplace: "Marketplace",
    sellerHub: "Seller Portal",
    adminHub: "Admin Hub",
    orders: "Track Orders",
    wishlist: "Wishlist",
    account: "Sign In",
    accountSub: "Account & Orders",
    dashboard: "My Dashboard",
    myOrders: "My Orders",
    myProfile: "Profile Settings",
    cart: "Cart",
    logout: "Sign Out",
    language: "عربي",
    currency: "Currency",
    menu: "Menu",
    close: "Close",
    categories: "All Categories",
    flashDeals: "Flash Deals 50%",
    officialStore: "Flagship Store",
    brands: "Top Brands",
    coupons: "Coupons & Deals",
    b2b: "B2B Wholesale",
    searchPlaceholder: "Search thousands of luxury products & brands...",
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

function setDocumentLanguage(language: Language) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
}

export default function Navbar() {
  const pathname = usePathname();
  const language = useNoormexaLanguage();
  const isAr = language === "ar";
  const [open, setOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { currency, setCurrency, currencies, cartCount, wishlist } = useMarketplace();

  // Dynamic user role evaluation based on email and profile
  const userRole = getUserRole(user, profile);
  const isAdmin = userRole === "admin";
  const isSeller = userRole === "seller";

  const text = copy[language];
  const profileName = typeof profile?.full_name === "string" ? profile.full_name : "";
  const avatarLetter = profileName ? profileName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || "U");
  const displayName = profileName || user?.email?.split("@")[0] || (isAr ? "المتسوق" : "Member");

  const roleBadgeLabel = isAdmin
    ? (isAr ? "مالك المنصة" : "Super Admin")
    : isSeller
    ? (isAr ? "تاجر معتمد" : "Verified Seller")
    : (isAr ? "عضو متسوق" : "Shopper");

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setCurrencyOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setDocumentLanguage(language);
  }, [language]);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setOpen(false);
    await Promise.race([
      signOut().catch((error) => console.error("Sign out error:", error)),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);

    if (typeof window !== "undefined") {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith("sb-") && key.includes("-auth-token"))
        .forEach((key) => window.localStorage.removeItem(key));
    }

    window.location.href = "/";
  };

  const toggleLanguage = () => {
    const next: Language = language === "ar" ? "en" : "ar";
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_KEY, next);
      setDocumentLanguage(next);
      window.dispatchEvent(new CustomEvent("noormexa-language-change", { detail: next }));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const currencyList = Object.keys(currencies) as CurrencyCode[];

  // Sub-Navigation Quick Strip Links
  const subNavLinks = [
    {
      nameAr: "جميع الأقسام",
      nameEn: "All Categories",
      href: "/marketplace",
      targetId: "categories",
      icon: ShoppingBag,
      color: "text-orange-500",
    },
    {
      nameAr: "عروض الفلاش 50%",
      nameEn: "Flash Deals 50%",
      href: "/marketplace?filter=deals#deals",
      targetId: "deals",
      icon: Flame,
      color: "text-red-500",
      highlight: true,
    },
    {
      nameAr: "المتجر المعتمد",
      nameEn: "Flagship Store",
      href: "/marketplace?official=true#official",
      targetId: "official",
      icon: Crown,
      color: "text-amber-500",
    },
    {
      nameAr: "الماركات العالمية",
      nameEn: "Top Brands",
      href: "/marketplace?view=brands#brands",
      targetId: "brands",
      icon: Sparkles,
      color: "text-purple-500",
    },
    {
      nameAr: "نادي الكوبونات",
      nameEn: "Coupons Club",
      href: "/marketplace?view=coupons#coupons",
      targetId: "coupons",
      icon: Tag,
      color: "text-emerald-500",
    },
    {
      nameAr: "تجارة الجملة B2B",
      nameEn: "B2B Wholesale",
      href: "/marketplace?view=b2b#b2b",
      targetId: "b2b",
      icon: Building2,
      color: "text-blue-500",
    },
    {
      nameAr: "إدارة وتتبع الشحنات",
      nameEn: "Live Shipments & Tracking",
      href: "/shipping",
      icon: Truck,
      color: "text-orange-500",
    },
  ];

  const handleSubNavClick = (
    item: { href: string; targetId?: string },
    e?: React.MouseEvent
  ) => {
    if (pathname === "/" && item.targetId) {
      const el = document.getElementById(item.targetId);
      if (el) {
        if (e) e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("noormexa-nav-action", { detail: item.href }));
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-colors">
      {/* 1. Global Announcement & Utility Ticker Bar */}
      <TopUtilityBar />

      {/* 2. Main Executive Header Bar */}
      <div className="relative z-30 w-full bg-surface/95 dark:bg-[#0b1322]/95 backdrop-blur-xl border-b border-line shadow-xs">
        <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 h-17 sm:h-18 flex items-center justify-between gap-3 sm:gap-5">
          
          {/* Left / RTL Start: Official Brand Identity & Logo */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              href="/"
              className="flex items-center group focus:outline-none py-1"
              aria-label="NOORMEXA home"
              onClick={() => setOpen(false)}
            >
              <BrandLogo size="md" />
            </Link>
          </div>

          {/* Center: Desktop Navigation Pills */}
          <nav
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-soft/80 dark:bg-slate-900/80 border border-line/70 shadow-xs"
            aria-label="Main navigation"
          >
            <Link
              href="/marketplace"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                pathname === "/marketplace"
                  ? "bg-surface dark:bg-slate-800 text-foreground shadow-xs border border-line"
                  : "text-muted hover:text-foreground hover:bg-surface/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <ShoppingBag size={14} className="text-orange-500" />
              <span>{text.marketplace}</span>
            </Link>

            <Link
              href="/seller/dashboard"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                pathname.startsWith("/seller")
                  ? "bg-surface dark:bg-slate-800 text-foreground shadow-xs border border-line"
                  : "text-muted hover:text-foreground hover:bg-surface/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <StoreIcon size={14} className="text-orange-500" />
              <span>{text.sellerHub}</span>
            </Link>

            <Link
              href="/shipping"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                pathname.startsWith("/shipping")
                  ? "bg-surface dark:bg-slate-800 text-foreground shadow-xs border border-line"
                  : "text-muted hover:text-foreground hover:bg-surface/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Truck size={14} className="text-orange-500" />
              <span>{isAr ? "إدارة الشحنات والتتبع" : "Logistics Hub"}</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/admin")
                    ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/40 shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-surface-soft dark:hover:bg-slate-800"
                }`}
              >
                <Crown size={14} className="text-orange-500" />
                <span>{text.adminHub}</span>
              </Link>
            )}
          </nav>

          {/* Right / RTL End: World-Class Actions & Account Area (Responsive Controls) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Quick Currency Selector (Tablet & Desktop) */}
            <div className="hidden md:block relative" ref={currencyMenuRef}>
              <button
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border border-line bg-surface dark:bg-slate-900 hover:border-orange-500/50 hover:text-foreground transition-all shadow-xs cursor-pointer"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                title={text.currency}
                aria-label={text.currency}
              >
                <Coins size={13} className="text-orange-500" />
                <span className="font-mono text-[11px] font-black">{currency}</span>
                <ChevronDown
                  size={11}
                  className={`text-muted transition-transform duration-200 ${
                    currencyOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {currencyOpen && (
                <div className="absolute top-full mt-2 ltr:right-0 rtl:left-0 z-[100] min-w-[220px] bg-surface dark:bg-slate-900 rounded-2xl shadow-2xl border border-line p-1.5 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-muted border-b border-line mb-1 uppercase tracking-wider">
                    {text.currency} / Select Currency
                  </div>
                  <div className="space-y-0.5 max-h-64 overflow-y-auto">
                    {currencyList.map((c) => {
                      const info = currencies[c];
                      const active = c === currency;
                      return (
                        <button
                          key={c}
                          type="button"
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            active
                              ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black border border-orange-500/30"
                              : "hover:bg-surface-soft dark:hover:bg-slate-800 text-foreground"
                          }`}
                          onClick={() => {
                            setCurrency(c);
                            setCurrencyOpen(false);
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-mono font-bold">{c}</span>
                            <span className="text-[10px] opacity-75">
                              ({isAr ? info.symbolAr : info.symbolEn})
                            </span>
                          </span>
                          <span className="text-[10px] text-muted font-bold">
                            {isAr ? info.nameAr : info.nameEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher (Tablet & Desktop) */}
            <button
              type="button"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border border-line bg-surface dark:bg-slate-900 hover:border-orange-500 hover:text-foreground transition-all shadow-xs active:scale-95 cursor-pointer"
              onClick={toggleLanguage}
              title={isAr ? "Switch to English" : "التبديل إلى العربية"}
              aria-label="Toggle language"
            >
              <Globe2 size={13} className="text-orange-500" />
              <span className="text-[11px] font-bold">{isAr ? "EN" : "عربي"}</span>
            </button>

            {/* Professional Day / Night Theme Toggle (Visible on Mobile & Desktop) */}
            <button
              id="theme-toggle-btn"
              type="button"
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-line bg-surface dark:bg-slate-900 hover:border-orange-500/60 text-muted hover:text-foreground transition-all shadow-xs active:scale-90 cursor-pointer"
              onClick={toggleTheme}
              title={theme === "dark" ? (isAr ? "التبديل إلى الوضع النهاري (Light Mode)" : "Switch to Light Mode") : (isAr ? "التبديل إلى الوضع الليلي (Dark Mode)" : "Switch to Dark Mode")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={16} className="text-amber-400 fill-amber-400/20 transition-transform duration-300 rotate-0 hover:rotate-90" />
              ) : (
                <Moon size={15} className="text-slate-700 dark:text-slate-200 fill-slate-700/15 transition-transform duration-300 rotate-0 hover:-rotate-12" />
              )}
            </button>

            {/* Search Quick Button (Mobile Only) */}
            <Link
              href="/marketplace"
              className="sm:hidden w-8 h-8 rounded-full border border-line bg-surface dark:bg-slate-900 flex items-center justify-center text-foreground hover:border-orange-500/60 transition-all shadow-xs"
              title={isAr ? "البحث في المنتجات" : "Search"}
              aria-label="Search"
            >
              <Search size={14} className="text-muted hover:text-orange-500" />
            </Link>

            {/* Wishlist Icon Button (Desktop/Tablet) */}
            <Link
              href="/marketplace?wishlist=true"
              className="hidden sm:flex relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-line bg-surface dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 items-center justify-center text-muted hover:text-foreground transition-all shadow-xs"
              title={text.wishlist}
              aria-label={text.wishlist}
            >
              <Heart
                size={15}
                className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -end-1 min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-black px-0.5 shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Icon Button with Amazon-Style Orange Badge */}
            <Link
              href="/cart"
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-line bg-surface dark:bg-slate-900 hover:border-orange-500/60 flex items-center justify-center text-foreground hover:text-orange-500 transition-all shadow-xs"
              title={text.cart}
              aria-label={text.cart}
            >
              <ShoppingCart size={15} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-black px-1 shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ========================================================================= */}
            {/* World-Class User Account & Login / Profile Center (بجنب تسجيل الدخول) */}
            {/* ========================================================================= */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                /* Authenticated State: Luxury Profile Avatar & Dropdown */
                <div>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full border border-line bg-surface dark:bg-slate-900 hover:border-orange-500/50 transition-all shadow-xs cursor-pointer group"
                    aria-label="User profile menu"
                  >
                    <div className="relative">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {avatarLetter}
                      </div>
                      <span className="absolute bottom-0 end-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface dark:border-slate-900" />
                    </div>

                    <div className="hidden md:flex flex-col text-start leading-tight">
                      <span className="text-[11px] font-black text-foreground max-w-[100px] truncate">
                        {displayName}
                      </span>
                      <span className="text-[9px] text-muted font-bold flex items-center gap-0.5">
                        {isAdmin ? (
                          <Crown size={10} className="text-amber-500 fill-amber-500/20" />
                        ) : isSeller ? (
                          <StoreIcon size={10} className="text-orange-500" />
                        ) : (
                          <Sparkles size={10} className="text-blue-500" />
                        )}
                        <span>{roleBadgeLabel}</span>
                      </span>
                    </div>

                    <ChevronDown
                      size={12}
                      className={`text-muted group-hover:text-foreground transition-transform duration-200 hidden sm:block ${
                        userDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu for Authenticated User */}
                  {userDropdownOpen && (
                    <div className="absolute top-full mt-2 ltr:right-0 rtl:left-0 z-[100] min-w-[250px] bg-surface dark:bg-slate-900 rounded-2xl shadow-2xl border border-line p-2 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                      {/* User Info Header */}
                      <div className="p-2.5 rounded-xl bg-surface-soft dark:bg-slate-800/80 border border-line mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-sm flex items-center justify-center">
                            {avatarLetter}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black text-foreground truncate flex items-center gap-1.5">
                              <span>{displayName}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                isAdmin
                                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                  : isSeller
                                  ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                                  : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                              }`}>
                                {roleBadgeLabel}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted truncate font-mono">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Menu Links */}
                      <div className="space-y-0.5 text-xs font-bold text-foreground">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-soft dark:hover:bg-slate-800 transition-colors"
                        >
                          <LayoutDashboard size={14} className="text-orange-500" />
                          <span>{text.dashboard}</span>
                        </Link>

                        <Link
                          href="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-soft dark:hover:bg-slate-800 transition-colors"
                        >
                          <Package size={14} className="text-orange-500" />
                          <span>{text.myOrders}</span>
                        </Link>

                        {(isSeller || isAdmin) ? (
                          <Link
                            href="/seller/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-soft dark:hover:bg-slate-800 transition-colors"
                          >
                            <StoreIcon size={14} className="text-amber-500" />
                            <span>{text.sellerHub}</span>
                          </Link>
                        ) : (
                          <Link
                            href="/auth/choose-role"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 transition-colors"
                          >
                            <StoreIcon size={14} className="text-orange-500" />
                            <span>{isAr ? "الترقية لحساب تاجر" : "Become a Seller"}</span>
                          </Link>
                        )}

                        <Link
                          href="/shipping"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-soft dark:hover:bg-slate-800 transition-colors"
                        >
                          <Truck size={14} className="text-orange-500" />
                          <span>{isAr ? "إدارة وتتبع الشحنات اللوجستية" : "Logistics & Shipments"}</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 transition-colors font-black"
                          >
                            <Crown size={14} className="text-orange-500" />
                            <span>{text.adminHub}</span>
                          </Link>
                        )}
                      </div>

                      <div className="my-1.5 border-t border-line" />

                      {/* Sign Out Button */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>{text.logout}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest / Sign-In State: High-Converting World-Class Action Button */
                <Link
                  href="/auth"
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-black bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 !text-white shadow-xs hover:shadow-orange-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer shrink-0"
                >
                  <UserRound size={14} className="stroke-[2.5]" />
                  <span className="hidden xs:inline">{text.account}</span>
                  <span className="xs:hidden">{isAr ? "دخول" : "Sign In"}</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-line bg-surface dark:bg-slate-900 flex items-center justify-center text-foreground hover:border-slate-400 transition-all shadow-xs cursor-pointer"
              onClick={() => setOpen(!open)}
              aria-label={open ? text.close : text.menu}
              aria-expanded={open}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>

          </div>

        </div>
      </div>

      {/* 3. Sub-Navigation / Secondary Quick Strip (Amazon / Noon / Farfetch Style) */}
      <nav
        aria-label={isAr ? "أقسام التسوق السريعة" : "Category and deals quick navigation"}
        className="relative z-10 w-full bg-surface-soft/90 dark:bg-[#070c17]/90 border-b border-line backdrop-blur-md overflow-x-auto no-scrollbar py-1 px-4 sm:px-6 lg:px-10 2xl:px-12 transition-colors"
      >
        <div className="max-w-[1720px] w-full mx-auto flex items-center justify-between gap-4 text-xs font-bold text-muted min-w-max">
          {/* Quick Links List */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {subNavLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleSubNavClick(item, e)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-[11px] sm:text-xs ${
                    item.highlight
                      ? "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-black border border-red-500/30 hover:bg-red-500/20"
                      : "hover:text-foreground hover:bg-surface dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={12} className={item.color} />
                  <span>{isAr ? item.nameAr : item.nameEn}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Right Side Hint (Desktop) */}
          <div className="hidden md:flex items-center gap-3 text-[11px] text-muted">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck size={12} />
              <span>{isAr ? "ضمان أصالة 100%" : "100% Authentic"}</span>
            </span>
            <span className="text-line">|</span>
            <Link
              href="/orders"
              className="hover:text-orange-500 transition-colors flex items-center gap-1"
            >
              <Truck size={12} />
              <span>{isAr ? "تتبع فوري للشحنة" : "Live GPS Tracking"}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 4. Sleek Mobile Slide-Down Drawer */}
      {open && (
        <div className="relative z-40 lg:hidden border-t border-line bg-surface/98 dark:bg-[#0b1322]/98 backdrop-blur-2xl px-4 py-5 shadow-2xl animate-in slide-in-from-top-3 duration-200 max-h-[85vh] overflow-y-auto">
          <div className="max-w-md mx-auto space-y-3.5">
            
            {/* User Account / Welcome Header Card */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-surface-soft dark:bg-slate-900/90 border border-line shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                      {avatarLetter}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-foreground truncate max-w-[140px]">{displayName}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                          isAdmin
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            : isSeller
                            ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                            : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        }`}>
                          {roleBadgeLabel}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted truncate font-mono">{user.email}</div>
                    </div>
                  </div>

                  {/* Clean Integrated Sign-Out Button in Mobile Header */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-black transition-all cursor-pointer shrink-0 active:scale-95"
                    title={text.logout}
                  >
                    <LogOut size={13} />
                    <span>{text.logout}</span>
                  </button>
                </div>

                {/* Role-Specific Quick Hub Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line/60">
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-surface dark:bg-slate-800 border border-line hover:border-orange-500/50 text-foreground font-black text-xs shadow-xs text-center"
                  >
                    <UserRound size={13} className="text-orange-500" />
                    <span>{text.dashboard}</span>
                  </Link>

                  {isAdmin ? (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs shadow-xs text-center"
                    >
                      <Crown size={13} />
                      <span>{text.adminHub}</span>
                    </Link>
                  ) : isSeller ? (
                    <Link
                      href="/seller/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs shadow-xs text-center"
                    >
                      <StoreIcon size={13} />
                      <span>{text.sellerHub}</span>
                    </Link>
                  ) : (
                    <Link
                      href="/auth/choose-role"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-black text-xs shadow-xs text-center"
                    >
                      <StoreIcon size={13} className="text-orange-500" />
                      <span>{isAr ? "افتح متجرك وابدأ البيع" : "Become Seller"}</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/30 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-foreground">
                    {isAr ? "مرحباً بك في NOORMEXA" : "Welcome to NOORMEXA"}
                  </div>
                  <div className="text-[10px] text-muted">
                    {isAr ? "سجّل دخولك للوصول إلى طلباتك وعروضك" : "Sign in to access orders and perks"}
                  </div>
                </div>
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 !text-white font-black text-xs shadow-xs hover:scale-102 transition-transform shrink-0"
                >
                  {isAr ? "دخول / تسجيل" : "Sign In"}
                </Link>
              </div>
            )}

            {/* Controls Bar in Mobile Menu (Currency, Language, Theme) */}
            <div className="p-3 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted">{isAr ? "العملة المفضلة:" : "Currency:"}</span>
                <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] no-scrollbar">
                  {currencyList.slice(0, 4).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        currency === c
                          ? "bg-orange-500 text-white shadow-xs"
                          : "bg-surface dark:bg-slate-800 text-muted hover:text-foreground border border-line"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-line/60">
                <span className="text-[11px] font-bold text-muted">{isAr ? "اللغة والمظهر:" : "Language & Theme:"}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="px-2.5 py-1 rounded-xl bg-surface dark:bg-slate-800 border border-line text-xs font-bold flex items-center gap-1 text-foreground cursor-pointer active:scale-95"
                  >
                    <Globe2 size={13} className="text-orange-500" />
                    <span>{isAr ? "EN" : "عربي"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="px-2.5 py-1 rounded-xl bg-surface dark:bg-slate-800 border border-line text-xs font-bold flex items-center gap-1 text-foreground cursor-pointer active:scale-95"
                  >
                    {theme === "dark" ? (
                      <Sun size={13} className="text-amber-400 fill-amber-400/20" />
                    ) : (
                      <Moon size={13} className="text-slate-600" />
                    )}
                    <span>{theme === "dark" ? (isAr ? "نهار" : "Light") : (isAr ? "ليل" : "Dark")}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Links Grid */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/marketplace"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line hover:border-orange-500/50 text-xs font-bold text-foreground transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <ShoppingBag size={16} />
                </div>
                <span>{text.marketplace}</span>
              </Link>

              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line hover:border-orange-500/50 text-xs font-bold text-foreground transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Truck size={16} />
                </div>
                <span>{text.orders}</span>
              </Link>
            </div>

            {/* Mobile Sub-Navigation Fast Actions */}
            <div className="p-3 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line space-y-2">
              <div className="text-[11px] font-black text-muted mb-1 px-1">
                {isAr ? "الأقسام والعروض السريعة" : "Quick Sections & Deals"}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {subNavLinks.slice(1, 6).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={(e) => {
                        setOpen(false);
                        handleSubNavClick(item, e);
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl bg-surface dark:bg-slate-800/80 border border-line hover:border-orange-500/50 text-foreground text-[11px] font-bold text-start transition-all cursor-pointer"
                    >
                      <Icon size={14} className={item.color} />
                      <span className="truncate">{isAr ? item.nameAr : item.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Links List */}
            <div className="p-3 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line space-y-1.5 text-xs font-bold">
              {/* Install App Trigger in Mobile Drawer */}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openPwaInstallModal();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-black text-xs cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Download size={16} className="text-orange-500 animate-bounce" />
                  <span>{isAr ? "تثبيت تطبيق NOORMEXA الرسمي" : "Install Official App"}</span>
                </span>
                <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {isAr ? "مجاني" : "Free"}
                </span>
              </button>

              <Link
                href="/marketplace?wishlist=true"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-surface dark:hover:bg-slate-800 text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Heart size={16} className="text-red-500" />
                  <span>{text.wishlist}</span>
                </span>
                {wishlist.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
