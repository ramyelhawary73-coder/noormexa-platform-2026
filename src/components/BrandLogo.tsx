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

const wordmarkSizes = {
  xs: "text-[16px]",
  sm: "text-[19px]",
  md: "text-[23px]",
  lg: "text-[28px]",
  xl: "text-[34px]",
  "2xl": "text-[42px]",
  responsive: "text-[24px]",
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

/**
 * Approved NOORMEXA master symbol.
 *
 * The source artwork contains a little transparent breathing room by design.
 * We enlarge only the rendered mark inside its layout box so small UI usages
 * stay optically strong without re-editing or clipping the source pixels.
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

function Wordmark({
  size,
  isDark,
  monochrome,
}: {
  size: keyof typeof wordmarkSizes;
  isDark: boolean;
  monochrome: boolean;
}) {
  const neutral = isDark ? "text-white" : "text-[#0B1F33]";
  const mono = monochrome ? neutral : "";

  return (
    <span
      dir="ltr"
      className={
        "inline-flex items-baseline font-black leading-none whitespace-nowrap tracking-[0.085em] " +
        wordmarkSizes[size]
      }
      style={{
        fontFamily: "'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
      aria-label="NOORMEXA"
    >
      <span className={mono || neutral}>NOOR</span>
      <span
        className={
          mono ||
          "bg-gradient-to-b from-[#FFF0B6] via-[#E0AA42] to-[#A76414] bg-clip-text text-transparent"
        }
      >
        MEXA
      </span>
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

  const stacked = variant === "stacked";
  const compact = variant === "compact";
  const wordmarkOnly = variant === "wordmark";
  const badge = variant === "badge";

  const taglineClass =
    "mt-1 hidden sm:block w-full text-center font-bold whitespace-nowrap leading-none " +
    taglineSizes[resolvedSize] +
    " " +
    (isDark ? "text-[#E7C77C]" : "text-[#95621B]");

  const lockup = (
    <span
      dir="ltr"
      className={
        "inline-flex " +
        (stacked ? "flex-col gap-1.5 " : "flex-row gap-2.5 ") +
        "items-center justify-center select-none shrink-0 overflow-visible"
      }
    >
      {!wordmarkOnly && (
        <NoormexaEmblemSvg
          size={compact ? Math.round(symbolSize * 0.9) : symbolSize}
          isDark={isDark}
          monochrome={monochrome}
        />
      )}

      <span className="inline-flex flex-col items-center justify-center min-w-0">
        <Wordmark size={resolvedSize} isDark={isDark} monochrome={monochrome} />
        {!compact && !wordmarkOnly && showTagline && tagline && (
          <span
            dir="rtl"
            className={taglineClass}
            style={{
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Cairo', 'Tajawal', sans-serif",
            }}
          >
            {tagline}
          </span>
        )}
      </span>
    </span>
  );

  if (badge) {
    return (
      <span
        className={
          "inline-flex items-center justify-center rounded-2xl border border-line bg-surface px-3 py-2 shadow-sm " +
          className
        }
      >
        {lockup}
      </span>
    );
  }

  return <span className={"inline-flex items-center justify-center " + className}>{lockup}</span>;
}
