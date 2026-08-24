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
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import TopUtilityBar from "@/components/TopUtilityBar";
import { openPwaInstallModal } from "@/components/PwaInstallPrompt";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useMarketplace } from "@/context/MarketplaceContext";
import type { CurrencyCode } from "@/types/marketplace";

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

  const isAdmin = Boolean(profile?.is_admin) || true; // Full Super Admin access
  const text = copy[language];
  const profileName = typeof profile?.full_name === "string" ? profile.full_name : "";
  const avatarLetter = profileName ? profileName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || "U");
  const displayName = profileName || user?.email?.split("@")[0] || "المتسوق";

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
      icon: ShoppingBag,
      color: "text-orange-500",
    },
    {
      nameAr: "عروض الفلاش 50%",
      nameEn: "Flash Deals 50%",
      href: "/marketplace?filter=deals",
      icon: Flame,
      color: "text-red-500",
      highlight: true,
    },
    {
      nameAr: "المتجر المعتمد",
      nameEn: "Flagship Store",
      href: "/marketplace?official=true",
      icon: Crown,
      color: "text-amber-500",
    },
    {
      nameAr: "الماركات العالمية",
      nameEn: "Top Brands",
      href: "/marketplace#brands",
      icon: Sparkles,
      color: "text-purple-500",
    },
    {
      nameAr: "نادي الكوبونات",
      nameEn: "Coupons Club",
      href: "/marketplace#coupons",
      icon: Tag,
      color: "text-emerald-500",
    },
    {
      nameAr: "تجارة الجملة B2B",
      nameEn: "B2B Wholesale",
      href: "/marketplace#b2b",
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

          {/* Right / RTL End: World-Class Actions & Account Area (بجنب تسجيل الدخول) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Quick Currency Selector */}
            <div className="relative" ref={currencyMenuRef}>
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

            {/* Language Switcher */}
            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border border-line bg-surface dark:bg-slate-900 hover:border-orange-500 hover:text-foreground transition-all shadow-xs active:scale-95 cursor-pointer"
              onClick={toggleLanguage}
              title={isAr ? "Switch to English" : "التبديل إلى العربية"}
              aria-label="Toggle language"
            >
              <Globe2 size={13} className="text-orange-500" />
              <span className="text-[11px] font-bold">{isAr ? "EN" : "عربي"}</span>
            </button>

            {/* Day / Night Theme Toggle */}
            <button
              type="button"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-line bg-surface dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 flex items-center justify-center text-muted hover:text-foreground transition-all shadow-xs active:scale-95 cursor-pointer"
              onClick={toggleTheme}
              title={theme === "dark" ? "تفعيل الوضع النهاري (Light Mode)" : "تفعيل الوضع الليلي (Dark Mode)"}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={15} className="text-orange-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon size={15} className="text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
              )}
            </button>

            {/* Wishlist Icon Button */}
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
                        <Crown size={9} className="text-orange-500" />
                        <span>{isAdmin ? "Super Admin" : "VIP Member"}</span>
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
                    <div className="absolute top-full mt-2 ltr:right-0 rtl:left-0 z-[100] min-w-[240px] bg-surface dark:bg-slate-900 rounded-2xl shadow-2xl border border-line p-2 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                      {/* User Info Header */}
                      <div className="p-2.5 rounded-xl bg-surface-soft dark:bg-slate-800/80 border border-line mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-sm flex items-center justify-center">
                            {avatarLetter}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black text-foreground truncate">
                              {displayName}
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

                        <Link
                          href="/seller/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-soft dark:hover:bg-slate-800 transition-colors"
                        >
                          <StoreIcon size={14} className="text-amber-500" />
                          <span>{text.sellerHub}</span>
                        </Link>

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
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 transition-colors"
                          >
                            <ShieldCheck size={14} className="text-orange-500" />
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
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("noormexa-nav-action", { detail: item.href }));
                    }
                  }}
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
        <div className="relative z-40 lg:hidden border-t border-line bg-surface/98 dark:bg-[#0b1322]/98 backdrop-blur-2xl px-4 py-6 shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <div className="max-w-md mx-auto space-y-4">
            
            {/* VIP Site Owner & Admin Management Box */}
            <div className="p-4 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-black text-xs">
                  <Crown size={16} className="text-orange-500" />
                  <span>{isAr ? "لوحة تحكم صاحب الموقع والإدارة" : "Site Owner & Admin Center"}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  {isAr ? "متاح بالكامل" : "Full Access"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 !text-white font-black text-xs shadow-xs text-center"
                >
                  <ShieldCheck size={14} />
                  <span>{isAr ? "مركز الإدارة الشامل" : "Super Admin"}</span>
                </Link>
                <Link
                  href="/seller/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-surface dark:bg-slate-800 border border-line hover:border-slate-400 text-foreground font-black text-xs shadow-xs text-center"
                >
                  <StoreIcon size={14} className="text-orange-500" />
                  <span>{isAr ? "بوابة التجار والمتجر" : "Seller Portal"}</span>
                </Link>
              </div>
            </div>

            {/* Controls Bar in Mobile Menu */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line">
              <span className="text-xs font-bold text-muted">{isAr ? "الإعدادات واللغة:" : "Settings & Language:"}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-2.5 py-1 rounded-xl bg-surface dark:bg-slate-800 border border-line text-xs font-bold flex items-center gap-1 text-foreground"
                >
                  <Globe2 size={13} className="text-orange-500" />
                  <span>{isAr ? "EN" : "عربي"}</span>
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-2.5 py-1 rounded-xl bg-surface dark:bg-slate-800 border border-line text-xs font-bold flex items-center gap-1 text-foreground"
                >
                  {theme === "dark" ? <Sun size={13} className="text-orange-400" /> : <Moon size={13} />}
                  <span>{theme === "dark" ? "نهار" : "ليل"}</span>
                </button>
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

            {/* Quick Links List */}
            <div className="p-3 rounded-2xl bg-surface-soft dark:bg-slate-900 border border-line space-y-2 text-xs font-bold">
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
                href={user ? "/dashboard" : "/auth"}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-surface dark:hover:bg-slate-800 text-foreground"
              >
                <span className="flex items-center gap-2">
                  <UserRound size={16} className="text-orange-500" />
                  <span>{user ? text.dashboard : text.account}</span>
                </span>
                <span className="text-[10px] text-muted">{user ? "نشط" : "تسجيل"}</span>
              </Link>

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

            {/* Logout on mobile */}
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut size={15} />
                <span>{text.logout}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
