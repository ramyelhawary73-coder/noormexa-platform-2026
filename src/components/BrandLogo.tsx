"use client";

/* eslint-disable @next/next/no-img-element -- SVG master artwork must render pixel-faithfully */
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

const BRAND_ASSETS = {
  light: "/brand/noormexa-logo-light.svg?v=vector-master-1",
  dark: "/brand/noormexa-logo-dark.svg?v=vector-master-1",
  symbol: "/brand/noormexa-mark.svg?v=vector-master-1",
} as const;

const symbolSizes = {
  xs: 28,
  sm: 34,
  md: 42,
  lg: 54,
  xl: 70,
  "2xl": 88,
  responsive: 44,
} as const;

const logoWidths = {
  xs: 132,
  sm: 158,
  md: 190,
  lg: 230,
  xl: 286,
  "2xl": 348,
  responsive: 205,
} as const;

const taglineSizes = {
  xs: "text-[7px]",
  sm: "text-[8px]",
  md: "text-[9px]",
  lg: "text-[10px]",
  xl: "text-[11px]",
  "2xl": "text-[12px]",
  responsive: "text-[9px]",
} as const;

/** Master vector mark. Source is SVG paths, never raster artwork. */
export function NoormexaEmblemSvg({
  size = 44,
  isDark = false,
  className = "",
  monochrome = false,
}: {
  size?: number;
  isDark?: boolean;
  className?: string;
  monochrome?: boolean;
}) {
  return (
    <img
      src={BRAND_ASSETS.symbol}
      width={size}
      height={size}
      alt="NOORMEXA"
      draggable={false}
      className={"select-none object-contain shrink-0 " + className}
      style={{
        width: size,
        height: size,
        filter: monochrome
          ? isDark
            ? "grayscale(1) brightness(2.35)"
            : "grayscale(1) brightness(.24)"
          : undefined,
      }}
    />
  );
}

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
  const resolvedSize = size in symbolSizes ? size : "responsive";
  const symbolSize = symbolSizes[resolvedSize];
  const logoWidth = logoWidths[resolvedSize];
  const logoSrc = isDark ? BRAND_ASSETS.dark : BRAND_ASSETS.light;

  if (variant === "icon" || variant === "symbol" || variant === "pure-svg") {
    return (
      <span
        dir="ltr"
        className={"inline-flex items-center justify-center shrink-0 " + className}
      >
        <NoormexaEmblemSvg
          size={symbolSize}
          isDark={isDark}
          monochrome={monochrome}
          className="transition-transform duration-300 hover:scale-105"
        />
      </span>
    );
  }

  const stacked = variant === "stacked";
  const compact = variant === "compact";
  const wordmarkOnly = variant === "wordmark";
  const badge = variant === "badge";
  const displayWidth = compact ? Math.round(logoWidth * 0.88) : logoWidth;

  const logo = (
    <span
      className={
        "inline-flex flex-col " +
        (stacked ? "items-center " : "items-center ") +
        "justify-center min-w-0"
      }
    >
      <img
        src={logoSrc}
        width={displayWidth}
        height={Math.round(displayWidth * 160 / 870)}
        alt="NOORMEXA"
        draggable={false}
        className="h-auto max-w-full object-contain select-none transition-transform duration-200 hover:scale-[1.01]"
        style={{
          width: displayWidth,
          filter: monochrome
            ? isDark
              ? "grayscale(1) brightness(2.15)"
              : "grayscale(1) brightness(.28)"
            : undefined,
        }}
      />

      {!compact && !wordmarkOnly && showTagline && tagline && (
        <span
          dir="rtl"
          className={
            "mt-0.5 hidden sm:block w-full text-center font-bold whitespace-nowrap leading-none " +
            taglineSizes[resolvedSize] +
            " " +
            (isDark ? "text-[#E7C77C]" : "text-[#95621B]")
          }
          style={{
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Cairo', 'Tajawal', sans-serif",
          }}
        >
          {tagline}
        </span>
      )}
    </span>
  );

  if (wordmarkOnly) {
    return (
      <span className={"inline-flex items-center justify-center " + className}>
        {logo}
      </span>
    );
  }

  if (badge) {
    return (
      <span
        className={
          "inline-flex items-center justify-center rounded-2xl border border-line bg-surface px-3 py-2 shadow-sm " +
          className
        }
      >
        {logo}
      </span>
    );
  }

  return (
    <span
      dir="ltr"
      className={
        "inline-flex " +
        (stacked ? "flex-col " : "flex-row ") +
        "items-center justify-center shrink-0 " +
        className
      }
    >
      {logo}
    </span>
  );
}
