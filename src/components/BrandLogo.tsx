"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@/context/ThemeContext";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "horizontal" | "icon" | "symbol" | "stacked";
  showTagline?: boolean;
}

const LANGUAGE_KEY = "noormexa-language";

function getLanguageSnapshot(): "ar" | "en" {
  if (typeof window === "undefined") return "ar";
  return window.localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar";
}

function subscribeToLanguage(callback: () => void) {
  window.addEventListener("noormexa-language-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("noormexa-language-change", callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * 100% Self-Contained Vector SVG Sun-Crown 'N' Emblem
 * Eliminates all external image loading issues, 404s, and deployment glitches.
 */
export function NoormexaEmblemSvg({
  size = 40,
  isDark = true,
  className = "",
}: {
  size?: number;
  isDark?: boolean;
  className?: string;
}) {
  const uniqueId = isDark ? "dark" : "light";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`flex-shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Squircle Background Gradient */}
        <linearGradient id={`nmxBg_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {isDark ? (
            <>
              <stop offset="0%" stopColor="#0F223D" />
              <stop offset="50%" stopColor="#081424" />
              <stop offset="100%" stopColor="#03070E" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#FBF8F3" />
              <stop offset="100%" stopColor="#F2ECE1" />
            </>
          )}
        </linearGradient>

        {/* Squircle Metallic Border Gradient */}
        <linearGradient id={`nmxRim_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {isDark ? (
            <>
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0.4" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#B45309" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#78350F" stopOpacity="0.25" />
            </>
          )}
        </linearGradient>

        {/* 3D Gold Gradient for the Letter 'N' Sculpture */}
        <linearGradient id={`nmxGold_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {isDark ? (
            <>
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="30%" stopColor="#D97706" />
              <stop offset="70%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </>
          )}
        </linearGradient>

        {/* Rays Gradient */}
        <linearGradient id={`nmxRays_${uniqueId}`} x1="0%" y1="100%" x2="100%" y2="0%">
          {isDark ? (
            <>
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FEF08A" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#78350F" />
              <stop offset="100%" stopColor="#D97706" />
            </>
          )}
        </linearGradient>
      </defs>

      {/* 1. Base Squircle Shape with Precision Curved Corners */}
      <rect
        x="6"
        y="6"
        width="188"
        height="188"
        rx="46"
        fill={`url(#nmxBg_${uniqueId})`}
        stroke={`url(#nmxRim_${uniqueId})`}
        strokeWidth="4"
      />

      {/* 2. Radiant Sun Rays of NOOR (النور) */}
      <g
        stroke={`url(#nmxRays_${uniqueId})`}
        strokeWidth="3.6"
        strokeLinecap="round"
        opacity="0.95"
      >
        <line x1="120" y1="38" x2="112" y2="22" />
        <line x1="136" y1="32" x2="136" y2="14" />
        <line x1="152" y1="34" x2="160" y2="18" />
        <line x1="166" y1="42" x2="178" y2="32" />
        <line x1="172" y1="56" x2="188" y2="52" />
      </g>

      {/* 3. Sun Core Disc */}
      <circle
        cx="145"
        cy="48"
        r="14"
        fill={`url(#nmxGold_${uniqueId})`}
      />
      <circle
        cx="145"
        cy="48"
        r="8"
        fill={isDark ? "#FFFBEB" : "#F59E0B"}
        opacity="0.95"
      />

      {/* 4. Letter 'N' Straight Left Vertical Pillar */}
      <rect
        x="44"
        y="48"
        width="24"
        height="104"
        rx="10"
        fill={`url(#nmxGold_${uniqueId})`}
      />

      {/* 5. Letter 'N' Straight Right Vertical Pillar */}
      <rect
        x="133"
        y="68"
        width="24"
        height="84"
        rx="10"
        fill={`url(#nmxGold_${uniqueId})`}
      />

      {/* 6. Precision Diagonal Straight Connecting Beam */}
      <polygon
        points="44,48 68,48 157,144 133,152 44,58"
        fill={`url(#nmxGold_${uniqueId})`}
      />

      {/* 7. Subtle Light Accent Flare */}
      <circle
        cx="56"
        cy="58"
        r="4"
        fill="#FFFFFF"
        opacity={isDark ? "0.85" : "0.5"}
      />
    </svg>
  );
}

export default function BrandLogo({
  size = "md",
  className = "",
  variant = "horizontal",
  showTagline = true,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const language = useSyncExternalStore(subscribeToLanguage, getLanguageSnapshot, () => "ar");
  const isArabic = language === "ar";

  const config = {
    sm: {
      iconPx: 30,
      textSize: "text-sm sm:text-base",
      arSize: "text-[9px] sm:text-[10px]",
      taglineSize: "text-[8px] sm:text-[9px]",
      gap: "gap-1.5 sm:gap-2",
    },
    md: {
      iconPx: 38,
      textSize: "text-base sm:text-xl",
      arSize: "text-[10px] sm:text-xs",
      taglineSize: "text-[9px] sm:text-[10px]",
      gap: "gap-2 sm:gap-2.5",
    },
    lg: {
      iconPx: 48,
      textSize: "text-xl sm:text-2xl",
      arSize: "text-xs sm:text-sm",
      taglineSize: "text-[10px] sm:text-xs",
      gap: "gap-2.5 sm:gap-3",
    },
    xl: {
      iconPx: 60,
      textSize: "text-2xl sm:text-3xl",
      arSize: "text-sm sm:text-base",
      taglineSize: "text-xs sm:text-sm",
      gap: "gap-3 sm:gap-4",
    },
  }[size];

  // Standalone Icon
  if (variant === "icon" || variant === "symbol") {
    return (
      <div
        className={`inline-flex items-center justify-center select-none flex-shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
      >
        <NoormexaEmblemSvg size={config.iconPx} isDark={isDark} />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center select-none group focus:outline-none flex-shrink-0 ${config.gap} ${className}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* 1. Official 100% Vector 3D Sun-Crown 'N' Squircle Badge */}
      <div className="relative flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
        <NoormexaEmblemSvg size={config.iconPx} isDark={isDark} />
      </div>

      {/* 2. World-Class Marketplace Typography Lockup */}
      <div className="flex flex-col justify-center min-w-0 text-start leading-tight">
        {/* Main Brand Title Row */}
        <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
          <div className="flex items-baseline tracking-tight font-black" dir="ltr">
            <span
              className={`uppercase transition-colors ${config.textSize} ${
                isDark ? "text-white" : "text-[#0F172A]"
              }`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              NOOR
            </span>
            <span
              className={`uppercase font-black ${config.textSize} bg-gradient-to-r from-[#F59E0B] via-[#EAB308] to-[#D97706] bg-clip-text text-transparent ml-[1px]`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                filter: isDark ? "drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))" : "none",
              }}
            >
              MEXA
            </span>
          </div>

          {/* Arabic Brand Identity Badge */}
          {isArabic && (
            <span
              className={`font-black select-none transition-colors px-1.5 py-0.5 rounded-md ${
                isDark
                  ? "bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30"
                  : "bg-[#F59E0B]/12 text-[#B45309] border border-[#F59E0B]/20"
              } ${config.arSize}`}
              dir="rtl"
              style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
            >
              نورميكسا
            </span>
          )}
        </div>

        {/* Global Marketplace Tagline (Hidden on narrow mobile to keep header clean) */}
        {showTagline && (
          <div
            className="hidden sm:flex items-center gap-1.5 mt-0.5"
            dir={isArabic ? "rtl" : "ltr"}
            style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
          >
            <span
              className={`font-semibold text-muted tracking-tight truncate ${config.taglineSize}`}
            >
              {isArabic ? "سوق التجارة الإلكترونية الشامل" : "Global Commerce Marketplace"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
