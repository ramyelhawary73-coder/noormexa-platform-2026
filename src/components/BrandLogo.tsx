"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

export interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "responsive";
  className?: string;
  variant?: "horizontal" | "compact" | "icon" | "symbol" | "stacked" | "wordmark" | "badge" | "pure-svg";
  showTagline?: boolean;
  tagline?: string;
  monochrome?: boolean;
  forceDark?: boolean;
  forceLight?: boolean;
}

/**
 * NOORMEXA World-Class Master Emblem (Vector SVG)
 *
 * Core Brand Metaphor:
 * 1. NOOR (نور - Light / Brilliance): The 4-point radiant diamond starburst & golden dawn light beam.
 * 2. MEXA (مكسا - Maximum Exchange / Nexus): The dynamic 3D isometric 'N' monogram & aerodynamic commerce horizon arc.
 * 3. The Horizon Smile of Commerce: Aerodynamic golden trajectory symbolizing global speed, trust, and complete fulfillment.
 */
export function NoormexaEmblemSvg({
  size,
  isDark = false,
  className = "",
  monochrome = false,
}: {
  size?: number;
  isDark?: boolean;
  className?: string;
  monochrome?: boolean;
}) {
  const shell = monochrome ? "currentColor" : "#07111F";
  const border = monochrome ? "currentColor" : "#17395C";
  const left = monochrome ? (isDark ? "#F8FAFC" : "#0F172A") : "#2F80ED";
  const right = monochrome ? (isDark ? "#F8FAFC" : "#0F172A") : "#F8FAFC";
  const beam = monochrome ? (isDark ? "#F8FAFC" : "#0F172A") : "#F5B941";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      shapeRendering="geometricPrecision"
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label="NOORMEXA"
    >
      <rect x="12" y="12" width="176" height="176" rx="48" fill={shell} />
      {!monochrome && (
        <circle cx="100" cy="100" r="75" fill="#0B1C31" stroke={border} strokeWidth="2" />
      )}
      <rect x="50" y="55" width="22" height="92" rx="11" fill={left} />
      <rect x="128" y="55" width="22" height="92" rx="11" fill={right} />
      <path d="M61 68 L139 135" stroke={beam} strokeWidth="22" strokeLinecap="round" />
      <path
        d="M151 31 L155 43 L167 49 L155 55 L151 67 L147 55 L135 49 L147 43 Z"
        fill={beam}
      />
    </svg>
  );
}

/**
 * Universal Master BrandLogo Component for NOORMEXA
 *
 * Professional Global Commerce Identity System:
 * - High-end 3D Beveled Monogram (Solid Geometric Architecture)
 * - Bespoke Dual-Tone Luxury Wordmark (NOOR in Obsidian/Platinum + MEXA in 24K Imperial Gold)
 * - Prestigious Arabic/English Tagline with optical alignment & zero clipping
 * - Mathematical responsive scaling from 20px to 4K displays
 */
export default function BrandLogo({
  size = "responsive",
  className = "",
  variant = "horizontal",
  showTagline = true,
  tagline = "سوق التجارة والتسوق العالمي الذكي",
  monochrome = false,
  forceDark,
  forceLight,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const isDark = forceDark ? true : forceLight ? false : theme === "dark";

  // Dimension presets for Emblem & Geometry
  const iconConfig = {
    xs: "w-7 h-7",
    sm: "w-8.5 h-8.5 sm:w-9.5 sm:h-9.5",
    md: "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12",
    lg: "w-13 h-13 sm:w-15 sm:h-15 md:w-16 md:h-16",
    xl: "w-16 h-16 sm:w-20 sm:h-20",
    "2xl": "w-20 h-20 sm:w-24 sm:h-24",
    responsive: "w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12",
  };

  const textSizes = {
    xs: "text-[15px] tracking-[0.08em]",
    sm: "text-[17px] sm:text-[18px] tracking-[0.08em]",
    md: "text-[20px] sm:text-[22px] md:text-[24px] tracking-[0.08em]",
    lg: "text-[24px] sm:text-[28px] md:text-[32px] tracking-[0.09em]",
    xl: "text-[36px] sm:text-[44px] tracking-[0.1em]",
    "2xl": "text-[46px] sm:text-[56px] tracking-[0.1em]",
    responsive: "text-[18px] xs:text-[20px] sm:text-[22px] md:text-[24px] tracking-[0.08em]",
  };

  const subtitleSizes = {
    xs: "text-[8px] tracking-normal",
    sm: "text-[9px] sm:text-[9.5px] tracking-normal",
    md: "text-[10px] sm:text-[10.5px] md:text-[11px] tracking-normal",
    lg: "text-[11px] sm:text-[12.5px] md:text-[13.5px] tracking-normal",
    xl: "text-[13px] sm:text-[15px] md:text-[16px] tracking-normal",
    "2xl": "text-[15px] sm:text-[17px] md:text-[18px] tracking-normal",
    responsive: "text-[9px] xs:text-[9.5px] sm:text-[10.5px] md:text-[11px] tracking-normal",
  };

  const activeIconClass = iconConfig[size] || iconConfig.responsive;

  // --------------------------------------------------------------------------
  // Variant: Icon / Symbol Only (Favicon, App Launcher, Header Compact)
  // --------------------------------------------------------------------------
  if (variant === "icon" || variant === "symbol") {
    return (
      <div dir="ltr" className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <div className={`${activeIconClass} flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105`}>
          <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full drop-shadow-sm" />
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Variant: Badge / Official Verified Seal
  // --------------------------------------------------------------------------
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all ${
          isDark
            ? "bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border-amber-500/30 shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
            : "bg-gradient-to-r from-white via-slate-50 to-amber-50/50 border-amber-500/30 shadow-[0_4px_16px_rgba(245,158,11,0.12)]"
        } ${className}`}
      >
        <div className="w-7 h-7 flex items-center justify-center shrink-0">
          <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full" />
        </div>
        <div className="flex flex-col text-start">
          <span className="text-[12px] font-black tracking-wider text-foreground leading-tight">
            NOOR<span className="text-amber-500">MEXA</span>
          </span>
          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 leading-tight">
            المتجر الرسمي المعتمد
          </span>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Variant: Stacked (Splash, Auth Pages, Hero Centers)
  // --------------------------------------------------------------------------
  if (variant === "stacked") {
    return (
      <div className={`inline-flex flex-col items-center justify-center gap-3 select-none shrink-0 ${className}`}>
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105">
          <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full drop-shadow-md" />
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <div dir="ltr" className="flex items-center font-black leading-none select-none tracking-wider">
            <span
              className={`font-black ${textSizes[size]} transition-all duration-200 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif",
                letterSpacing: "3px",
              }}
            >
              NOOR
            </span>
            <span
              className={`font-black ${textSizes[size]} transition-all duration-200 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif",
                letterSpacing: "3px",
              }}
            >
              MEXA
            </span>
          </div>

          {showTagline && (
            <span
              dir="rtl"
              className={`font-bold ${subtitleSizes[size]} mt-2 transition-colors duration-200 ${
                isDark ? "text-amber-400/90" : "text-amber-700/95"
              }`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Cairo', 'Tajawal', sans-serif",
              }}
            >
              {tagline}
            </span>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Variant: Compact (Emblem + NOORMEXA wordmark without tagline)
  // --------------------------------------------------------------------------
  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none shrink-0 transition-transform duration-200 hover:scale-[1.015] ${className}`}>
        <div className={`${activeIconClass} flex items-center justify-center shrink-0`}>
          <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full drop-shadow-sm" />
        </div>
        <div dir="ltr" className="flex items-center font-black leading-none select-none">
          <span
            className={`font-black ${textSizes[size]} transition-all duration-200 ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif",
              letterSpacing: "2.5px",
            }}
          >
            NOOR
          </span>
          <span
            className={`font-black ${textSizes[size]} transition-all duration-200 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif",
              letterSpacing: "2.5px",
            }}
          >
            MEXA
          </span>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Default: Horizontal Brand Identity (Executive E-Commerce Master Layout)
  // --------------------------------------------------------------------------
  return (
    <div
      className={`inline-flex items-center gap-2.5 xs:gap-3 sm:gap-3.5 select-none shrink-0 transition-transform duration-200 hover:scale-[1.015] group ${className}`}
    >
      {/* 3D Master Monogram & Horizon Emblem */}
      <div className={`${activeIconClass} flex items-center justify-center shrink-0 relative`}>
        <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
      </div>

      {/* Brand Identity: Dual-Tone Wordmark + Arabic Tagline */}
      <div className="flex flex-col justify-center text-start min-w-0">
        <div dir="ltr" className="flex items-center font-black leading-none select-none relative">
          <span
            className={`font-black ${textSizes[size]} transition-all duration-200 ${
              isDark ? "text-slate-50" : "text-slate-900"
            }`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif",
              letterSpacing: "2.5px",
            }}
          >
            NOOR
          </span>
          <span
            className={`font-black ${textSizes[size]} transition-all duration-200 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif",
              letterSpacing: "2.5px",
            }}
          >
            MEXA
          </span>
        </div>

        {/* Global Smart Commerce Tagline - Clean responsive display (Desktop & Tablet) */}
        {showTagline && (
          <div className="hidden sm:flex items-center gap-1.5 mt-0.5 sm:mt-1">
            <span
              dir="rtl"
              className={`font-bold ${subtitleSizes[size]} transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis ${
                isDark ? "text-amber-400/90" : "text-amber-700/95"
              }`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Cairo', 'Tajawal', sans-serif",
              }}
            >
              {tagline}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

