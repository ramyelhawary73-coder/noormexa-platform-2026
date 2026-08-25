"use client";

import React, { useId } from "react";
import { useTheme } from "@/context/ThemeContext";

export interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "responsive";
  className?: string;
  variant?: "horizontal" | "compact" | "icon" | "symbol" | "stacked" | "wordmark";
  showTagline?: boolean;
  tagline?: string;
  monochrome?: boolean;
  forceDark?: boolean;
  forceLight?: boolean;
}

/**
 * NOORMEXA Official Vector Brand Emblem
 * Exact 1:1 mathematical vector recreation of the brand mark:
 * - Spherical 3D Globe with global network nodes & orbital arcs
 * - Fluid Dual-Ribbon 3D 'N' Monogram:
 *   1. Solid Champagne Gold Dynamic Ribbon (#ECD697 -> #C49B45 -> #7E5818)
 *   2. Solid Ocean Teal / Cyan Ribbon (#25BFD2 -> #0A5E70 -> #011F28)
 *   3. Right vertical teardrop pillar & left spherical curvature
 *   4. Network nodes on latitude connectors
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
      aria-label="NOORMEXA Logo Emblem"
    >
      <defs>
        {!monochrome ? (
          <>
            {/* Primary Gold Ribbon Gradient */}
            <linearGradient id={`gold_main_${uid}`} x1="20%" y1="10%" x2="85%" y2="90%">
              <stop offset="0%" stopColor={isDark ? "#FFF0C2" : "#ECD697"} />
              <stop offset="30%" stopColor={isDark ? "#EED48F" : "#DFBF6D"} />
              <stop offset="60%" stopColor={isDark ? "#D4A949" : "#C49B45"} />
              <stop offset="85%" stopColor={isDark ? "#B88A31" : "#A37A2C"} />
              <stop offset="100%" stopColor={isDark ? "#8A621D" : "#7E5818"} />
            </linearGradient>

            {/* Gold Arc & Nodes Gradient */}
            <linearGradient id={`gold_arc_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "#FFF0C2" : "#EED9A0"} />
              <stop offset="50%" stopColor={isDark ? "#E2C375" : "#C6A04D"} />
              <stop offset="100%" stopColor={isDark ? "#9E7728" : "#967026"} />
            </linearGradient>

            {/* Teal Primary Ribbon Gradient */}
            <linearGradient id={`teal_main_${uid}`} x1="15%" y1="5%" x2="85%" y2="95%">
              <stop offset="0%" stopColor={isDark ? "#3CE0F2" : "#25BFD2"} />
              <stop offset="30%" stopColor={isDark ? "#25BFD2" : "#1592A5"} />
              <stop offset="65%" stopColor={isDark ? "#118397" : "#0A5E70"} />
              <stop offset="90%" stopColor={isDark ? "#074B5C" : "#043846"} />
              <stop offset="100%" stopColor={isDark ? "#022731" : "#011F28"} />
            </linearGradient>

            {/* Teal Right Pillar Gradient */}
            <linearGradient id={`teal_pillar_${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "#4EEDFF" : "#22BACD"} />
              <stop offset="40%" stopColor={isDark ? "#22BACD" : "#118397"} />
              <stop offset="80%" stopColor={isDark ? "#0B6375" : "#074B5C"} />
              <stop offset="100%" stopColor={isDark ? "#032D38" : "#032D38"} />
            </linearGradient>

            {/* Teal Outer Arc Gradient */}
            <linearGradient id={`teal_arc_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? "#28C3D5" : "#1CA0B3"} />
              <stop offset="60%" stopColor={isDark ? "#118397" : "#095465"} />
              <stop offset="100%" stopColor={isDark ? "#043846" : "#022731"} />
            </linearGradient>

            {/* Dark Mode Luminous Glow Filter */}
            {isDark && (
              <filter id={`glow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            )}
          </>
        ) : null}
      </defs>

      <g filter={isDark && !monochrome ? `url(#glow_${uid})` : undefined}>
        {/* ======================================================== */}
        {/* 1. BACKGROUND SPHERE NETWORK & ORBITAL LATITUDES         */}
        {/* ======================================================== */}

        {/* Outer Right Gold Globe Arc */}
        <path
          d="M 100,14 C 146,14 186,52 186,100 C 186,128 174,152 154,168"
          stroke={monochrome ? (isDark ? "#FFFFFF" : "#04303D") : `url(#gold_arc_${uid})`}
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Upper-Right Gold Meridian Loop */}
        <path
          d="M 100,14 C 128,14 154,50 154,96 C 154,120 144,146 126,166"
          stroke={monochrome ? (isDark ? "#FFFFFF" : "#04303D") : `url(#gold_arc_${uid})`}
          strokeWidth="5.5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Horizontal Network Latitude Connector Bars */}
        <path
          d="M 80,138 L 152,138 M 86,76 L 158,76"
          stroke={monochrome ? (isDark ? "#FFFFFF" : "#04303D") : (isDark ? "#28C3D5" : "#0B6375")}
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.65"
        />

        {/* Top-Right Gold Network Node Circle */}
        <circle
          cx="156"
          cy="76"
          r="7.5"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#04303D") : `url(#gold_main_${uid})`}
        />

        {/* Bottom-Left Teal Network Node Circle */}
        <circle
          cx="80"
          cy="138"
          r="7.5"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#04303D") : (isDark ? "#28C3D5" : "#0A5E70")}
        />

        {/* Outer Left & Bottom Teal Globe Arc */}
        <path
          d="M 100,14 C 52,14 14,52 14,100 C 14,146 52,186 100,186 C 126,186 148,174 164,158"
          stroke={monochrome ? (isDark ? "#FFFFFF" : "#04303D") : `url(#teal_arc_${uid})`}
          strokeWidth="7.5"
          strokeLinecap="round"
        />

        {/* Lower-Left Internal Meridian Arc (Teal) */}
        <path
          d="M 100,186 C 68,186 38,152 38,106 C 38,76 50,46 72,28"
          stroke={monochrome ? (isDark ? "#FFFFFF" : "#04303D") : `url(#teal_arc_${uid})`}
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* ======================================================== */}
        {/* 2. DYNAMIC 'N' CENTRAL MONOGRAM (SOLID 3D RIBBONS)       */}
        {/* ======================================================== */}

        {/* Leftmost Vertical Curved Pillar of 'N' (Teal Base) */}
        <path
          d="M 44,156 
             C 32,136 26,112 26,90 
             C 26,64 36,44 54,30 
             C 57,28 61,31 60,35 
             C 50,52 46,74 46,96 
             C 46,120 52,140 64,156 
             C 66,160 61,164 56,162 
             C 51,161 47,158 44,156 Z"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#04303D") : `url(#teal_main_${uid})`}
        />

        {/* Right Vertical Teardrop Pillar of 'N' (Teal Leaf Shape) */}
        <path
          d="M 124,58 
             C 144,58 162,80 162,112 
             C 162,142 144,168 126,170 
             C 122,170 120,165 122,161 
             C 134,142 142,120 142,98 
             C 142,78 132,64 120,60 
             C 118,59 120,58 124,58 Z"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#04303D") : `url(#teal_pillar_${uid})`}
        />

        {/* Middle Sweeping Diagonal Ribbon (Ocean Teal Underlayer) */}
        <path
          d="M 50,38 
             C 68,20 94,20 114,38 
             L 160,138 
             C 166,152 154,168 136,168 
             C 124,168 114,156 106,140 
             L 64,54 
             C 56,38 48,38 50,38 Z"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#04303D") : `url(#teal_main_${uid})`}
          opacity="0.95"
        />

        {/* Primary Foreground Diagonal Ribbon (Champagne Gold Signature Swoop) */}
        <path
          d="M 64,32 
             C 80,16 102,18 120,38 
             L 166,134 
             C 178,156 166,178 142,178 
             C 126,178 114,166 104,148 
             L 68,68 
             C 60,48 50,44 64,32 Z"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#04303D") : `url(#gold_main_${uid})`}
        />

        {/* Gold Ribbon Inner Sheen (Adds 3D Lustre) */}
        <path
          d="M 76,38 
             C 88,26 104,28 118,44 
             L 158,132 
             C 166,148 156,164 140,164 
             C 130,164 120,154 112,138 
             L 78,64 
             C 72,50 68,44 76,38 Z"
          fill="#FFF6D8"
          opacity="0.4"
        />

        {/* Bottom Loop Interlocking Under-Shadow */}
        <path
          d="M 104,148 
             C 114,166 126,178 142,178 
             C 146,178 150,176 154,172 
             C 142,174 130,166 120,148 
             L 104,148 Z"
          fill="#664610"
          opacity="0.5"
        />
      </g>
    </svg>
  );
}

/**
 * Universal BrandLogo component for NOORMEXA
 * Exactly replicates the brand hierarchy, typography scale, and colors:
 * - NOOR in Deep Petrol Navy (#03303D in Light Mode, #F8FAFC in Dark Mode)
 * - MEXA in Champagne Gold (#C29B48 -> #E0C070 -> #9E7728)
 * - Global Smart Shopping subtitle (#52667A in Light Mode, #94A3B8 in Dark Mode)
 * - Fully responsive across mobile, tablet, and desktop viewports
 */
export default function BrandLogo({
  size = "responsive",
  className = "",
  variant = "horizontal",
  showTagline = true,
  tagline = "Global Smart Shopping",
  monochrome = false,
  forceDark,
  forceLight,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const isDark = forceDark ? true : forceLight ? false : theme === "dark";

  // Pre-configured dimensions for fixed or responsive modes
  const iconConfig = {
    xs: "w-7 h-7",
    sm: "w-8 h-8 sm:w-9 sm:h-9",
    md: "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12",
    lg: "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16",
    xl: "w-16 h-16 sm:w-20 sm:h-20",
    "2xl": "w-20 h-20 sm:w-24 sm:h-24",
    responsive: "w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12",
  };

  const textSizes = {
    xs: "text-base tracking-[0.03em]",
    sm: "text-lg tracking-[0.03em]",
    md: "text-xl sm:text-2xl md:text-[26px] tracking-[0.035em]",
    lg: "text-2xl sm:text-3xl md:text-4xl tracking-[0.04em]",
    xl: "text-4xl sm:text-5xl tracking-[0.05em]",
    "2xl": "text-5xl sm:text-6xl tracking-[0.05em]",
    responsive: "text-[18px] xs:text-[20px] sm:text-[23px] md:text-[26px] lg:text-[28px] tracking-[0.035em]",
  };

  const subtitleSizes = {
    xs: "text-[8px] tracking-[0.04em]",
    sm: "text-[9px] sm:text-[10px] tracking-[0.05em]",
    md: "text-[10px] sm:text-[11.5px] md:text-[12.5px] tracking-[0.05em]",
    lg: "text-[12px] sm:text-[14px] md:text-[16px] tracking-[0.06em]",
    xl: "text-[14px] sm:text-[16px] md:text-[18px] tracking-[0.07em]",
    "2xl": "text-[16px] sm:text-[19px] md:text-[22px] tracking-[0.08em]",
    responsive: "text-[8.5px] xs:text-[9.5px] sm:text-[11px] md:text-[12px] lg:text-[13px] tracking-[0.045em]",
  };

  const activeIconClass = iconConfig[size] || iconConfig.responsive;

  // Variant: Icon Only
  if (variant === "icon" || variant === "symbol") {
    return (
      <div dir="ltr" className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <div className={`${activeIconClass} flex items-center justify-center shrink-0`}>
          <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full" />
        </div>
      </div>
    );
  }

  // Variant: Stacked
  if (variant === "stacked") {
    return (
      <div dir="ltr" className={`inline-flex flex-col items-center justify-center gap-2 sm:gap-2.5 select-none shrink-0 ${className}`}>
        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0">
          <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full" />
        </div>
        <div dir="ltr" className="flex flex-col items-center justify-center text-center">
          <div dir="ltr" className="flex items-center font-black leading-none select-none">
            <span
              className={`font-black ${textSizes[size]} transition-colors duration-200 ${
                isDark ? "text-slate-100" : "text-[#03303D]"
              }`}
              style={{
                fontFamily: "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                letterSpacing: "0.03em",
              }}
            >
              NOOR
            </span>
            <span
              className="font-black bg-gradient-to-r from-[#C29B48] via-[#E2C375] to-[#9E7728] bg-clip-text text-transparent"
              style={{
                fontFamily: "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                letterSpacing: "0.03em",
              }}
            >
              MEXA
            </span>
          </div>
          {showTagline && (
            <span
              className={`font-medium ${subtitleSizes[size]} mt-1 transition-colors duration-200 ${
                isDark ? "text-slate-400" : "text-[#52667A]"
              }`}
              style={{
                fontFamily: "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              {tagline}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant: Compact (Emblem + NOORMEXA without tagline, great for small badges/headers)
  if (variant === "compact") {
    return (
      <div dir="ltr" className={`inline-flex items-center gap-2 sm:gap-2.5 select-none shrink-0 ${className}`}>
        <div className={`${activeIconClass} flex items-center justify-center shrink-0`}>
          <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full" />
        </div>
        <div dir="ltr" className="flex items-center font-black leading-none select-none">
          <span
            className={`font-black ${textSizes[size]} transition-colors duration-200 ${
              isDark ? "text-slate-100" : "text-[#03303D]"
            }`}
            style={{
              fontFamily: "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            NOOR
          </span>
          <span
            className="font-black bg-gradient-to-r from-[#C29B48] via-[#E2C375] to-[#9E7728] bg-clip-text text-transparent"
            style={{
              fontFamily: "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            MEXA
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal Brand Identity (Exact match to official brand artwork on both Web and Mobile)
  return (
    <div
      dir="ltr"
      className={`inline-flex items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-3.5 select-none shrink-0 transition-transform duration-200 hover:scale-[1.01] ${className}`}
    >
      {/* 3D Spherical Emblem (Responsive scaling) */}
      <div className={`${activeIconClass} flex items-center justify-center shrink-0`}>
        <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full" />
      </div>

      {/* Brand Typography (Always LTR: NOOR in Petrol/White + MEXA in Metallic Gold, Subtitle underneath) */}
      <div dir="ltr" className="flex flex-col justify-center text-left min-w-0">
        <div dir="ltr" className="flex items-center font-black leading-none select-none">
          <span
            className={`font-black ${textSizes[size]} transition-colors duration-200 ${
              isDark ? "text-slate-100" : "text-[#03303D]"
            }`}
            style={{
              fontFamily: "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            NOOR
          </span>
          <span
            className={`font-black ${textSizes[size]} bg-gradient-to-r from-[#C29B48] via-[#E2C375] to-[#9E7728] bg-clip-text text-transparent`}
            style={{
              fontFamily: "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            MEXA
          </span>
        </div>

        {showTagline && (
          <span
            className={`font-medium ${subtitleSizes[size]} mt-0.5 sm:mt-1 transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis ${
              isDark ? "text-slate-400" : "text-[#52667A]"
            }`}
            style={{
              fontFamily: "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
