"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe2, Languages } from "lucide-react";
import { useState } from "react";

interface LanguageToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "pill" | "compact" | "minimal";
  showLabel?: boolean;
}

export default function LanguageToggle({
  className = "",
  size = "md",
  variant = "button",
  showLabel,
}: LanguageToggleProps) {
  const { isAr, toggleLanguage } = useLanguage();
  const [isRotating, setIsRotating] = useState(false);

  const targetLabel = isAr ? "English" : "العربية";
  const targetCode = isAr ? "EN" : "عربي";

  const sizeClasses = {
    sm: "h-8 text-xs px-2 sm:px-2.5",
    md: "h-8.5 sm:h-9 text-xs px-2.5 sm:px-3",
    lg: "h-10 text-sm px-3.5 sm:px-4",
  };

  const iconSizes = {
    sm: 13,
    md: 14,
    lg: 16,
  };

  const handleToggle = () => {
    setIsRotating(true);
    toggleLanguage();
    setTimeout(() => setIsRotating(false), 450);
  };

  if (variant === "pill") {
    return (
      <button
        id="language-toggle-pill-btn"
        type="button"
        onClick={handleToggle}
        aria-label={isAr ? "Switch website language to English" : "تبديل لغة الموقع إلى العربية"}
        title={isAr ? "Switch to English (التبديل للإنجليزية)" : "التبديل للعربية (Switch to Arabic)"}
        className={`relative group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface dark:bg-slate-900/90 hover:border-orange-500/70 hover:bg-orange-50/40 dark:hover:bg-slate-800/80 text-foreground transition-all duration-300 select-none cursor-pointer shadow-xs active:scale-95 ${sizeClasses[size]} ${className}`}
      >
        <span
          className={`flex items-center justify-center transition-transform duration-500 text-orange-500 ${
            isRotating ? "rotate-180 scale-110" : "rotate-0 scale-100"
          }`}
        >
          <Languages size={iconSizes[size]} />
        </span>

        <span className="font-bold tracking-tight">
          {targetLabel}
        </span>

        <span className="px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono text-[10px] font-black border border-orange-500/20">
          {targetCode}
        </span>
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        id="language-toggle-minimal-btn"
        type="button"
        onClick={handleToggle}
        aria-label={isAr ? "Switch to English" : "التبديل للعربية"}
        title={isAr ? "Switch to English" : "التبديل للعربية"}
        className={`relative group flex items-center justify-center rounded-full border border-line bg-surface dark:bg-slate-900 text-foreground hover:border-orange-500/60 hover:text-orange-500 transition-all select-none cursor-pointer active:scale-90 ${
          size === "sm" ? "w-8 h-8" : size === "lg" ? "w-10 h-10" : "w-8.5 h-8.5 sm:w-9 sm:h-9"
        } ${className}`}
      >
        <span
          className={`transition-transform duration-500 ${
            isRotating ? "rotate-180 scale-110" : "rotate-0 scale-100"
          }`}
        >
          <Globe2 size={iconSizes[size]} className="text-orange-500" />
        </span>
      </button>
    );
  }

  // Default "button" / "compact" style
  return (
    <button
      id="language-toggle-btn"
      type="button"
      onClick={handleToggle}
      aria-label={isAr ? "Switch website language to English" : "تبديل لغة الموقع إلى العربية"}
      title={
        isAr
          ? "Switch to English (التبديل إلى الإنجليزية)"
          : "التبديل إلى العربية (Switch to Arabic)"
      }
      className={`relative group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface dark:bg-slate-900 hover:border-orange-500/70 hover:bg-orange-50/40 dark:hover:bg-slate-800/80 text-foreground transition-all duration-300 select-none cursor-pointer shadow-xs active:scale-95 ${sizeClasses[size]} ${className}`}
    >
      {/* Subtle hover glow */}
      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-orange-500/5 blur-xs" />

      {/* Rotating Globe icon */}
      <span
        className={`flex items-center justify-center transition-transform duration-500 text-orange-500 ${
          isRotating ? "rotate-180 scale-110" : "rotate-0 scale-100"
        }`}
      >
        <Globe2 size={iconSizes[size]} />
      </span>

      {/* Language label & code */}
      <span className="text-[11px] sm:text-xs font-black tracking-tight text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
        {showLabel ? (isAr ? "English" : "العربية") : targetCode}
      </span>
    </button>
  );
}
