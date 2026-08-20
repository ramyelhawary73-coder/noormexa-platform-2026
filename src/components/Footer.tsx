"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import BrandLogo from "@/components/BrandLogo";

type Language = "ar" | "en";

const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    arabicName: "نورميكسا",
    tagline: "سوق تجارة إلكترونية عالمي",
    text: "NOORMEXA يساعد المتسوقين والبائعين والمتاجر والمعلنين على الظهور في تجربة واضحة وسهلة.",
    groups: [
      { title: "التسوق", items: ["استكشف السوق", "ابحث عن متجر", "أقسام السوق"] },
      { title: "البيع", items: ["ابدأ البيع", "اعرض منتجاتك", "اعرض متجرك"] },
      { title: "الإعلانات", items: ["أعلن عن عروضك", "منتجات مميزة", "عروض واضحة"] },
    ],
    rights: "© 2026 NOORMEXA. جميع الحقوق محفوظة.",
  },
  en: {
    arabicName: null,
    tagline: "Global E-Commerce Marketplace",
    text: "NOORMEXA helps shoppers, sellers, stores, and advertisers appear in a clear and simple experience.",
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
          <div className="noormexa-footer-brand-row">
            <BrandLogo size="lg" showTagline={true} taglineText={text.tagline} />
          </div>
          <p className="noormexa-footer-text">{text.text}</p>
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
