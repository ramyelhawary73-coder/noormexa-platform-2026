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
 * 100% Self-Contained Vector SVG Royal Sun-Crown 'N' Emblem
 * World-Class Luxury Precision Vector Graphic.
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
  const uniqueId = isDark ? "dark" : "light";

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
        {/* International Luxury Squircle Base */}
        <linearGradient id={`nmxBg_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {isDark ? (
            <>
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#0b0f19" />
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
        <linearGradient id={`nmxRim_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {isDark ? (
            <>
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#334155" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.4" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.2" />
            </>
          )}
        </linearGradient>

        {/* 3D Master Letter 'N' Sculpture (Vibrant Commerce Accent) */}
        <linearGradient id={`nmxGold_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {isDark ? (
            <>
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="25%" stopColor="#fb923c" />
              <stop offset="65%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="40%" stopColor="#f97316" />
              <stop offset="80%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#c2410c" />
            </>
          )}
        </linearGradient>

        {/* Diagonal Bevel Highlight */}
        <linearGradient id={`nmxBevel_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={isDark ? "0.9" : "0.6"} />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
        </linearGradient>

        {/* Crown Star Core */}
        <radialGradient id={`nmxStar_${uniqueId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Base Squircle Shape with Precision Curved Corners */}
      <rect
        x="6"
        y="6"
        width="188"
        height="188"
        rx="46"
        fill={`url(#nmxBg_${uniqueId})`}
        stroke={`url(#nmxRim_${uniqueId})`}
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
        stroke={`url(#nmxRim_${uniqueId})`}
        strokeWidth="1"
        strokeOpacity={isDark ? "0.3" : "0.15"}
      />

      {/* 3. Crown & Lightburst of NOOR (النور) */}
      <g opacity={isDark ? "0.95" : "0.85"}>
        {/* Crown Spikes */}
        <polygon points="126,46 132,30 138,46" fill={`url(#nmxGold_${uniqueId})`} />
        <polygon points="142,46 150,22 158,46" fill={`url(#nmxGold_${uniqueId})`} />
        <polygon points="162,46 168,30 174,46" fill={`url(#nmxGold_${uniqueId})`} />
        {/* Crown Base Bar */}
        <rect x="124" y="44" width="52" height="6" rx="3" fill={`url(#nmxGold_${uniqueId})`} />
        {/* Crown Jewels */}
        <circle cx="132" cy="28" r="2.5" fill="#ffffff" />
        <circle cx="150" cy="20" r="3.5" fill="#ffffff" />
        <circle cx="168" cy="28" r="2.5" fill="#ffffff" />
      </g>

      {/* 4. Sculptural Monogram 'N' (Left Vertical Pillar) */}
      <rect
        x="38"
        y="42"
        width="26"
        height="116"
        rx="9"
        fill={`url(#nmxGold_${uniqueId})`}
      />

      {/* 5. Sculptural Monogram 'N' (Right Vertical Pillar) */}
      <rect
        x="136"
        y="60"
        width="26"
        height="98"
        rx="9"
        fill={`url(#nmxGold_${uniqueId})`}
      />

      {/* 6. Precision Diagonal Power Connecting Beam */}
      <polygon
        points="38,44 64,44 162,148 136,158 38,54"
        fill={`url(#nmxGold_${uniqueId})`}
      />

      {/* 7. Precision Light Bevel Edge for 3D Luxury Sheen */}
      <polygon
        points="38,44 64,44 64,52 46,52"
        fill={`url(#nmxBevel_${uniqueId})`}
      />

      {/* 8. Star Diamond Sparkle */}
      <circle cx="150" cy="20" r="10" fill={`url(#nmxStar_${uniqueId})`} />
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
      iconPx: 30,
      textSize: "text-sm sm:text-base",
      arSize: "text-[9px] sm:text-[10px]",
      taglineSize: "text-[8px] sm:text-[9px]",
      gap: "gap-1.5 sm:gap-2",
    },
    md: {
      iconPx: 38,
      textSize: "text-base sm:text-xl",
      arSize: "text-[10px] sm:text-xs",
      taglineSize: "text-[9px] sm:text-[10px]",
      gap: "gap-2 sm:gap-2.5",
    },
    lg: {
      iconPx: 48,
      textSize: "text-xl sm:text-2xl",
      arSize: "text-xs sm:text-sm",
      taglineSize: "text-[10px] sm:text-xs",
      gap: "gap-2.5 sm:gap-3",
    },
    xl: {
      iconPx: 60,
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
      {/* 1. Official 100% Vector 3D Sun-Crown 'N' Squircle Badge */}
      <div className="relative flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
        <NoormexaEmblemSvg size={config.iconPx} isDark={isDark} />
      </div>

      {/* 2. World-Class Marketplace Typography Lockup */}
      <div className="flex flex-col justify-center min-w-0 text-start leading-tight">
        {/* Main Brand Title Row */}
        <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
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
              className={`uppercase font-black ${config.textSize} bg-gradient-to-r from-[#F97316] to-[#EA580C] bg-clip-text text-transparent ml-[1px]`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                filter: isDark ? "drop-shadow(0 0 8px rgba(249, 115, 22, 0.3))" : "none",
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

        {/* Global Marketplace Tagline (Hidden on narrow mobile to keep header clean) */}
        {showTagline && (
          <div
            className="hidden sm:flex items-center gap-1.5 mt-0.5"
            dir={isArabic ? "rtl" : "ltr"}
            style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
          >
            <span
              className={`font-semibold text-muted tracking-tight truncate ${config.taglineSize}`}
            >
              {isArabic ? "سوق التجارة الإلكترونية الشامل" : "Global Commerce Marketplace"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
