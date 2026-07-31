"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BadgeQuestionMark,
  Gift,
  HomeIcon,
  Megaphone,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import HeroImageSlider from "@/components/landing/HeroImageSlider";

type Language = "ar" | "en";

type RoleCard = {
  title: string;
  text: string;
  cta: string;
  icon: LucideIcon;
};

type CategoryCard = {
  name: string;
  slug: string;
  icon: LucideIcon;
};

type StatCard = {
  value: string;
  label: string;
};

type PlanCard = {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlight?: boolean;
};

const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    badge: "سوق إلكتروني للتسوق والبيع والإعلانات",
    title: "اكتشف منتجات ومتاجر وابدأ البيع بسهولة",
    text: "ابحث عن منتج أو متجر، اعرض منتجاتك، أو أعلن عن عروضك داخل سوق واضح وسهل الاستخدام.",
    primary: "استكشف السوق",
    secondary: "ابدأ البيع",
    searchPlaceholder: "ابحث عن منتج أو متجر",
    marketTitle: "NOORMEXA يجمع السوق في مكان واحد",
    marketText: "واجهة واحدة تساعد العميل على التسوق، وتساعد البائع والمتجر والمعلن على الظهور بوضوح.",
    rolesTitle: "اختر دورك",
    rolesText: "ابدأ من المسار المناسب لك داخل السوق.",
    roles: [
      { title: "متسوق", text: "اكتشف المنتجات والمتاجر والعلامات التجارية بسهولة.", cta: "استكشف", icon: Search },
      { title: "بائع", text: "اعرض منتجاتك وابدأ البيع من واجهة واضحة.", cta: "ابدأ البيع", icon: ShoppingBag },
      { title: "متجر / علامة تجارية", text: "اعرض متجرك ومنتجاتك بشكل منظم.", cta: "اعرض متجرك", icon: Store },
      { title: "معلن", text: "أعلن عن عروضك ومنتجاتك داخل السوق.", cta: "أعلن عن عروضك", icon: Megaphone },
    ] as RoleCard[],
    categoriesTitle: "أقسام السوق",
    categoriesText: "ابدأ من القسم الأقرب لما تبحث عنه.",
    categories: [
      { name: "إلكترونيات", slug: "electronics", icon: Package },
      { name: "أزياء", slug: "fashion", icon: ShoppingBag },
      { name: "منزل", slug: "home", icon: HomeIcon },
      { name: "جمال", slug: "beauty", icon: Sparkles },
      { name: "إكسسوارات", slug: "accessories", icon: Gift },
      { name: "هدايا", slug: "gifts", icon: Gift },
    ] as CategoryCard[],
    faqTitle: "أسئلة سريعة",
    faqs: [
      { q: "هل يمكنني التسوق؟", a: "نعم، يمكنك اكتشاف المنتجات والمتاجر والعلامات التجارية من الصفحة الرئيسية." },
      { q: "هل يمكنني عرض منتجاتي؟", a: "نعم، اختر حساب بائع أو متجر وابدأ عرض منتجاتك." },
      { q: "هل يمكنني الإعلان؟", a: "نعم، يمكن للمعلنين عرض المنتجات والعروض داخل السوق." },
      { q: "هل يوجد عمولة على المبيعات؟", a: "نعم، نأخذ نسبة عمولة بسيطة من كل عملية بيع ناجحة، وتقدر تشوف تفاصيلها في خطط الاشتراك." },
      { q: "هل بياناتي وأموالي آمنة؟", a: "نعم، كل الحسابات والبيانات محمية عبر Supabase، والمدفوعات تمر عبر بوابات دفع موثوقة." },
    ],
    statsTitle: "أرقام تتكلم عن نفسها",
    stats: [
      { value: "+500", label: "بائع ومتجر" },
      { value: "+120", label: "دولة وصل لها السوق" },
      { value: "24/7", label: "دعم فني متواصل" },
      { value: "%99.9", label: "وقت تشغيل مستقر" },
    ] as StatCard[],
    plansTitle: "خطط اشتراك تناسب كل بائع",
    plansText: "اختر الباقة اللي تناسب حجم نشاطك وابدأ البيع فورًا.",
    plans: [
      {
        name: "أساسية",
        price: "مجانية",
        period: "",
        features: ["حتى 10 منتجات", "عمولة 8% على البيع", "دعم عبر البريد"],
      },
      {
        name: "احترافية",
        price: "299 ج.م",
        period: "/شهريًا",
        features: ["منتجات غير محدودة", "عمولة 5% على البيع", "دعم مباشر", "ظهور مميز في التصنيفات"],
        highlight: true,
      },
      {
        name: "متجر/علامة تجارية",
        price: "حسب الطلب",
        period: "",
        features: ["صفحة متجر مخصصة", "عمولة تفاوضية", "مدير حساب خاص", "تقارير وتحليلات متقدمة"],
      },
    ] as PlanCard[],
  },
  en: {
    badge: "Marketplace for shopping, selling, and ads",
    title: "Discover products and stores, then start selling easily",
    text: "Find products or stores, show your products, or promote offers inside a clear and simple market.",
    primary: "Explore market",
    secondary: "Start selling",
    searchPlaceholder: "Search product or store",
    marketTitle: "NOORMEXA brings the market into one place",
    marketText: "One interface helps shoppers buy, and helps sellers, stores, and advertisers appear clearly.",
    rolesTitle: "Choose your role",
    rolesText: "Start from the path that fits your place in the market.",
    roles: [
      { title: "Shopper", text: "Discover products, stores, and brands easily.", cta: "Explore", icon: Search },
      { title: "Seller", text: "Show your products and start selling from a clear interface.", cta: "Start selling", icon: ShoppingBag },
      { title: "Store / Brand", text: "Present your store and products in an organized way.", cta: "Show store", icon: Store },
      { title: "Advertiser", text: "Promote offers and products inside the market.", cta: "Advertise", icon: Megaphone },
    ] as RoleCard[],
    categoriesTitle: "Market categories",
    categoriesText: "Start from the section closest to what you need.",
    categories: [
      { name: "Electronics", slug: "electronics", icon: Package },
      { name: "Fashion", slug: "fashion", icon: ShoppingBag },
      { name: "Home", slug: "home", icon: HomeIcon },
      { name: "Beauty", slug: "beauty", icon: Sparkles },
      { name: "Accessories", slug: "accessories", icon: Gift },
      { name: "Gifts", slug: "gifts", icon: Gift },
    ] as CategoryCard[],
    faqTitle: "Quick questions",
    faqs: [
      { q: "Can I shop?", a: "Yes, you can discover products, stores, and brands from the homepage." },
      { q: "Can I show products?", a: "Yes, choose a seller or store account and start showing products." },
      { q: "Can I advertise?", a: "Yes, advertisers can present products and offers inside the market." },
      { q: "Is there a commission on sales?", a: "Yes, we take a small commission on each successful sale — see the plans section for details." },
      { q: "Is my data and money safe?", a: "Yes, all accounts and data are protected via Supabase, and payments go through trusted gateways." },
    ],
    statsTitle: "Numbers that speak for themselves",
    stats: [
      { value: "500+", label: "Sellers & stores" },
      { value: "120+", label: "Countries reached" },
      { value: "24/7", label: "Ongoing support" },
      { value: "99.9%", label: "Uptime" },
    ] as StatCard[],
    plansTitle: "Plans that fit every seller",
    plansText: "Pick the plan that fits your business size and start selling right away.",
    plans: [
      {
        name: "Basic",
        price: "Free",
        period: "",
        features: ["Up to 10 products", "8% sales commission", "Email support"],
      },
      {
        name: "Professional",
        price: "$9",
        period: "/month",
        features: ["Unlimited products", "5% sales commission", "Priority support", "Featured in categories"],
        highlight: true,
      },
      {
        name: "Store / Brand",
        price: "Custom",
        period: "",
        features: ["Dedicated store page", "Negotiable commission", "Dedicated account manager", "Advanced analytics"],
      },
    ] as PlanCard[],
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

export default function Home() {
  const language = useNoormexaLanguage();
  const text = copy[language];
  const isArabic = language === "ar";
  const DirectionIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <main id="top" className="noormexa-main">
      <section id="market" className="noormexa-hero-section">
        <div className="noormexa-container noormexa-hero-grid">
          <div className="noormexa-hero-copy">
            <span className="noormexa-eyebrow">
              <Sparkles size={17} />
              {text.badge}
            </span>

            <h1>{text.title}</h1>
            <p>{text.text}</p>

            <div className="noormexa-search-box" aria-label={text.searchPlaceholder}>
              <Search size={19} />
              <span>{text.searchPlaceholder}</span>
            </div>

            <div className="noormexa-hero-actions">
              <Link href="#categories" className="noormexa-primary-button">
                {text.primary}
                <DirectionIcon size={17} />
              </Link>
              <Link href="/auth" className="noormexa-secondary-button">
                {text.secondary}
              </Link>
            </div>
          </div>

          <HeroImageSlider language={language} />
        </div>
      </section>

      <section className="noormexa-market-strip">
        <div className="noormexa-container noormexa-market-strip-inner">
          <h2>{text.marketTitle}</h2>
          <p>{text.marketText}</p>
        </div>
      </section>

      <section className="noormexa-section noormexa-stats-section">
        <div className="noormexa-container">
          <div className="noormexa-section-heading">
            <h2>{text.statsTitle}</h2>
          </div>
          <div className="noormexa-stats-grid">
            {text.stats.map((stat) => (
              <div key={stat.label} className="noormexa-stat-card">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="noormexa-section">
        <div className="noormexa-container">
          <div className="noormexa-section-heading">
            <h2>{text.rolesTitle}</h2>
            <p>{text.rolesText}</p>
          </div>

          <div className="noormexa-roles-grid">
            {text.roles.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="noormexa-role-card">
                  <span className="noormexa-card-icon">
                    <Icon size={23} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <Link href="/auth">
                    {item.cta}
                    <DirectionIcon size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="categories" className="noormexa-section noormexa-section-soft">
        <div className="noormexa-container">
          <div className="noormexa-section-heading">
            <h2>{text.categoriesTitle}</h2>
            <p>{text.categoriesText}</p>
          </div>

          <div className="noormexa-categories-grid">
            {text.categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.name} href={`/category/${category.slug}`} className="noormexa-category-card">
                  <Icon size={24} />
                  <span>{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="plans" className="noormexa-section noormexa-section-soft">
        <div className="noormexa-container">
          <div className="noormexa-section-heading">
            <h2>{text.plansTitle}</h2>
            <p>{text.plansText}</p>
          </div>

          <div className="noormexa-plans-grid">
            {text.plans.map((plan) => (
              <article
                key={plan.name}
                className={`noormexa-plan-card${plan.highlight ? " noormexa-plan-highlight" : ""}`}
              >
                <h3>{plan.name}</h3>
                <div className="noormexa-plan-price">
                  <strong>{plan.price}</strong>
                  {plan.period && <span>{plan.period}</span>}
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <BadgeCheck size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/auth">{text.secondary}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="noormexa-section">
        <div className="noormexa-container noormexa-faq-grid">
          <div className="noormexa-faq-title">
            <span className="noormexa-card-icon">
              <BadgeQuestionMark size={23} />
            </span>
            <h2>{text.faqTitle}</h2>
          </div>

          <div className="noormexa-faq-list">
            {text.faqs.map((faq) => (
              <details key={faq.q} className="noormexa-faq-item">
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
