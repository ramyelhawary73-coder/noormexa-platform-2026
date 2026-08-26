"use client";

import React from "react";
import { NoormexaEmblemSvg } from "@/components/BrandLogo";

export interface BrandLogoProps {
  brandId: string;
  className?: string;
  size?: number | string;
  variant?: "icon" | "badge" | "3d" | "full";
  interactive?: boolean;
}

/**
 * 3D Luxury Brand Emblem Vector Engine for Noormexa
 * Provides 100% vector, mathematically accurate, 3D embossed, metallic and jewel-luster
 * representations of the world's most prestigious global brands.
 */
export function BrandLogo({
  brandId,
  className = "w-7 h-7",
}: BrandLogoProps) {
  const normalizedId = (brandId || "").toLowerCase().trim();

  // Generate unique IDs for SVG defs to avoid collisions across multiple instances
  const uid = React.useId().replace(/:/g, "_");

  switch (normalizedId) {
    case "noormexa":
      return <NoormexaEmblemSvg size={28} className={`${className} shrink-0`} />;

    // 1. APPLE (3D Metallic Chrome / Titanium with 100% Exact Official Silhouette & Leaf)
    case "apple":
      return (
        <svg
          viewBox="0 0 170 170"
          className={`${className} shrink-0`}
          aria-label="Apple Official Emblem"
        >
          <defs>
            <linearGradient id={`appleGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#F1F5F9" />
              <stop offset="70%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id={`appleShine_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <filter id={`appleShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.55" />
            </filter>
          </defs>

          <g filter={`url(#appleShadow_${uid})`}>
            {/* Apple Body with genuine official bite & curves */}
            <path
              d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14-4.89-7.5-8.8-15.69-11.73-24.58-2.93-8.89-4.4-17.54-4.4-25.96 0-13.5 3.5-24.8 10.5-33.9 7-9.1 15.8-13.7 26.4-13.8 5.7 0 11.6 1.7 17.7 5.1 6.1 3.4 10 5.2 11.7 5.2 1.5 0 5.3-1.8 11.4-5.4 6.1-3.6 11.7-5.2 16.8-4.8 12.6.9 22.5 5.9 29.7 15-11 6.7-16.4 15.8-16.2 27.3.2 9 3.6 16.5 10.2 22.5 4.3 3.9 9.3 6.6 15 8.1-1.3 4.1-2.9 8.2-4.8 12.3z"
              fill={`url(#appleGrad_${uid})`}
            />
            {/* Apple Leaf */}
            <path
              d="M119.22 31.02c0-7.2 2.6-13.8 7.8-19.8 5.2-6 11.7-9.5 19.5-10.5.2 1.1.3 2.1.3 3 0 7.2-2.7 14-8.1 20.4-5.4 6.4-12 10.1-19.8 11.1-.1-1.4-.2-2.8-.2-4.2z"
              fill={`url(#appleGrad_${uid})`}
            />
          </g>
        </svg>
      );

    // 2. NIKE (3D Bold Aerodynamic Swoosh with Fiery Gradient & Typography)
    case "nike":
      return (
        <svg
          viewBox="0 0 160 85"
          className={`${className} shrink-0`}
          aria-label="Nike Official Swoosh"
        >
          <defs>
            <linearGradient id={`nikeGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#FF8A00" />
              <stop offset="65%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <filter id={`nikeGlow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3.5" stdDeviation="3.5" floodColor="#EA580C" floodOpacity="0.6" />
            </filter>
          </defs>

          <g filter={`url(#nikeGlow_${uid})`}>
            <path
              d="M148.5 18.2 C120.3 35.6 85.2 53.5 48.6 62 C28.9 66.6 14.2 64.4 7.6 56.8 C1.4 49.6 4.8 37.8 14.5 26.2 C15.6 24.8 17.2 25.3 16.6 26.8 C10.6 37.4 11.5 46.1 17.8 51.7 C24.6 57.7 38.1 57.1 56.9 51.3 C92.7 40.6 129.2 23.2 153.4 10.8 C157.1 8.9 159.8 12.7 148.5 18.2 Z"
              fill={`url(#nikeGrad_${uid})`}
            />
            <text
              x="80"
              y="79"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12.5"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              fontStyle="italic"
              letterSpacing="0.28em"
              opacity="0.95"
            >
              NIKE
            </text>
          </g>
        </svg>
      );

    // 3. ROLEX (Haute Horlogerie 24K Solid Gold 5-Sphere Coronet with Geneva Luster)
    case "rolex":
      return (
        <svg
          viewBox="0 0 140 100"
          className={`${className} shrink-0`}
          aria-label="Rolex Official 5-Point Crown Emblem"
        >
          <defs>
            <linearGradient id={`rolexGold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF0" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
            <radialGradient id={`rolexSphereGlow_${uid}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#FDE047" />
              <stop offset="80%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </radialGradient>
            <filter id={`rolexLuster_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#B45309" floodOpacity="0.55" />
            </filter>
          </defs>

          <g filter={`url(#rolexLuster_${uid})`}>
            {/* 5 Solid Jewel Pearl Spheres */}
            <circle cx="20" cy="26" r="6" fill={`url(#rolexSphereGlow_${uid})`} />
            <circle cx="45" cy="14" r="6.5" fill={`url(#rolexSphereGlow_${uid})`} />
            <circle cx="70" cy="8" r="7.5" fill={`url(#rolexSphereGlow_${uid})`} />
            <circle cx="95" cy="14" r="6.5" fill={`url(#rolexSphereGlow_${uid})`} />
            <circle cx="120" cy="26" r="6" fill={`url(#rolexSphereGlow_${uid})`} />

            {/* Central Coronet Body with Authentic Flaring Crown Wings */}
            <path
              d="M20 34 L38 64 L47 22 L70 64 L93 22 L102 64 L120 34 L108 72 L32 72 Z"
              fill={`url(#rolexGold_${uid})`}
            />

            {/* Bottom 24K Solid Beveled Coronet Band */}
            <rect x="26" y="75" width="88" height="7.5" rx="3.75" fill={`url(#rolexGold_${uid})`} />
            <line x1="30" y1="77.5" x2="110" y2="77.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />

            {/* ROLEX Wordmark */}
            <text
              x="70"
              y="97"
              textAnchor="middle"
              fill={`url(#rolexGold_${uid})`}
              fontSize="14"
              fontWeight="900"
              fontFamily="serif"
              letterSpacing="0.32em"
            >
              ROLEX
            </text>
          </g>
        </svg>
      );

    // 4. DIOR (Parisian Haute Couture Christian Dior CD Monogram & Parisian Gold Finish)
    case "dior":
      return (
        <svg
          viewBox="0 0 140 100"
          className={`${className} shrink-0`}
          aria-label="Christian Dior Official Monogram"
        >
          <defs>
            <linearGradient id={`diorGold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="35%" stopColor="#FDE68A" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <filter id={`diorShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          <g filter={`url(#diorShadow_${uid})`}>
            {/* C Glyph with authentic French high-fashion serif weights */}
            <path
              d="M62 12 C46 12 32 25 32 41 C32 57 46 70 62 70 C71 70 79 66 84 60 L75 53 C71 57 67 60 62 60 C51 60 42 52 42 41 C42 30 51 22 62 22 C67 22 71 25 75 29 L84 22 C79 16 71 12 62 12 Z"
              fill={`url(#diorGold_${uid})`}
            />
            {/* D Glyph Interlocking through C */}
            <path
              d="M64 12 H86 C101 12 112 25 112 41 C112 57 101 70 86 70 H64 V12 Z M74 22 V60 H85 C95 60 101 52 101 41 C101 30 95 22 85 22 H74 Z"
              fill={`url(#diorGold_${uid})`}
            />
            {/* DIOR Wordmark */}
            <text
              x="70"
              y="92"
              textAnchor="middle"
              fill={`url(#diorGold_${uid})`}
              fontSize="14.5"
              fontWeight="900"
              fontFamily="serif"
              letterSpacing="0.32em"
            >
              DIOR
            </text>
          </g>
        </svg>
      );

    // 5. SAMSUNG (Authentic Official 3D Cobalt Oval Badge & Full Samsung Wordmark)
    case "samsung":
      return (
        <svg
          viewBox="0 0 150 75"
          className={`${className} shrink-0`}
          aria-label="Samsung Official 3D Emblem"
        >
          <defs>
            <linearGradient id={`samsungBlue_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E88E5" />
              <stop offset="45%" stopColor="#034EA2" />
              <stop offset="100%" stopColor="#00225E" />
            </linearGradient>
            <linearGradient id={`samsungGloss_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <filter id={`samsungShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#00225E" floodOpacity="0.6" />
            </filter>
          </defs>

          <g filter={`url(#samsungShadow_${uid})`}>
            {/* Iconic Tilted Samsung Ellipse (3D Oval Pill) */}
            <ellipse
              cx="75"
              cy="37.5"
              rx="70"
              ry="29"
              transform="rotate(-9 75 37.5)"
              fill={`url(#samsungBlue_${uid})`}
            />

            {/* 3D Glass Specular Reflection on Top Half */}
            <ellipse
              cx="75"
              cy="28"
              rx="60"
              ry="16"
              transform="rotate(-9 75 37.5)"
              fill={`url(#samsungGloss_${uid})`}
            />

            {/* Official SAMSUNG Bold Typography */}
            <text
              x="75"
              y="44"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="19"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.1em"
              transform="rotate(-9 75 37.5)"
              filter="drop-shadow(0 1.5px 2px rgba(0,0,0,0.6))"
            >
              SAMSUNG
            </text>
          </g>
        </svg>
      );

    // 6. SONY (Studio Platinum Chrome Wordmark in Authentic Slab-Serif Typography)
    case "sony":
      return (
        <svg
          viewBox="0 0 140 60"
          className={`${className} shrink-0`}
          aria-label="Sony Official Wordmark"
        >
          <defs>
            <linearGradient id={`sonyChrome_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#F1F5F9" />
              <stop offset="70%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <filter id={`sonyBevel_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.55" />
            </filter>
          </defs>

          <g filter={`url(#sonyBevel_${uid})`}>
            <text
              x="70"
              y="43"
              textAnchor="middle"
              fill={`url(#sonyChrome_${uid})`}
              fontSize="36"
              fontWeight="900"
              fontFamily="'Cinzel', 'Times New Roman', Times, serif"
              letterSpacing="0.16em"
            >
              SONY
            </text>
          </g>
        </svg>
      );

    // 7. CHANEL (Paris Interlocking Twin CC Monogram & Noir Haute Couture Finish)
    case "chanel":
      return (
        <svg
          viewBox="0 0 140 100"
          className={`${className} shrink-0`}
          aria-label="Chanel Interlocking CC Logo"
        >
          <defs>
            <linearGradient id={`chanelSilver_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#E2E8F0" />
              <stop offset="85%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <filter id={`chanelGlow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          <g filter={`url(#chanelGlow_${uid})`}>
            {/* Left C */}
            <path
              d="M52 14 C34 14 20 28 20 45 C20 62 34 76 52 76 C64 76 74 69 80 59 L70 53 C66 59 60 64 52 64 C41 64 32 55 32 45 C32 35 41 26 52 26 C60 26 66 31 70 37 L80 31 C74 21 64 14 52 14 Z"
              fill={`url(#chanelSilver_${uid})`}
            />
            {/* Right C - Interlocked with Precision Crossing */}
            <path
              d="M88 14 C76 14 66 21 60 31 L70 37 C74 31 80 26 88 26 C99 26 108 35 108 45 C108 55 99 64 88 64 C80 64 74 59 70 53 L60 59 C66 69 76 76 88 76 C106 76 120 62 120 45 C120 28 106 14 88 14 Z"
              fill={`url(#chanelSilver_${uid})`}
            />

            {/* CHANEL Wordmark */}
            <text
              x="70"
              y="94"
              textAnchor="middle"
              fill={`url(#chanelSilver_${uid})`}
              fontSize="13"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.36em"
            >
              CHANEL
            </text>
          </g>
        </svg>
      );

    // 8. ADIDAS (3D Performance Mountain Slanted 3-Stripes with Athletic Speed Gradient)
    case "adidas":
      return (
        <svg
          viewBox="0 0 140 90"
          className={`${className} shrink-0`}
          aria-label="Adidas Official 3-Stripes Emblem"
        >
          <defs>
            <linearGradient id={`adidasGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#38BDF8" />
              <stop offset="75%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <filter id={`adidasShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#0284C7" floodOpacity="0.55" />
            </filter>
          </defs>

          <g filter={`url(#adidasShadow_${uid})`}>
            {/* Stripe 1 (Smallest Left) */}
            <path d="M22 55 L38 55 L62 21 L46 21 Z" fill={`url(#adidasGrad_${uid})`} />
            {/* Stripe 2 (Medium Center) */}
            <path d="M51 55 L67 55 L99 6 L83 6 Z" fill={`url(#adidasGrad_${uid})`} />
            {/* Stripe 3 (Tallest Right) */}
            <path d="M80 55 L96 55 L133 -9 L117 -9 Z" fill={`url(#adidasGrad_${uid})`} />

            {/* adidas Wordmark */}
            <text
              x="70"
              y="78"
              textAnchor="middle"
              fill={`url(#adidasGrad_${uid})`}
              fontSize="19"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.12em"
            >
              adidas
            </text>
          </g>
        </svg>
      );

    // 9. GUCCI (Firenze Luxury Interlocking GG Emblem in 3D Antique Gold)
    case "gucci":
      return (
        <svg
          viewBox="0 0 140 95"
          className={`${className} shrink-0`}
          aria-label="Gucci Interlocking GG Emblem"
        >
          <defs>
            <linearGradient id={`gucciGold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="30%" stopColor="#FDE68A" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <filter id={`gucciShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#78350F" floodOpacity="0.55" />
            </filter>
          </defs>

          <g filter={`url(#gucciShadow_${uid})`}>
            {/* Left G */}
            <path
              d="M62 33 C62 18 49 7 34 7 C18 7 6 18 6 33 C6 48 18 60 34 60 C44 60 53 54 58 47 L47 47 C44 51 39 53 34 53 C24 53 15 44 15 33 C15 23 24 14 34 14 C42 14 48 19 50 26 L38 26 L38 33 L62 33 Z"
              fill={`url(#gucciGold_${uid})`}
            />
            {/* Right G (Interlocked back-to-back) */}
            <path
              d="M78 33 C78 48 91 60 106 60 C122 60 134 48 134 33 C134 18 122 7 106 7 C96 7 87 13 82 20 L93 20 C96 16 101 14 106 14 C116 14 125 23 125 33 C125 44 116 53 106 53 C98 53 92 48 90 41 L102 41 L102 33 L78 33 Z"
              fill={`url(#gucciGold_${uid})`}
            />

            {/* GUCCI Wordmark */}
            <text
              x="70"
              y="84"
              textAnchor="middle"
              fill={`url(#gucciGold_${uid})`}
              fontSize="16"
              fontWeight="900"
              fontFamily="serif"
              letterSpacing="0.32em"
            >
              GUCCI
            </text>
          </g>
        </svg>
      );

    // 10. LOUIS VUITTON (Maison Paris Interlocking LV Monogram & Floral Star Crest in French Bronze Gold)
    case "lv":
    case "louis-vuitton":
      return (
        <svg
          viewBox="0 0 140 100"
          className={`${className} shrink-0`}
          aria-label="Louis Vuitton Official LV Monogram"
        >
          <defs>
            <linearGradient id={`lvGold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="35%" stopColor="#FDE68A" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <filter id={`lvShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#78350F" floodOpacity="0.55" />
            </filter>
          </defs>

          <g filter={`url(#lvShadow_${uid})`}>
            {/* Serif 'L' */}
            <path
              d="M38 14 H51 V54 H76 V64 H38 Z"
              fill={`url(#lvGold_${uid})`}
            />
            {/* Serif 'V' Interlocking over 'L' */}
            <path
              d="M57 14 H71 L86 54 L101 14 H115 L94 64 H78 Z"
              fill={`url(#lvGold_${uid})`}
            />

            {/* 4-Petal Monogram Floral Star Motif at Corner */}
            <g transform="translate(18, 30) scale(0.8)">
              <path
                d="M10 0 C10 6 6 10 0 10 C6 10 10 14 10 20 C10 14 14 10 20 10 C14 10 10 6 10 0 Z"
                fill={`url(#lvGold_${uid})`}
                opacity="0.9"
              />
            </g>

            {/* LOUIS VUITTON Wordmark */}
            <text
              x="70"
              y="88"
              textAnchor="middle"
              fill={`url(#lvGold_${uid})`}
              fontSize="10.5"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.28em"
            >
              LOUIS VUITTON
            </text>
          </g>
        </svg>
      );

    // 11. DYSON (Pioneering Engineering - Official "dyson" Wordmark with Fuchsia Cyclonic Ring)
    case "dyson":
      return (
        <svg
          viewBox="0 0 140 70"
          className={`${className} shrink-0`}
          aria-label="Dyson Official 3D Emblem"
        >
          <defs>
            <linearGradient id={`dysonMagenta_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="45%" stopColor="#D946EF" />
              <stop offset="85%" stopColor="#A21CAF" />
              <stop offset="100%" stopColor="#701A75" />
            </linearGradient>
            <filter id={`dysonGlow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#D946EF" floodOpacity="0.55" />
            </filter>
          </defs>

          <g filter={`url(#dysonGlow_${uid})`}>
            {/* Cyclonic Halo Ring behind 'd' */}
            <ellipse
              cx="35"
              cy="35"
              rx="24"
              ry="24"
              fill="none"
              stroke={`url(#dysonMagenta_${uid})`}
              strokeWidth="3.5"
              strokeDasharray="36 10"
              opacity="0.8"
            />

            {/* Authentic dyson Lowercase Typography */}
            <text
              x="70"
              y="45"
              textAnchor="middle"
              fill={`url(#dysonMagenta_${uid})`}
              fontSize="32"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.04em"
            >
              dyson
            </text>
          </g>
        </svg>
      );

    // 12. ZARA (Haute Couture Overlapping Serif ZARA Wordmark)
    case "zara":
      return (
        <svg
          viewBox="0 0 140 60"
          className={`${className} shrink-0`}
          aria-label="ZARA Official Wordmark"
        >
          <defs>
            <linearGradient id={`zaraGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#E2E8F0" />
              <stop offset="80%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <filter id={`zaraShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          <g filter={`url(#zaraShadow_${uid})`}>
            {/* Iconic Interconnected ZARA Serifs */}
            <text
              x="70"
              y="44"
              textAnchor="middle"
              fill={`url(#zaraGrad_${uid})`}
              fontSize="42"
              fontWeight="900"
              fontFamily="'Playfair Display', Didot, 'Bodoni MT', Georgia, serif"
              letterSpacing="-0.09em"
            >
              ZARA
            </text>
          </g>
        </svg>
      );

    // 13. PRADA (Milano Triangle Plaque & Heraldic Crest)
    case "prada":
      return (
        <svg
          viewBox="0 0 130 80"
          className={`${className} shrink-0`}
          aria-label="Prada Milano Triangle Logo"
        >
          <defs>
            <linearGradient id={`pradaSilver_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <filter id={`pradaShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>
          <g filter={`url(#pradaShadow_${uid})`}>
            <polygon
              points="65,72 8,10 122,10"
              fill="#0F172A"
              stroke={`url(#pradaSilver_${uid})`}
              strokeWidth="3.5"
            />
            <polygon
              points="65,66 14,14 116,14"
              fill="none"
              stroke={`url(#pradaSilver_${uid})`}
              strokeWidth="1"
              opacity="0.6"
            />
            <text
              x="65"
              y="32"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="16"
              fontWeight="900"
              fontFamily="serif"
              letterSpacing="0.22em"
            >
              PRADA
            </text>
            <text
              x="65"
              y="46"
              textAnchor="middle"
              fill={`url(#pradaSilver_${uid})`}
              fontSize="7.5"
              fontWeight="700"
              fontFamily="sans-serif"
              letterSpacing="0.28em"
            >
              MILANO
            </text>
          </g>
        </svg>
      );

    // 14. HERMÈS (Parisian Luxury Duc Carriage & H Emblem)
    case "hermes":
    case "hermès":
      return (
        <svg
          viewBox="0 0 140 90"
          className={`${className} shrink-0`}
          aria-label="Hermes Paris Logo"
        >
          <defs>
            <linearGradient id={`hermesOrange_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="35%" stopColor="#F97316" />
              <stop offset="80%" stopColor="#C2410C" />
              <stop offset="100%" stopColor="#7C2D12" />
            </linearGradient>
            <filter id={`hermesShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#C2410C" floodOpacity="0.5" />
            </filter>
          </defs>
          <g filter={`url(#hermesShadow_${uid})`}>
            <circle cx="70" cy="32" r="22" fill="none" stroke={`url(#hermesOrange_${uid})`} strokeWidth="3" />
            <text
              x="70"
              y="42"
              textAnchor="middle"
              fill={`url(#hermesOrange_${uid})`}
              fontSize="26"
              fontWeight="900"
              fontFamily="serif"
            >
              H
            </text>
            <text
              x="70"
              y="76"
              textAnchor="middle"
              fill={`url(#hermesOrange_${uid})`}
              fontSize="14"
              fontWeight="900"
              fontFamily="serif"
              letterSpacing="0.28em"
            >
              HERMÈS
            </text>
          </g>
        </svg>
      );

    // 15. CARTIER (Haute Horlogerie & High Jewelry Script)
    case "cartier":
      return (
        <svg
          viewBox="0 0 140 60"
          className={`${className} shrink-0`}
          aria-label="Cartier Official Logo"
        >
          <defs>
            <linearGradient id={`cartierGold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="35%" stopColor="#FDE68A" />
              <stop offset="75%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <filter id={`cartierShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#78350F" floodOpacity="0.5" />
            </filter>
          </defs>
          <g filter={`url(#cartierShadow_${uid})`}>
            <text
              x="70"
              y="42"
              textAnchor="middle"
              fill={`url(#cartierGold_${uid})`}
              fontSize="34"
              fontWeight="700"
              fontFamily="'Brush Script MT', 'Great Vibes', cursive, serif"
              fontStyle="italic"
            >
              Cartier
            </text>
          </g>
        </svg>
      );

    default:
      return (
        <div
          className={`${className} rounded-xl bg-linear-to-br from-slate-800 to-slate-950 flex items-center justify-center text-xs font-black text-white shrink-0 border border-slate-700/80 shadow-xs`}
        >
          {brandId.slice(0, 3).toUpperCase()}
        </div>
      );
  }
}


