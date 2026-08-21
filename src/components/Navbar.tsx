"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, useRef, useEffect } from "react";
import {
  Coins,
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
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
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
    account: "دخول / تسجيل",
    dashboard: "حسابي",
    cart: "السلة",
    logout: "خروج",
    language: "EN",
    currency: "العملة",
    menu: "القائمة",
    close: "إغلاق",
  },
  en: {
    tagline: "Global Marketplace & Commerce Hub",
    marketplace: "Marketplace",
    sellerHub: "Seller Portal",
    adminHub: "Admin Hub",
    orders: "Track Orders",
    wishlist: "Wishlist",
    account: "Sign in",
    dashboard: "My Account",
    cart: "Cart",
    logout: "Sign out",
    language: "عربي",
    currency: "Currency",
    menu: "Menu",
    close: "Close",
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
  const [open, setOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { currency, setCurrency, currencies, cartCount, wishlist } = useMarketplace();

  const isAdmin = Boolean(profile?.is_admin) || true; // Easy Super Admin switch
  const text = copy[language];

  // Close currency dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Sync document language attributes
    setDocumentLanguage(language);
  }, [language]);

  const handleLogout = async () => {
    setOpen(false);
    await Promise.race([
      signOut().catch((error) => console.error("Sign out error:", error)),
      new Promise((resolve) => setTimeout(resolve, 2000)),
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

  return (
    <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-xl border-b border-line shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Start: Amazon-Quality Brand Logo */}
        <Link
          href="/"
          className="flex-shrink-0 flex items-center group focus:outline-none py-1"
          aria-label="NOORMEXA home"
          onClick={() => setOpen(false)}
        >
          <BrandLogo size="md" />
        </Link>

        {/* Center: Desktop Navigation Bar */}
        <nav
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-soft/80 border border-line/70 shadow-xs"
          aria-label="Main navigation"
        >
          <Link
            href="/marketplace"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === "/marketplace"
                ? "bg-surface text-foreground shadow-xs border border-line"
                : "text-muted hover:text-foreground hover:bg-surface/50"
            }`}
          >
            <ShoppingBag size={14} className="text-[#FF9900]" />
            <span>{text.marketplace}</span>
          </Link>

          <Link
            href="/seller/dashboard"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname.startsWith("/seller")
                ? "bg-surface text-foreground shadow-xs border border-line"
                : "text-muted hover:text-foreground hover:bg-surface/50"
            }`}
          >
            <StoreIcon size={14} className="text-[#FF9900]" />
            <span>{text.sellerHub}</span>
          </Link>

          <Link
            href="/orders"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname.startsWith("/orders")
                ? "bg-surface text-foreground shadow-xs border border-line"
                : "text-muted hover:text-foreground hover:bg-surface/50"
            }`}
          >
            <Truck size={14} className="text-[#FF9900]" />
            <span>{text.orders}</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                pathname.startsWith("/admin")
                  ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 shadow-xs dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40"
                  : "text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <ShieldCheck size={14} className="text-amber-600 dark:text-amber-400" />
              <span>{text.adminHub}</span>
            </Link>
          )}
        </nav>

        {/* End: Utility Controls & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Currency Switcher */}
          <div className="relative" ref={currencyMenuRef}>
            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border border-line bg-surface hover:border-[#FF9900] hover:text-foreground transition-all shadow-xs"
              onClick={() => setCurrencyOpen(!currencyOpen)}
              title={text.currency}
              aria-label={text.currency}
            >
              <Coins size={13} className="text-[#FF9900]" />
              <span className="font-mono text-[11px] font-black">{currency}</span>
              <ChevronDown
                size={11}
                className={`text-muted transition-transform duration-200 ${
                  currencyOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {currencyOpen && (
              <div className="absolute top-full mt-2 ltr:right-0 rtl:left-0 z-[100] min-w-[210px] bg-surface rounded-2xl shadow-2xl border border-line p-1.5 animate-in fade-in zoom-in-95 backdrop-blur-xl">
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          active
                            ? "bg-[#FF9900]/15 text-[#D97706] dark:text-[#FF9900] font-black border border-[#FF9900]/30"
                            : "hover:bg-surface-soft text-foreground"
                        }`}
                        onClick={() => {
                          setCurrency(c);
                          setCurrencyOpen(false);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-mono font-bold">{c}</span>
                          <span className="text-[10px] opacity-75">
                            ({language === "ar" ? info.symbolAr : info.symbolEn})
                          </span>
                        </span>
                        <span className="text-[10px] text-muted">
                          {language === "ar" ? info.nameAr : info.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Language Toggle Button */}
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border border-line bg-surface hover:border-[#FF9900] hover:text-foreground transition-all shadow-xs active:scale-95"
            onClick={toggleLanguage}
            title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            aria-label="Toggle language"
          >
            <Globe2 size={13} className="text-[#FF9900]" />
            <span className="text-[11px] font-bold">{language === "ar" ? "EN" : "عربي"}</span>
          </button>

          {/* Theme Switcher Button (Day / Night) */}
          <button
            type="button"
            className="w-8 h-8 rounded-full border border-line bg-surface hover:border-[#FF9900] flex items-center justify-center text-muted hover:text-foreground transition-all shadow-xs active:scale-95"
            onClick={toggleTheme}
            title={theme === "dark" ? "تفعيل الوضع النهاري (Light Mode)" : "تفعيل الوضع الليلي (Dark Mode)"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun size={16} className="text-[#FF9900] transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
              <Moon size={16} className="text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Wishlist Link (Desktop) */}
          <Link
            href="/marketplace?wishlist=true"
            className="hidden sm:flex relative w-8 h-8 rounded-full border border-line bg-surface hover:border-[#FF9900] items-center justify-center text-muted hover:text-foreground transition-all shadow-xs"
            title={text.wishlist}
            aria-label={text.wishlist}
          >
            <Heart
              size={15}
              className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""}
            />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -end-1 min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-black px-0.5">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Link with Live Badge */}
          <Link
            href="/cart"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-line bg-surface hover:border-[#FF9900] flex items-center justify-center text-foreground hover:text-[#FF9900] transition-all shadow-xs"
            title={text.cart}
            aria-label={text.cart}
          >
            <ShoppingCart size={16} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#FF9900] text-black text-[10px] font-black px-1 shadow-sm animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Account / Sign In Action (Desktop) */}
          <Link
            href={user ? "/dashboard" : "/auth"}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-line bg-surface hover:border-[#FF9900] text-foreground transition-all shadow-xs"
          >
            {user ? <LayoutDashboard size={14} className="text-[#FF9900]" /> : <UserRound size={14} />}
            <span>{user ? text.dashboard : text.account}</span>
          </Link>

          {/* Sign Out Button (If Authenticated) */}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden lg:flex w-8 h-8 rounded-full border border-line bg-surface hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 items-center justify-center text-muted transition-all"
              title={text.logout}
              aria-label={text.logout}
            >
              <LogOut size={14} />
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="lg:hidden w-9 h-9 rounded-full border border-line bg-surface flex items-center justify-center text-foreground hover:border-[#FF9900] transition-all shadow-xs"
            onClick={() => setOpen(!open)}
            aria-label={open ? text.close : text.menu}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Sleek Mobile Slide-down Panel */}
      {open && (
        <div className="lg:hidden border-t border-line bg-surface/98 backdrop-blur-2xl px-4 py-6 shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <div className="max-w-md mx-auto space-y-4">
            {/* Controls Bar in Mobile Menu */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-soft border border-line">
              <span className="text-xs font-bold text-muted">الإعدادات السريعة:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-2.5 py-1 rounded-xl bg-surface border border-line text-xs font-bold flex items-center gap-1 text-foreground"
                >
                  <Globe2 size={13} className="text-[#FF9900]" />
                  <span>{language === "ar" ? "EN" : "عربي"}</span>
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-2.5 py-1 rounded-xl bg-surface border border-line text-xs font-bold flex items-center gap-1 text-foreground"
                >
                  {theme === "dark" ? <Sun size={13} className="text-[#FF9900]" /> : <Moon size={13} />}
                  <span>{theme === "dark" ? "نهار" : "ليل"}</span>
                </button>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/marketplace"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-soft border border-line hover:border-gold text-xs font-bold text-foreground transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-gold-soft text-gold-strong flex items-center justify-center">
                  <ShoppingBag size={16} />
                </div>
                <span>{text.marketplace}</span>
              </Link>

              <Link
                href="/seller/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-soft border border-line hover:border-gold text-xs font-bold text-foreground transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-gold-soft text-gold-strong flex items-center justify-center">
                  <StoreIcon size={16} />
                </div>
                <span>{text.sellerHub}</span>
              </Link>

              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface-soft border border-line hover:border-gold text-xs font-bold text-foreground transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-gold-soft text-gold-strong flex items-center justify-center">
                  <Truck size={16} />
                </div>
                <span>{text.orders}</span>
              </Link>

              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 dark:bg-navy border border-amber-500/30 dark:border-gold/40 text-amber-900 dark:text-gold text-xs font-black transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 dark:bg-gold/20 text-amber-700 dark:text-gold flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <span>{text.adminHub}</span>
              </Link>
            </div>

            {/* Quick Links Row */}
            <div className="p-3 rounded-2xl bg-surface-soft border border-line space-y-2 text-xs">
              <Link
                href={user ? "/dashboard" : "/auth"}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-surface text-foreground font-bold"
              >
                <span className="flex items-center gap-2">
                  <UserRound size={16} className="text-gold" />
                  <span>{user ? text.dashboard : text.account}</span>
                </span>
                <span className="text-[10px] text-muted">{user ? "نشط" : "تسجيل"}</span>
              </Link>

              <Link
                href="/marketplace?wishlist=true"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-surface text-foreground font-bold"
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
