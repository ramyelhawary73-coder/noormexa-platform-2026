"use client";

import React, { useId } from "react";
import { useTheme } from "@/context/ThemeContext";

interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  variant?: "horizontal" | "icon" | "symbol" | "stacked" | "wordmark";
  showTagline?: boolean;
}

/**
 * World-Class NOORMEXA Global Flagship Icon (SVG Vector)
 * Masterfully engineered: The Dynamic "N" Nexus Ribbon combining 
 * Global Commerce Flow, Aurora Nexus Spark, and Diamond Precision Geometry.
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
      aria-label="NOORMEXA Global Emblem"
    >
      <defs>
        {/* Deep Vivid Commerce Gradients (Apple / Stripe / Google Tech Standard) */}
        {/* Left Pillar: High-Tech Indigo to Electric Cyan/Blue */}
        <linearGradient id={`nmx_p1_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>

        {/* Diagonal Bridge: Dynamic Solar Pulse (Amber into Electric Orange into Sunset Pink) */}
        <linearGradient id={`nmx_bridge_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>

        {/* Right Pillar: Global Commerce Gold to Pure Radiance */}
        <linearGradient id={`nmx_p2_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>

        {/* Pure Platinum Gloss Highlights */}
        <linearGradient id={`nmx_gloss_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Subtle Ambient Shadow Filter for Precision Depth */}
        <filter id={`nmx_shadow_${uid}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#F97316" floodOpacity={isDark ? "0.25" : "0.15"} />
        </filter>
      </defs>

      <g filter={`url(#nmx_shadow_${uid})`}>
        {/* 1. Left Upward Geometric Arch Pillar */}
        <path
          d="M 22,82 L 22,30 C 22,22 28,16 36,16 C 44,16 48,22 48,29 L 48,46 L 36,54 L 36,31 C 36,27 33,25 31,25 C 29,25 28,27 28,30 L 28,82 Z"
          fill={`url(#nmx_p1_${uid})`}
        />

        {/* 2. Diagonal Dynamic Commerce Bridge (Flowing N-Vector) */}
        <path
          d="M 24,24 L 76,76 C 81,81 81,85 76,85 C 72,85 68,82 65,79 L 20,34 C 18,31 18,26 21,23 C 22,22 23,23 24,24 Z"
          fill={`url(#nmx_bridge_${uid})`}
        />

        {/* 3. Right Downward/Upward Symmetry Pillar */}
        <path
          d="M 78,18 L 78,70 C 78,78 72,84 64,84 C 56,84 52,78 52,71 L 52,54 L 64,46 L 64,69 C 64,73 67,75 69,75 C 71,75 72,73 72,70 L 72,18 Z"
          fill={`url(#nmx_p2_${uid})`}
        />

        {/* 4. Center Innovation Spark Point (The Noor / Light Point) */}
        <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="2.5" fill="#F97316" />
      </g>
    </svg>
  );
}

/**
 * World-Class NOORMEXA Flagship Wordmark & Full Logo Component
 * Combines:
 * 1. World-Class Icon
 * 2. Premium Typography ("NOOR" + "MEXA" dual tone luxury tech wordmark)
 * 3. Arabic Subtitle / Global Tagline
 */
export function NoormexaFullLogo({
  size = "md",
  className = "",
  isDark = true,
  showTagline = false,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  isDark?: boolean;
  showTagline?: boolean;
}) {
  const iconSizes = {
    xs: 26,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
    "2xl": 68,
  };

  const textSizes = {
    xs: "text-base tracking-wider",
    sm: "text-lg tracking-wider",
    md: "text-xl tracking-wider",
    lg: "text-2xl tracking-widest",
    xl: "text-3xl tracking-widest",
    "2xl": "text-4xl tracking-widest",
  };

  const currentIconSize = iconSizes[size] || 40;

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3.5 select-none shrink-0 ${className}`}>
      {/* Icon Emblem */}
      <div className="relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
        <NoormexaEmblemSvg size={currentIconSize} isDark={isDark} />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500/20 to-blue-500/20 blur-md pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity" />
      </div>

      {/* Wordmark Branding */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center font-black leading-none font-sans">
          <span
            className={`font-extrabold ${textSizes[size]} transition-colors ${
              isDark ? "text-white" : "text-slate-950"
            }`}
            style={{ fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "0.08em" }}
          >
            NOOR
          </span>
          <span
            className={`font-black ${textSizes[size]} bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent`}
            style={{ fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "0.08em" }}
          >
            MEXA
          </span>
        </div>

        {/* Optional Tagline / Subtitle */}
        {showTagline ? (
          <div className="flex items-center justify-between gap-1.5 mt-0.5 pt-0.5 border-t border-slate-200/40 dark:border-slate-800/80">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              GLOBAL MARKETPLACE
            </span>
          </div>
        ) : (
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase">
            Global Market
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Universal BrandLogo component compatible with all existing views
 */
export default function BrandLogo({
  size = "md",
  className = "",
  variant = "horizontal",
  showTagline = false,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "icon" || variant === "symbol") {
    const iconSizeMap = {
      xs: 24,
      sm: 30,
      md: 38,
      lg: 48,
      xl: 60,
      "2xl": 80,
    };
    return <NoormexaEmblemSvg size={iconSizeMap[size]} isDark={isDark} className={className} />;
  }

  return (
    <NoormexaFullLogo
      size={size}
      className={className}
      isDark={isDark}
      showTagline={showTagline}
    />
  );
}
