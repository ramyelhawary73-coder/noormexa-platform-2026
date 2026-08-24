"use client";

import React, { useId, useSyncExternalStore } from "react";
import { useTheme } from "@/context/ThemeContext";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  variant?: "horizontal" | "icon" | "symbol" | "stacked" | "wordmark";
  showTagline?: boolean;
  showArabicBadge?: boolean;
  monochrome?: boolean;
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
 * 100% Vector Precision Official NOORMEXA Luxury Architectural 'N' Monogram
 * Exact reproduction of the master brand specification:
 * - Geometric double-line architectural 'N'
 * - 180° rotational symmetry
 * - Left column: open top, closed bottom base connector
 * - Right column: closed top cap connector, open bottom
 * - Center traverse: dual parallel precision diagonal bars
 * - Color: Pure Luxury Gold (#C89B5C / #D4A362 on dark, #A6742E / #8F6023 on light)
 */
export function NoormexaEmblemSvg({
  size = 40,
  isDark = true,
  className = "",
  monochrome = false,
}: {
  size?: number;
  isDark?: boolean;
  className?: string;
  monochrome?: boolean;
}) {
  const uid = useId().replace(/:/g, "_");

  const goldPrimary = isDark ? "#C89B5C" : "#A6742E";
  const goldSecondary = isDark ? "#D8A869" : "#B88438";
  const goldDeep = isDark ? "#B08346" : "#8F6023";
  const shadowColor = isDark ? "#000000" : "#5C3E14";
  const shadowOpacity = isDark ? 0.45 : 0.16;

  if (monochrome) {
    const monoColor = isDark ? "#ffffff" : "#A6742E";
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 320"
        width={size}
        height={size}
        className={`shrink-0 select-none transition-colors duration-200 ${className}`}
        aria-hidden="true"
        fill="none"
        shapeRendering="geometricPrecision"
        style={{ width: size, height: size, minWidth: size }}
      >
        <g fill={monoColor} transform="translate(-110, -70)">
          <rect x="135" y="80" width="20" height="300" rx="1" />
          <rect x="135" y="360" width="60" height="20" rx="1" />
          <rect x="175" y="150" width="20" height="230" rx="1" />
          <polygon points="175,80 195,80 345,280 345,307 325,307 175,107" />
          <polygon points="175,153 195,153 345,353 345,380 325,380 175,180" />
          <rect x="345" y="80" width="20" height="230" rx="1" />
          <rect x="345" y="80" width="60" height="20" rx="1" />
          <rect x="385" y="80" width="20" height="300" rx="1" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 320"
      width={size}
      height={size}
      className={`shrink-0 select-none transition-transform duration-200 ${className}`}
      aria-hidden="true"
      fill="none"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: size, height: size, minWidth: size }}
    >
      <defs>
        <linearGradient id={`gold_grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={goldSecondary} />
          <stop offset="45%" stopColor={goldPrimary} />
          <stop offset="100%" stopColor={goldDeep} />
        </linearGradient>
        <filter id={`gold_shadow_${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={shadowColor} floodOpacity={shadowOpacity} />
        </filter>
      </defs>

      <g id="noormexa-monogram-symbol" transform="translate(-110, -70)">
        {/* Left Outer Vertical Bar */}
        <rect x="135" y="80" width="20" height="300" rx="1" fill={`url(#gold_grad_${uid})`} filter={`url(#gold_shadow_${uid})`} />

        {/* Left Bottom Horizontal Connector */}
        <rect x="135" y="360" width="60" height="20" rx="1" fill={`url(#gold_grad_${uid})`} />

        {/* Left Inner Vertical Bar */}
        <rect x="175" y="150" width="20" height="230" rx="1" fill={`url(#gold_grad_${uid})`} />

        {/* Upper Main Diagonal Bar */}
        <polygon 
          points="175,80 195,80 345,280 345,307 325,307 175,107" 
          fill={`url(#gold_grad_${uid})`} 
          filter={`url(#gold_shadow_${uid})`}
        />

        {/* Lower Secondary Diagonal Bar */}
        <polygon 
          points="175,153 195,153 345,353 345,380 325,380 175,180" 
          fill={`url(#gold_grad_${uid})`} 
          filter={`url(#gold_shadow_${uid})`}
        />

        {/* Right Inner Vertical Bar */}
        <rect x="345" y="80" width="20" height="230" rx="1" fill={`url(#gold_grad_${uid})`} />

        {/* Right Top Horizontal Connector */}
        <rect x="345" y="80" width="60" height="20" rx="1" fill={`url(#gold_grad_${uid})`} />

        {/* Right Outer Vertical Bar */}
        <rect x="385" y="80" width="20" height="300" rx="1" fill={`url(#gold_grad_${uid})`} filter={`url(#gold_shadow_${uid})`} />
      </g>
    </svg>
  );
}

/**
 * 1:1 Stacked Official Master Vector Logo (Monogram on Top + Wordmark Below)
 * Exact representation of the official brand asset in the uploaded image.
 */
export function NoormexaStackedLogo({
  width = 240,
  isDark = true,
  className = "",
}: {
  width?: number;
  isDark?: boolean;
  className?: string;
}) {
  const textColor = isDark ? "#C89B5C" : "#A6742E";

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <NoormexaEmblemSvg size={width * 0.7} isDark={isDark} />
      <span
        className="mt-3.5 uppercase font-black text-xl sm:text-2xl tracking-[0.22em] transition-colors"
        style={{
          color: textColor,
          fontFamily: "system-ui, -apple-system, 'Montserrat', 'Inter', 'Segoe UI', sans-serif",
        }}
      >
        NOORMEXA
      </span>
    </div>
  );
}

/**
 * Main Dynamic Brand Logo Component used across the platform
 */
export default function BrandLogo({
  size = "md",
  className = "",
  variant = "horizontal",
  showTagline = true,
  showArabicBadge = true,
  monochrome = false,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const language = useSyncExternalStore(subscribeToLanguage, getLanguageSnapshot, () => "ar");
  const isArabic = language === "ar";

  const goldTextColor = isDark ? "text-[#C89B5C]" : "text-[#A6742E]";

  const config = {
    sm: {
      iconPx: 28,
      textSize: "text-sm sm:text-base",
      letterSpacing: "tracking-[0.14em]",
      arSize: "text-[9px] sm:text-[10px]",
      taglineSize: "text-[8px] sm:text-[9px]",
      gap: "gap-2 sm:gap-2.5",
    },
    md: {
      iconPx: 36,
      textSize: "text-base sm:text-lg lg:text-xl",
      letterSpacing: "tracking-[0.16em]",
      arSize: "text-[10px] sm:text-xs",
      taglineSize: "text-[9px] sm:text-[10px]",
      gap: "gap-2.5 sm:gap-3",
    },
    lg: {
      iconPx: 46,
      textSize: "text-xl sm:text-2xl",
      letterSpacing: "tracking-[0.18em]",
      arSize: "text-xs sm:text-sm",
      taglineSize: "text-[10px] sm:text-xs",
      gap: "gap-3 sm:gap-3.5",
    },
    xl: {
      iconPx: 58,
      textSize: "text-2xl sm:text-3xl",
      letterSpacing: "tracking-[0.2em]",
      arSize: "text-sm sm:text-base",
      taglineSize: "text-xs sm:text-sm",
      gap: "gap-3.5 sm:gap-4",
    },
    "2xl": {
      iconPx: 76,
      textSize: "text-3xl sm:text-4xl",
      letterSpacing: "tracking-[0.22em]",
      arSize: "text-base sm:text-lg",
      taglineSize: "text-sm",
      gap: "gap-4 sm:gap-5",
    },
  }[size];

  // 1. Standalone Icon
  if (variant === "icon" || variant === "symbol") {
    return (
      <div
        className={`inline-flex items-center justify-center select-none shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
      >
        <NoormexaEmblemSvg size={config.iconPx} isDark={isDark} monochrome={monochrome} />
      </div>
    );
  }

  // 2. Stacked 1:1 Match (Exact to user's uploaded master logo)
  if (variant === "stacked") {
    return (
      <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
        <NoormexaStackedLogo width={config.iconPx * 3.5} isDark={isDark} />
        {showArabicBadge && isArabic && (
          <span
            className={`mt-2 font-bold px-2 py-0.5 rounded-md ${
              isDark
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "bg-amber-600/10 text-amber-900 border border-amber-600/20"
            } ${config.arSize}`}
            dir="rtl"
          >
            نورميكسا
          </span>
        )}
      </div>
    );
  }

  // 3. Wordmark Only
  if (variant === "wordmark") {
    return (
      <div className={`inline-flex items-baseline select-none font-black ${className}`} dir="ltr">
        <span
          className={`uppercase font-extrabold ${config.textSize} ${config.letterSpacing} ${goldTextColor} transition-colors`}
          style={{
            fontFamily: "system-ui, -apple-system, 'Montserrat', 'Inter', sans-serif",
          }}
        >
          NOORMEXA
        </span>
      </div>
    );
  }

  // 4. Default: Horizontal Integration (Emblem + Wordmark + Arabic Badge + Subtitle)
  return (
    <div
      className={`inline-flex items-center select-none group focus:outline-none shrink-0 ${config.gap} ${className}`}
      dir="ltr"
    >
      {/* 1. Master Architectural Monogram Emblem */}
      <div className="relative shrink-0 transition-transform duration-200 group-hover:scale-105 flex items-center justify-center">
        <NoormexaEmblemSvg size={config.iconPx} isDark={isDark} monochrome={monochrome} />
      </div>

      {/* 2. Brand Identity Typography Lockup */}
      <div className="flex flex-col justify-center min-w-0 text-start leading-tight">
        {/* Main Brand Title Row */}
        <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
          <div className="flex items-baseline font-black">
            <span
              className={`uppercase font-black ${config.textSize} ${config.letterSpacing} transition-colors ${goldTextColor}`}
              style={{
                fontFamily: "system-ui, -apple-system, 'Montserrat', 'Inter', sans-serif",
              }}
            >
              NOORMEXA
            </span>
          </div>

          {/* Arabic Brand Identity Pill Badge */}
          {showArabicBadge && isArabic && (
            <span
              className={`font-black select-none transition-colors px-1.5 py-0.5 rounded-md ${
                isDark
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "bg-amber-600/10 text-amber-900 border border-amber-600/20"
              } ${config.arSize}`}
              dir="rtl"
              style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
            >
              نورميكسا
            </span>
          )}
        </div>

        {/* Global Marketplace Slogan */}
        {showTagline && (
          <div
            className="hidden sm:flex items-center gap-1.5 mt-0.5"
            dir={isArabic ? "rtl" : "ltr"}
            style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
          >
            <span
              className={`font-bold tracking-tight truncate ${config.taglineSize} ${
                isDark ? "text-amber-200/60 group-hover:text-amber-200" : "text-amber-900/60 group-hover:text-amber-900"
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
