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
 * 100% Vector Precision Official NOORMEXA 3D Ribbon 'N' Emblem
 * Master Ribbon Geometry:
 * - Top-left sharp crest (Cubic Bézier smoothly transitioning into a bulbous bottom-left loop)
 * - Deep 3D creased cavity beneath the top fold
 * - Ascending right wing with smooth curved lobe head
 * - Aqua underbelly luminous highlight
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

  if (monochrome) {
    const monoColor = isDark ? "#ffffff" : "#006d7d";
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 460 340"
        width={size}
        height={(size * 340) / 460}
        className={`shrink-0 select-none transition-colors duration-200 ${className}`}
        aria-hidden="true"
        fill="none"
        shapeRendering="geometricPrecision"
        style={{ width: size, height: (size * 340) / 460, minWidth: size }}
      >
        <g fill={monoColor} transform="translate(-20, 10)">
          <path d="M 160,35 C 175,35 195,38 210,50 C 225,62 230,85 225,115 C 215,165 175,225 140,265 C 120,288 95,298 75,288 C 55,278 52,250 68,218 C 90,175 125,110 145,60 C 152,42 155,35 160,35 Z" />
          <path d="M 235,270 C 260,265 295,215 328,150 C 355,95 385,38 420,38 C 445,38 460,58 455,85 C 448,120 405,185 365,240 C 335,280 295,305 260,300 C 245,298 235,285 235,270 Z" />
        </g>
      </svg>
    );
  }

  const dropShadowColor = isDark ? "#00222a" : "#003743";
  const shadowOpacity = isDark ? 0.6 : 0.18;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 460 340"
      width={size}
      height={(size * 340) / 460}
      className={`shrink-0 select-none transition-transform duration-200 ${className}`}
      aria-hidden="true"
      fill="none"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: size, height: (size * 340) / 460, minWidth: size }}
    >
      <defs>
        {/* Left Sail Front Gradient (Rich Teal -> Luminous Cyan at top) */}
        <linearGradient id={`grad_left_${uid}`} x1="0%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#005e6e" />
          <stop offset="25%" stopColor="#007e90" />
          <stop offset="55%" stopColor="#00a8bc" />
          <stop offset="85%" stopColor="#24d2e5" />
          <stop offset="100%" stopColor="#6be6f5" />
        </linearGradient>

        {/* Top Left Sharp Beak Highlight */}
        <linearGradient id={`grad_crest_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7bf0fd" />
          <stop offset="60%" stopColor="#2bd8ec" />
          <stop offset="100%" stopColor="#009eb0" />
        </linearGradient>

        {/* Center Deep Crease / 3D Underside Gradient */}
        <linearGradient id={`grad_crease_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#003c46" />
          <stop offset="40%" stopColor="#00505d" />
          <stop offset="75%" stopColor="#007181" />
          <stop offset="100%" stopColor="#0096a7" />
        </linearGradient>

        {/* Right Wing Ascending Gradient (Aqua-Cyan Petal) */}
        <linearGradient id={`grad_right_${uid}`} x1="20%" y1="100%" x2="85%" y2="0%">
          <stop offset="0%" stopColor="#007c8e" />
          <stop offset="35%" stopColor="#00a9bd" />
          <stop offset="70%" stopColor="#22d0e3" />
          <stop offset="100%" stopColor="#6ae4f3" />
        </linearGradient>

        {/* Bottom Underbelly Wrap Gradient */}
        <linearGradient id={`grad_wrap_${uid}`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#008a9c" />
          <stop offset="50%" stopColor="#55dfef" />
          <stop offset="100%" stopColor="#a2f4fc" />
        </linearGradient>

        {/* Soft Depth Ambient Shadow */}
        <filter id={`grad_shadow_${uid}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy={isDark ? 8 : 6} stdDeviation={isDark ? 10 : 8} floodColor={dropShadowColor} floodOpacity={shadowOpacity} />
        </filter>
      </defs>

      <g id="noormexa-vector-mark-sq" transform="translate(-20, 10)">
        {/* 1. Deep 3D Cavity Underside (Between the two wings) */}
        <path
          d="M 160,35 
             C 200,35 240,65 270,120 
             C 300,175 320,240 325,270 
             C 320,270 295,245 275,210 
             C 245,160 215,95 160,35 Z"
          fill={`url(#grad_crease_${uid})`}
        />

        {/* 2. Right Ascending Wing with Rounded Lobe Head */}
        <path
          d="M 235,270 
             C 260,265 295,215 328,150 
             C 355,95 385,38 420,38 
             C 445,38 460,58 455,85 
             C 448,120 405,185 365,240 
             C 335,280 295,305 260,300 
             C 245,298 235,285 235,270 Z"
          fill={`url(#grad_right_${uid})`}
        />

        {/* 3. Lower Underbelly Luminous Sweep */}
        <path
          d="M 225,272 
             C 255,290 295,305 340,280 
             C 350,274 340,265 325,262 
             C 290,255 255,255 225,272 Z"
          fill={`url(#grad_wrap_${uid})`}
          opacity="0.9"
        />

        {/* 4. Left Front Main Sail Ribbon (with sharp top crest and bulbous bottom foot) */}
        <path
          d="M 160,35 
             C 175,35 195,38 210,50 
             C 225,62 230,85 225,115 
             C 215,165 175,225 140,265 
             C 120,288 95,298 75,288 
             C 55,278 52,250 68,218 
             C 90,175 125,110 145,60 
             C 152,42 155,35 160,35 Z"
          fill={`url(#grad_left_${uid})`}
          filter={`url(#grad_shadow_${uid})`}
        />

        {/* 5. Top Crest Sharp Fold Cap Highlight */}
        <path
          d="M 160,35 
             C 175,35 195,38 210,50 
             C 200,45 185,42 170,42 
             C 162,42 158,38 160,35 Z"
          fill={`url(#grad_crest_${uid})`}
        />
      </g>
    </svg>
  );
}

/**
 * 1:1 Stacked Official Master Vector Logo (Emblem on Top + Wordmark Below)
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
  const textColor = isDark ? "#ffffff" : "#006d7d";

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <NoormexaEmblemSvg size={width * 0.85} isDark={isDark} />
      <span
        className="mt-3.5 uppercase font-black text-xl sm:text-2xl tracking-[0.2em] transition-colors"
        style={{
          color: textColor,
          fontFamily: "system-ui, -apple-system, 'Montserrat', 'Inter', sans-serif",
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

  const config = {
    sm: {
      iconPx: 32,
      textSize: "text-sm sm:text-base",
      letterSpacing: "tracking-[0.14em]",
      arSize: "text-[9px] sm:text-[10px]",
      taglineSize: "text-[8px] sm:text-[9px]",
      gap: "gap-2 sm:gap-2.5",
    },
    md: {
      iconPx: 40,
      textSize: "text-base sm:text-lg lg:text-xl",
      letterSpacing: "tracking-[0.16em]",
      arSize: "text-[10px] sm:text-xs",
      taglineSize: "text-[9px] sm:text-[10px]",
      gap: "gap-2.5 sm:gap-3",
    },
    lg: {
      iconPx: 50,
      textSize: "text-xl sm:text-2xl",
      letterSpacing: "tracking-[0.18em]",
      arSize: "text-xs sm:text-sm",
      taglineSize: "text-[10px] sm:text-xs",
      gap: "gap-3 sm:gap-3.5",
    },
    xl: {
      iconPx: 64,
      textSize: "text-2xl sm:text-3xl",
      letterSpacing: "tracking-[0.2em]",
      arSize: "text-sm sm:text-base",
      taglineSize: "text-xs sm:text-sm",
      gap: "gap-3.5 sm:gap-4",
    },
    "2xl": {
      iconPx: 84,
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
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "bg-teal-500/10 text-teal-800 border border-teal-500/20"
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
          className={`uppercase font-extrabold ${config.textSize} ${config.letterSpacing} ${
            isDark ? "text-white" : "text-[#006d7d]"
          } transition-colors`}
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
      {/* 1. Master 3D Vector 'N' Emblem */}
      <div className="relative shrink-0 transition-transform duration-200 group-hover:scale-105 flex items-center justify-center">
        <NoormexaEmblemSvg size={config.iconPx} isDark={isDark} monochrome={monochrome} />
      </div>

      {/* 2. Brand Identity Typography Lockup */}
      <div className="flex flex-col justify-center min-w-0 text-start leading-tight">
        {/* Main Brand Title Row */}
        <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
          <div className="flex items-baseline font-black">
            <span
              className={`uppercase font-extrabold ${config.textSize} ${config.letterSpacing} transition-colors ${
                isDark ? "text-white" : "text-[#006d7d]"
              }`}
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
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "bg-teal-600/10 text-teal-800 border border-teal-600/20"
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
                isDark ? "text-slate-400 group-hover:text-slate-200" : "text-slate-500 group-hover:text-slate-900"
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
