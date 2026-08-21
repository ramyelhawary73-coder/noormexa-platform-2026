"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Download } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { openPwaInstallModal } from "@/components/PwaInstallPrompt";

type Language = "ar" | "en";

const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    arabicName: "نورميكسا",
    tagline: "نورك إلى التجارة العالمية الذكية",
    text: "NOORMEXA — منصة وسوق التجارة الإلكترونية الشامل، يجمع أرقى المتاجر والعلامات الموثوقة مع تجربة تسوق فائقة السرعة والأمان.",
    installApp: "📲 تثبيت تطبيق NOORMEXA",
    groups: [
      { title: "التسوق", items: ["استكشف السوق", "ابحث عن متجر", "أقسام السوق"] },
      { title: "البيع", items: ["ابدأ البيع", "اعرض منتجاتك", "اعرض متجرك"] },
      { title: "الإعلانات", items: ["أعلن عن عروضك", "منتجات مميزة", "عروض واضحة"] },
    ],
    rights: "© 2026 NOORMEXA. جميع الحقوق محفوظة.",
  },
  en: {
    arabicName: null,
    tagline: "The Beacon of Smart Global Commerce",
    text: "NOORMEXA — The premier smart global e-commerce marketplace connecting verified stores, sellers, and shoppers worldwide.",
    installApp: "📲 Install NOORMEXA App",
    groups: [
      { title: "Shopping", items: ["Explore market", "Find stores", "Market sections"] },
      { title: "Selling", items: ["Start selling", "Show products", "Show store"] },
      { title: "Ads", items: ["Promote offers", "Featured products", "Clear deals"] },
    ],
    rights: "© 2026 NOORMEXA. All rights reserved.",
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

export default function Footer() {
  const language = useNoormexaLanguage();
  const text = copy[language];

  return (
    <footer className="noormexa-footer">
      <div className="noormexa-container noormexa-footer-grid">
        <section className="noormexa-footer-brand-card">
          <div className="noormexa-footer-brand-row mb-3">
            <BrandLogo size="lg" />
          </div>
          <p className="noormexa-footer-text mb-4">{text.text}</p>

          <button
            type="button"
            onClick={openPwaInstallModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 !text-white text-xs font-black shadow-md hover:shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Download size={15} className="stroke-[2.5]" />
            <span>{text.installApp}</span>
          </button>
        </section>

        <section className="noormexa-footer-links" aria-label="Footer links">
          {text.groups.map((group) => (
            <div className="noormexa-footer-list" key={group.title}>
              <h4>{group.title}</h4>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>
                    <Link href="/auth">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>

      <div className="noormexa-container noormexa-copy">{text.rights}</div>
    </footer>
  );
}
