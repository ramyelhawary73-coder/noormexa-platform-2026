"use client";

/* eslint-disable @next/next/no-img-element -- the brand mark is a local SVG master asset */
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

const MARK_SRC = "/brand/noormexa-mark-v1.svg?v=identity-v1";

const SIZE_MAP = {
  xs: { mark: 26, word: 18, tagline: 7, gap: 6 },
  sm: { mark: 32, word: 21, tagline: 7.5, gap: 7 },
  md: { mark: 38, word: 24, tagline: 8, gap: 8 },
  lg: { mark: 46, word: 28, tagline: 9, gap: 9 },
  xl: { mark: 58, word: 34, tagline: 10, gap: 11 },
  "2xl": { mark: 72, word: 42, tagline: 12, gap: 13 },
  responsive: { mark: 44, word: 27, tagline: 8.5, gap: 9 },
} as const;

function GoldWord({
  children,
  monochrome,
  color,
}: {
  children: React.ReactNode;
  monochrome: boolean;
  color: string;
}) {
  if (monochrome) {
    return <span style={{ color }}>{children}</span>;
  }

  return (
    <span
      style={{
        backgroundImage:
          "linear-gradient(180deg,#FFF0AE 0%,#E9B84A 28%,#C9861A 68%,#9C5B0C 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Canonical NOORMEXA symbol.
 * Every website surface, store card and PWA UI must use this exact asset.
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
      className={"inline-flex shrink-0 items-center justify-center overflow-visible " + className}
      style={{ width: size, height: size }}
      aria-label="NOORMEXA"
      role="img"
    >
      <img
        src={MARK_SRC}
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="block h-full w-full select-none object-contain"
        style={{
          filter: monochrome
            ? isDark
              ? "grayscale(1) brightness(2.2)"
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
  const s = SIZE_MAP[size in SIZE_MAP ? size : "responsive"];

  if (variant === "icon" || variant === "symbol" || variant === "pure-svg") {
    return (
      <NoormexaEmblemSvg
        size={s.mark}
        isDark={isDark}
        monochrome={monochrome}
        className={className}
      />
    );
  }

  const noorColor = monochrome ? (isDark ? "#FFFFFF" : "#071426") : isDark ? "#F8FAFC" : "#07192F";
  const taglineColor = monochrome ? (isDark ? "#CBD5E1" : "#475569") : isDark ? "#D8B45B" : "#9A6710";

  const wordmark = (
    <span
      dir="ltr"
      className="inline-flex items-baseline whitespace-nowrap font-black leading-none tracking-[-0.055em]"
      style={{
        fontSize: s.word,
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      <span style={{ color: noorColor }}>NOOR</span>
      <GoldWord monochrome={monochrome} color={noorColor}>MEXA</GoldWord>
    </span>
  );

  if (variant === "wordmark") {
    return <span className={"inline-flex items-center " + className}>{wordmark}</span>;
  }

  const taglineNode =
    showTagline && variant !== "compact" ? (
      <span
        dir="rtl"
        className="block whitespace-nowrap font-bold leading-none"
        style={{
          marginTop: Math.max(2, Math.round(s.tagline * 0.35)),
          fontSize: s.tagline,
          color: taglineColor,
          fontFamily: "Tahoma, Arial, sans-serif",
          letterSpacing: 0,
        }}
      >
        {tagline}
      </span>
    ) : null;

  const horizontal = (
    <span
      dir="ltr"
      className="inline-flex shrink-0 items-center overflow-visible"
      style={{ gap: s.gap }}
    >
      <NoormexaEmblemSvg size={s.mark} isDark={isDark} monochrome={monochrome} />
      <span className="inline-flex min-w-0 flex-col items-start justify-center">
        {wordmark}
        {taglineNode}
      </span>
    </span>
  );

  const stacked = (
    <span className="inline-flex shrink-0 flex-col items-center justify-center">
      <NoormexaEmblemSvg size={s.mark} isDark={isDark} monochrome={monochrome} />
      <span className="mt-1 inline-flex flex-col items-center">
        {wordmark}
        {taglineNode}
      </span>
    </span>
  );

  const body = variant === "stacked" ? stacked : horizontal;

  if (variant === "badge") {
    return (
      <span
        className={
          "inline-flex items-center justify-center rounded-2xl border border-line bg-surface px-3 py-2 shadow-sm " +
          className
        }
      >
        {body}
      </span>
    );
  }

  return <span className={"inline-flex items-center justify-center " + className}>{body}</span>;
}
