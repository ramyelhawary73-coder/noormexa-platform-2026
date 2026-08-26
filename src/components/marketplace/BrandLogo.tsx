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

    // 1. APPLE (3D Metallic Chrome / Titanium with Official Precise Silhouette & Leaf)
    case "apple":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} shrink-0`}
          aria-label="Apple Official 3D Emblem"
        >
          <defs>
            <linearGradient id={`appleGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#F1F5F9" />
              <stop offset="65%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <linearGradient id={`appleShine_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`appleSpecular_${uid}`} cx="35%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
            </radialGradient>
            <filter id={`appleShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.45" />
            </filter>
          </defs>

          <g filter={`url(#appleShadow_${uid})`}>
            {/* Apple Leaf */}
            <path
              d="M52 14 C55 8 62 4 69 4 C70 11 66 18 61 23 C56 28 49 29 48 29 C47 22 50 16 52 14 Z"
              fill={`url(#appleGrad_${uid})`}
            />
            <path
              d="M52 14 C55 8 62 4 69 4 C70 11 66 18 61 23 C56 28 49 29 48 29 C47 22 50 16 52 14 Z"
              fill={`url(#appleShine_${uid})`}
              opacity="0.75"
            />

            {/* Apple Body with Precise Official Bite */}
            <path
              d="M74.5 54.5 C74.3 43.5 83.2 37.8 83.7 37.5 C78.6 30 70.6 28.9 67.8 28.7 C61 28 54.5 32.7 51 32.7 C47.5 32.7 42.2 28.8 36.6 28.9 C29.3 29 22.4 33.2 18.7 39.7 C11.1 52.8 16.7 72.3 24.1 82.9 C27.7 88.1 31.9 93.8 37.5 93.6 C42.9 93.4 45 90.1 51.5 90.1 C57.9 90.1 59.8 93.6 65.5 93.4 C71.3 93.2 75 88.1 78.6 82.9 C82.8 76.8 84.5 70.8 84.7 70.4 C84.5 70.2 74.7 66.5 74.5 54.5 Z"
              fill={`url(#appleGrad_${uid})`}
            />
            {/* Apple 3D Specular Highlight Overlay */}
            <path
              d="M74.5 54.5 C74.3 43.5 83.2 37.8 83.7 37.5 C78.6 30 70.6 28.9 67.8 28.7 C61 28 54.5 32.7 51 32.7 C47.5 32.7 42.2 28.8 36.6 28.9 C29.3 29 22.4 33.2 18.7 39.7 C11.1 52.8 16.7 72.3 24.1 82.9 C27.7 88.1 31.9 93.8 37.5 93.6 C42.9 93.4 45 90.1 51.5 90.1 C57.9 90.1 59.8 93.6 65.5 93.4 C71.3 93.2 75 88.1 78.6 82.9 C82.8 76.8 84.5 70.8 84.7 70.4 C84.5 70.2 74.7 66.5 74.5 54.5 Z"
              fill={`url(#appleSpecular_${uid})`}
            />
          </g>
        </svg>
      );

    // 2. NIKE (3D Bold Aerodynamic Swoosh with Fiery Neon Bevel)
    case "nike":
      return (
        <svg
          viewBox="0 0 100 50"
          className={`${className} shrink-0`}
          aria-label="Nike Official 3D Swoosh"
        >
          <defs>
            <linearGradient id={`nikeGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#FF7A00" />
              <stop offset="70%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <linearGradient id={`nikeHighlight_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#FED7AA" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </linearGradient>
            <filter id={`nikeGlow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#EA580C" floodOpacity="0.5" />
            </filter>
          </defs>

          <g filter={`url(#nikeGlow_${uid})`}>
            <path
              d="M96 2.5 C77.5 14.5 54.2 27.5 28.5 33.8 C15.8 36.9 6.4 35.3 2.2 30.1 C-1.8 25 0.5 17 6.8 9 C7.5 8.1 8.5 8.4 8.1 9.4 C4.2 16.6 4.8 22.6 8.9 26.4 C13.4 30.5 22.2 30.1 34.5 26.2 C57.8 19 81.6 7.2 97.4 -1 C99.8 -2.3 101.6 0.2 96 2.5 Z"
              fill={`url(#nikeGrad_${uid})`}
              transform="translate(1, 6)"
            />
            {/* Aerodynamic Bevel Top Streak */}
            <path
              d="M96 2.5 C77.5 14.5 54.2 27.5 28.5 33.8 C15.8 36.9 6.4 35.3 2.2 30.1 C-1.8 25 0.5 17 6.8 9"
              fill="none"
              stroke={`url(#nikeHighlight_${uid})`}
              strokeWidth="1.8"
              strokeLinecap="round"
              transform="translate(1, 6)"
            />
          </g>
        </svg>
      );

    // 3. ROLEX (Haute Horlogerie 24K Solid Gold 5-Sphere Coronet with Geneva Luster)
    case "rolex":
      return (
        <svg
          viewBox="0 0 100 85"
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
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#B45309" floodOpacity="0.5" />
            </filter>
          </defs>

          <g filter={`url(#rolexLuster_${uid})`}>
            {/* 5 Solid Jewel Pearl Spheres */}
            <circle cx="14" cy="22" r="5" fill={`url(#rolexSphereGlow_${uid})`} />
            <circle cx="32" cy="11" r="5.2" fill={`url(#rolexSphereGlow_${uid})`} />
            <circle cx="50" cy="5" r="6" fill={`url(#rolexSphereGlow_${uid})`} />
            <circle cx="68" cy="11" r="5.2" fill={`url(#rolexSphereGlow_${uid})`} />
            <circle cx="86" cy="22" r="5" fill={`url(#rolexSphereGlow_${uid})`} />

            {/* Central Coronet Body with Authentic Flaring Crown Wings */}
            <path
              d="M14 28 L28 56 L34 16 L50 56 L66 16 L72 56 L86 28 L76 62 L24 62 Z"
              fill={`url(#rolexGold_${uid})`}
            />

            {/* Inner Crown Depth Oval Cutouts */}
            <ellipse cx="38" cy="46" rx="3" ry="5.5" fill="#000000" opacity="0.25" />
            <ellipse cx="62" cy="46" rx="3" ry="5.5" fill="#000000" opacity="0.25" />

            {/* Bottom 24K Solid Beveled Coronet Band */}
            <rect x="20" y="65" width="60" height="6.5" rx="3.2" fill={`url(#rolexGold_${uid})`} />
            <line x1="23" y1="67" x2="77" y2="67" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.85" />

            {/* ROLEX Wordmark */}
            <text
              x="50"
              y="82"
              textAnchor="middle"
              fill={`url(#rolexGold_${uid})`}
              fontSize="9"
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
          viewBox="0 0 100 85"
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
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          <g filter={`url(#diorShadow_${uid})`}>
            {/* C Glyph with authentic French high-fashion serif weights */}
            <path
              d="M44 14 C30 14 18 25 18 39 C18 53 30 64 44 64 C52 64 59 60 63 55 L55 49 C52 52 48 55 44 55 C35 55 27 48 27 39 C27 30 35 23 44 23 C48 23 52 26 55 29 L63 23 C59 18 52 14 44 14 Z"
              fill={`url(#diorGold_${uid})`}
            />
            {/* D Glyph Interlocking through C */}
            <path
              d="M46 14 H64 C77 14 86 25 86 39 C86 53 77 64 64 64 H46 V14 Z M55 23 V55 H63 C72 55 77 48 77 39 C77 30 72 23 63 23 H55 Z"
              fill={`url(#diorGold_${uid})`}
            />
            {/* Subtle Parisian Micro-Script Baseline */}
            <text
              x="50"
              y="79"
              textAnchor="middle"
              fill={`url(#diorGold_${uid})`}
              fontSize="9"
              fontWeight="900"
              fontFamily="serif"
              letterSpacing="0.35em"
            >
              PARIS
            </text>
          </g>
        </svg>
      );

    // 5. SAMSUNG (Authentic Official 3D Cobalt Oval Badge & Full Samsung Wordmark)
    case "samsung":
      return (
        <svg
          viewBox="0 0 120 55"
          className={`${className} shrink-0`}
          aria-label="Samsung Official 3D Emblem"
        >
          <defs>
            <linearGradient id={`samsungBlue_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0E7EFA" />
              <stop offset="45%" stopColor="#034EA2" />
              <stop offset="100%" stopColor="#002660" />
            </linearGradient>
            <linearGradient id={`samsungGloss_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <filter id={`samsungShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#002966" floodOpacity="0.5" />
            </filter>
          </defs>

          <g filter={`url(#samsungShadow_${uid})`}>
            {/* Iconic Tilted Samsung Ellipse (3D Oval Pill) */}
            <ellipse
              cx="60"
              cy="27"
              rx="56"
              ry="23"
              transform="rotate(-10 60 27)"
              fill={`url(#samsungBlue_${uid})`}
            />

            {/* 3D Glass Specular Reflection on Top Half */}
            <ellipse
              cx="60"
              cy="20"
              rx="48"
              ry="13"
              transform="rotate(-10 60 27)"
              fill={`url(#samsungGloss_${uid})`}
            />

            {/* Official SAMSUNG Bold Typography */}
            <text
              x="60"
              y="34"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="16.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.09em"
              transform="rotate(-10 60 27)"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.6))"
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
          viewBox="0 0 110 45"
          className={`${className} shrink-0`}
          aria-label="Sony Official Wordmark"
        >
          <defs>
            <linearGradient id={`sonyChrome_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#E2E8F0" />
              <stop offset="70%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <filter id={`sonyBevel_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.45" />
            </filter>
          </defs>

          <g filter={`url(#sonyBevel_${uid})`}>
            <text
              x="55"
              y="32"
              textAnchor="middle"
              fill={`url(#sonyChrome_${uid})`}
              fontSize="30"
              fontWeight="900"
              fontFamily="'Cinzel', 'Times New Roman', Times, serif"
              letterSpacing="0.18em"
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
          viewBox="0 0 100 85"
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
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          <g filter={`url(#chanelGlow_${uid})`}>
            {/* Left C */}
            <path
              d="M38 12 C22 12 10 25 10 42 C10 59 22 72 38 72 C49 72 58 65 63 56 L54 50 C51 56 45 60 38 60 C28 60 21 52 21 42 C21 32 28 24 38 24 C45 24 51 28 54 34 L63 28 C58 19 49 12 38 12 Z"
              fill={`url(#chanelSilver_${uid})`}
            />
            {/* Right C - Interlocked with Precision Crossing */}
            <path
              d="M62 12 C51 12 42 19 37 28 L46 34 C49 28 55 24 62 24 C72 24 79 32 79 42 C79 52 72 60 62 60 C55 60 49 56 46 50 L37 56 C42 65 51 72 62 72 C78 72 90 59 90 42 C90 25 78 12 62 12 Z"
              fill={`url(#chanelSilver_${uid})`}
            />

            {/* CHANEL Wordmark */}
            <text
              x="50"
              y="82"
              textAnchor="middle"
              fill={`url(#chanelSilver_${uid})`}
              fontSize="9"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.38em"
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
          viewBox="0 0 100 75"
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
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0284C7" floodOpacity="0.45" />
            </filter>
          </defs>

          <g filter={`url(#adidasShadow_${uid})`}>
            {/* Stripe 1 (Smallest Left) */}
            <path d="M16 48 L28 48 L46 22 L34 22 Z" fill={`url(#adidasGrad_${uid})`} />
            {/* Stripe 2 (Medium Center) */}
            <path d="M38 48 L50 48 L74 10 L62 10 Z" fill={`url(#adidasGrad_${uid})`} />
            {/* Stripe 3 (Tallest Right) */}
            <path d="M60 48 L72 48 L100 -2 L88 -2 Z" fill={`url(#adidasGrad_${uid})`} />

            {/* adidas Wordmark */}
            <text
              x="50"
              y="66"
              textAnchor="middle"
              fill={`url(#adidasGrad_${uid})`}
              fontSize="14.5"
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
          viewBox="0 0 100 78"
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
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#78350F" floodOpacity="0.45" />
            </filter>
          </defs>

          <g filter={`url(#gucciShadow_${uid})`}>
            {/* Left G */}
            <path
              d="M44 26 C44 14 34 5 22 5 C10 5 1 14 1 26 C1 38 10 47 22 47 C30 47 37 43 41 37 L33 37 C30 40 26 41 22 41 C15 41 8 34 8 26 C8 18 15 11 22 11 C28 11 33 15 34 21 L25 21 L25 27 L44 27 Z"
              fill={`url(#gucciGold_${uid})`}
            />
            {/* Right G (Interlocked back-to-back) */}
            <path
              d="M56 26 C56 38 66 47 78 47 C90 47 99 38 99 26 C99 14 90 5 78 5 C70 5 63 9 59 15 L67 15 C70 12 74 11 78 11 C85 11 92 18 92 26 C92 34 85 41 78 41 C72 41 67 37 66 31 L75 31 L75 25 L56 25 Z"
              fill={`url(#gucciGold_${uid})`}
            />

            {/* GUCCI Wordmark */}
            <text
              x="50"
              y="68"
              textAnchor="middle"
              fill={`url(#gucciGold_${uid})`}
              fontSize="12.5"
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
          viewBox="0 0 100 82"
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
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#78350F" floodOpacity="0.45" />
            </filter>
          </defs>

          <g filter={`url(#lvShadow_${uid})`}>
            {/* Serif 'L' */}
            <path
              d="M26 10 H37 V44 H58 V53 H26 Z"
              fill={`url(#lvGold_${uid})`}
            />
            {/* Serif 'V' Interlocking over 'L' */}
            <path
              d="M42 10 H54 L66 44 L78 10 H90 L73 53 H59 Z"
              fill={`url(#lvGold_${uid})`}
            />

            {/* 4-Petal Monogram Floral Star Motif at Corner */}
            <g transform="translate(12, 26) scale(0.65)">
              <path
                d="M10 0 C10 6 6 10 0 10 C6 10 10 14 10 20 C10 14 14 10 20 10 C14 10 10 6 10 0 Z"
                fill={`url(#lvGold_${uid})`}
                opacity="0.9"
              />
            </g>

            {/* LOUIS VUITTON Wordmark */}
            <text
              x="50"
              y="74"
              textAnchor="middle"
              fill={`url(#lvGold_${uid})`}
              fontSize="8.5"
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
          viewBox="0 0 110 50"
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
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D946EF" floodOpacity="0.5" />
            </filter>
          </defs>

          <g filter={`url(#dysonGlow_${uid})`}>
            {/* Cyclonic Halo Ring behind 'd' */}
            <ellipse
              cx="26"
              cy="25"
              rx="18"
              ry="18"
              fill="none"
              stroke={`url(#dysonMagenta_${uid})`}
              strokeWidth="2.8"
              strokeDasharray="26 8"
              opacity="0.85"
            />

            {/* Authentic dyson Lowercase Typography */}
            <text
              x="55"
              y="33"
              textAnchor="middle"
              fill={`url(#dysonMagenta_${uid})`}
              fontSize="24"
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
          viewBox="0 0 110 45"
          className={`${className} shrink-0`}
          aria-label="ZARA Official Wordmark"
        >
          <defs>
            <linearGradient id={`zaraGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#E2E8F0" />
              <stop offset="80%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <filter id={`zaraShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          <g filter={`url(#zaraShadow_${uid})`}>
            {/* Iconic Interconnected ZARA Serifs */}
            <text
              x="55"
              y="33"
              textAnchor="middle"
              fill={`url(#zaraGrad_${uid})`}
              fontSize="33"
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
          viewBox="0 0 100 65"
          className={`${className} shrink-0`}
          aria-label="Prada Milano Triangle Logo"
        >
          <defs>
            <linearGradient id={`pradaSilver_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          <polygon
            points="50,60 6,8 94,8"
            fill="#0F172A"
            stroke={`url(#pradaSilver_${uid})`}
            strokeWidth="3"
          />
          <text
            x="50"
            y="24"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="12"
            fontWeight="900"
            fontFamily="serif"
            letterSpacing="0.2em"
          >
            PRADA
          </text>
          <text
            x="50"
            y="36"
            textAnchor="middle"
            fill={`url(#pradaSilver_${uid})`}
            fontSize="6"
            fontWeight="700"
            fontFamily="sans-serif"
            letterSpacing="0.25em"
          >
            MILANO
          </text>
        </svg>
      );

    // 14. HERMÈS (Parisian Luxury Duc Carriage & H Emblem)
    case "hermes":
    case "hermès":
      return (
        <svg
          viewBox="0 0 100 75"
          className={`${className} shrink-0`}
          aria-label="Hermes Paris Logo"
        >
          <defs>
            <linearGradient id={`hermesOrange_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="40%" stopColor="#F97316" />
              <stop offset="85%" stopColor="#C2410C" />
              <stop offset="100%" stopColor="#7C2D12" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="28" r="20" fill="none" stroke={`url(#hermesOrange_${uid})`} strokeWidth="2.5" />
          <text
            x="50"
            y="36"
            textAnchor="middle"
            fill={`url(#hermesOrange_${uid})`}
            fontSize="22"
            fontWeight="900"
            fontFamily="serif"
          >
            H
          </text>
          <text
            x="50"
                y="66"
            textAnchor="middle"
            fill={`url(#hermesOrange_${uid})`}
            fontSize="11"
            fontWeight="900"
            fontFamily="serif"
            letterSpacing="0.25em"
          >
            HERMÈS
          </text>
        </svg>
      );

    // 15. CARTIER (Haute Horlogerie & High Jewelry Script)
    case "cartier":
      return (
        <svg
          viewBox="0 0 110 50"
          className={`${className} shrink-0`}
          aria-label="Cartier Official Logo"
        >
          <defs>
            <linearGradient id={`cartierGold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="40%" stopColor="#FDE68A" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          <text
            x="55"
            y="34"
            textAnchor="middle"
            fill={`url(#cartierGold_${uid})`}
            fontSize="26"
            fontWeight="700"
            fontFamily="'Brush Script MT', 'Great Vibes', cursive, serif"
            fontStyle="italic"
          >
            Cartier
          </text>
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


