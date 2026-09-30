"use client";

/* eslint-disable @next/next/no-img-element -- approved master artwork must render pixel-faithfully */
import React, { useId } from "react";
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
  headerLight: "/brand/noormexa-header-light-exact.svg?v=signature-ray-5",
  headerDark: "/brand/noormexa-header-dark-exact.svg?v=signature-ray-5",
  // Known-good existing website symbol. Keep it unscaled so constrained cards
  // cannot clip it. PWA/app artwork remains separate and unchanged.
  symbolLight: "/brand/noormexa-symbol-light-crop.webp?v=signature-ray-5",
  symbolDark: "/brand/noormexa-symbol-dark-crop.webp?v=signature-ray-5",
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

function SignatureRay({ isDark }: { isDark: boolean }) {
  const uid = useId().replace(/:/g, "");
  const glowId = "noormexa-ray-glow-" + uid;
  const beamId = "noormexa-ray-beam-" + uid;
  const blurId = "noormexa-ray-blur-" + uid;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 430 110"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFDF0" stopOpacity="1" />
          <stop offset="18%" stopColor="#FFF0A8" stopOpacity=".88" />
          <stop offset="48%" stopColor="#F4B52F" stopOpacity=".32" />
          <stop offset="100%" stopColor="#F4B52F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={beamId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#F2A919" stopOpacity="0" />
          <stop offset="42%" stopColor="#F8C84E" stopOpacity=".28" />
          <stop offset="82%" stopColor="#FFF2B5" stopOpacity=".70" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity=".90" />
        </linearGradient>
        <filter id={blurId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
      </defs>

      <circle
        cx="99"
        cy="20"
        r="19"
        fill={"url(#" + glowId + ")"}
        opacity={isDark ? ".70" : ".48"}
        filter={"url(#" + blurId + ")"}
      />
      <circle
        cx="99"
        cy="20"
        r="8"
        fill={"url(#" + glowId + ")"}
        opacity={isDark ? ".92" : ".74"}
      />
      <path
        d="M99 20 L158 -20"
        stroke={"url(#" + beamId + ")"}
        strokeWidth="8"
        strokeLinecap="round"
        opacity={isDark ? ".26" : ".17"}
        filter={"url(#" + blurId + ")"}
      />
      <path
        d="M99 20 L154 -18"
        stroke={"url(#" + beamId + ")"}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity={isDark ? ".82" : ".60"}
      />
      <path
        d="M77 20 H124 M99 -3 V42"
        stroke="#FFF1B1"
        strokeWidth=".95"
        strokeLinecap="round"
        opacity={isDark ? ".58" : ".40"}
      />
      <circle cx="99" cy="20" r="2.4" fill="#FFFFFF" opacity=".96" />
    </svg>
  );
}

/**
 * Small website symbol usage. This intentionally uses a known-good asset and
 * never applies transform/scale, preventing clipping or broken-image fallbacks
 * inside constrained store cards.
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
        src={isDark ? BRAND_ASSETS.symbolDark : BRAND_ASSETS.symbolLight}
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="block max-h-full max-w-full select-none object-contain shrink-0"
        style={{
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

function BalancedHeaderArtwork({
  src,
  width,
  isDark,
  monochrome,
}: {
  src: string;
  width: number;
  isDark: boolean;
  monochrome: boolean;
}) {
  const height = Math.round(width * 110 / 430);
  const artworkFilter = monochrome
    ? isDark
      ? "grayscale(1) brightness(2.15)"
      : "grayscale(1) brightness(.30)"
    : undefined;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-visible"
      style={{ width, height }}
    >
      {/* Base master keeps the approved NOORMEXA wordmark and Arabic line. */}
      <img
        src={src}
        width={width}
        height={height}
        alt="NOORMEXA"
        draggable={false}
        className="block h-full w-full select-none object-contain"
        style={{ filter: artworkFilter }}
      />

      {!monochrome && (
        <>
          {/* Hide only the original oversized N. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-full"
            style={{
              width: "32%",
              background: isDark ? "#07101d" : "#fafcfe",
            }}
          />

          {/* Re-use the exact same artwork as a sprite, but reduce only the N. */}
          <img
            src={src}
            width={width}
            height={height}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute left-0 top-0 h-full w-full select-none object-contain"
            style={{
              clipPath: "inset(0 68% 0 0)",
              transform: "translateX(4%) scale(.80)",
              transformOrigin: "left center",
            }}
          />

          <SignatureRay isDark={isDark} />
        </>
      )}
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

  void showTagline;
  void tagline;

  const width = headerWidths[resolvedSize];
  const src = isDark ? BRAND_ASSETS.headerDark : BRAND_ASSETS.headerLight;

  const image = (
    <BalancedHeaderArtwork
      src={src}
      width={width}
      isDark={isDark}
      monochrome={monochrome}
    />
  );

  if (variant === "badge") {
    return (
      <span
        className={
          "inline-flex items-center justify-center overflow-visible rounded-2xl border border-line bg-surface px-3 py-2 shadow-sm " +
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
      className={"inline-flex items-center justify-center shrink-0 overflow-visible " + className}
    >
      {image}
    </span>
  );
}
