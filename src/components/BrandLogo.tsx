"use client";

/* eslint-disable @next/next/no-img-element -- approved brand artwork must render pixel-faithfully */
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
  light: "/brand/noormexa-logo-light.webp",
  dark: "/brand/noormexa-logo-dark.webp",
  symbol: "/brand/noormexa-symbol.webp",
} as const;

const symbolSizes = {
  xs: 28, sm: 34, md: 42, lg: 54, xl: 70, "2xl": 88, responsive: 44,
} as const;

const logoWidths = {
  xs: 112, sm: 138, md: 166, lg: 205, xl: 260, "2xl": 320, responsive: 178,
} as const;

/** Compatibility export: now renders the approved Master Artwork directly. */
export function NoormexaEmblemSvg({
  size = 44, isDark = false, className = "", monochrome = false,
}: {
  size?: number; isDark?: boolean; className?: string; monochrome?: boolean;
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
            ? "grayscale(1) brightness(2.25)"
            : "grayscale(1) brightness(.28)"
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
  const symbolSize = symbolSizes[size] ?? symbolSizes.responsive;
  const logoWidth = logoWidths[size] ?? logoWidths.responsive;
  const logoSrc = isDark ? BRAND_ASSETS.dark : BRAND_ASSETS.light;

  if (variant === "icon" || variant === "symbol" || variant === "pure-svg") {
    return (
      <span dir="ltr" className={"inline-flex items-center justify-center shrink-0 " + className}>
        <NoormexaEmblemSvg
          size={symbolSize}
          isDark={isDark}
          monochrome={monochrome}
          className="transition-transform duration-300 hover:scale-105"
        />
      </span>
    );
  }

  if (variant === "badge") {
    return (
      <span dir="ltr" className={"inline-flex items-center justify-center rounded-2xl border border-line bg-surface px-3 py-2 shadow-sm " + className}>
        <img
          src={logoSrc}
          width={150}
          height={58}
          alt="NOORMEXA"
          draggable={false}
          className="h-auto w-[150px] max-w-full object-contain"
          style={{ filter: monochrome ? (isDark ? "grayscale(1) brightness(2.1)" : "grayscale(1) brightness(.3)") : undefined }}
        />
      </span>
    );
  }

  const stacked = variant === "stacked";
  const compact = variant === "compact";
  const wordmark = variant === "wordmark";
  const outerClass = "inline-flex " + (stacked ? "flex-col " : "flex-row ") + "items-center justify-center select-none shrink-0 " + className;
  const innerClass = "inline-flex flex-col " + (stacked ? "items-center " : "items-start ") + "justify-center min-w-0";
  const taglineClass = "mt-0.5 hidden sm:block w-full text-center font-bold whitespace-nowrap " +
    ((size === "lg" || size === "xl" || size === "2xl") ? "text-[11px] " : "text-[9px] ") +
    (isDark ? "text-[#E7C77C]" : "text-[#95621B]");

  return (
    <span className={outerClass}>
      <span className={innerClass}>
        <img
          src={logoSrc}
          width={logoWidth}
          height={Math.max(34, Math.round(logoWidth * 0.194))}
          alt="NOORMEXA"
          draggable={false}
          className="h-auto max-w-full object-contain transition-transform duration-200 hover:scale-[1.01]"
          style={{
            width: compact ? Math.round(logoWidth * 0.9) : logoWidth,
            filter: monochrome ? (isDark ? "grayscale(1) brightness(2.1)" : "grayscale(1) brightness(.3)") : undefined,
          }}
        />
        {!compact && !wordmark && showTagline && tagline && (
          <span
            dir="rtl"
            className={taglineClass}
            style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Cairo', 'Tajawal', sans-serif" }}
          >
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}
