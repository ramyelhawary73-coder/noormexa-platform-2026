"use client";

import React, { useSyncExternalStore } from "react";
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
 * 100% Vector Precision SVG Emblem for NOORMEXA
 * Exactly based on the master logo:
 * - 4 vertical pillars on the left (rounded smooth pill caps)
 * - Point-symmetric solid geometric diagonal slash in the center ('N' diagonal)
 * - 4 vertical pillars on the right (rounded smooth pill caps)
 * True 200x200 square canvas with geometric precision sub-pixel rendering
 */
export function NoormexaEmblemSvg({
  size = 38,
  isDark = true,
  className = "",
  color,
}: {
  size?: number;
  isDark?: boolean;
  className?: string;
  color?: string;
}) {
  const glyphColor = color || (isDark ? "#ffffff" : "#09090b");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`shrink-0 select-none transition-colors duration-200 ${className}`}
      aria-hidden="true"
      fill="none"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <g id="noormexa-vector-emblem" fill={glyphColor}>
        {/* Left 4 Vertical Bars with rounded smooth caps */}
        <rect x="16" y="14" width="8" height="172" rx="4" />
        <rect x="32" y="14" width="8" height="172" rx="4" />
        <rect x="48" y="14" width="8" height="172" rx="4" />
        <rect x="64" y="14" width="8" height="172" rx="4" />

        {/* Center Diagonal Solid Geometric Parallelogram (Point-Symmetric 'N' Slash) */}
        <polygon points="74,14 116,14 126,186 84,186" />

        {/* Right 4 Vertical Bars with rounded smooth caps */}
        <rect x="128" y="14" width="8" height="172" rx="4" />
        <rect x="144" y="14" width="8" height="172" rx="4" />
        <rect x="160" y="14" width="8" height="172" rx="4" />
        <rect x="176" y="14" width="8" height="172" rx="4" />
      </g>
    </svg>
  );
}

/**
 * 1:1 Stacked Master Vector Logo (Emblem on Top + Wordmark Below)
 * Exact representation of the official uploaded brand asset.
 */
export function NoormexaStackedLogo({
  width = 220,
  isDark = true,
  className = "",
  color,
}: {
  width?: number;
  isDark?: boolean;
  className?: string;
  color?: string;
}) {
  const glyphColor = color || (isDark ? "#ffffff" : "#09090b");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 360 360"
      width={width}
      height={width}
      className={`shrink-0 select-none transition-colors duration-200 ${className}`}
      aria-label="NOORMEXA Logo"
      fill="none"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Centered Top Emblem */}
      <g transform="translate(80, 24)" fill={glyphColor}>
        <rect x="16" y="14" width="8" height="172" rx="4" />
        <rect x="32" y="14" width="8" height="172" rx="4" />
        <rect x="48" y="14" width="8" height="172" rx="4" />
        <rect x="64" y="14" width="8" height="172" rx="4" />

        <polygon points="74,14 116,14 126,186 84,186" />

        <rect x="128" y="14" width="8" height="172" rx="4" />
        <rect x="144" y="14" width="8" height="172" rx="4" />
        <rect x="160" y="14" width="8" height="172" rx="4" />
        <rect x="176" y="14" width="8" height="172" rx="4" />
      </g>

      {/* Modern High-Tracking Wordmark NOORMEXA */}
      <text
        x="180"
        y="284"
        textAnchor="middle"
        fill={glyphColor}
        fontFamily="system-ui, -apple-system, 'Montserrat', 'Inter', 'Arial', sans-serif"
        fontSize="33"
        fontWeight="900"
        letterSpacing="7px"
      >
        NOORMEXA
      </text>
    </svg>
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
      iconPx: 26,
      textSize: "text-sm sm:text-base",
      letterSpacing: "tracking-[0.14em]",
      arSize: "text-[9px] sm:text-[10px]",
      taglineSize: "text-[8px] sm:text-[9px]",
      gap: "gap-2 sm:gap-2.5",
    },
    md: {
      iconPx: 32,
      textSize: "text-base sm:text-lg lg:text-xl",
      letterSpacing: "tracking-[0.16em]",
      arSize: "text-[10px] sm:text-xs",
      taglineSize: "text-[9px] sm:text-[10px]",
      gap: "gap-2.5 sm:gap-3",
    },
    lg: {
      iconPx: 42,
      textSize: "text-xl sm:text-2xl",
      letterSpacing: "tracking-[0.18em]",
      arSize: "text-xs sm:text-sm",
      taglineSize: "text-[10px] sm:text-xs",
      gap: "gap-3 sm:gap-3.5",
    },
    xl: {
      iconPx: 54,
      textSize: "text-2xl sm:text-3xl",
      letterSpacing: "tracking-[0.2em]",
      arSize: "text-sm sm:text-base",
      taglineSize: "text-xs sm:text-sm",
      gap: "gap-3.5 sm:gap-4",
    },
    "2xl": {
      iconPx: 72,
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
        <NoormexaEmblemSvg
          size={config.iconPx}
          isDark={isDark}
          color={monochrome ? (isDark ? "#ffffff" : "#000000") : undefined}
        />
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
                ? "bg-white/10 text-white/90 border border-white/15"
                : "bg-black/5 text-black/80 border border-black/10"
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
            isDark ? "text-white" : "text-[#09090b]"
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
      {/* 1. Master Vector 'N' Emblem */}
      <div className="relative shrink-0 transition-transform duration-200 group-hover:scale-105 flex items-center justify-center">
        <NoormexaEmblemSvg
          size={config.iconPx}
          isDark={isDark}
          color={monochrome ? (isDark ? "#ffffff" : "#000000") : undefined}
        />
      </div>

      {/* 2. Brand Identity Typography Lockup */}
      <div className="flex flex-col justify-center min-w-0 text-start leading-tight">
        {/* Main Brand Title Row */}
        <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
          <div className="flex items-baseline font-black">
            <span
              className={`uppercase font-extrabold ${config.textSize} ${config.letterSpacing} transition-colors ${
                isDark ? "text-white" : "text-[#09090b]"
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
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "bg-amber-500/10 text-amber-800 border border-amber-500/20"
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
