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

    // 1. APPLE (3D Space Grey / Titanium Metallic with Specular Crown)
    case "apple":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} shrink-0 drop-shadow-xs`}
          aria-label="Apple Official 3D Emblem"
        >
          <defs>
            <linearGradient id={`appleGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#E2E8F0" />
              <stop offset="70%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id={`appleShine_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`appleGlow_${uid}`} cx="38%" cy="32%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
            </radialGradient>
            <filter id={`appleShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
            </filter>
          </defs>

          <g filter={`url(#appleShadow_${uid})`}>
            {/* Apple Leaf */}
            <path
              d="M58.5 8.2 C63.8 2 70.8 -0.8 77 0 C77.8 7.2 74.2 14.5 69 19 C63.5 23.8 56.2 26.5 49.5 25.8 C48.8 18.5 52.8 13.5 58.5 8.2 Z"
              fill={`url(#appleGrad_${uid})`}
            />
            {/* Apple Leaf Specular */}
            <path
              d="M58.5 8.2 C63.8 2 70.8 -0.8 77 0 C77.8 7.2 74.2 14.5 69 19 C63.5 23.8 56.2 26.5 49.5 25.8 C48.8 18.5 52.8 13.5 58.5 8.2 Z"
              fill={`url(#appleShine_${uid})`}
              opacity="0.6"
            />

            {/* Apple Body with Precise Silhouette & Bite */}
            <path
              d="M87.5 76.5 C84.8 82.8 81.5 88.5 77.2 93.8 C72.1 100.1 66.8 100 61.2 97.4 C55.4 94.7 50.1 94.6 44.2 97.4 C38.3 100.1 33.3 99.8 28.5 93.8 C21.2 82.8 15.6 70.5 11.6 57 C7.6 43.2 9.5 30.5 17.5 21.8 C25.5 13 35.8 8.8 48 9 C53.5 9.2 58.8 11.5 63 13.5 C67.2 15.5 70.8 16.5 73 16.2 C76.5 15.5 82.2 12.5 88.8 12.8 C94.5 13.1 99.5 15.2 103 19 C91.5 26 86 35.8 86.2 48 C86.5 60.5 94.2 68.8 104 74.2 C101.5 82 96.5 90.2 91.5 96.8 C89 93.5 88.2 85 87.5 76.5 Z"
              transform="scale(0.88) translate(3, 4)"
              fill={`url(#appleGrad_${uid})`}
            />
            {/* Apple 3D Body Lighting */}
            <path
              d="M87.5 76.5 C84.8 82.8 81.5 88.5 77.2 93.8 C72.1 100.1 66.8 100 61.2 97.4 C55.4 94.7 50.1 94.6 44.2 97.4 C38.3 100.1 33.3 99.8 28.5 93.8 C21.2 82.8 15.6 70.5 11.6 57 C7.6 43.2 9.5 30.5 17.5 21.8 C25.5 13 35.8 8.8 48 9 C53.5 9.2 58.8 11.5 63 13.5 C67.2 15.5 70.8 16.5 73 16.2 C76.5 15.5 82.2 12.5 88.8 12.8 C94.5 13.1 99.5 15.2 103 19 C91.5 26 86 35.8 86.2 48 C86.5 60.5 94.2 68.8 104 74.2 C101.5 82 96.5 90.2 91.5 96.8 C89 93.5 88.2 85 87.5 76.5 Z"
              transform="scale(0.88) translate(3, 4)"
              fill={`url(#appleGlow_${uid})`}
            />
          </g>
        </svg>
      );

    // 2. NIKE (3D Energetic Swoosh with Liquid Aerodynamic Depth & Bevel)
    case "nike":
      return (
        <svg
          viewBox="0 0 100 50"
          className={`${className} shrink-0 drop-shadow-xs`}
          aria-label="Nike Official 3D Swoosh"
        >
          <defs>
            <linearGradient id={`nikeGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#FF6B00" />
              <stop offset="70%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <linearGradient id={`nikeHighlight_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#FED7AA" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </linearGradient>
            <filter id={`nikeGlow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#EA580C" floodOpacity="0.4" />
            </filter>
          </defs>

          <g filter={`url(#nikeGlow_${uid})`}>
            <path
              d="M96 2 C78.5 13.8 55.2 26.2 29.5 32.5 C16.8 35.7 7.4 34.3 3.2 29.3 C-1.1 24.3 0.7 16.7 6.7 9 C7.4 8.1 8.3 8.4 7.9 9.3 C4.2 16.3 4.7 22.1 8.7 25.8 C13 29.7 21.4 29.3 33.2 25.6 C55.4 18.7 78.7 7.4 94.2 -0.8 C96.6 -2.1 98.4 0.3 96 2 Z"
              fill={`url(#nikeGrad_${uid})`}
              transform="translate(2, 6) scale(0.96)"
            />
            {/* Top Aerodynamic Bevel Streak */}
            <path
              d="M96 2 C78.5 13.8 55.2 26.2 29.5 32.5 C16.8 35.7 7.4 34.3 3.2 29.3 C-1.1 24.3 0.7 16.7 6.7 9"
              fill="none"
              stroke={`url(#nikeHighlight_${uid})`}
              strokeWidth="1.5"
              strokeLinecap="round"
              transform="translate(2, 6) scale(0.96)"
            />
          </g>
        </svg>
      );

    // 3. ROLEX (Haute Horlogerie 24K Polished Gold 5-Sphere Coronet with Geneva Luster)
    case "rolex":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} shrink-0 drop-shadow-xs`}
          aria-label="Rolex Official 5-Point Crown Emblem"
        >
          <defs>
            <linearGradient id={`rolexGold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
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
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#B45309" floodOpacity="0.4" />
            </filter>
          </defs>

          <g filter={`url(#rolexLuster_${uid})`}>
            {/* 5 Solid Jewel Pearl Spheres */}
            <circle cx="12" cy="38" r="6" fill={`url(#rolexSphereGlow_${uid})`} />
            <circle cx="31" cy="22" r="6.2" fill={`url(#rolexSphereGlow_${uid})`} />
            <circle cx="50" cy="14" r="7" fill={`url(#rolexSphereGlow_${uid})`} />
            <circle cx="69" cy="22" r="6.2" fill={`url(#rolexSphereGlow_${uid})`} />
            <circle cx="88" cy="38" r="6" fill={`url(#rolexSphereGlow_${uid})`} />

            {/* Central Coronet Body with Authentic Flaring Crown Wings */}
            <path
              d="M15 46 L29 74 L37 32 L50 74 L63 32 L71 74 L85 46 L76 81 L24 81 Z"
              fill={`url(#rolexGold_${uid})`}
            />

            {/* Inner Crown Depth Oval Cutouts */}
            <ellipse cx="39" cy="62" rx="3.5" ry="7" fill="#000000" opacity="0.22" />
            <ellipse cx="61" cy="62" rx="3.5" ry="7" fill="#000000" opacity="0.22" />

            {/* Bottom 24K Solid Beveled Coronet Band */}
            <rect x="21" y="84" width="58" height="7" rx="3.5" fill={`url(#rolexGold_${uid})`} />
            <line x1="24" y1="86" x2="76" y2="86" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
          </g>
        </svg>
      );

    // 4. DIOR (Parisian Haute Couture Christian Dior CD Monogram & Parisian Gold Finish)
    case "dior":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} shrink-0 drop-shadow-xs`}
          aria-label="Christian Dior Official Monogram"
        >
          <defs>
            <linearGradient id={`diorGold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="35%" stopColor="#FDE68A" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <filter id={`diorShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
            </filter>
          </defs>

          <g filter={`url(#diorShadow_${uid})`}>
            {/* C Glyph with authentic French high-fashion serif weights */}
            <path
              d="M48 22 C32 22 18 34 18 50 C18 66 32 78 48 78 C57 78 64 74 69 68 L60 61 C57 65 53 68 48 68 C38 68 29 59 29 50 C29 41 38 32 48 32 C53 32 57 35 60 39 L69 32 C64 26 57 22 48 22 Z"
              fill={`url(#diorGold_${uid})`}
            />
            {/* D Glyph Interlocking through C */}
            <path
              d="M50 22 H68 C82 22 92 34 92 50 C92 66 82 78 68 78 H50 V22 Z M60 32 V68 H67 C76 68 81 60 81 50 C81 40 76 32 67 32 H60 Z"
              fill={`url(#diorGold_${uid})`}
            />
            {/* Subtle Parisian Micro-Script Baseline */}
            <text
              x="50"
              y="94"
              textAnchor="middle"
              fill={`url(#diorGold_${uid})`}
              fontSize="10"
              fontWeight="900"
              fontFamily="serif"
              letterSpacing="0.3em"
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
          viewBox="0 0 120 60"
          className={`${className} shrink-0 drop-shadow-xs`}
          aria-label="Samsung Official 3D Emblem"
        >
          <defs>
            <linearGradient id={`samsungBlue_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0A72EA" />
              <stop offset="45%" stopColor="#034EA2" />
              <stop offset="100%" stopColor="#002966" />
            </linearGradient>
            <linearGradient id={`samsungGloss_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <filter id={`samsungShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#002966" floodOpacity="0.45" />
            </filter>
          </defs>

          <g filter={`url(#samsungShadow_${uid})`}>
            {/* Iconic Tilted Samsung Ellipse (3D Oval Pill) */}
            <ellipse
              cx="60"
              cy="30"
              rx="56"
              ry="24"
              transform="rotate(-12 60 30)"
              fill={`url(#samsungBlue_${uid})`}
            />

            {/* 3D Glass Specular Reflection on Top Half */}
            <ellipse
              cx="60"
              cy="23"
              rx="48"
              ry="14"
              transform="rotate(-12 60 30)"
              fill={`url(#samsungGloss_${uid})`}
            />

            {/* Official SAMSUNG Bold Typography */}
            <text
              x="60"
              y="37"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="16.5"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.09em"
              transform="rotate(-12 60 30)"
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
            >
              SAMSUNG
            </text>
          </g>
        </svg>
      );

    // 6. SONY (Studio Platinum Chrome Wordmark in Authentic Serif Typography)
    case "sony":
      return (
        <svg
          viewBox="0 0 110 50"
          className={`${className} shrink-0 drop-shadow-xs`}
          aria-label="Sony Official Wordmark"
        >
          <defs>
            <linearGradient id={`sonyChrome_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#CBD5E1" />
              <stop offset="70%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <filter id={`sonyBevel_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>

          <g filter={`url(#sonyBevel_${uid})`}>
            {/* Authentic SONY Slab Serif Lettering */}
            <text
              x="55"
              y="36"
              textAnchor="middle"
              fill={`url(#sonyChrome_${uid})`}
              fontSize="31"
              fontWeight="900"
              fontFamily="'Times New Roman', Times, 'Cinzel', serif"
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
          viewBox="0 0 100 100"
          className={`${className} shrink-0 drop-shadow-xs`}
          aria-label="Chanel Interlocking CC Logo"
        >
          <defs>
            <linearGradient id={`chanelSilver_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <filter id={`chanelGlow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
            </filter>
          </defs>

          <g filter={`url(#chanelGlow_${uid})`}>
            {/* Left C */}
            <path
              d="M38 20 C22 20 10 33 10 50 C10 67 22 80 38 80 C49 80 58 73 63 64 L54 58 C51 64 45 68 38 68 C28 68 21 60 21 50 C21 40 28 32 38 32 C45 32 51 36 54 42 L63 36 C58 27 49 20 38 20 Z"
              fill={`url(#chanelSilver_${uid})`}
            />
            {/* Right C - Interlocked with Precision Crossing */}
            <path
              d="M62 20 C51 20 42 27 37 36 L46 42 C49 36 55 32 62 32 C72 32 79 40 79 50 C79 60 72 68 62 68 C55 68 49 64 46 58 L37 64 C42 73 51 80 62 80 C78 80 90 67 90 50 C90 33 78 20 62 20 Z"
              fill={`url(#chanelSilver_${uid})`}
            />

            {/* CHANEL Wordmark */}
            <text
              x="50"
              y="96"
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
          viewBox="0 0 100 80"
          className={`${className} shrink-0 drop-shadow-xs`}
          aria-label="Adidas Official 3-Stripes Emblem"
        >
          <defs>
            <linearGradient id={`adidasGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="35%" stopColor="#0284C7" />
              <stop offset="80%" stopColor="#0369A1" />
              <stop offset="100%" stopColor="#0C4A6E" />
            </linearGradient>
            <filter id={`adidasShadow_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0284C7" floodOpacity="0.4" />
            </filter>
          </defs>

          <g filter={`url(#adidasShadow_${uid})`}>
            {/* Stripe 1 (Smallest Left) */}
            <path d="M12 56 L24 56 L44 26 L32 26 Z" fill={`url(#adidasGrad_${uid})`} />
            {/* Stripe 2 (Medium Center) */}
            <path d="M36 56 L48 56 L74 12 L62 12 Z" fill={`url(#adidasGrad_${uid})`} />
            {/* Stripe 3 (Tallest Right) */}
            <path d="M60 56 L72 56 L104 -2 L92 -2 Z" fill={`url(#adidasGrad_${uid})`} />

            {/* adidas Wordmark */}
            <text
              x="50"
              y="74"
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
          viewBox="0 0 100 80"
          className={`${className} shrink-0 drop-shadow-xs`}
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
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#78350F" floodOpacity="0.4" />
            </filter>
          </defs>

          <g filter={`url(#gucciShadow_${uid})`}>
            {/* Left G */}
            <path
              d="M44 32 C44 20 34 11 22 11 C10 11 1 20 1 32 C1 44 10 53 22 53 C30 53 37 49 41 43 L33 43 C30 46 26 47 22 47 C15 47 8 40 8 32 C8 24 15 17 22 17 C28 17 33 21 34 27 L25 27 L25 33 L44 33 Z"
              fill={`url(#gucciGold_${uid})`}
            />
            {/* Right G (Interlocked back-to-back) */}
            <path
              d="M56 32 C56 44 66 53 78 53 C90 53 99 44 99 32 C99 20 90 11 78 11 C70 11 63 15 59 21 L67 21 C70 18 74 17 78 17 C85 17 92 24 92 32 C92 40 85 47 78 47 C72 47 67 43 66 37 L75 37 L75 31 L56 31 Z"
              fill={`url(#gucciGold_${uid})`}
            />

            {/* GUCCI Wordmark */}
            <text
              x="50"
              y="74"
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
          viewBox="0 0 100 85"
          className={`${className} shrink-0 drop-shadow-xs`}
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
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#78350F" floodOpacity="0.4" />
            </filter>
          </defs>

          <g filter={`url(#lvShadow_${uid})`}>
            {/* Serif 'L' */}
            <path
              d="M26 12 H37 V48 H58 V57 H26 Z"
              fill={`url(#lvGold_${uid})`}
            />
            {/* Serif 'V' Interlocking over 'L' */}
            <path
              d="M42 12 H54 L66 48 L78 12 H90 L73 57 H59 Z"
              fill={`url(#lvGold_${uid})`}
            />

            {/* 4-Petal Monogram Floral Star Motif at Corner */}
            <g transform="translate(14, 28) scale(0.6)">
              <path
                d="M10 0 C10 6 6 10 0 10 C6 10 10 14 10 20 C10 14 14 10 20 10 C14 10 10 6 10 0 Z"
                fill={`url(#lvGold_${uid})`}
                opacity="0.85"
              />
            </g>

            {/* LOUIS VUITTON Wordmark */}
            <text
              x="50"
              y="77"
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
          className={`${className} shrink-0 drop-shadow-xs`}
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
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D946EF" floodOpacity="0.45" />
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
              strokeWidth="2.5"
              strokeDasharray="28 8"
              opacity="0.75"
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
          viewBox="0 0 110 50"
          className={`${className} shrink-0 drop-shadow-xs`}
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
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
            </filter>
          </defs>

          <g filter={`url(#zaraShadow_${uid})`}>
            {/* Iconic Interconnected ZARA Serifs */}
            <text
              x="55"
              y="37"
              textAnchor="middle"
              fill={`url(#zaraGrad_${uid})`}
              fontSize="34"
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
          viewBox="0 0 100 70"
          className={`${className} shrink-0 drop-shadow-xs`}
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
            points="50,65 5,10 95,10"
            fill="#0F172A"
            stroke={`url(#pradaSilver_${uid})`}
            strokeWidth="3"
          />
          <text
            x="50"
            y="26"
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
            y="38"
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
          viewBox="0 0 100 80"
          className={`${className} shrink-0 drop-shadow-xs`}
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
          <circle cx="50" cy="30" r="22" fill="none" stroke={`url(#hermesOrange_${uid})`} strokeWidth="2.5" />
          <text
            x="50"
            y="38"
            textAnchor="middle"
            fill={`url(#hermesOrange_${uid})`}
            fontSize="24"
            fontWeight="900"
            fontFamily="serif"
          >
            H
          </text>
          <text
            x="50"
            y="70"
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
          className={`${className} shrink-0 drop-shadow-xs`}
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


