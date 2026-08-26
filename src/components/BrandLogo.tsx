"use client";

import React, { useId } from "react";
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
  const uid = useId().replace(/:/g, "_");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      className={`shrink-0 select-none ${className}`}
      aria-label="NOORMEXA Master Brand Monogram"
    >
      <defs>
        {!monochrome ? (
          <>
            {/* 1. Left Sapphire Tech Pillar */}
            <linearGradient id={`nx_left_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="35%" stopColor="#0EA5E9" />
              <stop offset="70%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#034574" />
            </linearGradient>

            {/* 2. Left Edge Bevel Light */}
            <linearGradient id={`nx_left_edge_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
            </linearGradient>

            {/* 3. Central 24K Imperial Gold Noor Ribbon */}
            <linearGradient id={`nx_gold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="18%" stopColor="#FEF08A" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="80%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#9A3412" />
            </linearGradient>

            {/* 4. Gold Ribbon Lateral 3D Facet (Shaded Depth) */}
            <linearGradient id={`nx_gold_edge_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350F" />
              <stop offset="50%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* 5. Right Cobalt Ascending Pillar */}
            <linearGradient id={`nx_right_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="35%" stopColor="#2563EB" />
              <stop offset="75%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* 6. Right Edge Bevel */}
            <linearGradient id={`nx_right_edge_${uid}`} x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
            </linearGradient>

            {/* 7. Drop Shadow for 3D Layer Overlap */}
            <filter id={`nx_fold_shadow_${uid}`} x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="-3" dy="4" stdDeviation="4" floodColor="#020617" floodOpacity={isDark ? "0.85" : "0.5"} />
            </filter>

            {/* 8. Global Emblem Grounding Shadow */}
            <filter id={`nx_master_shadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor={isDark ? "#000000" : "#0F172A"} floodOpacity={isDark ? "0.6" : "0.2"} />
            </filter>
          </>
        ) : null}
      </defs>

      {/* ======================================================== */}
      {/* THE MASTER 3D GEOMETRIC NOORMEXA "N" MONOGRAM            */}
      {/* ======================================================== */}
      <g filter={!monochrome ? `url(#nx_master_shadow_${uid})` : undefined}>
        
        {/* [1. LEFT PILLAR] */}
        <g id={`left_col_${uid}`}>
          <path
            d="M 38,42 
               C 38,32 46,26 56,26 
               L 62,26 
               C 70,26 76,32 76,42 
               L 76,158 
               C 76,168 70,174 62,174 
               L 56,174 
               C 46,174 38,168 38,158 
               Z"
            fill={monochrome ? (isDark ? "#64748B" : "#334155") : `url(#nx_left_${uid})`}
          />
          {!monochrome && (
            <path
              d="M 38,42 C 38,32 46,26 56,26 L 59,26 L 59,174 L 56,174 C 46,174 38,168 38,158 Z"
              fill={`url(#nx_left_edge_${uid})`}
            />
          )}
        </g>

        {/* [2. RIGHT PILLAR] */}
        <g id={`right_col_${uid}`}>
          <path
            d="M 124,42 
               C 124,32 130,26 140,26 
               L 146,26 
               C 156,26 162,32 162,42 
               L 162,158 
               C 162,168 156,174 146,174 
               L 140,174 
               C 130,174 124,168 124,158 
               Z"
            fill={monochrome ? (isDark ? "#475569" : "#1E293B") : `url(#nx_right_${uid})`}
          />
          {!monochrome && (
            <path
              d="M 162,42 C 162,32 156,26 146,26 L 143,26 L 143,174 L 146,174 C 156,174 162,168 162,158 Z"
              fill={`url(#nx_right_edge_${uid})`}
            />
          )}
        </g>

        {/* [3. CENTRAL GOLDEN NOOR RIBBON - OVERLAPPING 3D FOLD] */}
        <g id={`diagonal_fold_${uid}`} filter={!monochrome ? `url(#nx_fold_shadow_${uid})` : undefined}>
          {/* Depth Facet */}
          {!monochrome && (
            <path
              d="M 40,48 
                 L 144,158 
                 C 152,166 146,174 136,174 
                 L 122,174 
                 L 40,88 
                 Z"
              fill={`url(#nx_gold_edge_${uid})`}
            />
          )}

          {/* Golden Upper Face */}
          <path
            d="M 40,36 
               C 48,26 60,30 70,42 
               L 160,146 
               C 166,154 162,166 150,166 
               C 140,166 130,160 120,148 
               L 40,50 
               C 34,44 34,40 40,36 Z"
            fill={monochrome ? (isDark ? "#F8FAFC" : "#0F172A") : `url(#nx_gold_${uid})`}
          />
        </g>

      </g>
    </svg>
  );
}

/**
 * Universal Master BrandLogo Component for NOORMEXA
 *
 * Professional Global Commerce Identity System:
 * - High-end 3D Beveled Monogram + Golden Horizon Smile & Noor Starburst
 * - Bespoke Dual-Tone Luxury Wordmark (NOOR in Sapphire/Platinum + MEXA in Imperial Amber Gold)
 * - Prestigious Bilingual Arabic Tagline
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
    responsive: "w-9 h-9 xs:w-10 xs:h-10 sm:w-11.5 sm:h-11.5 md:w-12.5 md:h-12.5 lg:w-13.5 lg:h-13.5",
  };

  const textSizes = {
    xs: "text-[15px] tracking-[0.06em]",
    sm: "text-[17px] sm:text-[18px] tracking-[0.07em]",
    md: "text-[20px] sm:text-[22px] md:text-[24px] tracking-[0.07em]",
    lg: "text-[24px] sm:text-[28px] md:text-[32px] tracking-[0.08em]",
    xl: "text-[36px] sm:text-[44px] tracking-[0.09em]",
    "2xl": "text-[46px] sm:text-[56px] tracking-[0.09em]",
    responsive: "text-[19px] xs:text-[21px] sm:text-[23px] md:text-[25px] lg:text-[27px] tracking-[0.06em]",
  };

  const subtitleSizes = {
    xs: "text-[7.5px] tracking-normal",
    sm: "text-[8.5px] sm:text-[9.5px] tracking-normal",
    md: "text-[9.5px] sm:text-[10.5px] md:text-[11px] tracking-normal",
    lg: "text-[11px] sm:text-[13px] md:text-[14px] tracking-normal",
    xl: "text-[13px] sm:text-[15px] md:text-[17px] tracking-normal",
    "2xl": "text-[15px] sm:text-[17px] md:text-[19px] tracking-normal",
    responsive: "text-[9px] xs:text-[10px] sm:text-[11px] md:text-[11.5px] lg:text-[12px] tracking-normal",
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
              className={`font-black ${textSizes[size]} transition-all duration-200 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent`}
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
            className={`font-black ${textSizes[size]} transition-all duration-200 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent`}
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

      {/* Brand Identity: Dual-Tone Wordmark + Horizon Smile + Arabic Tagline */}
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
            className={`font-black ${textSizes[size]} transition-all duration-200 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif",
              letterSpacing: "2.5px",
            }}
          >
            MEXA
          </span>
        </div>

        {/* Global Smart Commerce Tagline */}
        {showTagline && (
          <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
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

