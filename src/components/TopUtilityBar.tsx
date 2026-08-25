"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Truck,
  Sparkles,
  Gift,
  Flame,
  ShieldCheck,
  Headphones,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Crown,
  Copy,
  Check,
  Coins,
  Sun,
  Moon,
} from "lucide-react";
import { openPwaInstallModal } from "@/components/PwaInstallPrompt";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useTheme } from "@/context/ThemeContext";

const LANGUAGE_KEY = "noormexa-language";

function getLanguageSnapshot(): "ar" | "en" {
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

export default function TopUtilityBar() {
  const language = useSyncExternalStore(subscribeToLanguage, getLanguageSnapshot, () => "ar");
  const isAr = language === "ar";
  const { currency } = useMarketplace();
  const { theme, toggleTheme } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const announcements = [
    {
      id: "ship",
      icon: Truck,
      iconColor: "text-amber-400",
      textAr: "شحن جوي سريع ومجاني للطلبات المؤهلة | كود الشحن:",
      textEn: "Free Express Air Shipping on qualifying orders | Code:",
      badge: "FREESHIP",
      badgeType: "code",
      href: "/marketplace",
      tagAr: "شحن سريع",
      tagEn: "Express",
    },
    {
      id: "guarantee",
      icon: ShieldCheck,
      iconColor: "text-emerald-400",
      textAr: "منتجات أصلية 100% معتمدة بفحص الجودة وضمان استرجاع 14 يوماً",
      textEn: "100% Certified Authentic with Quality Guarantee & 14-Day Free Returns",
      badge: isAr ? "ضمان ذهبي" : "Golden Guarantee",
      badgeType: "badge",
      href: "/marketplace",
      tagAr: "جودة معتمدة",
      tagEn: "Verified",
    },
    {
      id: "welcome",
      icon: Gift,
      iconColor: "text-orange-400",
      textAr: "خصم ترحيبي 10% فوري لجميع المتسوقين الجدد | استخدم كود:",
      textEn: "Instant 10% Welcome Discount for new members | Code:",
      badge: "NOOR10",
      badgeType: "code",
      href: "/marketplace",
      tagAr: "عرض ترحيبي",
      tagEn: "Welcome",
    },
    {
      id: "flash",
      icon: Flame,
      iconColor: "text-red-400",
      textAr: "عروض الفلاش ديلز: تخفيضات كبرى تصل إلى 50% على المنتجات الأكثر طلباً",
      textEn: "Flash Deals: Exclusive discounts up to 50% OFF trending products",
      badge: isAr ? "خصم 50%" : "50% OFF",
      badgeType: "deal",
      href: "/marketplace?filter=deals",
      tagAr: "فلاش ديلز",
      tagEn: "Flash Deals",
    },
    {
      id: "support",
      icon: Headphones,
      iconColor: "text-cyan-400",
      textAr: "مركز كونسيرج ودعم فني VIP متاح على مدار الساعة 24/7",
      textEn: "24/7 VIP Concierge & Live Customer Support ready to assist you",
      badge: isAr ? "دعم 24/7" : "24/7 Support",
      badgeType: "badge",
      href: "/marketplace",
      tagAr: "خدمة VIP",
      tagEn: "VIP",
    },
  ];

  // Auto rotation ticker
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, announcements.length]);

  const handleCopy = (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const current = announcements[currentIndex];
  const IconComponent = current.icon;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  return (
    <aside
      id="top-utility-bar"
      aria-label={isAr ? "شريط الإعلانات والخدمات السريعة" : "Top announcement and utility bar"}
      className="w-full bg-[#080d1a] dark:bg-[#050811] text-slate-200 border-b border-slate-800/80 text-[11px] sm:text-xs select-none transition-colors"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-10 2xl:px-12 h-8.5 sm:h-9 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* VIP Live Announcement Carousel */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
          {/* Tag Pill - Desktop/Tablet */}
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-wider shrink-0">
            <Sparkles size={11} className="text-orange-400 animate-pulse" />
            <span>{isAr ? current.tagAr : current.tagEn}</span>
          </span>

          {/* Controls: Prev / Next buttons for ticker */}
          <div className="flex items-center gap-0.5 shrink-0 text-slate-400">
            <button
              type="button"
              onClick={prevSlide}
              aria-label={isAr ? "الإعلان السابق" : "Previous announcement"}
              className="p-0.5 rounded hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              {isAr ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label={isAr ? "الإعلان التالي" : "Next announcement"}
              className="p-0.5 rounded hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              {isAr ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
            </button>
          </div>

          {/* Active Announcement Text & Link */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
            <IconComponent size={13} className={`shrink-0 ${current.iconColor}`} />
            <Link
              href={current.href}
              className="truncate font-medium text-slate-300 hover:text-white transition-colors text-[11px] sm:text-xs"
            >
              {isAr ? current.textAr : current.textEn}
            </Link>

            {/* Clickable Code or Badge */}
            {current.badgeType === "code" ? (
              <button
                type="button"
                onClick={(e) => handleCopy(e, current.badge)}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-mono text-[10px] font-black shrink-0 transition-all active:scale-95 cursor-pointer"
                title={isAr ? "انقر لنسخ الكود" : "Click to copy code"}
              >
                <span>{current.badge}</span>
                {copiedCode === current.badge ? (
                  <Check size={11} className="text-emerald-400" />
                ) : (
                  <Copy size={10} className="text-orange-300/80" />
                )}
              </button>
            ) : current.badgeType === "deal" ? (
              <Link
                href={current.href}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-black text-[10px] shrink-0 transition-all"
              >
                <span>{current.badge}</span>
              </Link>
            ) : (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] shrink-0">
                {current.badge}
              </span>
            )}
          </div>
        </div>

        {/* Right (RTL End): Fast Global Utility Navigation Links (Responsive: Desktop & Tablet) */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-4 shrink-0 text-[11px] font-semibold text-slate-400">
          
          {/* Track Orders Link */}
          <Link
            href="/orders"
            className="hidden lg:flex items-center gap-1 hover:text-orange-400 transition-colors"
          >
            <Truck size={12} className="text-orange-400/80" />
            <span>{isAr ? "تتبع الشحنات" : "Track Order"}</span>
          </Link>

          {/* Merchant Registration Link */}
          <Link
            href="/seller/dashboard"
            className="hidden md:flex items-center gap-1 hover:text-amber-400 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>{isAr ? "بوابة التجار والبيع" : "Sell on NOORMEXA"}</span>
          </Link>

          {/* Super Admin Quick Link */}
          <Link
            href="/admin"
            className="hidden xl:flex items-center gap-1 text-slate-300 hover:text-orange-400 transition-colors"
          >
            <Crown size={12} className="text-orange-400" />
            <span>{isAr ? "مركز الإدارة" : "Admin"}</span>
          </Link>

          {/* Direct Install PWA Button */}
          <button
            type="button"
            onClick={openPwaInstallModal}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/30 text-orange-300 hover:text-orange-200 text-[10px] font-black transition-all cursor-pointer"
            title={isAr ? "تثبيت التطبيق على جهازك" : "Install App"}
          >
            <Smartphone size={11} className="text-orange-400" />
            <span>{isAr ? "تثبيت التطبيق" : "Get App"}</span>
          </button>

          {/* Top Bar Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white text-[10px] font-bold transition-all cursor-pointer active:scale-95"
            title={theme === "dark" ? (isAr ? "تفعيل الوضع النهاري" : "Switch to Light Mode") : (isAr ? "تفعيل الوضع الليلي" : "Switch to Dark Mode")}
          >
            {theme === "dark" ? (
              <>
                <Sun size={11} className="text-amber-400 fill-amber-400/20" />
                <span className="hidden xl:inline">{isAr ? "نهاري" : "Light"}</span>
              </>
            ) : (
              <>
                <Moon size={11} className="text-slate-300" />
                <span className="hidden xl:inline">{isAr ? "ليلي" : "Dark"}</span>
              </>
            )}
          </button>

          {/* Quick Currency indicator */}
          <div className="hidden lg:flex items-center gap-1 text-slate-400 text-[10px] font-mono font-bold bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
            <Coins size={10} className="text-orange-400" />
            <span>{currency}</span>
          </div>

        </div>

      </div>
    </aside>
  );
}
