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
 * NOORMEXA reference-locked master mark.
 *
 * This SVG follows the approved Signature Executive artwork: luminous blue
 * architectural pillars, a sculpted warm-gold ribbon forming the N, restrained
 * metallic highlights, and a small light flare at the upper-right edge.
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
  const mono = isDark ? "#F8FAFC" : "#0B1F33";

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
      {!monochrome && (
        <defs>
          <linearGradient id={`nxBlue_${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67D4FF" />
            <stop offset="23%" stopColor="#1F8CFF" />
            <stop offset="58%" stopColor="#095DDA" />
            <stop offset="100%" stopColor="#05275F" />
          </linearGradient>
          <linearGradient id={`nxBlueSide_${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#03152E" />
            <stop offset="100%" stopColor="#0B438F" />
          </linearGradient>
          <linearGradient id={`nxGold_${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF3BD" />
            <stop offset="18%" stopColor="#F8D77F" />
            <stop offset="46%" stopColor="#E5AD46" />
            <stop offset="73%" stopColor="#B87520" />
            <stop offset="100%" stopColor="#70400A" />
          </linearGradient>
          <linearGradient id={`nxGoldEdge_${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6E3D08" />
            <stop offset="50%" stopColor="#B8731B" />
            <stop offset="100%" stopColor="#4D2A05" />
          </linearGradient>
          <linearGradient id={`nxGlint_${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FFF4C7" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id={`nxFlare_${uid}`}>
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="28%" stopColor="#FFF5C7" />
            <stop offset="62%" stopColor="#F1B846" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#F1B846" stopOpacity="0" />
          </radialGradient>
          <filter id={`nxShadow_${uid}`} x="-30%" y="-30%" width="170%" height="180%">
            <feDropShadow
              dx="0"
              dy="5"
              stdDeviation="5"
              floodColor="#020617"
              floodOpacity={isDark ? "0.5" : "0.22"}
            />
          </filter>
        </defs>
      )}

      <g filter={!monochrome ? `url(#nxShadow_${uid})` : undefined}>
        {/* Left luminous blue pillar */}
        <path
          d="M47 151V66C47 54 53 46 64 42L78 37V112C78 125 74 136 66 147L60 155C55 160 47 157 47 151Z"
          fill={monochrome ? mono : `url(#nxBlue_${uid})`}
        />
        {!monochrome && (
          <path
            d="M47 151V66C47 55 53 48 63 43V142L57 153C54 157 47 155 47 151Z"
            fill={`url(#nxBlueSide_${uid})`}
            opacity="0.68"
          />
        )}

        {/* Right blue pillar with the taller executive rise */}
        <path
          d="M126 77C126 67 130 58 137 51L149 39C157 31 166 36 166 48V140C166 153 158 160 146 160H126V77Z"
          fill={monochrome ? mono : `url(#nxBlue_${uid})`}
        />
        {!monochrome && (
          <path
            d="M151 39C158 32 166 36 166 48V140C166 151 160 158 151 160V39Z"
            fill={`url(#nxBlueSide_${uid})`}
            opacity="0.55"
          />
        )}

        {/* Sculpted gold ribbon: the dominant N signature */}
        <path
          d="M55 42C65 34 79 36 90 48L154 115C165 126 165 140 155 150C145 160 130 158 120 147L53 78C42 67 44 51 55 42Z"
          fill={monochrome ? mono : `url(#nxGold_${uid})`}
        />

        {!monochrome && (
          <>
            {/* Metallic lower facet gives the selected reference its 3D fold */}
            <path
              d="M52 72L121 145C131 156 145 158 155 150C151 157 143 161 135 159C130 158 125 154 120 149L53 80C50 77 48 74 47 70L52 72Z"
              fill={`url(#nxGoldEdge_${uid})`}
              opacity="0.78"
            />

            {/* Controlled specular highlight across the gold face */}
            <path
              d="M59 43C67 38 77 40 86 50L150 116"
              stroke={`url(#nxGlint_${uid})`}
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Blue edge lights matching the approved artwork */}
            <path
              d="M53 145V68C53 58 57 52 65 48"
              stroke="#A9E8FF"
              strokeWidth="2.3"
              strokeLinecap="round"
              opacity="0.68"
            />
            <path
              d="M160 49V137"
              stroke="#72C9FF"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.58"
            />

            {/* Small upper-right light signature from the chosen reference */}
            <circle cx="159" cy="41" r="13" fill={`url(#nxFlare_${uid})`} />
            <path d="M159 27V55M145 41H173" stroke="#FFF4C1" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
            <path d="M150 32L168 50M168 32L150 50" stroke="#F9C95B" strokeWidth="1" strokeLinecap="round" opacity="0.58" />
          </>
        )}
      </g>
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
              className={`font-black ${textSizes[size]} transition-all duration-200 bg-gradient-to-b from-[#FFF0B5] via-[#DCA13C] to-[#9A5D14] bg-clip-text text-transparent`}
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
                isDark ? "text-[#EACB7B]" : "text-[#9B6A22]"
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
            className={`font-black ${textSizes[size]} transition-all duration-200 bg-gradient-to-b from-[#FFF0B5] via-[#DCA13C] to-[#9A5D14] bg-clip-text text-transparent`}
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
            className={`font-black ${textSizes[size]} transition-all duration-200 bg-gradient-to-b from-[#FFF0B5] via-[#DCA13C] to-[#9A5D14] bg-clip-text text-transparent`}
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
                isDark ? "text-[#EACB7B]" : "text-[#9B6A22]"
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

