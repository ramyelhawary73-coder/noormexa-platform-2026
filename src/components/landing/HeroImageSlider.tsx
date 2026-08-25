"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  Pause,
  Play,
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
    image: "/images/landing/hero-slide-products.webp",
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
    image: "/images/landing/hero-slide-shopping.webp",
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
    image: "/images/landing/hero-slide-stores.webp",
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
    image: "/images/landing/hero-slide-ads.webp",
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
    image: "/images/landing/hero-slide-logistics.webp",
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

type HeroImageSliderProps = {
  language?: "ar" | "en";
};

export default function HeroImageSlider({ language: propLanguage }: HeroImageSliderProps = {}) {
  const globalLanguage = useNoormexaLanguage();
  const language = propLanguage || globalLanguage || "ar";
  const isAr = language === "ar";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [userToggledPause, setUserToggledPause] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Trigger Slide Change with Cinematic Timing
  const changeSlide = useCallback(
    (nextIdx: number) => {
      if (nextIdx === currentIndex || isTransitioning) return;

      setPrevIndex(currentIndex);
      setCurrentIndex(nextIdx);
      setIsTransitioning(true);
      setProgressKey((k) => k + 1);

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setPrevIndex(null);
      }, 1100); // 1100ms transition duration
    },
    [currentIndex, isTransitioning]
  );

  const nextSlide = useCallback(() => {
    const nextIdx = (currentIndex + 1) % SLIDES.length;
    changeSlide(nextIdx);
  }, [currentIndex, changeSlide]);

  const prevSlide = useCallback(() => {
    const prevIdx = (currentIndex - 1 + SLIDES.length) % SLIDES.length;
    changeSlide(prevIdx);
  }, [currentIndex, changeSlide]);

  // Autoplay Effect (6s cycle)
  useEffect(() => {
    if (isPaused || userToggledPause) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, userToggledPause, nextSlide]);

  // Touch Swipe Handlers for Mobile
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
        // Swiped Left
        if (isAr) prevSlide();
        else nextSlide();
      } else {
        // Swiped Right
        if (isAr) nextSlide();
        else prevSlide();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentSlide = SLIDES[currentIndex];
  const BadgeIcon = currentSlide.badgeIcon;
  const DirectionArrowNext = isAr ? ChevronLeft : ChevronRight;
  const DirectionArrowPrev = isAr ? ChevronRight : ChevronLeft;

  return (
    <div
      className={styles.sliderContainer}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label={isAr ? "سلايدر العروض والمنتجات المميزة" : "Featured Products & Deals Slider"}
    >
      {/* 1. Dual Overlaid Layers (Ken Burns Morphing & Cinematic Crossfade) */}
      {SLIDES.map((slide, idx) => {
        const isActive = idx === currentIndex;
        const isPrev = idx === prevIndex;

        if (!isActive && !isPrev) {
          return null; // Skip non-active slides from rendering heavily in DOM
        }

        let layerClass = styles.layerHidden;
        if (isActive) {
          layerClass = isTransitioning ? `${styles.layerActive} ${styles.layerActiveEntering}` : styles.layerActive;
        } else if (isPrev) {
          layerClass = styles.layerPrevious;
        }

        return (
          <div key={slide.id} className={`${styles.slideLayer} ${layerClass}`}>
            <Image
              src={slide.image}
              alt={isAr ? slide.arTitle : slide.enTitle}
              fill
              priority={idx === 0}
              quality={90}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
              className={styles.kenBurnsImage}
            />
          </div>
        );
      })}

      {/* 2. Dynamic Vignette & Backdrop Layers */}
      <div className={styles.vignetteBackdrop} />
      <div className={isAr ? styles.vignetteSideRtl : styles.vignetteSideLtr} />
      <div className={styles.accentGlow} />

      {/* 3. Staggered Split Text & Interactive Content Overlay */}
      <div className={styles.contentOverlay}>
        <div key={`content-${currentIndex}`} className={styles.staggeredBox}>
          {/* Badge & Stat Tag */}
          <div className={`${styles.staggerBadge} flex items-center gap-2 flex-wrap`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/90 to-amber-500/90 text-white font-black text-[11px] sm:text-xs shadow-md backdrop-blur-md border border-white/20">
              <BadgeIcon size={13} className="shrink-0 animate-pulse" />
              <span>{isAr ? currentSlide.badgeAr : currentSlide.badgeEn}</span>
            </div>

            {(currentSlide.highlightStatAr || currentSlide.highlightStatEn) && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 dark:bg-black/40 text-slate-100 font-bold text-[10px] sm:text-[11px] backdrop-blur-md border border-white/10">
                <BadgeCheck size={12} className="text-emerald-400 shrink-0" />
                <span>{isAr ? currentSlide.highlightStatAr : currentSlide.highlightStatEn}</span>
              </div>
            )}
          </div>

          {/* Slide Heading */}
          <h2
            className={`${styles.staggerTitle} text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md`}
          >
            {isAr ? currentSlide.arTitle : currentSlide.enTitle}
          </h2>

          {/* Slide Description */}
          <p
            className={`${styles.staggerDesc} text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed max-w-xl font-medium drop-shadow-sm`}
          >
            {isAr ? currentSlide.arText : currentSlide.enText}
          </p>

          {/* Action CTAs */}
          <div className={`${styles.staggerAction} flex items-center gap-2.5 pt-1.5 flex-wrap`}>
            <Link
              href={currentSlide.ctaHref}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-orange-500/30 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ShoppingBag size={14} />
              <span>{isAr ? currentSlide.ctaTextAr : currentSlide.ctaTextEn}</span>
              {isAr ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
            </Link>

            {currentSlide.secondaryHref && (
              <Link
                href={currentSlide.secondaryHref}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>{isAr ? currentSlide.secondaryTextAr : currentSlide.secondaryTextEn}</span>
              </Link>
            )}
          </div>
        </div>

        {/* 4. Smart Controls Bar & Smooth Time Progress Bar */}
        <div className={styles.controlsBar}>
          {/* Slide Progress Indicators (Pills) */}
          <div className={styles.indicatorsTrack} aria-label={isAr ? "مؤشرات الشرائح" : "Slide progress"}>
            {SLIDES.map((slide, idx) => {
              const isPillActive = idx === currentIndex;
              const isPillPast = idx < currentIndex;
              const isEffectivelyPaused = isPaused || userToggledPause;

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => changeSlide(idx)}
                  className={`${styles.indicatorPill} ${
                    isPillActive
                      ? isEffectivelyPaused
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

          {/* Navigation Tools (Prev / Pause / Next) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              onClick={() => setUserToggledPause((p) => !p)}
              className={styles.navArrow}
              aria-label={userToggledPause ? (isAr ? "تشغيل التمرير التلقائي" : "Play") : isAr ? "إيقاف مؤقت" : "Pause"}
              title={userToggledPause ? (isAr ? "تشغيل" : "Play") : isAr ? "إيقاف مؤقت" : "Pause"}
            >
              {userToggledPause ? <Play size={13} className="fill-white" /> : <Pause size={13} />}
            </button>

            {/* Previous Slide Button */}
            <button
              type="button"
              onClick={prevSlide}
              className={styles.navArrow}
              aria-label={isAr ? "الشريحة السابقة" : "Previous slide"}
            >
              <DirectionArrowPrev size={16} />
            </button>

            {/* Next Slide Button */}
            <button
              type="button"
              onClick={nextSlide}
              className={styles.navArrow}
              aria-label={isAr ? "الشريحة التالية" : "Next slide"}
            >
              <DirectionArrowNext size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
