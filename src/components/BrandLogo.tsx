"use client";

import React, { useId } from "react";
import { useTheme } from "@/context/ThemeContext";

export interface BrandLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "responsive";
  className?: string;
  variant?: "horizontal" | "compact" | "icon" | "symbol" | "stacked" | "wordmark" | "pure-svg";
  showTagline?: boolean;
  tagline?: string;
  monochrome?: boolean;
  forceDark?: boolean;
  forceLight?: boolean;
}

/**
 * NOORMEXA High-End Interwoven Global Tech 'N' Emblem
 *
 * Design Concept:
 * - A bold, clear letter 'N' composed of sleek aerodynamic energy ribbons (Left Blue Stem, Diagonal Radiant Gold Band, Right Blue/Cyan Stem).
 * - Intertwined with 3D orbital planetary network threads (Global Commerce Lines) wrapping around the N to form a futuristic wireframe globe.
 * - Glowing network nodes & trade route intersections representing global e-commerce.
 * - Perfectly optimized for crisp rendering at any scale (from 24px navbar icon to 512px hero).
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
      viewBox="0 0 160 160"
      width={size}
      height={size}
      fill="none"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      className={`shrink-0 select-none ${className}`}
      aria-label="NOORMEXA Global E-Commerce Emblem"
    >
      <defs>
        {!monochrome ? (
          <>
            {/* Background Ambient Glow */}
            <radialGradient id={`globe_core_glow_${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isDark ? "#1E3A8A" : "#DBEAFE"} stopOpacity={isDark ? "0.45" : "0.75"} />
              <stop offset="60%" stopColor={isDark ? "#0F172A" : "#EFF6FF"} stopOpacity={isDark ? "0.2" : "0.3"} />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* N - Left Pillar Gradient (Electric Blue / Tech Sapphire) */}
            <linearGradient id={`n_left_grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="40%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>

            {/* N - Diagonal Commerce Stream Gradient (Radiant Imperial Gold) */}
            <linearGradient id={`n_diagonal_grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="25%" stopColor="#FBBF24" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* N - Right Pillar Gradient (Deep Indigo to Ocean Blue) */}
            <linearGradient id={`n_right_grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* Orbital Thread 1 - Equatorial Golden Commerce Loop */}
            <linearGradient id={`orbit_gold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#D97706" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
            </linearGradient>

            {/* Orbital Thread 2 - Latitude Cyan Data Flow */}
            <linearGradient id={`orbit_cyan_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0284C7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0.2" />
            </linearGradient>

            {/* Orbital Thread 3 - Meridian Blue Fiber */}
            <linearGradient id={`orbit_meridian_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.1" />
            </linearGradient>

            {/* High-Tech Glow Filters */}
            <filter id={`glow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* 3D Diagonal Ribbon Drop Shadow */}
            <filter id={`ribbon_shadow_${uid}`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="-2" dy="3.5" stdDeviation="3" floodColor="#0F172A" floodOpacity={isDark ? "0.7" : "0.4"} />
            </filter>
          </>
        ) : null}
      </defs>

      {/* 1. Ambient Globe Depth Glow */}
      {!monochrome && (
        <circle cx="80" cy="80" r="62" fill={`url(#globe_core_glow_${uid})`} />
      )}

      {/* ======================================================== */}
      {/* 2. BACKGROUND GLOBE THREADS (Layers behind the N)        */}
      {/* ======================================================== */}
      <g id={`globe_back_threads_${uid}`}>
        {/* Outer Globe Boundary Ring (Soft Fiber) */}
        <circle
          cx="80"
          cy="80"
          r="56"
          stroke={monochrome ? (isDark ? "#475569" : "#CBD5E1") : (isDark ? "#38BDF8" : "#0284C7")}
          strokeWidth="1.2"
          strokeDasharray="4 3"
          strokeOpacity={isDark ? "0.35" : "0.3"}
        />

        {/* Background Meridian Arc (Left) */}
        <path
          d="M 80,24 C 44,24 38,80 38,80 C 38,80 44,136 80,136"
          stroke={monochrome ? (isDark ? "#334155" : "#E2E8F0") : `url(#orbit_cyan_${uid})`}
          strokeWidth="1.4"
          strokeOpacity={isDark ? "0.4" : "0.35"}
          strokeDasharray="5 3"
          fill="none"
        />

        {/* Background Meridian Arc (Right) */}
        <path
          d="M 80,24 C 116,24 122,80 122,80 C 122,80 116,136 80,136"
          stroke={monochrome ? (isDark ? "#334155" : "#E2E8F0") : `url(#orbit_meridian_${uid})`}
          strokeWidth="1.4"
          strokeOpacity={isDark ? "0.4" : "0.35"}
          strokeDasharray="5 3"
          fill="none"
        />

        {/* Background Upper Latitude Thread */}
        <path
          d="M 36,52 C 55,40 105,40 124,52"
          stroke={monochrome ? (isDark ? "#334155" : "#E2E8F0") : (isDark ? "#93C5FD" : "#60A5FA")}
          strokeWidth="1.2"
          strokeOpacity={isDark ? "0.3" : "0.25"}
          fill="none"
        />

        {/* Background Lower Latitude Thread */}
        <path
          d="M 36,108 C 55,120 105,120 124,108"
          stroke={monochrome ? (isDark ? "#334155" : "#E2E8F0") : (isDark ? "#FCD34D" : "#F59E0B")}
          strokeWidth="1.2"
          strokeOpacity={isDark ? "0.3" : "0.25"}
          fill="none"
        />
      </g>

      {/* ======================================================== */}
      {/* 3. THE ICONIC LETTER 'N' (CORE LOGO IDENTITY)            */}
      {/* ======================================================== */}
      <g id={`core_letter_n_${uid}`}>
        {/* [N: LEFT PILLAR - Sleek Aerodynamic Tech Stem] */}
        <path
          d="M 38,34 
             C 47,34 52,39 52,47 
             L 52,113 
             C 52,121 47,126 38,126 
             C 34,126 31,120 31,113 
             L 31,47 
             C 31,40 34,34 38,34 Z"
          fill={monochrome ? (isDark ? "#94A3B8" : "#475569") : `url(#n_left_grad_${uid})`}
        />
        {/* Left Pillar Light Accent Ridge */}
        <path
          d="M 34,44 L 34,116"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity={isDark ? "0.8" : "0.6"}
          fill="none"
        />

        {/* [N: RIGHT PILLAR - Sleek Aerodynamic Tech Stem] */}
        <path
          d="M 122,34 
             C 126,34 129,40 129,47 
             L 129,113 
             C 129,120 126,126 122,126 
             C 113,126 108,121 108,113 
             L 108,47 
             C 108,39 113,34 122,34 Z"
          fill={monochrome ? (isDark ? "#64748B" : "#334155") : `url(#n_right_grad_${uid})`}
        />
        {/* Right Pillar Light Accent Ridge */}
        <path
          d="M 126,44 L 126,116"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity={isDark ? "0.8" : "0.6"}
          fill="none"
        />

        {/* [N: DIAGONAL POWER STRIP - Dynamic 3D Intersecting Gold Band] */}
        {/* Extends cleanly from Top-Left Pillar to Bottom-Right Pillar */}
        <path
          d="M 33,36 
             C 41,32 50,35 56,43 
             L 126,116 
             C 130,121 127,128 120,128 
             C 112,128 104,123 98,115 
             L 32,47 
             C 28,42 28,38 33,36 Z"
          fill={monochrome ? (isDark ? "#F8FAFC" : "#0F172A") : `url(#n_diagonal_grad_${uid})`}
          filter={!monochrome ? `url(#ribbon_shadow_${uid})` : undefined}
        />

        {/* Diagonal Golden Core Light Stream (High Speed Fiber) */}
        <path
          d="M 37,38 L 121,123"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeOpacity={isDark ? "0.95" : "0.85"}
          fill="none"
        />

        {/* Fast Tech Fiber Tracer Lines on Diagonal */}
        <path
          d="M 44,48 L 110,117"
          stroke="#FEF08A"
          strokeWidth="1"
          strokeDasharray="6 4"
          strokeOpacity="0.9"
          fill="none"
        />
      </g>

      {/* ======================================================== */}
      {/* 4. FOREGROUND INTERWOVEN GLOBE THREADS & ORBITAL RINGS   */}
      {/* ======================================================== */}
      <g id={`globe_front_threads_${uid}`}>
        {/* Thread A: Main Dynamic 3D Equatorial Orbit (Sweeps around the globe & cuts across N) */}
        <path
          d="M 18,92 
             C 25,62 70,55 105,68 
             C 128,77 142,92 142,96 
             C 142,102 120,116 85,114 
             C 50,112 20,98 18,92 Z"
          stroke={monochrome ? (isDark ? "#CBD5E1" : "#475569") : `url(#orbit_gold_${uid})`}
          strokeWidth="2.2"
          fill="none"
        />

        {/* Thread B: Angled Planetary Orbit Ring (Global Logistics / Air Routes) */}
        <path
          d="M 28,118 
             C 32,100 68,60 110,44 
             C 134,35 146,42 146,48 
             C 146,56 122,86 82,110 
             C 54,126 30,126 28,118 Z"
          stroke={monochrome ? (isDark ? "#94A3B8" : "#64748B") : `url(#orbit_cyan_${uid})`}
          strokeWidth="1.8"
          strokeDasharray="6 3"
          fill="none"
        />

        {/* Thread C: Equatorial Horizon Fiber Line */}
        <path
          d="M 24,80 C 45,74 115,74 136,80"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity={isDark ? "0.4" : "0.3"}
          fill="none"
        />

        {/* ======================================================== */}
        {/* 5. LUMINOUS GLOBAL TRADE NODES (Connecting Cities/Hubs)  */}
        {/* ======================================================== */}
        {/* Node 1: Top-Left Anchor Hub */}
        <circle cx="38" cy="38" r="4.5" fill="#38BDF8" filter={!monochrome ? `url(#glow_${uid})` : undefined} />
        <circle cx="38" cy="38" r="2.2" fill="#FFFFFF" />

        {/* Node 2: Center-Right Global Hub */}
        <circle cx="124" cy="74" r="3.5" fill="#FBBF24" filter={!monochrome ? `url(#glow_${uid})` : undefined} />
        <circle cx="124" cy="74" r="1.8" fill="#FFFFFF" />

        {/* Node 3: Bottom-Right Anchor Hub */}
        <circle cx="122" cy="122" r="4.5" fill="#F59E0B" filter={!monochrome ? `url(#glow_${uid})` : undefined} />
        <circle cx="122" cy="122" r="2.2" fill="#FFFFFF" />

        {/* Node 4: Left Orbit Spark */}
        <circle cx="28" cy="94" r="2.5" fill="#38BDF8" />
        <circle cx="28" cy="94" r="1.2" fill="#FFFFFF" />

        {/* Node 5: Top Orbit Spark */}
        <circle cx="110" cy="44" r="2.8" fill="#FDE047" />
        <circle cx="110" cy="44" r="1.4" fill="#FFFFFF" />

        {/* Node 6: Center Cross Intersection Spark */}
        <circle cx="80" cy="80" r="3" fill="#FFFFFF" filter={!monochrome ? `url(#glow_${uid})` : undefined} />
      </g>
    </svg>
  );
}

/**
 * Universal BrandLogo component for NOORMEXA
 *
 * Professional E-Commerce Identity:
 * - Clear, high-contrast letter 'N' constructed with modern aerodynamic gradients
 * - Wrapped with 3D intertwined global network fibers & orbital trade nodes
 * - Sophisticated typography: "NOORMEXA" in high-contrast blue/gold with "GLOBAL SMART SHOPPING"
 */
export default function BrandLogo({
  size = "responsive",
  className = "",
  variant = "horizontal",
  showTagline = true,
  tagline = "GLOBAL SMART SHOPPING",
  monochrome = false,
  forceDark,
  forceLight,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const isDark = forceDark ? true : forceLight ? false : theme === "dark";

  // Dimension presets
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
    xs: "text-base tracking-[0.05em]",
    sm: "text-lg tracking-[0.06em]",
    md: "text-xl sm:text-2xl md:text-[25px] tracking-[0.06em]",
    lg: "text-2xl sm:text-3xl md:text-4xl tracking-[0.07em]",
    xl: "text-4xl sm:text-5xl tracking-[0.08em]",
    "2xl": "text-5xl sm:text-6xl tracking-[0.08em]",
    responsive: "text-[18px] xs:text-[20px] sm:text-[23px] md:text-[25px] lg:text-[27px] tracking-[0.06em]",
  };

  const subtitleSizes = {
    xs: "text-[7px] tracking-[0.22em]",
    sm: "text-[8px] sm:text-[9px] tracking-[0.24em]",
    md: "text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.26em]",
    lg: "text-[11px] sm:text-[13px] md:text-[14px] tracking-[0.28em]",
    xl: "text-[13px] sm:text-[15px] md:text-[16px] tracking-[0.3em]",
    "2xl": "text-[15px] sm:text-[17px] md:text-[19px] tracking-[0.32em]",
    responsive: "text-[8px] xs:text-[9px] sm:text-[10px] md:text-[10.5px] lg:text-[11.5px] tracking-[0.26em]",
  };

  const activeIconClass = iconConfig[size] || iconConfig.responsive;

  // Variant: Icon / Symbol Only
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
      <div dir="ltr" className={`inline-flex flex-col items-center justify-center gap-2 select-none shrink-0 ${className}`}>
        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0">
          <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full" />
        </div>
        <div dir="ltr" className="flex flex-col items-center justify-center text-center">
          <div dir="ltr" className="flex items-center font-black leading-none select-none">
            <span
              className={`font-black ${textSizes[size]} transition-all duration-200 bg-clip-text text-transparent ${
                isDark
                  ? "bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#F59E0B]"
                  : "bg-gradient-to-r from-[#0369A1] via-[#0284C7] to-[#D97706]"
              }`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Segoe UI', Roboto, sans-serif",
                letterSpacing: "3.5px",
              }}
            >
              NOORMEXA
            </span>
          </div>
          {showTagline && (
            <span
              className={`font-medium uppercase ${subtitleSizes[size]} mt-1 transition-colors duration-200 ${
                isDark ? "text-slate-400" : "text-[#64748B]"
              }`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Segoe UI', Roboto, sans-serif",
                letterSpacing: "5px",
              }}
            >
              {tagline}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant: Compact (Emblem + NOORMEXA without tagline)
  if (variant === "compact") {
    return (
      <div dir="ltr" className={`inline-flex items-center gap-2.5 sm:gap-3 select-none shrink-0 ${className}`}>
        <div className={`${activeIconClass} flex items-center justify-center shrink-0`}>
          <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full" />
        </div>
        <div dir="ltr" className="flex items-center font-black leading-none select-none">
          <span
            className={`font-black ${textSizes[size]} transition-all duration-200 bg-clip-text text-transparent ${
              isDark
                ? "bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#F59E0B]"
                : "bg-gradient-to-r from-[#0369A1] via-[#0284C7] to-[#D97706]"
            }`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Segoe UI', Roboto, sans-serif",
              letterSpacing: "3.5px",
            }}
          >
            NOORMEXA
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal Brand Identity (Gap: 16-20px, Interwoven Global 'N' Emblem + Modern Typography)
  return (
    <div
      dir="ltr"
      className={`inline-flex items-center gap-2.5 xs:gap-3 sm:gap-3.5 select-none shrink-0 transition-transform duration-200 hover:scale-[1.01] ${className}`}
    >
      {/* Interwoven Global 'N' Emblem */}
      <div className={`${activeIconClass} flex items-center justify-center shrink-0`}>
        <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full" />
      </div>

      {/* Typography: "NOORMEXA" + "GLOBAL SMART SHOPPING" */}
      <div dir="ltr" className="flex flex-col justify-center text-left min-w-0">
        <div dir="ltr" className="flex items-center font-black leading-none select-none">
          <span
            className={`font-black ${textSizes[size]} transition-all duration-200 bg-clip-text text-transparent ${
              isDark
                ? "bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#F59E0B]"
                : "bg-gradient-to-r from-[#0369A1] via-[#0284C7] to-[#D97706]"
            }`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Segoe UI', Roboto, sans-serif",
              letterSpacing: "3.5px",
            }}
          >
            NOORMEXA
          </span>
        </div>

        {showTagline && (
          <span
            className={`font-semibold uppercase ${subtitleSizes[size]} mt-0.5 sm:mt-1 transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis ${
              isDark ? "text-slate-400" : "text-[#64748B]"
            }`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Segoe UI', Roboto, sans-serif",
              letterSpacing: "5px",
            }}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
