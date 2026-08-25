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
 * NOORMEXA Pure SVG 3D Spherical 'N' Emblem
 * 
 * Technical Design Specification:
 * - A 3D tech-globe sphere where surface lines & ribbon curves specifically FORM THE LETTER 'N'
 * - Left vertical curved line/pillar, 3D diagonal sweep, right vertical curved line/pillar
 * - 3D Sphere gradient: #0d47a1 (top-left) -> #1565c0 -> #1a6dd4 (center) -> #b8922e -> #e6c15a (bottom-right)
 * - Surface technical lines: semi-transparent white (opacity 0.10-0.25), stroke-width 1.2px
 * - Upper-left specular highlight: white radial gradient
 * - Soft drop shadow: #1565c0, opacity 0.25, blur 8-10px
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
      aria-label="NOORMEXA 3D Spherical N Emblem"
    >
      <defs>
        {!monochrome ? (
          <>
            {/* Sphere Body 3D Gradient */}
            <linearGradient id={`sphere_grad_${uid}`} x1="15%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#0d47a1" />
              <stop offset="26%" stopColor="#1565c0" />
              <stop offset="52%" stopColor="#1a6dd4" />
              <stop offset="78%" stopColor="#b8922e" />
              <stop offset="100%" stopColor="#e6c15a" />
            </linearGradient>

            {/* Upper-Left Radial Specular Highlight */}
            <radialGradient id={`highlight_grad_${uid}`} cx="32%" cy="28%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? "0.22" : "0.18"} />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity={isDark ? "0.10" : "0.08"} />
              <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </radialGradient>

            {/* Soft Blue Drop Shadow */}
            <filter id={`shadow_${uid}`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="5"
                stdDeviation="8"
                floodColor="#1565c0"
                floodOpacity={isDark ? "0.45" : "0.25"}
              />
            </filter>

            {/* N Gold Ribbon Gradient */}
            <linearGradient id={`gold_ribbon_${uid}`} x1="20%" y1="15%" x2="90%" y2="90%">
              <stop offset="0%" stopColor={isDark ? "#FFF0C4" : "#FCEAB2"} />
              <stop offset="35%" stopColor={isDark ? "#F3D072" : "#E5C15E"} />
              <stop offset="70%" stopColor={isDark ? "#D4A745" : "#C29738"} />
              <stop offset="100%" stopColor={isDark ? "#A57920" : "#916817"} />
            </linearGradient>

            {/* N Blue Ribbon Gradient */}
            <linearGradient id={`blue_ribbon_${uid}`} x1="10%" y1="10%" x2="80%" y2="85%">
              <stop offset="0%" stopColor={isDark ? "#69B4FF" : "#54A5FF"} />
              <stop offset="40%" stopColor={isDark ? "#2D8BFA" : "#1E7BE8"} />
              <stop offset="75%" stopColor={isDark ? "#196BCB" : "#125BB5"} />
              <stop offset="100%" stopColor={isDark ? "#0C448F" : "#083677"} />
            </linearGradient>

            <clipPath id={`clip_${uid}`}>
              <circle cx="80" cy="80" r="58" />
            </clipPath>
          </>
        ) : (
          <clipPath id={`clip_${uid}`}>
            <circle cx="80" cy="80" r="58" />
          </clipPath>
        )}
      </defs>

      <g id={`emblem_group_${uid}`} filter={!monochrome ? `url(#shadow_${uid})` : undefined}>
        {/* 1. 3D Sphere Base */}
        <circle
          cx="80"
          cy="80"
          r="58"
          fill={monochrome ? (isDark ? "#1E293B" : "#0F172A") : `url(#sphere_grad_${uid})`}
        />

        {/* 2. Spherical Ambient Highlight */}
        {!monochrome && (
          <circle cx="80" cy="80" r="58" fill={`url(#highlight_grad_${uid})`} />
        )}

        {/* 3. Technical Surface Lines & 'N' Geometry (Clipped to Sphere) */}
        <g clipPath={`url(#clip_${uid})`}>
          {/* Background Technical Latitude & Longitude Arcs (Globe Grid) */}
          <path d="M 22,80 Q 80,62 138,80" stroke="#FFFFFF" strokeOpacity={isDark ? "0.18" : "0.14"} strokeWidth="1.2" fill="none" />
          <path d="M 27,55 Q 80,40 133,55" stroke="#FFFFFF" strokeOpacity={isDark ? "0.14" : "0.12"} strokeWidth="1.2" fill="none" />
          <path d="M 27,105 Q 80,120 133,105" stroke="#FFFFFF" strokeOpacity={isDark ? "0.14" : "0.12"} strokeWidth="1.2" fill="none" />
          <path d="M 80,22 Q 62,80 80,138" stroke="#FFFFFF" strokeOpacity={isDark ? "0.14" : "0.12"} strokeWidth="1.2" fill="none" />

          {/* Network Nodes */}
          <circle cx="48" cy="55" r="2" fill="#FFFFFF" fillOpacity="0.35" />
          <circle cx="112" cy="105" r="2" fill="#FFFFFF" fillOpacity="0.35" />
          <circle cx="80" cy="80" r="2.5" fill="#FFFFFF" fillOpacity="0.4" />

          {/* ======================================================== */}
          {/* THE LETTER 'N' WRAPPED IN 3D SPHERICAL SHAPE             */}
          {/* ======================================================== */}

          {/* [N - Left Pillar] Curved 3D Vertical Band */}
          <path
            d="M 44,38 
               C 36,52 32,68 32,84 
               C 32,100 37,114 45,124 
               C 49,129 55,126 55,120 
               C 49,110 45,98 45,84 
               C 45,69 49,56 55,44 
               C 56,40 50,35 44,38 Z"
            fill={monochrome ? (isDark ? "#94A3B8" : "#475569") : `url(#blue_ribbon_${uid})`}
          />
          <path
            d="M 44,38 C 36,54 32,69 32,84 C 32,100 37,114 45,124"
            stroke="#FFFFFF"
            strokeOpacity={isDark ? "0.35" : "0.25"}
            strokeWidth="1.2"
            fill="none"
          />

          {/* [N - Right Pillar] Curved 3D Vertical Band */}
          <path
            d="M 105,38 
               C 111,50 115,66 115,82 
               C 115,98 111,112 105,124 
               C 103,128 108,132 113,128 
               C 122,116 128,100 128,82 
               C 128,64 122,48 113,36 
               C 108,32 103,35 105,38 Z"
            fill={monochrome ? (isDark ? "#E2E8F0" : "#94A3B8") : `url(#gold_ribbon_${uid})`}
          />
          <path
            d="M 113,36 C 122,48 128,64 128,82 C 128,100 122,116 113,128"
            stroke="#FFFFFF"
            strokeOpacity={isDark ? "0.4" : "0.3"}
            strokeWidth="1.2"
            fill="none"
          />

          {/* [N - Diagonal Stroke] Dynamic 3D Spherical Ribbon (Top-Left to Bottom-Right) */}
          <path
            d="M 44,38 
               C 54,34 66,40 76,52 
               L 115,116 
               C 120,124 116,130 108,130 
               C 100,130 92,122 84,110 
               L 46,48 
               C 42,42 42,39 44,38 Z"
            fill={monochrome ? (isDark ? "#94A3B8" : "#475569") : `url(#blue_ribbon_${uid})`}
            opacity="0.85"
          />
          
          {/* Primary Foreground 3D Gold Diagonal */}
          <path
            d="M 50,34 
               C 62,30 76,36 88,50 
               L 122,114 
               C 128,124 124,132 114,132 
               C 106,132 98,124 88,110 
               L 54,46 
               C 48,38 46,35 50,34 Z"
            fill={monochrome ? (isDark ? "#F8FAFC" : "#CBD5E1") : `url(#gold_ribbon_${uid})`}
          />

          {/* Precise Surface Technical Tracing Lines (1.2px) forming the N */}
          <path
            d="M 50,34 L 122,114"
            stroke="#FFFFFF"
            strokeOpacity={isDark ? "0.3" : "0.22"}
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 54,46 L 88,110"
            stroke="#FFFFFF"
            strokeOpacity={isDark ? "0.2" : "0.14"}
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 33,84 L 127,84"
            stroke="#FFFFFF"
            strokeOpacity={isDark ? "0.16" : "0.12"}
            strokeWidth="1.2"
            strokeDasharray="3 3"
            fill="none"
          />

          {/* Diagonal Specular Sheen */}
          <path
            d="M 58,38 C 66,34 78,40 86,52 L 118,112 C 122,118 118,124 112,124 L 58,38 Z"
            fill="#FFFFFF"
            fillOpacity={isDark ? "0.25" : "0.2"}
          />
        </g>

        {/* Outer Sphere Thin Technical Rim */}
        <circle
          cx="80"
          cy="80"
          r="58"
          stroke="#FFFFFF"
          strokeOpacity={isDark ? "0.2" : "0.15"}
          strokeWidth="1.2"
          fill="none"
        />
      </g>
    </svg>
  );
}

/**
 * Universal BrandLogo component for NOORMEXA
 * 
 * Features:
 * - Pure SVG Vector rendering
 * - 3D Sphere wrapped with technical lines that form the letter "N"
 * - Gradient: #0d47a1 -> #1565c0 -> #1a6dd4 -> #b8922e -> #e6c15a
 * - Text: "NOORMEXA" in sans-serif, weight 900, letter-spacing: 3px
 *   Text gradient: #1565c0 -> #4a90d9 -> #c8a24d
 * - Subtitle: "GLOBAL SMART SHOPPING" in gray (#7a7a8e), letter-spacing: 5px, weight 400
 * - Scales seamlessly from 16px to 300px+
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

  // Pre-configured dimensions
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
    xs: "text-[7.5px] tracking-[0.2em]",
    sm: "text-[8.5px] sm:text-[9.5px] tracking-[0.22em]",
    md: "text-[9.5px] sm:text-[10.5px] md:text-[11.5px] tracking-[0.25em]",
    lg: "text-[11px] sm:text-[13px] md:text-[15px] tracking-[0.28em]",
    xl: "text-[13px] sm:text-[15px] md:text-[17px] tracking-[0.3em]",
    "2xl": "text-[15px] sm:text-[18px] md:text-[20px] tracking-[0.32em]",
    responsive: "text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] tracking-[0.25em]",
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
      <div dir="ltr" className={`inline-flex flex-col items-center justify-center gap-2 sm:gap-2.5 select-none shrink-0 ${className}`}>
        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0">
          <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full" />
        </div>
        <div dir="ltr" className="flex flex-col items-center justify-center text-center">
          <div dir="ltr" className="flex items-center font-black leading-none select-none">
            <span
              className={`font-black ${textSizes[size]} transition-all duration-200 bg-clip-text text-transparent ${
                isDark
                  ? "bg-gradient-to-r from-[#4AA8FF] via-[#80C3FF] to-[#E5C15E]"
                  : "bg-gradient-to-r from-[#1565c0] via-[#4a90d9] to-[#c8a24d]"
              }`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                letterSpacing: "3px",
              }}
            >
              NOORMEXA
            </span>
          </div>
          {showTagline && (
            <span
              className={`font-normal uppercase ${subtitleSizes[size]} mt-1 transition-colors duration-200 ${
                isDark ? "text-slate-400" : "text-[#7a7a8e]"
              }`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                ? "bg-gradient-to-r from-[#4AA8FF] via-[#80C3FF] to-[#E5C15E]"
                : "bg-gradient-to-r from-[#1565c0] via-[#4a90d9] to-[#c8a24d]"
            }`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              letterSpacing: "3px",
            }}
          >
            NOORMEXA
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal Brand Identity (Gap: 20-24px, 3D Spherical N Icon + Gradient Typography + Subtitle)
  return (
    <div
      dir="ltr"
      className={`inline-flex items-center gap-2.5 xs:gap-3 sm:gap-3.5 md:gap-4 select-none shrink-0 transition-transform duration-200 hover:scale-[1.01] ${className}`}
    >
      {/* 3D Spherical 'N' Emblem */}
      <div className={`${activeIconClass} flex items-center justify-center shrink-0`}>
        <NoormexaEmblemSvg isDark={isDark} monochrome={monochrome} className="w-full h-full" />
      </div>

      {/* Typography: "NOORMEXA" with gradient + "GLOBAL SMART SHOPPING" */}
      <div dir="ltr" className="flex flex-col justify-center text-left min-w-0">
        <div dir="ltr" className="flex items-center font-black leading-none select-none">
          <span
            className={`font-black ${textSizes[size]} transition-all duration-200 bg-clip-text text-transparent ${
              isDark
                ? "bg-gradient-to-r from-[#4AA8FF] via-[#80C3FF] to-[#E5C15E]"
                : "bg-gradient-to-r from-[#1565c0] via-[#4a90d9] to-[#c8a24d]"
            }`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              letterSpacing: "3px",
            }}
          >
            NOORMEXA
          </span>
        </div>

        {showTagline && (
          <span
            className={`font-normal uppercase ${subtitleSizes[size]} mt-0.5 sm:mt-1 transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis ${
              isDark ? "text-slate-400" : "text-[#7a7a8e]"
            }`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
