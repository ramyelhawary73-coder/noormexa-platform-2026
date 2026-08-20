"use client";

import Link from "next/link";
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
  UserRound,
  X,
  ChevronDown,
} from "lucide-react";
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
    adminHub: "مركز الإدارة الموحد",
    orders: "طلباتي والتتبع",
    wishlist: "المفضلة",
    account: "دخول / تسجيل",
    dashboard: "لوحة التحكم",
    cart: "السلة",
    logout: "تسجيل خروج",
    language: "EN",
    menu: "القائمة",
    close: "إغلاق القائمة",
    currency: "العملة",
  },
  en: {
    tagline: "Global Marketplace & Commerce Hub",
    marketplace: "Marketplace",
    sellerHub: "Seller Portal",
    adminHub: "Super Admin",
    orders: "My Orders & Tracking",
    wishlist: "Wishlist",
    account: "Sign in",
    dashboard: "Dashboard",
    cart: "Cart",
    logout: "Sign out",
    language: "AR",
    menu: "Menu",
    close: "Close menu",
    currency: "Currency",
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
  const language = useNoormexaLanguage();
  const [open, setOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { currency, setCurrency, currencies, cartCount, wishlist } = useMarketplace();

  const isAdmin = Boolean(profile?.is_admin) || true; // Allow testing Super Admin easily
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

  const handleLogout = async () => {
    setOpen(false);
    await Promise.race([
      signOut().catch((error) => console.error("Sign out error:", error)),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);

    if (typeof window !== "undefined") {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith("sb-") && key.includes("-auth-token"))
        .forEach((key) => window.localStorage.removeItem(key));
    }

    window.location.href = "/";
  };

  const toggleLanguage = () => {
    const next = language === "ar" ? "en" : "ar";
    window.localStorage.setItem(LANGUAGE_KEY, next);
    setDocumentLanguage(next);
    window.dispatchEvent(new CustomEvent("noormexa-language-change", { detail: next }));
    setOpen(false);
  };

  const currencyList = Object.keys(currencies) as CurrencyCode[];

  return (
    <header className="noormexa-header">
      <div className="noormexa-container noormexa-header-inner">
        {/* Brand Logo & Name */}
        <Link href="/" className="noormexa-brand" aria-label="NOORMEXA home" onClick={() => setOpen(false)}>
          <div className="noormexa-brand-logo-shell relative flex items-center justify-center p-1 rounded-xl bg-surface shadow-sm border border-line">
            <span className="font-extrabold text-lg tracking-wider text-gold font-sans">NRX</span>
          </div>
          <span className="noormexa-brand-text">
            <span className="noormexa-brand-word">NOORMEXA</span>
            <span className="noormexa-brand-tag">{text.tagline}</span>
          </span>
        </Link>

        {/* Primary Desktop Navigation */}
        <nav className="noormexa-nav-links" aria-label="Primary navigation">
          <Link href="/marketplace" className="font-medium text-foreground hover:text-gold flex items-center gap-1.5 transition-colors">
            <ShoppingBag size={16} />
            <span>{text.marketplace}</span>
          </Link>
          <Link href="/seller/dashboard" className="font-medium text-foreground hover:text-gold flex items-center gap-1.5 transition-colors">
            <StoreIcon size={16} />
            <span>{text.sellerHub}</span>
          </Link>
          <Link href="/orders" className="font-medium text-foreground hover:text-gold transition-colors">
            <span>{text.orders}</span>
          </Link>
        </nav>

        {/* Navigation Action Buttons */}
        <div className="noormexa-nav-actions">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="noormexa-icon-button noormexa-mobile-menu-button"
            aria-label={open ? text.close : text.menu}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={21} />}
          </button>

          {/* Currency Switcher Dropdown */}
          <div className="relative" ref={currencyMenuRef}>
            <button
              type="button"
              className="noormexa-pill-button flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border border-line bg-surface hover:border-gold transition-all"
              onClick={() => setCurrencyOpen(!currencyOpen)}
              title={text.currency}
            >
              <Coins size={14} className="text-gold" />
              <span>{currency}</span>
              <ChevronDown size={12} className={`transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
            </button>

            {currencyOpen && (
              <div className="absolute top-full mt-2 end-0 z-50 min-w-[170px] bg-surface rounded-2xl shadow-xl border border-line p-1.5 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-bold text-muted border-b border-line mb-1">
                  {text.currency} / Currency
                </div>
                {currencyList.map((c) => {
                  const info = currencies[c];
                  const active = c === currency;
                  return (
                    <button
                      key={c}
                      type="button"
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        active
                          ? "bg-gold-soft text-gold-strong font-bold"
                          : "hover:bg-surface-soft text-foreground"
                      }`}
                      onClick={() => {
                        setCurrency(c);
                        setCurrencyOpen(false);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-bold">{c}</span>
                        <span className="text-[11px] text-muted">({language === "ar" ? info.symbolAr : info.symbolEn})</span>
                      </span>
                      <span className="text-[11px] text-muted">{language === "ar" ? info.nameAr : info.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <button
            type="button"
            className="noormexa-pill-button noormexa-lang-toggle"
            onClick={toggleLanguage}
            aria-label="Toggle language"
          >
            <Globe2 size={16} />
            <span>{text.language}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            className="noormexa-icon-button noormexa-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Wishlist Link */}
          <Link
            href="/marketplace?wishlist=true"
            className="noormexa-icon-button noormexa-desktop-only-action relative"
            aria-label={text.wishlist}
            title={text.wishlist}
          >
            <Heart size={18} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Link with Badge */}
          <Link
            href="/cart"
            className="noormexa-icon-button noormexa-cart-link noormexa-desktop-only-action relative"
            aria-label="cart"
            title={text.cart}
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && <span className="noormexa-cart-badge">{cartCount}</span>}
          </Link>

          {/* Admin Hub Link */}
          {isAdmin && (
            <Link
              href="/admin"
              className="noormexa-pill-button noormexa-admin-link flex items-center gap-1.5 bg-navy text-gold border border-gold/40 hover:border-gold px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm"
              title="Super Admin Hub"
            >
              <ShieldCheck size={15} className="text-gold" />
              <span>{text.adminHub}</span>
            </Link>
          )}

          {/* Account / Dashboard Button */}
          <Link href={user ? "/dashboard" : "/auth"} className="noormexa-pill-button noormexa-account-link">
            {user ? <LayoutDashboard size={16} /> : <UserRound size={16} />}
            <span>{user ? text.dashboard : text.account}</span>
          </Link>

          {user && (
            <button
              type="button"
              className="noormexa-icon-button noormexa-desktop-only-action"
              onClick={handleLogout}
              aria-label={text.logout}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {open && (
        <div className="noormexa-mobile-panel">
          <nav className="noormexa-mobile-panel-card" aria-label="Mobile navigation">
            <Link href="/marketplace" onClick={() => setOpen(false)} className="flex items-center gap-2 font-semibold">
              <ShoppingBag size={18} className="text-gold" />
              <span>{text.marketplace}</span>
            </Link>
            <Link href="/seller/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <StoreIcon size={18} />
              <span>{text.sellerHub}</span>
            </Link>
            <Link href="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2">
              <span>{text.orders}</span>
            </Link>
            <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingCart size={18} />
                <span>{text.cart}</span>
              </span>
              {cartCount > 0 && (
                <span className="bg-gold text-navy px-2 py-0.5 rounded-full text-xs font-bold">{cartCount}</span>
              )}
            </Link>
            <Link href="/marketplace?wishlist=true" onClick={() => setOpen(false)} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Heart size={18} />
                <span>{text.wishlist}</span>
              </span>
              {wishlist.length > 0 && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">{wishlist.length}</span>
              )}
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 font-bold text-gold">
                <ShieldCheck size={18} />
                <span>{text.adminHub}</span>
              </Link>
            )}
            <Link href={user ? "/dashboard" : "/auth"} onClick={() => setOpen(false)}>
              {user ? text.dashboard : text.account}
            </Link>
            {user && (
              <button type="button" onClick={handleLogout} className="noormexa-mobile-logout">
                {text.logout}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
