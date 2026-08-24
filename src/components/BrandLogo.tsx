"use client";

import React, { useId } from "react";
import { useTheme } from "@/context/ThemeContext";

interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  variant?: "horizontal" | "icon" | "symbol" | "stacked" | "wordmark";
  showTagline?: boolean;
  monochrome?: boolean;
}

/**
 * World-Class NOORMEXA Global Flagship Brand Mark (SVG Vector)
 * 
 * Architecture:
 * - Dynamic High-Tech Monogram "N" (Noor & Mexa)
 * - Left & Right Pillars: Electric Cobalt & Deep Sapphire Blue
 * - Dynamic Forward Diagonal: Radiant Solar Amber/Orange Ribbon
 * - Apex Noor Light Spark: 4-pointed radiant star
 * - 100% pure vector SVG, mathematically balanced, crisp at all resolutions.
 */
export function NoormexaEmblemSvg({
  size = 36,
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

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      className={`shrink-0 select-none ${className}`}
      aria-label="NOORMEXA Brand Mark"
    >
      <defs>
        {!monochrome ? (
          <>
            <linearGradient id={`nmx_l_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            <linearGradient id={`nmx_d_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="45%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>

            <linearGradient id={`nmx_r_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="60%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </>
        ) : null}
      </defs>

      <g transform="translate(0, 0)">
        {/* Left Vertical Pillar */}
        <rect
          x="16"
          y="16"
          width="17"
          height="68"
          rx="8.5"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#0B1322") : `url(#nmx_l_${uid})`}
        />

        {/* Right Vertical Pillar */}
        <rect
          x="67"
          y="16"
          width="17"
          height="68"
          rx="8.5"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#0B1322") : `url(#nmx_r_${uid})`}
        />

        {/* Dynamic Forward Energy Ribbon (Diagonal) */}
        <path
          d="M 16,24.5 
             L 75,82.5 
             C 80,87.5 84,85 84,78 
             L 84,62 
             L 25,14.5 
             C 20.5,10.5 16,13.5 16,19.5 
             Z"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#0B1322") : `url(#nmx_d_${uid})`}
        />

        {/* Noor Apex Star (Beacon of Light) */}
        <path
          d="M 75.5,21.5 L 78.5,28.5 L 85.5,31.5 L 78.5,34.5 L 75.5,41.5 L 72.5,34.5 L 65.5,31.5 L 72.5,28.5 Z"
          fill={monochrome ? (isDark ? "#0B1322" : "#FFFFFF") : "#FBBF24"}
        />
        <circle
          cx="75.5"
          cy="31.5"
          r="2.2"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#0B1322") : "#FFFFFF"}
        />
      </g>
    </svg>
  );
}

/**
 * Universal BrandLogo component with forced LTR direction to prevent Arabic RTL inversion
 */
export default function BrandLogo({
  size = "md",
  className = "",
  variant = "horizontal",
  showTagline = false,
  monochrome = false,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const iconSizes = {
    xs: 24,
    sm: 30,
    md: 38,
    lg: 46,
    xl: 56,
    "2xl": 72,
  };

  const textSizes = {
    xs: "text-base tracking-wider",
    sm: "text-lg tracking-wider",
    md: "text-xl tracking-wider",
    lg: "text-2xl tracking-widest",
    xl: "text-3xl tracking-widest",
    "2xl": "text-4xl tracking-widest",
  };

  const currentIconSize = iconSizes[size] || 38;

  if (variant === "icon" || variant === "symbol") {
    return (
      <div
        dir="ltr"
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
      >
        <NoormexaEmblemSvg
          size={currentIconSize}
          isDark={isDark}
          monochrome={monochrome}
        />
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div
        dir="ltr"
        className={`inline-flex flex-col items-center justify-center gap-2 select-none shrink-0 ${className}`}
      >
        <NoormexaEmblemSvg
          size={currentIconSize * 1.3}
          isDark={isDark}
          monochrome={monochrome}
        />
        <div dir="ltr" className="flex items-center font-black tracking-widest leading-none">
          <span className={isDark ? "text-white" : "text-slate-950"}>NOOR</span>
          <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
            MEXA
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase">
            التسوق الذكي
          </span>
        )}
      </div>
    );
  }

  // Default: Horizontal Brand Identity (Icon + NOORMEXA)
  // CRITICAL: dir="ltr" ensures the logo reads [ICON] NOORMEXA even inside Arabic RTL parent pages!
  return (
    <div
      dir="ltr"
      className={`inline-flex items-center gap-2.5 sm:gap-3 select-none shrink-0 transition-opacity hover:opacity-95 ${className}`}
    >
      {/* Brand Icon Mark */}
      <div className="relative flex items-center justify-center shrink-0">
        <NoormexaEmblemSvg
          size={currentIconSize}
          isDark={isDark}
          monochrome={monochrome}
        />
      </div>

      {/* Brand Wordmark (Always LTR: NOOR + MEXA) */}
      <div dir="ltr" className="flex flex-col justify-center text-left">
        <div dir="ltr" className="flex items-center font-black leading-none font-sans select-none">
          <span
            className={`font-black ${textSizes[size]} transition-colors ${
              isDark ? "text-white" : "text-slate-950"
            }`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              letterSpacing: "0.06em",
            }}
          >
            NOOR
          </span>
          <span
            className={`font-black ${textSizes[size]} bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              letterSpacing: "0.06em",
            }}
          >
            MEXA
          </span>
        </div>

        {showTagline ? (
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider mt-0.5">
            التسوق الذكي
          </span>
        ) : null}
      </div>
    </div>
  );
}
