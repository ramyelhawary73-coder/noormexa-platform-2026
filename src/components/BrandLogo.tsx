"use client";

/* eslint-disable @next/next/no-img-element -- approved master artwork must render pixel-faithfully */
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
  headerLight: "/brand/noormexa-header-light-exact.svg?v=signature-ray-1",
  headerDark: "/brand/noormexa-header-dark-exact.svg?v=signature-ray-1",
  symbol: "/brand/noormexa-symbol.webp?v=master-artwork-4",
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

const headerWidths = {
  xs: 118,
  sm: 146,
  md: 176,
  lg: 214,
  xl: 262,
  "2xl": 322,
  responsive: 230,
} as const;

/**
 * Symbol-only usage inside the website stays container-free.
 * The installed-app artwork is handled separately by the PWA icon pipeline.
 */
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
    <span
      className={"inline-flex items-center justify-center shrink-0 overflow-visible " + className}
      style={{ width: size, height: size }}
      aria-label="NOORMEXA"
      role="img"
    >
      <img
        src={BRAND_ASSETS.symbol}
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="select-none object-contain shrink-0"
        style={{
          width: size,
          height: size,
          transform: "scale(1.26)",
          transformOrigin: "center",
          filter: monochrome
            ? isDark
              ? "grayscale(1) brightness(2.25)"
              : "grayscale(1) brightness(.28)"
            : undefined,
        }}
      />
    </span>
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

  // Preserve the existing clean symbol-only website usage. App/PWA icon uses
  // the separately approved exact app artwork.
  if (variant === "icon" || variant === "symbol" || variant === "pure-svg") {
    return (
      <span
        dir="ltr"
        className={"inline-flex items-center justify-center shrink-0 overflow-visible " + className}
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

  // The approved artwork already contains the exact NOORMEXA wordmark,
  // signature light ray, and Arabic brand line from the chosen master board.
  void showTagline;
  void tagline;

  const width = headerWidths[resolvedSize];
  const src = isDark ? BRAND_ASSETS.headerDark : BRAND_ASSETS.headerLight;
  const image = (
    <img
      src={src}
      width={width}
      height={Math.round(width * 110 / 430)}
      alt="NOORMEXA"
      draggable={false}
      className="block h-auto max-w-full select-none object-contain"
      style={{
        width,
        filter: monochrome
          ? isDark
            ? "grayscale(1) brightness(2.15)"
            : "grayscale(1) brightness(.30)"
          : undefined,
      }}
    />
  );

  if (variant === "badge") {
    return (
      <span
        className={
          "inline-flex items-center justify-center rounded-2xl border border-line bg-surface px-3 py-2 shadow-sm " +
          className
        }
      >
        {image}
      </span>
    );
  }

  return (
    <span
      dir="ltr"
      className={"inline-flex items-center justify-center shrink-0 " + className}
    >
      {image}
    </span>
  );
}
