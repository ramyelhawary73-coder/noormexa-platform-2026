"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Flame,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import styles from "./HeroImageSlider.module.css";

export type SlideData = {
  id: string;
  image: string;
  badgeAr: string;
  badgeEn: string;
  badgeIcon: typeof Sparkles;
  arTitle: string;
  enTitle: string;
  arText: string;
  enText: string;
  ctaTextAr: string;
  ctaTextEn: string;
  ctaHref: string;
  secondaryTextAr?: string;
  secondaryTextEn?: string;
  secondaryHref?: string;
  highlightStatAr?: string;
  highlightStatEn?: string;
};

const SLIDES: SlideData[] = [
  {
    id: "products",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=85&w=1600&auto=format&fit=crop",
    badgeAr: "المنتجات الأكثر طلباً وأصالة",
    badgeEn: "Top Trending & Verified Products",
    badgeIcon: Sparkles,
    arTitle: "منتجات أصلية 100% معتمدة وضمان جودة",
    enTitle: "100% Certified Authentic Collections",
    arText: "اكتشف آلاف المنتجات والعروض الحصرية من كبرى الماركات العالمية والمتاجر الرسمية الموثقة في منصة واحدة.",
    enText: "Discover thousands of exclusive products and deals from leading global brands and verified flagship stores in one place.",
    ctaTextAr: "تصفح السوق الشامل",
    ctaTextEn: "Shop Full Catalog",
    ctaHref: "/marketplace",
    secondaryTextAr: "عروض الفلاش 50%",
    secondaryTextEn: "Flash Deals 50%",
    secondaryHref: "/#deals",
    highlightStatAr: "+120,000 منتج موثق",
    highlightStatEn: "120k+ Verified Products",
  },
  {
    id: "shopping",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=85&w=1600&auto=format&fit=crop",
    badgeAr: "تجربة تسوق ذكية وفائقة السلاسة",
    badgeEn: "Ultra-Fast Smart Commerce",
    badgeIcon: Flame,
    arTitle: "تسوق فوري وسرعة فائقة بلمسة زر",
    enTitle: "Seamless Shopping with Express Dispatch",
    arText: "واجهة فائقة التطور تتيح لك الوصول الفوري لما تبحث عنه، مع تتبع حي عبر الـ GPS وخيارات دفع مشفرة.",
    enText: "An ultra-smooth interface giving you instant access to curated essentials with real-time GPS tracking and secure payments.",
    ctaTextAr: "استكشف أحدث الوصولات",
    ctaTextEn: "Explore New Arrivals",
    ctaHref: "/marketplace?sort=newest",
    secondaryTextAr: "تتبع شحناتك",
    secondaryTextEn: "Track Shipments",
    secondaryHref: "/orders",
    highlightStatAr: "توصيل خلال 24-48 ساعة",
    highlightStatEn: "24-48hr Fast Dispatch",
  },
  {
    id: "stores",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=85&w=1600&auto=format&fit=crop",
    badgeAr: "المتاجر المعتمدة والعلامات التجارية",
    badgeEn: "Official Flagships & Certified Stores",
    badgeIcon: Store,
    arTitle: "متاجر وعلامات تجارية بشارة التوثيق الذهبية",
    enTitle: "Verified Stores with Golden Badges",
    arText: "انضم إلى آلاف التجار والبراندات الرائدة، وأطلق متجرك الإلكتروني للوصول إلى ملايين المشترين حول العالم.",
    enText: "Join thousands of leading merchants and brands, launch your digital storefront, and reach millions of buyers worldwide.",
    ctaTextAr: "سجل كتاجر معتمد",
    ctaTextEn: "Become a Verified Merchant",
    ctaHref: "/seller/dashboard",
    secondaryTextAr: "تصفح دليل المتاجر",
    secondaryTextEn: "Browse All Stores",
    secondaryHref: "/store",
    highlightStatAr: "0% عمولة لأول شهر",
    highlightStatEn: "0% Commission Month 1",
  },
  {
    id: "ads",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=85&w=1600&auto=format&fit=crop",
    badgeAr: "عروض الفلاش والتوفير الذكي",
    badgeEn: "Exclusive Vault & Smart Savings",
    badgeIcon: BadgeCheck,
    arTitle: "خصومات كبرى وقسائم توفير فورية",
    enTitle: "Massive Discounts & Instant Promo Codes",
    arText: "وفر حتى 50% على أفضل التشكيلات الفاخرة مع كوبونات تخفيض فورية ونقاط ولاء مضاعفة على كل طلب.",
    enText: "Save up to 50% on signature luxury selections with instant promo discount codes and reward cashback points on every order.",
    ctaTextAr: "استفد من كوبونات اليوم",
    ctaTextEn: "Claim Today's Coupons",
    ctaHref: "/#coupons",
    secondaryTextAr: "عروض الباقات",
    secondaryTextEn: "Bundle Deals",
    secondaryHref: "/marketplace?category=offers",
    highlightStatAr: "توفير يصل إلى 50%",
    highlightStatEn: "Up to 50% Savings",
  },
  {
    id: "logistics",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=85&w=1600&auto=format&fit=crop",
    badgeAr: "اللوجستيات وضمان الاسترجاع",
    badgeEn: "Global Logistics & Buyer Protection",
    badgeIcon: ShieldCheck,
    arTitle: "شحن جوي سريع وحماية كاملة للمشتري",
    enTitle: "Priority Express Freight & Safe Escrow",
    arText: "شحن سريع لباب منزلك مع إمكانية الإرجاع والاستبدال المجاني خلال 14 يوماً واسترداد كامل الأموال.",
    enText: "Priority door-to-door delivery with 14-day hassle-free returns, certified quality guarantee, and 100% refund protection.",
    ctaTextAr: "اكتشف ضمانات NOORMEXA",
    ctaTextEn: "View Buyer Guarantees",
    ctaHref: "/#guarantees",
    secondaryTextAr: "سياسة الشحن",
    secondaryTextEn: "Shipping Policy",
    secondaryHref: "/shipping",
    highlightStatAr: "ضمان استرجاع 14 يوماً",
    highlightStatEn: "14-Day Free Returns",
  },
];

const AUTOPLAY_DURATION = 6000; // 6 seconds per slide
const MORPH_TRANSITION_DURATION = 1100; // 1100ms smooth cinematic morph dissolve (cubic-bezier(0.16, 1, 0.3, 1))

type HeroImageSliderProps = {
  language?: "ar" | "en";
};

export default function HeroImageSlider({ language: propLanguage }: HeroImageSliderProps = {}) {
  const globalLanguage = useNoormexaLanguage();
  const language = propLanguage || globalLanguage || "ar";
  const isAr = language === "ar";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Preload all slide images into browser cache on mount
  useEffect(() => {
    SLIDES.forEach((slide) => {
      const img = new window.Image();
      img.src = slide.image;
    });
  }, []);

  // Calm & Gentle Dissolve Blend Transition (The previous image dissolves gracefully into the new one)
  const changeSlide = useCallback(
    (nextIdx: number) => {
      if (nextIdx === currentIndex) return;

      setPrevIndex(currentIndex);
      setCurrentIndex(nextIdx);
      setProgressKey((k) => k + 1);

      if (prevTimeoutRef.current) {
        clearTimeout(prevTimeoutRef.current);
      }

      // Keep previous layer active during the full 1600ms gentle dissolve
      prevTimeoutRef.current = setTimeout(() => {
        setPrevIndex(null);
      }, MORPH_TRANSITION_DURATION);
    },
    [currentIndex]
  );

  const nextSlide = useCallback(() => {
    const nextIdx = (currentIndex + 1) % SLIDES.length;
    changeSlide(nextIdx);
  }, [currentIndex, changeSlide]);

  const prevSlide = useCallback(() => {
    const prevIdx = (currentIndex - 1 + SLIDES.length) % SLIDES.length;
    changeSlide(prevIdx);
  }, [currentIndex, changeSlide]);

  // Autoplay Loop (6s cycle)
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Touch Handlers for Mobile Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0) {
        if (isAr) prevSlide();
        else nextSlide();
      } else {
        if (isAr) nextSlide();
        else prevSlide();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide = SLIDES[currentIndex];
  const CurrentBadgeIcon = currentSlide.badgeIcon;

  return (
    <div className={styles.sliderWrapper}>
      {/* 1. Pure Clean Image Screen - 100% Free of any buttons, badges, or overlays */}
      <div
        className={styles.imageScreen}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label={isAr ? "شاشة عرض الصور" : "Image Showcase Screen"}
      >
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const isPrev = idx === prevIndex;

          let layerStateClass = "";
          if (isActive) {
            layerStateClass = styles.active;
          } else if (isPrev) {
            layerStateClass = styles.previous;
          }

          return (
            <div key={slide.id} className={`${styles.slideLayer} ${layerStateClass}`}>
              <Image
                src={slide.image}
                alt={isAr ? slide.arTitle : slide.enTitle}
                fill
                priority={idx === 0}
                unoptimized
                referrerPolicy="no-referrer"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
                className={styles.kenBurnsImage}
              />
            </div>
          );
        })}
      </div>

      {/* 2. Pure Floating Typography & Interactive Controls (Zero Container Box, Zero Arrow/Pause Buttons) */}
      <div className={styles.floatingDock}>
        {/* Header Row: Floating Badge + Stat + Minimal Progress Indicator */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Badge & Stat Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 text-orange-500 font-black text-xs border border-orange-500/25 shadow-xs">
              <CurrentBadgeIcon size={13} className="shrink-0" />
              <span>{isAr ? currentSlide.badgeAr : currentSlide.badgeEn}</span>
            </div>

            {(currentSlide.highlightStatAr || currentSlide.highlightStatEn) && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 dark:bg-white/5 text-foreground font-bold text-xs border border-line/60">
                <BadgeCheck size={13} className="text-emerald-400 shrink-0" />
                <span>{isAr ? currentSlide.highlightStatAr : currentSlide.highlightStatEn}</span>
              </div>
            )}
          </div>

          {/* Minimalist Progress Indicators */}
          <div className={styles.indicatorsTrack} aria-label={isAr ? "مؤشرات الشرائح" : "Slide progress"}>
            {SLIDES.map((slide, idx) => {
              const isPillActive = idx === currentIndex;
              const isPillPast = idx < currentIndex;

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => changeSlide(idx)}
                  className={`${styles.indicatorPill} ${
                    isPillActive
                      ? isPaused
                        ? `${styles.indicatorActive} ${styles.indicatorActivePaused}`
                        : styles.indicatorActive
                      : isPillPast
                      ? styles.indicatorFilled
                      : ""
                  }`}
                  aria-label={`${isAr ? "الشريحة" : "Slide"} ${idx + 1}`}
                  title={isAr ? slide.arTitle : slide.enTitle}
                >
                  <div key={`${idx}-${progressKey}`} className={styles.indicatorFill} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Title & Description */}
        <div key={`text-${currentIndex}`} className="space-y-1 transition-all duration-700 animate-in fade-in">
          <h3 className="text-lg sm:text-xl font-black text-foreground transition-all duration-500 leading-snug">
            {isAr ? currentSlide.arTitle : currentSlide.enTitle}
          </h3>
          <p className="text-xs sm:text-sm text-muted/90 line-clamp-2 leading-relaxed transition-all duration-500">
            {isAr ? currentSlide.arText : currentSlide.enText}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1 flex-wrap">
          <Link
            href={currentSlide.ctaHref}
            className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <ShoppingBag size={15} />
            <span>{isAr ? currentSlide.ctaTextAr : currentSlide.ctaTextEn}</span>
            {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </Link>

          {currentSlide.secondaryHref && (
            <Link
              href={currentSlide.secondaryHref}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 border border-line/60 text-foreground font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
            >
              <span>{isAr ? currentSlide.secondaryTextAr : currentSlide.secondaryTextEn}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
