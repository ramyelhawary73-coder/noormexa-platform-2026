"use client";

import Image from "next/image";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  taglineText?: string;
  className?: string;
}

export default function BrandLogo({
  size = "md",
  showTagline = true,
  taglineText = "سوق ومنظومة التجارة العالمية",
  className = "",
}: BrandLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [imgError, setImgError] = useState(false);

  const dimensions = {
    sm: { icon: 34, width: 130, height: 34, text: "text-base", sub: "text-[9px]" },
    md: { icon: 42, width: 160, height: 42, text: "text-lg", sub: "text-[10px]" },
    lg: { icon: 52, width: 190, height: 52, text: "text-xl", sub: "text-xs" },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem Icon */}
      <div
        className="relative flex items-center justify-center rounded-2xl overflow-hidden shadow-sm transition-transform hover:scale-105 border border-line"
        style={{ width: dimensions.icon, height: dimensions.icon }}
      >
        {!imgError ? (
          <Image
            src={isDark ? "/brand/lockup-dark-mode.png" : "/brand/lockup-light-mode.png"}
            alt="NOORMEXA Logo"
            width={dimensions.icon}
            height={dimensions.icon}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy to-slate-900 text-gold font-extrabold font-sans">
            <span>NRX</span>
          </div>
        )}
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-wider text-foreground font-sans uppercase ${dimensions.text}`}>
            NOORMEXA
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        </div>
        {showTagline && (
          <span className={`text-muted font-bold tracking-tight truncate max-w-[140px] sm:max-w-[220px] mt-0.5 ${dimensions.sub}`}>
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );
}
