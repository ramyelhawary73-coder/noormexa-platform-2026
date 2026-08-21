"use client";

import { useState, useEffect } from "react";
import { Flame, Timer, Zap } from "lucide-react";

interface SmoothFlashTimerProps {
  initialHours?: number;
  initialMins?: number;
  initialSecs?: number;
  language?: "ar" | "en";
  className?: string;
  showProgress?: boolean;
}

export default function SmoothFlashTimer({
  initialHours = 13,
  initialMins = 47,
  initialSecs = 28,
  language = "ar",
  className = "",
  showProgress = true,
}: SmoothFlashTimerProps) {
  const isAr = language === "ar";

  // Calculate target end timestamp once and store in localStorage for consistent realistic countdown
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    progressPercent: number;
  }>({
    hours: initialHours,
    minutes: initialMins,
    seconds: initialSecs,
    progressPercent: 78,
  });

  useEffect(() => {
    const STORAGE_KEY = "noormexa_flash_deal_target";
    let targetTime: number;

    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const now = Date.now();

    if (stored && Number(stored) > now) {
      targetTime = Number(stored);
    } else {
      // 14 hours ahead from now
      targetTime = now + (14 * 60 * 60 + 35 * 60 + 20) * 1000;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, String(targetTime));
      }
    }

    const totalDealDuration = 24 * 60 * 60 * 1000; // 24 hours total

    const updateTimer = () => {
      const currentNow = Date.now();
      const diff = targetTime - currentNow;

      if (diff <= 0) {
        // Reset cycle for endless dynamic shopping excitement
        const newTarget = currentNow + 24 * 60 * 60 * 1000;
        targetTime = newTarget;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, String(newTarget));
        }
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const remainingRatio = Math.min(100, Math.max(15, Math.floor((diff / totalDealDuration) * 100)));

      setTimeLeft({
        hours,
        minutes,
        seconds,
        progressPercent: remainingRatio,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 sm:p-4 rounded-3xl bg-surface border border-line shadow-md relative overflow-hidden group ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 end-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
          <Flame size={20} className="fill-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
            <Timer size={13} className="text-orange-500" />
            <span>{isAr ? "ينتهي العرض الخاطف خلال:" : "Flash Deals Expire In:"}</span>
          </div>
          <p className="text-[11px] text-muted font-bold">
            {isAr ? "خصومات حصرية متجددة تلقائياً" : "Auto-renewing exclusive discounts"}
          </p>
        </div>
      </div>

      {/* Digital Flip Clock Counter Display */}
      <div className="flex items-center gap-1.5 sm:gap-2 mx-auto sm:mx-0 sm:ms-auto font-mono" dir="ltr">
        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-inner border border-white/10 relative overflow-hidden">
            <span className="relative z-10">{pad(timeLeft.hours)}</span>
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 border-b border-white/10" />
          </div>
          <span className="text-[9px] text-muted font-bold mt-1 uppercase tracking-wider">
            {isAr ? "ساعة" : "Hours"}
          </span>
        </div>

        <span className="text-orange-500 font-black text-lg -mt-4">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-inner border border-white/10 relative overflow-hidden">
            <span className="relative z-10">{pad(timeLeft.minutes)}</span>
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/5 border-b border-white/10" />
          </div>
          <span className="text-[9px] text-muted font-bold mt-1 uppercase tracking-wider">
            {isAr ? "دقيقة" : "Mins"}
          </span>
        </div>

        <span className="text-orange-500 font-black text-lg -mt-4">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="w-11 sm:w-12 h-11 sm:h-12 rounded-2xl bg-gradient-to-b from-orange-600 to-red-600 text-white flex items-center justify-center font-black text-base sm:text-lg shadow-md border border-orange-400/40 relative overflow-hidden animate-pulse">
            <span className="relative z-10">{pad(timeLeft.seconds)}</span>
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/15 border-b border-white/20" />
          </div>
          <span className="text-[9px] text-orange-600 dark:text-orange-400 font-black mt-1 uppercase tracking-wider">
            {isAr ? "ثانية" : "Secs"}
          </span>
        </div>
      </div>

      {/* Mini Deals Progress Bar */}
      {showProgress && (
        <div className="w-full sm:hidden pt-2 border-t border-line">
          <div className="flex items-center justify-between text-[10px] text-muted font-bold mb-1">
            <span className="flex items-center gap-1 text-red-500">
              <Zap size={11} className="fill-red-500" />
              <span>{isAr ? "تم حجز 86% من الصفقات" : "86% claimed"}</span>
            </span>
            <span className="font-mono">{timeLeft.progressPercent}% {isAr ? "متبقي" : "left"}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-soft overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${100 - timeLeft.progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
