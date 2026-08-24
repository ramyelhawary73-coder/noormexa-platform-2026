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
 * World-Class NOORMEXA Brand Mark (SVG Vector)
 * 
 * Mathematical Geometry:
 * - Interlocking geometric continuous loops representing "N" (Noor/Light) & "X" (Mexa/Exchange).
 * - Dual-tone global commerce gradient: Electric Sapphire (#2563EB) & Solar Coral (#F97316).
 * - Center Nexus Light Spark (#FFFFFF / #F97316).
 * - 100% vector SVG, infinite scalability, crystal-sharp in favicon, app icons, desktop and mobile.
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
            {/* Primary Pillar Gradient (Electric Sapphire to Royal Azure) */}
            <linearGradient id={`p1_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="40%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* Dynamic Bridge Gradient (Solar Amber to Coral Radiance) */}
            <linearGradient id={`p2_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>

            {/* Core Intersection Highlight */}
            <linearGradient id={`cross_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>
          </>
        ) : null}
      </defs>

      <g transform="translate(0, 0)">
        {/* 1. Left Upward Arch Pillar (Forming N anchor) */}
        <path
          d="M 21,80 L 21,32 C 21,20 30,12 42,12 C 49,12 55,16 58,22 C 55,27 49,30 42,30 C 37,30 33,34 33,39 L 33,80 Z"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#0F172A") : `url(#p1_${uid})`}
        />

        {/* 2. Central Dynamic Crossing Bridge (Forms N & X - The Nexus Exchange) */}
        <path
          d="M 26,20 L 74,80 C 78,85 85,85 88,80 C 91,75 88,68 83,62 L 35,2 C 30,-3 23,-3 20,2 C 17,7 20,14 26,20 Z"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#0F172A") : `url(#p2_${uid})`}
        />

        {/* 3. Right Downward Arch Pillar (Completing the N/M symmetry) */}
        <path
          d="M 79,20 L 79,68 C 79,80 70,88 58,88 C 51,88 45,84 42,78 C 45,73 51,70 58,70 C 63,70 67,66 67,61 L 67,20 Z"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#0F172A") : `url(#p1_${uid})`}
        />

        {/* 4. Core Light Fusion Spark (The Noor Beacon) */}
        <circle
          cx="50"
          cy="50"
          r="6"
          fill={monochrome ? (isDark ? "#0F172A" : "#FFFFFF") : "#FFFFFF"}
        />
        <circle
          cx="50"
          cy="50"
          r="3.5"
          fill={monochrome ? (isDark ? "#FFFFFF" : "#0F172A") : "#F97316"}
        />
      </g>
    </svg>
  );
}

/**
 * Pure Vector Typography Wordmark for NOORMEXA (Uppercased, Geometric, Modern)
 */
export function NoormexaWordmarkSvg({
  width = 140,
  isDark = true,
  className = "",
}: {
  width?: number;
  isDark?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "_");
  const primaryColor = isDark ? "#FFFFFF" : "#0F172A";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 40"
      width={width}
      height={width * (40 / 280)}
      fill="none"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      className={`shrink-0 select-none ${className}`}
      aria-label="NOORMEXA"
    >
      <defs>
        <linearGradient id={`wm_grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="60%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>

      {/* NOOR (Bold Solid Titanium) */}
      <g fill={primaryColor}>
        {/* N */}
        <path d="M 10,6 L 19,6 L 38,30 L 38,6 L 46,6 L 46,34 L 37,34 L 18,10 L 18,34 L 10,34 Z" />

        {/* O (1) */}
        <path
          fillRule="evenodd"
          d="M 64,6 C 74,6 80,12 80,20 C 80,28 74,34 64,34 C 54,34 48,28 48,20 C 48,12 54,6 64,6 Z M 64,13 C 58,13 55,16 55,20 C 55,24 58,27 64,27 C 70,27 73,24 73,20 C 73,16 70,13 64,13 Z"
        />

        {/* O (2) */}
        <path
          fillRule="evenodd"
          d="M 98,6 C 108,6 114,12 114,20 C 114,28 108,34 98,34 C 88,34 82,28 82,20 C 82,12 88,6 98,6 Z M 98,13 C 92,13 89,16 89,20 C 89,24 92,27 98,27 C 104,27 107,24 107,20 C 107,16 104,13 98,13 Z"
        />

        {/* R */}
        <path
          fillRule="evenodd"
          d="M 120,6 L 138,6 C 145,6 149,9 149,15 C 149,19.5 146,22.5 141,23.5 L 150,34 L 140,34 L 132,24 L 127.5,24 L 127.5,34 L 120,34 Z M 127.5,12.5 L 137,12.5 C 140,12.5 141.5,13.5 141.5,15.5 C 141.5,17.5 140,18.5 137,18.5 L 127.5,18.5 Z"
        />
      </g>

      {/* MEXA (Vibrant Gradient / Tech Energy Accent) */}
      <g fill={`url(#wm_grad_${uid})`}>
        {/* M */}
        <path d="M 156,6 L 165,6 L 174,21 L 183,6 L 192,6 L 192,34 L 184.5,34 L 184.5,14 L 176.5,26.5 L 171.5,26.5 L 163.5,14 L 163.5,34 L 156,34 Z" />

        {/* E */}
        <path d="M 199,6 L 221,6 L 221,12.5 L 206.5,12.5 L 206.5,17 L 219,17 L 219,23 L 206.5,23 L 206.5,27.5 L 221,27.5 L 221,34 L 199,34 Z" />

        {/* X */}
        <path d="M 226,6 L 235,6 L 243.5,18 L 252,6 L 261,6 L 249,20 L 261.5,34 L 252.5,34 L 243.5,21.5 L 234.5,34 L 225.5,34 L 238,20 Z" />

        {/* A */}
        <path
          fillRule="evenodd"
          d="M 271,6 L 279,6 L 291,34 L 283,34 L 280.5,27.5 L 269.5,27.5 L 267,34 L 259,34 Z M 271.5,22 L 278.5,22 L 275,13 Z"
        />
      </g>
    </svg>
  );
}

/**
 * Universal BrandLogo component used across all headers, footers, and dashboards
 */
export default function BrandLogo({
  size = "md",
  className = "",
  variant = "horizontal",
  showTagline = false,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Size specifications
  const iconSizes = {
    xs: 24,
    sm: 30,
    md: 38,
    lg: 46,
    xl: 56,
    "2xl": 72,
  };

  const wordmarkWidths = {
    xs: 95,
    sm: 115,
    md: 135,
    lg: 160,
    xl: 195,
    "2xl": 240,
  };

  const currentIconSize = iconSizes[size] || 38;
  const currentWordmarkWidth = wordmarkWidths[size] || 135;

  if (variant === "icon" || variant === "symbol") {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <NoormexaEmblemSvg size={currentIconSize} isDark={isDark} />
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <NoormexaWordmarkSvg width={currentWordmarkWidth} isDark={isDark} />
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={`inline-flex flex-col items-center justify-center gap-2 select-none shrink-0 ${className}`}>
        <NoormexaEmblemSvg size={currentIconSize * 1.3} isDark={isDark} />
        <NoormexaWordmarkSvg width={currentWordmarkWidth} isDark={isDark} />
        {showTagline && (
          <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase">
            التسوق الذكي
          </span>
        )}
      </div>
    );
  }

  // Default: Horizontal Brand Identity (Icon + NOORMEXA)
  return (
    <div
      className={`inline-flex items-center gap-2.5 sm:gap-3 select-none shrink-0 transition-opacity hover:opacity-95 ${className}`}
    >
      {/* Brand Icon Mark */}
      <div className="relative flex items-center justify-center shrink-0">
        <NoormexaEmblemSvg size={currentIconSize} isDark={isDark} />
      </div>

      {/* Brand Wordmark & Tagline */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center font-black leading-none font-sans">
          <span
            className={`font-black text-lg sm:text-xl transition-colors tracking-wider ${
              isDark ? "text-white" : "text-slate-950"
            }`}
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            NOOR
          </span>
          <span
            className="font-black text-lg sm:text-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent tracking-wider"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            MEXA
          </span>
        </div>

        {showTagline ? (
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            التسوق الذكي
          </span>
        ) : null}
      </div>
    </div>
  );
}
