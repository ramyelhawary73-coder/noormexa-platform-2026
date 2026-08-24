"use client";

import React from "react";
import { NoormexaEmblemSvg } from "@/components/BrandLogo";

interface BrandLogoProps {
  brandId: string;
  className?: string;
  size?: number | string;
  variant?: "icon" | "badge" | "full";
}

export function BrandLogo({ brandId, className = "w-7 h-7" }: BrandLogoProps) {
  const normalizedId = brandId.toLowerCase().trim();

  switch (normalizedId) {
    case "noormexa":
      return <NoormexaEmblemSvg size={28} className={`${className} shrink-0`} />;

    case "apple":
      return (
        <svg
          viewBox="0 0 170 170"
          className={`${className} fill-current`}
          aria-label="Apple Official Logo"
        >
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.79-11.97-14.25-6.53-9.9-11.59-20.98-15.18-33.24-3.59-12.26-5.38-23.75-5.38-34.45 0-14.13 3.59-26.04 10.77-35.73 7.18-9.69 16.32-14.65 27.42-14.88 4.35 0 9.42 1.25 15.22 3.75 5.8 2.5 9.74 3.86 11.83 4.08 1.96-.22 6.07-1.63 12.33-4.24 6.26-2.61 11.52-3.8 15.78-3.58 11.96.65 21.64 4.89 29.04 12.72-10.44 6.31-15.55 15-15.33 26.09.22 8.7 3.49 16.09 9.8 22.18 6.31 6.09 13.92 9.57 22.84 10.44-2.39 7.18-5.38 14.57-8.97 22.18zM119.22 31.84c0-7.39 2.66-14.24 7.99-20.55 5.33-6.31 11.75-10.22 19.25-11.29.22 1.09.33 2.18.33 3.26 0 7.39-2.77 14.35-8.32 20.88-5.55 6.53-12.07 10.33-19.58 11.41-.11-1.08-.22-2.17-.22-3.26z" />
        </svg>
      );

    case "nike":
      return (
        <svg
          viewBox="0 0 24 24"
          className={`${className} fill-current`}
          aria-label="Nike Swoosh Logo"
        >
          <path d="M21.88 5.74c-4.48 2.58-10.23 7.02-13.88 10.25-2.15 1.9-4.18 1.92-5.32.96-1.53-1.29-.98-4.17 1.49-7.87C6.31 5.86 9.36 3.08 12.98 1.2c-2.14.73-5.69 2.58-8.43 5.56-3.4 3.69-3.97 7.27-1.9 9.87 2.08 2.61 6.08 2.29 9.94-.61 4.54-3.41 10.59-7.94 12.87-9.42.47-.3.5-.83-.07-.83-.53 0-2.13.72-3.51 1.57z" />
        </svg>
      );

    case "rolex":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} fill-amber-500 dark:fill-amber-400`}
          aria-label="Rolex Official Crown Logo"
        >
          <circle cx="12" cy="38" r="4.5" />
          <circle cx="31" cy="22" r="4.5" />
          <circle cx="50" cy="14" r="5" />
          <circle cx="69" cy="22" r="4.5" />
          <circle cx="88" cy="38" r="4.5" />
          <path d="M15 48 L28 72 L38 34 L50 72 L62 34 L72 72 L85 48 L76 80 L24 80 Z" />
          <path d="M22 84 H78 V88 H22 Z" />
        </svg>
      );

    case "dior":
      return (
        <div className="flex flex-col items-center justify-center select-none font-serif tracking-[0.25em] text-foreground font-black text-xs leading-tight">
          <span>DIOR</span>
          <span className="text-[7px] font-sans tracking-[0.3em] text-muted opacity-80">PARIS</span>
        </div>
      );

    case "samsung":
      return (
        <div className="flex items-center justify-center select-none font-sans font-black tracking-[0.15em] text-[11px] px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/30">
          SAMSUNG
        </div>
      );

    case "sony":
      return (
        <div className="flex items-center justify-center select-none font-serif font-black tracking-[0.22em] text-xs text-foreground">
          SONY
        </div>
      );

    case "chanel":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} fill-current`}
          aria-label="Chanel Interlocking CC Logo"
        >
          <path d="M38 26 C25 26 15 36 15 50 C15 64 25 74 38 74 C47 74 54 69 58 62 L51 57 C48 62 44 65 38 65 C29 65 23 58 23 50 C23 42 29 35 38 35 C44 35 48 38 51 43 L58 38 C54 31 47 26 38 26 Z" />
          <path d="M62 26 C53 26 46 31 42 38 L49 43 C52 38 56 35 62 35 C71 35 77 42 77 50 C77 58 71 65 62 65 C56 65 52 62 49 57 L42 62 C46 69 53 74 62 74 C75 74 85 64 85 50 C85 36 75 26 62 26 Z" />
        </svg>
      );

    case "adidas":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} fill-current`}
          aria-label="Adidas 3-Stripes Logo"
        >
          <rect x="22" y="58" width="13" height="24" rx="2" transform="skewX(-28)" />
          <rect x="44" y="42" width="13" height="40" rx="2" transform="skewX(-28)" />
          <rect x="66" y="26" width="13" height="56" rx="2" transform="skewX(-28)" />
        </svg>
      );

    case "gucci":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} fill-current`}
          aria-label="Gucci Interlocking GG Logo"
        >
          <path d="M48 50 C48 38 38 28 26 28 C14 28 4 38 4 50 C4 62 14 72 26 72 C35 72 43 67 46 60 L38 60 C36 63 31 65 26 65 C18 65 11 58 11 50 C11 42 18 35 26 35 C33 35 39 40 40 46 L30 46 L30 52 L48 52 Z" />
          <path d="M52 50 C52 62 62 72 74 72 C86 72 96 62 96 50 C96 38 86 28 74 28 C65 28 57 33 54 40 L62 40 C64 37 69 35 74 35 C82 35 89 42 89 50 C89 58 82 65 74 65 C67 65 61 60 60 54 L70 54 L70 48 L52 48 Z" />
        </svg>
      );

    case "lv":
    case "louis-vuitton":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${className} fill-current`}
          aria-label="Louis Vuitton Monogram Logo"
        >
          <path d="M22 28 H30 L30 65 H52 V72 H22 Z" />
          <path d="M42 28 H50 L64 64 L78 28 H86 L68 72 H60 Z" />
        </svg>
      );

    case "dyson":
      return (
        <div className="flex items-center justify-center select-none font-sans font-black tracking-wider text-xs lowercase text-fuchsia-600 dark:text-fuchsia-400">
          dyson
        </div>
      );

    case "zara":
      return (
        <div className="flex items-center justify-center select-none font-serif font-black tracking-[-0.08em] text-sm text-foreground leading-none">
          ZARA
        </div>
      );

    default:
      return (
        <div className="w-7 h-7 rounded-lg bg-surface-soft flex items-center justify-center text-xs font-black text-foreground">
          {brandId.slice(0, 2).toUpperCase()}
        </div>
      );
  }
}
