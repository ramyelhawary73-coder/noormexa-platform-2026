"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@/context/ThemeContext";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "horizontal" | "icon" | "symbol" | "stacked";
  showTagline?: boolean;
}

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

/**
 * 100% Precision Master Vector SVG Emblem for NOORMEXA
 * Features: Iconic Sculptural Letter 'N' with a Soaring Radiant Ray of Light (شعاع النور)
 * and Brilliant 4-Point Diamond Starburst Flare.
 */
export function NoormexaEmblemSvg({
  size = 40,
  isDark = true,
  className = "",
}: {
  size?: number;
  isDark?: boolean;
  className?: string;
}) {
  const id = isDark ? "dark" : "light";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`flex-shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Deep Luxury Squircle Background */}
        <linearGradient id={`nmxBg_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {isDark ? (
            <>
              <stop offset="0%" stopColor="#151f32" />
              <stop offset="50%" stopColor="#090d16" />
              <stop offset="100%" stopColor="#04070e" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </>
          )}
        </linearGradient>

        {/* Squircle Precision Chamfer Bezel */}
        <linearGradient id={`nmxRim_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {isDark ? (
            <>
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#ea580c" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.4" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ea580c" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.3" />
            </>
          )}
        </linearGradient>

        {/* 3D Master Letter 'N' Sculpture (Vibrant Sunset-Gold Gradient) */}
        <linearGradient id={`nmxGold_${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c2410c" />
          <stop offset="25%" stopColor="#ea580c" />
          <stop offset="55%" stopColor="#f97316" />
          <stop offset="85%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>

        {/* Ray of Light (شعاع النور) Main Laser Beam Gradient */}
        <linearGradient id={`nmxRay_${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="20%" stopColor="#fef08a" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#fb923c" stopOpacity="0.55" />
          <stop offset="85%" stopColor="#f97316" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
        </linearGradient>

        {/* Secondary Ambient Light Beam */}
        <linearGradient id={`nmxAmbientRay_${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#fcd34d" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>

        {/* Diamond Star Flare Core */}
        <radialGradient id={`nmxStar_${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="30%" stopColor="#fef08a" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#f97316" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>

        {/* Ambient Back Glow */}
        <radialGradient id={`nmxGlow_${id}`} cx="68%" cy="32%" r="60%">
          <stop offset="0%" stopColor="#f97316" stopOpacity={isDark ? "0.4" : "0.22"} />
          <stop offset="50%" stopColor="#ea580c" stopOpacity={isDark ? "0.15" : "0.08"} />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>

        {/* 3D Bevel Highlight */}
        <linearGradient id={`nmxBevel_${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. Base Squircle Shape */}
      <rect
        x="6"
        y="6"
        width="188"
        height="188"
        rx="46"
        fill={`url(#nmxBg_${id})`}
        stroke={`url(#nmxRim_${id})`}
        strokeWidth="3.5"
      />

      {/* 2. Inner Subtle Luxury Accent Border */}
      <rect
        x="12"
        y="12"
        width="176"
        height="176"
        rx="40"
        fill="none"
        stroke={`url(#nmxRim_${id})`}
        strokeWidth="1"
        strokeOpacity={isDark ? "0.25" : "0.15"}
      />

      {/* 3. Ambient Back Radiant Glow */}
      <circle cx="138" cy="62" r="70" fill={`url(#nmxGlow_${id})`} />

      {/* 4. Radiant Rays of Light (أشعة النور المنطلقة من حرف N) */}
      {/* Main Broad Light Beam */}
      <polygon
        points="132,66 190,12 170,8 116,60"
        fill={`url(#nmxRay_${id})`}
        opacity="0.9"
      />
      {/* Secondary Sharp Ray Shooting High */}
      <polygon
        points="138,60 192,26 186,18 128,56"
        fill={`url(#nmxAmbientRay_${id})`}
        opacity="0.95"
      />
      {/* Secondary Diagonal Ray 2 */}
      <polygon
        points="134,64 158,8 150,8 124,58"
        fill={`url(#nmxAmbientRay_${id})`}
        opacity="0.75"
      />
      {/* Secondary Lateral Ray 3 */}
      <polygon
        points="136,70 194,54 192,46 132,66"
        fill={`url(#nmxAmbientRay_${id})`}
        opacity="0.6"
      />

      {/* 5. Sculptural Monogram 'N' */}
      {/* Left Pillar */}
      <rect
        x="42"
        y="52"
        width="26"
        height="104"
        rx="8"
        fill={`url(#nmxGold_${id})`}
      />
      {/* Left Pillar Bevel Light */}
      <rect
        x="44"
        y="54"
        width="8"
        height="100"
        rx="4"
        fill={`url(#nmxBevel_${id})`}
        opacity="0.3"
      />

      {/* Powerful Diagonal Bridge connecting the two pillars */}
      <polygon
        points="44,56 70,56 156,150 130,150"
        fill={`url(#nmxGold_${id})`}
      />
      {/* Diagonal Bridge Highlight */}
      <polygon
        points="50,56 70,56 135,124 125,124"
        fill={`url(#nmxBevel_${id})`}
        opacity="0.35"
      />

      {/* Right Pillar (Seamlessly launches the Ray of Light) */}
      <rect
        x="130"
        y="52"
        width="26"
        height="104"
        rx="8"
        fill={`url(#nmxGold_${id})`}
      />

      {/* 6. Brilliant Diamond Starburst Flare (بؤرة النور المتوهجة على قمة النون) */}
      {/* Soft Glow Halo */}
      <circle cx="143" cy="52" r="22" fill={`url(#nmxStar_${id})`} />

      {/* 4-Point Diamond Laser Star Spikes */}
      <polygon points="143,38 147,52 143,66 139,52" fill="#ffffff" opacity="0.95" />
      <polygon points="143,24 145,52 143,80 141,52" fill="#ffffff" opacity="0.95" />
      <polygon points="125,52 143,49 161,52 143,55" fill="#ffffff" opacity="0.95" />
      <polygon points="133,42 145,50 153,62 141,54" fill="#fef08a" opacity="0.8" />
      <polygon points="133,62 141,50 153,42 145,54" fill="#fef08a" opacity="0.8" />

      {/* Diamond Sparkle Core */}
      <circle cx="143" cy="52" r="3.5" fill="#ffffff" />
      <circle cx="143" cy="52" r="7" fill="#fef08a" opacity="0.6" />
    </svg>
  );
}

export default function BrandLogo({
  size = "md",
  className = "",
  variant = "horizontal",
  showTagline = true,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const language = useSyncExternalStore(subscribeToLanguage, getLanguageSnapshot, () => "ar");
  const isArabic = language === "ar";

  const config = {
    sm: {
      iconPx: 28,
      textSize: "text-sm sm:text-base",
      arSize: "text-[9px] sm:text-[10px]",
      taglineSize: "text-[8px] sm:text-[9px]",
      gap: "gap-1.5 sm:gap-2",
    },
    md: {
      iconPx: 36,
      textSize: "text-base sm:text-lg lg:text-xl",
      arSize: "text-[10px] sm:text-xs",
      taglineSize: "text-[9px] sm:text-[10px]",
      gap: "gap-2 sm:gap-2.5",
    },
    lg: {
      iconPx: 46,
      textSize: "text-xl sm:text-2xl",
      arSize: "text-xs sm:text-sm",
      taglineSize: "text-[10px] sm:text-xs",
      gap: "gap-2.5 sm:gap-3",
    },
    xl: {
      iconPx: 58,
      textSize: "text-2xl sm:text-3xl",
      arSize: "text-sm sm:text-base",
      taglineSize: "text-xs sm:text-sm",
      gap: "gap-3 sm:gap-4",
    },
  }[size];

  // Standalone Icon
  if (variant === "icon" || variant === "symbol") {
    return (
      <div
        className={`inline-flex items-center justify-center select-none flex-shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
      >
        <NoormexaEmblemSvg size={config.iconPx} isDark={isDark} />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center select-none group focus:outline-none flex-shrink-0 ${config.gap} ${className}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* 1. Official 100% Vector 3D 'N' with Ray of Light Emblem */}
      <div className="relative flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
        <NoormexaEmblemSvg size={config.iconPx} isDark={isDark} />
      </div>

      {/* 2. World-Class Marketplace Typography Lockup */}
      <div className="flex flex-col justify-center min-w-0 text-start leading-tight">
        {/* Main Brand Title Row */}
        <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
          <div className="flex items-baseline tracking-tight font-black" dir="ltr">
            <span
              className={`uppercase transition-colors ${config.textSize} ${
                isDark ? "text-white" : "text-[#0F172A]"
              }`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              NOOR
            </span>
            <span
              className={`uppercase font-black ${config.textSize} bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#EA580C] bg-clip-text text-transparent ml-[1px]`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                filter: isDark ? "drop-shadow(0 0 10px rgba(249, 115, 22, 0.4))" : "none",
              }}
            >
              MEXA
            </span>
          </div>

          {/* Arabic Brand Identity Badge */}
          {isArabic && (
            <span
              className={`font-black select-none transition-colors px-1.5 py-0.5 rounded-md ${
                isDark
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                  : "bg-orange-500/10 text-orange-700 border border-orange-500/20"
              } ${config.arSize}`}
              dir="rtl"
              style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
            >
              نورميكسا
            </span>
          )}
        </div>

        {/* Global Marketplace Professional Slogan */}
        {showTagline && (
          <div
            className="hidden sm:flex items-center gap-1.5 mt-0.5"
            dir={isArabic ? "rtl" : "ltr"}
            style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
          >
            <span
              className={`font-bold tracking-tight truncate ${config.taglineSize} ${
                isDark ? "text-slate-400 group-hover:text-orange-400" : "text-slate-500 group-hover:text-orange-600"
              } transition-colors`}
            >
              {isArabic ? "نورك إلى التجارة العالمية الذكية" : "The Beacon of Smart Global Commerce"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
