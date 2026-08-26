"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useState } from "react";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = "",
  size = "md",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [isRotating, setIsRotating] = useState(false);

  const isDark = theme === "dark";

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-8.5 h-8.5 sm:w-9 sm:h-9",
    lg: "w-10 h-10",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const handleToggle = () => {
    setIsRotating(true);
    toggleTheme();
    setTimeout(() => setIsRotating(false), 450);
  };

  return (
    <button
      id="theme-toggle-master-btn"
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={
        isDark
          ? "التبديل إلى الوضع النهاري (Light Mode)"
          : "التبديل إلى الوضع الليلي (Dark Mode)"
      }
      className={`relative group flex items-center justify-center rounded-full border transition-all duration-300 select-none cursor-pointer active:scale-90 ${
        isDark
          ? "bg-slate-900/90 border-slate-700/80 text-amber-400 hover:border-amber-400/80 hover:bg-slate-800 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
          : "bg-surface/90 border-line text-slate-700 hover:border-orange-500/70 hover:bg-orange-50/50 shadow-xs"
      } ${sizeClasses[size]} ${className}`}
    >
      {/* Background ambient glow pulse on hover */}
      <span
        className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
          isDark ? "bg-amber-400/15 blur-xs" : "bg-orange-500/10 blur-xs"
        }`}
      />

      {/* Animated icon wrapper with 360 spin & spring scale */}
      <div
        className={`flex items-center justify-center transition-all duration-500 ease-out transform ${
          isRotating ? "rotate-[360deg] scale-110" : "rotate-0 scale-100"
        }`}
      >
        {isDark ? (
          <Sun
            size={iconSizes[size]}
            className="text-amber-400 fill-amber-400/30 transition-transform duration-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
          />
        ) : (
          <Moon
            size={iconSizes[size]}
            className="text-slate-700 dark:text-slate-200 fill-slate-700/15 transition-transform duration-300 group-hover:-rotate-12"
          />
        )}
      </div>

      {showLabel && (
        <span className="ms-2 text-xs font-bold text-foreground">
          {isDark ? "نهاري" : "ليلي"}
        </span>
      )}
    </button>
  );
}
