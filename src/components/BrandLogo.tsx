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
 * NOORMEXA High-End 3D Globe & Geometric 'N' Emblem
 *
 * Design Concept:
 * - A high-definition 3D dimensional globe with clear spherical depth, illuminated atmosphere, and defined latitude/longitude gridlines.
 * - Central iconic 'N' structure with 3D beveled sapphire pillars and an imperial gold power ribbon cutting dynamically across the sphere.
 * - Surrounding 3D orbital commerce rings with luminous global trade hubs representing international smart e-commerce.
 * - Pristine vector scaling from 24px navbar to 512px billboard resolutions.
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
      viewBox="0 0 180 180"
      width={size}
      height={size}
      fill="none"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      className={`shrink-0 select-none ${className}`}
      aria-label="NOORMEXA 3D Global E-Commerce Emblem"
    >
      <defs>
        {!monochrome ? (
          <>
            {/* 1. 3D Globe Sphere Realistic Depth Gradient */}
            <radialGradient id={`globe_sphere_${uid}`} cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor={isDark ? "#2563EB" : "#93C5FD"} stopOpacity={isDark ? "0.95" : "0.9"} />
              <stop offset="35%" stopColor={isDark ? "#1D4ED8" : "#3B82F6"} stopOpacity={isDark ? "0.9" : "0.85"} />
              <stop offset="70%" stopColor={isDark ? "#0F172A" : "#1E40AF"} stopOpacity={isDark ? "0.95" : "0.95"} />
              <stop offset="100%" stopColor={isDark ? "#020617" : "#172554"} stopOpacity="1" />
            </radialGradient>

            {/* 2. Globe Outer Atmospheric Rim Glow */}
            <radialGradient id={`globe_rim_${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor={isDark ? "#38BDF8" : "#60A5FA"} stopOpacity="0" />
              <stop offset="96%" stopColor={isDark ? "#38BDF8" : "#0284C7"} stopOpacity={isDark ? "0.75" : "0.6"} />
              <stop offset="100%" stopColor={isDark ? "#67E8F9" : "#38BDF8"} stopOpacity={isDark ? "0.9" : "0.8"} />
            </radialGradient>

            {/* 3. Top-Left Sunlight Specular Glow */}
            <radialGradient id={`sun_highlight_${uid}`} cx="32%" cy="28%" r="42%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? "0.45" : "0.6"} />
              <stop offset="45%" stopColor="#93C5FD" stopOpacity={isDark ? "0.15" : "0.2"} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>

            {/* 4. Core 'N' - Left Vertical Pillar Gradient (Electric Blue / Tech Sapphire) */}
            <linearGradient id={`n_left_grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="25%" stopColor="#38BDF8" />
              <stop offset="70%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>

            {/* 5. Core 'N' - Diagonal Commerce Stream Gradient (Radiant 24K Imperial Gold) */}
            <linearGradient id={`n_diagonal_grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="20%" stopColor="#FDE047" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* 6. Core 'N' - Right Vertical Pillar Gradient (Deep Indigo / Cobalt) */}
            <linearGradient id={`n_right_grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="30%" stopColor="#3B82F6" />
              <stop offset="70%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>

            {/* 7. Orbital Ring 3D Gradient */}
            <linearGradient id={`orbit_ring_grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.3" />
            </linearGradient>

            {/* 8. Glowing Filters */}
            <filter id={`node_glow_${uid}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* 9. 3D Diagonal Ribbon Drop Shadow */}
            <filter id={`ribbon_shadow_${uid}`} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="-2.5" dy="4" stdDeviation="3.5" floodColor="#020617" floodOpacity={isDark ? "0.85" : "0.55"} />
            </filter>

            {/* 10. Globe Shadow underneath entire emblem */}
            <filter id={`globe_depth_shadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor={isDark ? "#000000" : "#0284C7"} floodOpacity={isDark ? "0.6" : "0.25"} />
            </filter>
          </>
        ) : null}
      </defs>

      {/* ======================================================== */}
      {/* 1. 3D GLOBE SPHERE BASE & LIGHTING                      */}
      {/* ======================================================== */}
      <g id={`globe_sphere_body_${uid}`} filter={!monochrome ? `url(#globe_depth_shadow_${uid})` : undefined}>
        {/* The Solid 3D Sphere */}
        <circle
          cx="90"
          cy="90"
          r="66"
          fill={monochrome ? (isDark ? "#1E293B" : "#F1F5F9") : `url(#globe_sphere_${uid})`}
        />

        {/* 3D Atmospheric Rim Edge */}
        {!monochrome && (
          <circle cx="90" cy="90" r="66" fill={`url(#globe_rim_${uid})`} />
        )}

        {/* Top-Left Sunlight Reflection */}
        {!monochrome && (
          <circle cx="90" cy="90" r="66" fill={`url(#sun_highlight_${uid})`} />
        )}
      </g>

      {/* ======================================================== */}
      {/* 2. HIGH-DEFINITION 3D GLOBE GRIDLINES & CONTINENT ARCS   */}
      {/* ======================================================== */}
      <g id={`globe_grid_${uid}`}>
        {/* Equator Line */}
        <ellipse
          cx="90"
          cy="90"
          rx="66"
          ry="17"
          stroke={monochrome ? (isDark ? "#475569" : "#CBD5E1") : "#60A5FA"}
          strokeWidth="1.2"
          strokeOpacity={isDark ? "0.45" : "0.5"}
          fill="none"
        />

        {/* Northern Tropic Line (+30 deg) */}
        <ellipse
          cx="90"
          cy="62"
          rx="58"
          ry="13"
          stroke={monochrome ? (isDark ? "#334155" : "#E2E8F0") : "#93C5FD"}
          strokeWidth="1"
          strokeDasharray="4 3"
          strokeOpacity={isDark ? "0.35" : "0.4"}
          fill="none"
        />

        {/* Southern Tropic Line (-30 deg) */}
        <ellipse
          cx="90"
          cy="118"
          rx="58"
          ry="13"
          stroke={monochrome ? (isDark ? "#334155" : "#E2E8F0") : "#FBBF24"}
          strokeWidth="1"
          strokeDasharray="4 3"
          strokeOpacity={isDark ? "0.35" : "0.4"}
          fill="none"
        />

        {/* Prime Central Meridian */}
        <ellipse
          cx="90"
          cy="90"
          rx="22"
          ry="66"
          stroke={monochrome ? (isDark ? "#475569" : "#CBD5E1") : "#38BDF8"}
          strokeWidth="1.2"
          strokeOpacity={isDark ? "0.4" : "0.45"}
          fill="none"
        />

        {/* Left Meridian */}
        <path
          d="M 90,24 C 54,24 46,90 46,90 C 46,90 54,156 90,156"
          stroke={monochrome ? (isDark ? "#334155" : "#E2E8F0") : "#67E8F9"}
          strokeWidth="1"
          strokeDasharray="5 3"
          strokeOpacity={isDark ? "0.3" : "0.35"}
          fill="none"
        />

        {/* Right Meridian */}
        <path
          d="M 90,24 C 126,24 134,90 134,90 C 134,90 126,156 90,156"
          stroke={monochrome ? (isDark ? "#334155" : "#E2E8F0") : "#60A5FA"}
          strokeWidth="1"
          strokeDasharray="5 3"
          strokeOpacity={isDark ? "0.3" : "0.35"}
          fill="none"
        />

        {/* Global Trade Landmass / Digital Continents Silhouettes */}
        {/* Eurasia / Middle East Trade Hub Silhouette */}
        <path
          d="M 68,54 Q 76,46 88,48 Q 98,42 110,48 Q 116,56 108,66 Q 96,68 84,62 Z"
          fill={monochrome ? (isDark ? "#334155" : "#E2E8F0") : "#38BDF8"}
          fillOpacity={isDark ? "0.2" : "0.25"}
        />
        {/* Africa / Americas Trade Hub Silhouette */}
        <path
          d="M 72,96 Q 84,94 92,102 Q 90,118 78,124 Q 70,116 72,96 Z"
          fill={monochrome ? (isDark ? "#334155" : "#E2E8F0") : "#F59E0B"}
          fillOpacity={isDark ? "0.18" : "0.22"}
        />
      </g>

      {/* ======================================================== */}
      {/* 3. THE ICONIC CORE LETTER 'N' (3D HIGH-CONTRAST IDENTITY)*/}
      {/* ======================================================== */}
      <g id={`core_letter_n_${uid}`}>
        {/* [N: LEFT PILLAR - 3D Sapphire Blue Column] */}
        <path
          d="M 44,38 
             C 53,38 58,43 58,52 
             L 58,128 
             C 58,137 53,142 44,142 
             C 39,142 35,136 35,128 
             L 35,52 
             C 35,44 39,38 44,38 Z"
          fill={monochrome ? (isDark ? "#94A3B8" : "#475569") : `url(#n_left_grad_${uid})`}
        />
        {/* Left Pillar Light Accent Bevel */}
        <path
          d="M 39,48 L 39,132"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity={isDark ? "0.9" : "0.75"}
          fill="none"
        />

        {/* [N: RIGHT PILLAR - 3D Deep Cobalt Blue Column] */}
        <path
          d="M 136,38 
             C 141,38 145,44 145,52 
             L 145,128 
             C 145,136 141,142 136,142 
             C 127,142 122,137 122,128 
             L 122,52 
             C 122,43 127,38 136,38 Z"
          fill={monochrome ? (isDark ? "#64748B" : "#334155") : `url(#n_right_grad_${uid})`}
        />
        {/* Right Pillar Light Accent Bevel */}
        <path
          d="M 141,48 L 141,132"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity={isDark ? "0.9" : "0.75"}
          fill="none"
        />

        {/* [N: DIAGONAL POWER STRIP - 3D Intersecting Imperial Gold Ribbon] */}
        {/* Bold, sweeping from top-left pillar to bottom-right pillar with a drop shadow */}
        <path
          d="M 37,40 
             C 47,35 57,39 64,48 
             L 142,132 
             C 147,138 143,145 135,145 
             C 125,145 117,140 109,130 
             L 36,52 
             C 32,46 32,42 37,40 Z"
          fill={monochrome ? (isDark ? "#F8FAFC" : "#0F172A") : `url(#n_diagonal_grad_${uid})`}
          filter={!monochrome ? `url(#ribbon_shadow_${uid})` : undefined}
        />

        {/* Diagonal Golden Center Specular Beam */}
        <path
          d="M 42,43 L 137,139"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeOpacity={isDark ? "0.95" : "0.9"}
          fill="none"
        />

        {/* High-Speed Gold Laser Tracer */}
        <path
          d="M 50,54 L 126,133"
          stroke="#FEF08A"
          strokeWidth="1.2"
          strokeDasharray="8 5"
          strokeOpacity="0.95"
          fill="none"
        />
      </g>

      {/* ======================================================== */}
      {/* 4. 3D ORBITAL COMMERCE BELT (Wrapping Around the Globe) */}
      {/* ======================================================== */}
      <g id={`globe_orbit_belt_${uid}`}>
        {/* Main 3D Orbit Belt: Sweeps from behind south-west around the globe to north-east */}
        <path
          d="M 16,108 
             C 24,72 74,60 118,74 
             C 148,84 166,102 164,110 
             C 162,118 136,134 94,130 
             C 52,126 18,116 16,108 Z"
          stroke={monochrome ? (isDark ? "#CBD5E1" : "#475569") : `url(#orbit_ring_grad_${uid})`}
          strokeWidth="2.6"
          fill="none"
        />

        {/* Fast Commerce Light Stream Track */}
        <path
          d="M 28,136 
             C 32,114 74,68 122,50 
             C 150,40 164,48 164,56 
             C 164,66 136,100 90,126 
             C 58,144 30,144 28,136 Z"
          stroke={monochrome ? (isDark ? "#94A3B8" : "#64748B") : "#38BDF8"}
          strokeWidth="1.8"
          strokeDasharray="7 4"
          strokeOpacity={isDark ? "0.85" : "0.75"}
          fill="none"
        />

        {/* ======================================================== */}
        {/* 5. LUMINOUS GLOBAL TRADE HUBS & SHOPPING NODES           */}
        {/* ======================================================== */}
        {/* Hub 1: North-West Anchor Node (Global Sourcing) */}
        <circle cx="44" cy="44" r="5" fill="#38BDF8" filter={!monochrome ? `url(#node_glow_${uid})` : undefined} />
        <circle cx="44" cy="44" r="2.5" fill="#FFFFFF" />

        {/* Hub 2: South-East Anchor Node (Smart Delivery) */}
        <circle cx="136" cy="136" r="5" fill="#F59E0B" filter={!monochrome ? `url(#node_glow_${uid})` : undefined} />
        <circle cx="136" cy="136" r="2.5" fill="#FFFFFF" />

        {/* Hub 3: Equatorial Trade Intersection */}
        <circle cx="140" cy="84" r="4" fill="#FBBF24" filter={!monochrome ? `url(#node_glow_${uid})` : undefined} />
        <circle cx="140" cy="84" r="2" fill="#FFFFFF" />

        {/* Hub 4: Western Orbit Gateway */}
        <circle cx="26" cy="108" r="3.5" fill="#67E8F9" />
        <circle cx="26" cy="108" r="1.6" fill="#FFFFFF" />

        {/* Hub 5: Northern Air Express Hub */}
        <circle cx="122" cy="50" r="3.5" fill="#FDE047" />
        <circle cx="122" cy="50" r="1.6" fill="#FFFFFF" />

        {/* Hub 6: Central Core Intersection Starburst */}
        <circle cx="90" cy="90" r="3.8" fill="#FFFFFF" filter={!monochrome ? `url(#node_glow_${uid})` : undefined} />
      </g>
    </svg>
  );
}

/**
 * Universal BrandLogo Component for NOORMEXA
 *
 * Professional E-Commerce Identity:
 * - Ultra-clear 3D Globe with illuminated sphere & aerodynamic 'N' emblem
 * - Refined international typography for "NOORMEXA"
 * - High-end Arabic Slogan: "سوق التجارة والتسوق العالمي الذكي"
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

  // Dimension presets
  const iconConfig = {
    xs: "w-7 h-7",
    sm: "w-8 h-8 sm:w-9 sm:h-9",
    md: "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12",
    lg: "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16",
    xl: "w-16 h-16 sm:w-20 sm:h-20",
    "2xl": "w-20 h-20 sm:w-24 sm:h-24",
    responsive: "w-8.5 h-8.5 xs:w-9.5 xs:h-9.5 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-13 lg:h-13",
  };

  const textSizes = {
    xs: "text-base tracking-[0.05em]",
    sm: "text-lg tracking-[0.06em]",
    md: "text-xl sm:text-2xl md:text-[25px] tracking-[0.06em]",
    lg: "text-2xl sm:text-3xl md:text-4xl tracking-[0.07em]",
    xl: "text-4xl sm:text-5xl tracking-[0.08em]",
    "2xl": "text-5xl sm:text-6xl tracking-[0.08em]",
    responsive: "text-[19px] xs:text-[21px] sm:text-[24px] md:text-[26px] lg:text-[28px] tracking-[0.05em]",
  };

  const subtitleSizes = {
    xs: "text-[8px] tracking-normal",
    sm: "text-[9px] sm:text-[10px] tracking-normal",
    md: "text-[10px] sm:text-[11px] md:text-[12px] tracking-normal",
    lg: "text-[12px] sm:text-[14px] md:text-[15px] tracking-normal",
    xl: "text-[14px] sm:text-[16px] md:text-[18px] tracking-normal",
    "2xl": "text-[16px] sm:text-[18px] md:text-[20px] tracking-normal",
    responsive: "text-[9.5px] xs:text-[10.5px] sm:text-[11.5px] md:text-[12px] lg:text-[12.5px] tracking-normal",
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
      <div className={`inline-flex flex-col items-center justify-center gap-2 select-none shrink-0 ${className}`}>
        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0">
          <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full" />
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <div dir="ltr" className="flex items-center font-black leading-none select-none">
            <span
              className={`font-black ${textSizes[size]} transition-all duration-200 bg-clip-text text-transparent ${
                isDark
                  ? "bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#F59E0B]"
                  : "bg-gradient-to-r from-[#0369A1] via-[#0284C7] to-[#D97706]"
              }`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Segoe UI', Roboto, sans-serif",
                letterSpacing: "2.5px",
              }}
            >
              NOORMEXA
            </span>
          </div>
          {showTagline && (
            <span
              dir="rtl"
              className={`font-bold ${subtitleSizes[size]} mt-1 transition-colors duration-200 ${
                isDark ? "text-amber-400/90" : "text-amber-700/90"
              }`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Cairo', 'Segoe UI', Tahoma, sans-serif",
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
      <div className={`inline-flex items-center gap-2.5 sm:gap-3.5 select-none shrink-0 ${className}`}>
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
              letterSpacing: "2.5px",
            }}
          >
            NOORMEXA
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal Brand Identity (Executive E-Commerce Layout)
  return (
    <div
      className={`inline-flex items-center gap-2.5 xs:gap-3 sm:gap-3.5 select-none shrink-0 transition-transform duration-200 hover:scale-[1.015] ${className}`}
    >
      {/* 3D Global 'N' Emblem */}
      <div className={`${activeIconClass} flex items-center justify-center shrink-0`}>
        <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full" />
      </div>

      {/* Brand Identity: "NOORMEXA" + Arabic Slogan */}
      <div className="flex flex-col justify-center text-start min-w-0">
        <div dir="ltr" className="flex items-center font-black leading-none select-none">
          <span
            className={`font-black ${textSizes[size]} transition-all duration-200 bg-clip-text text-transparent ${
              isDark
                ? "bg-gradient-to-r from-[#38BDF8] via-[#60A5FA] to-[#F59E0B]"
                : "bg-gradient-to-r from-[#0369A1] via-[#0284C7] to-[#D97706]"
            }`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Segoe UI', Roboto, sans-serif",
              letterSpacing: "2.5px",
            }}
          >
            NOORMEXA
          </span>
        </div>

        {showTagline && (
          <span
            dir="rtl"
            className={`font-bold ${subtitleSizes[size]} mt-0.5 sm:mt-1 transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis ${
              isDark ? "text-amber-400/90" : "text-amber-600/95"
            }`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Cairo', 'Segoe UI', Tahoma, sans-serif",
            }}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
