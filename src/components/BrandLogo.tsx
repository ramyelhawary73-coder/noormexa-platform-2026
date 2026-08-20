"use client";

import { useTheme } from "@/context/ThemeContext";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "horizontal" | "icon" | "stacked";
  showTagline?: boolean;
}

/**
 * High-End Luxury Geometric Letter 'N' Vector Icon
 * Handcrafted pure SVG with multi-faceted golden metallic lighting
 */
function LuxuryNIcon({ size = 36, isDark }: { size: number; isDark: boolean }) {
  const gradientIdLeft = `nrx-n-left-${isDark ? "dark" : "light"}`;
  const gradientIdRight = `nrx-n-right-${isDark ? "dark" : "light"}`;
  const gradientIdDiag = `nrx-n-diag-${isDark ? "dark" : "light"}`;
  const gradientIdBg = `nrx-n-bg-${isDark ? "dark" : "light"}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-hidden="true"
    >
      <defs>
        {/* Background rounded squircle gradient */}
        <linearGradient id={gradientIdBg} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? "#1E293B" : "#0F172A"} />
          <stop offset="100%" stopColor={isDark ? "#0B1322" : "#020617"} />
        </linearGradient>

        {/* Left vertical stem of N */}
        <linearGradient id={gradientIdLeft} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Right vertical stem of N */}
        <linearGradient id={gradientIdRight} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>

        {/* Dynamic diagonal ribbon with glossy metallic highlight */}
        <linearGradient id={gradientIdDiag} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="25%" stopColor="#FBBF24" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Outer subtle glow */}
        <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59E0B" floodOpacity={isDark ? "0.45" : "0.25"} />
        </filter>
      </defs>

      {/* Modern Squircle Badge */}
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="26"
        fill={`url(#${gradientIdBg})`}
        stroke={isDark ? "rgba(245, 158, 11, 0.4)" : "rgba(245, 158, 11, 0.3)"}
        strokeWidth="2.5"
      />

      {/* Inner Accent Ring */}
      <rect
        x="7"
        y="7"
        width="86"
        height="86"
        rx="21"
        fill="none"
        stroke="rgba(255, 255, 255, 0.06)"
        strokeWidth="1"
      />

      {/* Main Stylized Luxury 3D 'N' Letter Geometry */}
      <g filter="url(#gold-glow)">
        {/* 1. Left Pillar */}
        <path
          d="M24 74 V26 C24 23.5 25.5 22 28 22 H32 C34.5 22 36 23.5 36 26 V74 C36 76.5 34.5 78 32 78 H28 C25.5 78 24 76.5 24 74 Z"
          fill={`url(#${gradientIdLeft})`}
        />

        {/* 2. Right Pillar */}
        <path
          d="M64 74 V26 C64 23.5 65.5 22 68 22 H72 C74.5 22 76 23.5 76 26 V74 C76 76.5 74.5 78 72 78 H68 C65.5 78 64 76.5 64 74 Z"
          fill={`url(#${gradientIdRight})`}
        />

        {/* 3. Sweeping 3D Dynamic Diagonal Slash */}
        <path
          d="M27 22 L73 75 C75.5 78 78 76 78 73 L78 66 L38 22 C35 19 31 19 28 21 L27 22 Z"
          fill={`url(#${gradientIdDiag})`}
        />

        {/* 4. Top-right Golden Spark / Diamond */}
        <path
          d="M50 14 L53 19 L58 20 L53 21 L50 26 L47 21 L42 20 L47 19 Z"
          fill="#FFFBEB"
          opacity="0.9"
        />
      </g>
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

  const config = {
    sm: {
      iconSize: 30,
      textSize: "text-base font-black tracking-tight",
      arSize: "text-[10px] font-bold",
      taglineSize: "text-[8.5px]",
      gap: "gap-2.5",
    },
    md: {
      iconSize: 38,
      textSize: "text-xl sm:text-[22px] font-black tracking-tight",
      arSize: "text-xs font-bold",
      taglineSize: "text-[10px]",
      gap: "gap-3",
    },
    lg: {
      iconSize: 48,
      textSize: "text-2xl sm:text-3xl font-black tracking-tight",
      arSize: "text-sm font-bold",
      taglineSize: "text-xs",
      gap: "gap-3.5",
    },
    xl: {
      iconSize: 60,
      textSize: "text-3xl sm:text-4xl font-black tracking-tight",
      arSize: "text-base font-bold",
      taglineSize: "text-sm",
      gap: "gap-4",
    },
  }[size];

  // Standalone Icon
  if (variant === "icon") {
    return (
      <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
        <LuxuryNIcon size={config.iconSize} isDark={isDark} />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center select-none group focus:outline-none ${config.gap} ${className}`}
      dir="ltr"
    >
      {/* 1. Precision Luxury N Vector Icon */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <LuxuryNIcon size={config.iconSize} isDark={isDark} />
      </div>

      {/* 2. World-Class Precision Typography Lockup */}
      <div className="flex flex-col justify-center min-w-0" dir="ltr">
        {/* Main Wordmark Line */}
        <div className="flex items-center gap-2 leading-none">
          <div className="flex items-baseline tracking-tight">
            <span
              className={`uppercase transition-colors ${config.textSize} ${
                isDark ? "text-white" : "text-[#0F172A]"
              }`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.02em",
              }}
            >
              NOOR
            </span>
            <span
              className={`uppercase font-black ${config.textSize} bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#D97706] bg-clip-text text-transparent`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Montserrat', 'Inter', sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                filter: isDark ? "drop-shadow(0 0 12px rgba(245, 158, 11, 0.45))" : "none",
              }}
            >
              MEXA
            </span>
          </div>

          {/* Arabic Brand Badge */}
          <span
            className={`px-1.5 py-0.5 rounded-md font-bold leading-none select-none transition-colors ${
              isDark
                ? "bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/30"
                : "bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/25"
            } ${config.arSize}`}
            dir="rtl"
            style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
          >
            نورميكسا
          </span>
        </div>

        {/* Elegant Tagline */}
        {showTagline && (
          <div
            className="flex items-center gap-1.5 mt-1"
            dir="rtl"
            style={{ fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif" }}
          >
            <span
              className={`font-semibold tracking-normal text-muted truncate ${config.taglineSize}`}
            >
              سوق التجارة الإلكترونية الشامل
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
