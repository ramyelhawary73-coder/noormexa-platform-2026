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
      iconSize: 32,
      textSize: "text-base sm:text-lg",
      arSize: "text-[10px]",
      taglineSize: "text-[8.5px]",
      gap: "gap-2 sm:gap-2.5",
    },
    md: {
      iconSize: 42,
      textSize: "text-xl sm:text-[22px]",
      arSize: "text-xs",
      taglineSize: "text-[10px]",
      gap: "gap-2.5 sm:gap-3",
    },
    lg: {
      iconSize: 52,
      textSize: "text-2xl sm:text-3xl",
      arSize: "text-sm",
      taglineSize: "text-xs",
      gap: "gap-3 sm:gap-3.5",
    },
    xl: {
      iconSize: 64,
      textSize: "text-3xl sm:text-4xl",
      arSize: "text-base",
      taglineSize: "text-sm",
      gap: "gap-3.5 sm:gap-4",
    },
  }[size];

  // Official App Icon Badges matching the brand guide sheet
  const appIconSrc = isDark
    ? "/brand/app-icon-dark.png"
    : "/brand/app-icon-light.png";

  // Standalone App Icon
  if (variant === "icon") {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none flex-shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
        style={{ width: `${config.iconSize}px`, height: `${config.iconSize}px` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={appIconSrc}
          alt="NOORMEXA Logo"
          width={config.iconSize * 2}
          height={config.iconSize * 2}
          className="w-full h-full object-contain rounded-2xl drop-shadow-sm"
          loading="eager"
        />
      </div>
    );
  }

  // Standalone Transparent Symbol
  if (variant === "symbol") {
    const symbolSrc = isDark
      ? "/brand/noormexa-n-symbol-dark.png"
      : "/brand/noormexa-n-symbol-light.png";

    return (
      <div
        className={`relative inline-flex items-center justify-center select-none flex-shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
        style={{ width: `${config.iconSize}px`, height: `${config.iconSize}px` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={symbolSrc}
          alt="NOORMEXA Symbol"
          width={config.iconSize * 2}
          height={config.iconSize * 2}
          className="w-full h-full object-contain drop-shadow-sm"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center select-none group focus:outline-none ${config.gap} ${className}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* 1. Official 3D Sun-Crown 'N' Squircle Badge Icon */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center rounded-2xl overflow-hidden shadow-xs transition-transform duration-200 group-hover:scale-105"
        style={{
          width: `${config.iconSize}px`,
          height: `${config.iconSize}px`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={appIconSrc}
          alt="NOORMEXA"
          width={config.iconSize * 2}
          height={config.iconSize * 2}
          className="w-full h-full object-contain rounded-2xl aspect-square"
          loading="eager"
        />
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
              className={`uppercase font-black ${config.textSize} bg-gradient-to-r from-[#F59E0B] via-[#EAB308] to-[#D97706] bg-clip-text text-transparent ml-[1px]`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                filter: isDark ? "drop-shadow(0 0 10px rgba(245, 158, 11, 0.45))" : "none",
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
                  ? "bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30"
                  : "bg-[#F59E0B]/12 text-[#B45309] border border-[#F59E0B]/20"
              } ${config.arSize}`}
              dir="rtl"
              style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
            >
              نورميكسا
            </span>
          )}
        </div>

        {/* Global Marketplace Tagline */}
        {showTagline && (
          <div
            className="flex items-center gap-1.5 mt-0.5"
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
