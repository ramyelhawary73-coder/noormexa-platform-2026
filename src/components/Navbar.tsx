"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Globe2, LayoutDashboard, Menu, Moon, ShieldCheck, Sun, UserRound, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

type Language = "ar" | "en";

const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    tagline: "سوق تجارة إلكترونية عالمي",
    nav: [
      { href: "/#market", label: "السوق" },
      { href: "/#roles", label: "الأدوار" },
      { href: "/#categories", label: "الأقسام" },
      { href: "/#plans", label: "الأسعار" },
      { href: "/#faq", label: "الأسئلة" },
    ],
    account: "دخول",
    dashboard: "لوحة التحكم",
    admin: "لوحة الإدارة",
    language: "EN",
    menu: "القائمة",
    close: "إغلاق القائمة",
  },
  en: {
    tagline: "Global E-Commerce Marketplace",
    nav: [
      { href: "/#market", label: "Market" },
      { href: "/#roles", label: "Roles" },
      { href: "/#categories", label: "Categories" },
      { href: "/#plans", label: "Pricing" },
      { href: "/#faq", label: "Questions" },
    ],
    account: "Sign in",
    dashboard: "Dashboard",
    admin: "Admin",
    language: "AR",
    menu: "Menu",
    close: "Close menu",
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
  const { theme, toggleTheme } = useTheme();
  const { user, profile } = useAuth();
  const isAdmin = Boolean(profile?.is_admin);
  const text = copy[language];

  const toggleLanguage = () => {
    const next = language === "ar" ? "en" : "ar";
    window.localStorage.setItem(LANGUAGE_KEY, next);
    setDocumentLanguage(next);
    window.dispatchEvent(new CustomEvent("noormexa-language-change", { detail: next }));
    setOpen(false);
  };

  return (
    <header className="noormexa-header">
      <div className="noormexa-container noormexa-header-inner">
        <Link href="/" className="noormexa-brand" aria-label="NOORMEXA home" onClick={() => setOpen(false)}>
          <span className="noormexa-brand-logo-shell">
            <Image src="/logo-icon-dark.png" alt="NOORMEXA" width={96} height={96} className="noormexa-brand-logo" priority />
          </span>
          <span className="noormexa-brand-text">
            <span className="noormexa-brand-word">NOORMEXA</span>
            <span className="noormexa-brand-tag">{text.tagline}</span>
          </span>
        </Link>

        <nav className="noormexa-nav-links" aria-label="Primary navigation">
          {text.nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="noormexa-nav-actions">
          <button
            type="button"
            className="noormexa-icon-button noormexa-mobile-menu-button"
            aria-label={open ? text.close : text.menu}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={21} />}
          </button>

          <button type="button" className="noormexa-pill-button" onClick={toggleLanguage} aria-label="Toggle language">
            <Globe2 size={16} />
            <span>{text.language}</span>
          </button>

          <button type="button" className="noormexa-icon-button" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAdmin && (
            <Link href="/admin" className="noormexa-pill-button noormexa-admin-link">
              <ShieldCheck size={16} />
              <span>{text.admin}</span>
            </Link>
          )}

          <Link href={user ? "/dashboard" : "/auth"} className="noormexa-pill-button noormexa-account-link">
            {user ? <LayoutDashboard size={16} /> : <UserRound size={16} />}
            <span>{user ? text.dashboard : text.account}</span>
          </Link>
        </div>
      </div>

      {open && (
        <div className="noormexa-mobile-panel">
          <nav className="noormexa-mobile-panel-card" aria-label="Mobile navigation">
            {text.nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)}>
                {text.admin}
              </Link>
            )}
            <Link href={user ? "/dashboard" : "/auth"} onClick={() => setOpen(false)}>
              {user ? text.dashboard : text.account}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
