"use client";

import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "horizontal" | "icon" | "stacked";
  showTagline?: boolean;
}

export default function BrandLogo({
  size = "md",
  className = "",
  variant = "horizontal",
  showTagline = true,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const config = {
    sm: {
      iconSize: 28,
      textSize: "text-base tracking-[0.03em]",
      arSize: "text-[10px]",
      taglineSize: "text-[8.5px]",
      gap: "gap-2",
    },
    md: {
      iconSize: 36,
      textSize: "text-lg sm:text-xl tracking-[0.04em]",
      arSize: "text-[11px] sm:text-xs",
      taglineSize: "text-[9.5px] sm:text-[10px]",
      gap: "gap-2.5",
    },
    lg: {
      iconSize: 44,
      textSize: "text-2xl sm:text-3xl tracking-[0.04em]",
      arSize: "text-xs sm:text-sm",
      taglineSize: "text-xs",
      gap: "gap-3",
    },
    xl: {
      iconSize: 54,
      textSize: "text-3xl sm:text-4xl tracking-[0.05em]",
      arSize: "text-sm sm:text-base",
      taglineSize: "text-xs sm:text-sm",
      gap: "gap-3.5",
    },
  }[size];

  // Official Emblem Icon from files (crystal clean & transparent)
  const emblemSrc = "/brand/official-emblem.png";

  if (variant === "icon") {
    return (
      <div className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}>
        <Image
          src={emblemSrc}
          alt="NOORMEXA Logo"
          width={config.iconSize * 2}
          height={config.iconSize * 2}
          className="object-contain transition-transform duration-200 hover:scale-105"
          style={{ width: `${config.iconSize}px`, height: `${config.iconSize}px` }}
          priority
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center select-none group focus:outline-none ${config.gap} ${className}`}
      dir="ltr"
    >
      {/* 1. Official Pure Emblem Icon */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-xs transition-transform duration-200 group-hover:scale-105"
        style={{
          width: `${config.iconSize}px`,
          height: `${config.iconSize}px`,
        }}
      >
        <Image
          src={emblemSrc}
          alt="NOORMEXA Logo"
          width={config.iconSize * 2}
          height={config.iconSize * 2}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* 2. Precision Coded Typography Lockup */}
      <div className="flex flex-col justify-center min-w-0" dir="ltr">
        {/* Main Wordmark (English + Arabic Badge) */}
        <div className="flex items-baseline gap-1.5 leading-none">
          <span
            className={`font-black uppercase transition-colors select-none ${config.textSize} ${
              isDark ? "text-white" : "text-[#0F172A]"
            }`}
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', sans-serif",
            }}
          >
            NOOR
            <span
              className="bg-gradient-to-r from-[#F59E0B] via-[#EAB308] to-[#D97706] bg-clip-text text-transparent font-black"
              style={{
                filter: isDark ? "drop-shadow(0 0 10px rgba(245, 158, 11, 0.35))" : "none",
              }}
            >
              MEXA
            </span>
          </span>

          <span
            className={`font-black text-[#D97706] dark:text-[#FBBF24] leading-none ${config.arSize}`}
            dir="rtl"
            style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
          >
            نورميكسا
          </span>
        </div>

        {/* Dynamic Tagline (Arabic) */}
        {showTagline && (
          <div
            className="flex items-center gap-1.5 mt-0.5"
            dir="rtl"
            style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
          >
            <span
              className={`font-bold text-muted truncate ${config.taglineSize}`}
            >
              سوق التجارة الإلكترونية الشامل
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
