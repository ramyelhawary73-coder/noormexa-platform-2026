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
  headerLight: "/brand/noormexa-header-light-exact.svg?v=signature-ray-2",
  headerDark: "/brand/noormexa-header-dark-exact.svg?v=signature-ray-2",
  symbol: "/brand/noormexa-symbol-exact.svg?v=signature-ray-2",
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
          <stop offset="18%" stopColor="#FFF0A8" stopOpacity=".92" />
          <stop offset="48%" stopColor="#F4B52F" stopOpacity=".38" />
          <stop offset="100%" stopColor="#F4B52F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={beamId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#F2A919" stopOpacity="0" />
          <stop offset="42%" stopColor="#F8C84E" stopOpacity=".32" />
          <stop offset="82%" stopColor="#FFF2B5" stopOpacity=".76" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity=".94" />
        </linearGradient>
        <filter id={blurId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5.5" />
        </filter>
      </defs>

      {/* Ambient halo at the top-right edge of the N */}
      <circle
        cx="111"
        cy="15"
        r="24"
        fill={"url(#" + glowId + ")"}
        opacity={isDark ? ".78" : ".58"}
        filter={"url(#" + blurId + ")"}
      />
      <circle
        cx="111"
        cy="15"
        r="10"
        fill={"url(#" + glowId + ")"}
        opacity={isDark ? ".96" : ".82"}
      />

      {/* Long premium diagonal light beam - the NOOR signature */}
      <path
        d="M111 15 L190 -38"
        stroke={"url(#" + beamId + ")"}
        strokeWidth="10"
        strokeLinecap="round"
        opacity={isDark ? ".30" : ".20"}
        filter={"url(#" + blurId + ")"}
      />
      <path
        d="M111 15 L184 -34"
        stroke={"url(#" + beamId + ")"}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity={isDark ? ".92" : ".72"}
      />

      {/* Restrained starburst so the ray reads as light, not a decorative sparkle */}
      <path
        d="M79 15 H151 M111 -14 V44"
        stroke="#FFF1B1"
        strokeWidth="1.15"
        strokeLinecap="round"
        opacity={isDark ? ".70" : ".50"}
      />
      <path
        d="M91 35 L131 -5 M92 -5 L130 33"
        stroke="#F8C64E"
        strokeWidth=".8"
        strokeLinecap="round"
        opacity={isDark ? ".42" : ".30"}
      />
      <circle cx="111" cy="15" r="2.8" fill="#FFFFFF" opacity=".98" />
    </svg>
  );
}

/**
 * Exact transparent NOORMEXA symbol.
 * No CSS scale is applied: this prevents clipping inside store cards and other
 * constrained UI containers.
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
        className="block select-none object-contain shrink-0"
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
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-visible"
      style={{ width }}
    >
      <img
        src={src}
        width={width}
        height={Math.round(width * 110 / 430)}
        alt="NOORMEXA"
        draggable={false}
        className="block h-auto w-full select-none object-contain"
        style={{
          width,
          filter: monochrome
            ? isDark
              ? "grayscale(1) brightness(2.15)"
              : "grayscale(1) brightness(.30)"
            : undefined,
        }}
      />
      {!monochrome && <SignatureRay isDark={isDark} />}
    </span>
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
