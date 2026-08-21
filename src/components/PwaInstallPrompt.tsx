"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Download,
  Share,
  PlusSquare,
  Smartphone,
  Laptop,
  X,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { NoormexaEmblemSvg } from "@/components/BrandLogo";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [activeTab, setActiveTab] = useState<"desktop" | "android" | "ios">("desktop");
  const [copied, setCopied] = useState(false);

  // Ref to hold the triggerInstallFlow function safely for event listeners
  const installFlowRef = useRef<() => void>(() => {});

  // Trigger Install Flow
  const triggerInstallFlow = useCallback(async () => {
    // 1. If native browser prompt is ready and we can prompt directly:
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setShowBanner(false);
          setShowModal(false);
        }
        setDeferredPrompt(null);
        return;
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    }

    // 2. Otherwise (in iframe, Safari, or before native prompt arrives), open the interactive Install Hub Modal
    setShowModal(true);
  }, [deferredPrompt]);

  useEffect(() => {
    installFlowRef.current = triggerInstallFlow;
  }, [triggerInstallFlow]);

  // Check device and register service worker
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect device to set default modal tab
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isAppleDevice) {
      setTimeout(() => setActiveTab("ios"), 0);
    } else if (isAndroid) {
      setTimeout(() => setActiveTab("android"), 0);
    } else {
      setTimeout(() => setActiveTab("desktop"), 0);
    }

    // Register Service Worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[NOORMEXA] PWA Service Worker active with scope:", reg.scope);
        })
        .catch((err) => {
          console.log("[NOORMEXA] Service Worker registration note:", err);
        });
    }

    // Check if already in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error navigator.standalone on iOS
      Boolean(window.navigator.standalone) ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      const timer = setTimeout(() => setIsInstalled(true), 0);
      return () => clearTimeout(timer);
    }

    const wasDismissed = window.sessionStorage.getItem("noormexa_pwa_dismissed");

    let bannerTimeout: NodeJS.Timeout | undefined;

    if (!wasDismissed) {
      bannerTimeout = setTimeout(() => setShowBanner(true), 4000);
    }

    // Listen for BeforeInstallPrompt on Chrome, Edge, Android, Desktop
    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!wasDismissed) {
        setTimeout(() => setShowBanner(true), 2500);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setShowModal(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // Custom global event listener for header/footer install triggers
    const handleCustomTrigger = () => {
      installFlowRef.current();
    };
    window.addEventListener("noormexa-trigger-pwa-install", handleCustomTrigger);

    return () => {
      if (bannerTimeout) clearTimeout(bannerTimeout);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("noormexa-trigger-pwa-install", handleCustomTrigger);
    };
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("noormexa_pwa_dismissed", "true");
    }
  };

  const handleOpenStandaloneTab = () => {
    if (typeof window !== "undefined") {
      window.open(window.location.origin, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      {/* 1. Floating World-Class PWA Install Banner */}
      {showBanner && !showModal && (
        <div className="fixed bottom-20 md:bottom-6 start-3 end-3 sm:start-auto sm:end-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 rounded-3xl bg-slate-950/95 text-white border-2 border-orange-500/40 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
            {/* Ambient Gold Glow Accent */}
            <div className="absolute top-0 end-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3.5 relative z-10">
              {/* App Icon */}
              <div className="relative shrink-0 w-12 h-12 rounded-2xl bg-slate-900 border border-orange-500/40 p-1 flex items-center justify-center shadow-lg">
                <NoormexaEmblemSvg size={36} isDark={true} />
                <span className="absolute -top-1 -end-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>

              {/* Text & Features */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-black text-sm text-white tracking-wide">
                    تطبيق NOORMEXA الرسمي
                  </span>
                  <Sparkles size={13} className="text-orange-400" />
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  ثبّت التطبيق الآن على جهازك للوصول السريع وتصفح الصفقات بدون انقطاع!
                </p>

                {/* Compatibility Badges */}
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                    <Laptop size={11} className="text-orange-400" />
                    <span>PC & Mac</span>
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md">
                    <Smartphone size={11} className="text-orange-400" />
                    <span>Android & iOS</span>
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowBanner(false);
                  triggerInstallFlow();
                }}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Download size={14} className="stroke-[2.5]" />
                <span>تثبيت التطبيق الآن</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer text-center"
              >
                <span>لاحقاً</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive World-Class PWA Installation Hub Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3.5 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-950 text-white rounded-3xl p-5 sm:p-6 border-2 border-orange-500/40 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -end-12 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -start-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl bg-slate-900 border border-orange-500/50 p-1 flex items-center justify-center shadow-lg">
                  <NoormexaEmblemSvg size={36} isDark={true} />
                  <span className="absolute -top-1 -end-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-1.5">
                    <span>تثبيت تطبيق NOORMEXA</span>
                    <Sparkles size={16} className="text-orange-400" />
                  </h3>
                  <p className="text-xs text-orange-400 font-bold">
                    سريع، خفيف، ويعمل كبرنامج رسمي على جهازك
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Benefits Strip */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
                <Zap size={14} className="text-amber-400" />
                <span>سرعة فائقة</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>أمان كامل</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
                <Layers size={14} className="text-orange-400" />
                <span>إشعارات حصرية</span>
              </div>
            </div>

            {/* Direct 1-Click Launch Button for Browser Tabs */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/10 border border-orange-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-300">
                  ⚡ للتثبيت التلقائي بنقرة واحدة:
                </span>
                <span className="text-[10px] text-slate-400">Chrome / Edge / Safari</span>
              </div>
              <button
                type="button"
                onClick={handleOpenStandaloneTab}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <ExternalLink size={14} className="stroke-[2.5]" />
                <span>فتح في تبويب المتصفح للتثبيت المباشر</span>
              </button>
            </div>

            {/* Device-Specific Instructions Tabs */}
            <div className="space-y-3">
              <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("desktop")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "desktop"
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Laptop size={13} />
                  <span>الكمبيوتر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("android")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "android"
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Smartphone size={13} />
                  <span>أندرويد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ios")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "ios"
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Smartphone size={13} />
                  <span>آيفون / آيباد</span>
                </button>
              </div>

              {/* Desktop Instructions */}
              {activeTab === "desktop" && (
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-lg bg-orange-500 text-white font-black flex items-center justify-center text-[11px] shrink-0">1</span>
                    <p className="text-[12px] leading-relaxed">
                      في شريط عنوان المتصفح (Address Bar) أعلى الشاشة، اضغط على أيقونة <b>التثبيت</b> (علامة <b>➕</b> أو <b>💻</b>).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-lg bg-orange-500 text-white font-black flex items-center justify-center text-[11px] shrink-0">2</span>
                    <p className="text-[12px] leading-relaxed">
                      اضغط على <b>«Install / تثبيت»</b> وسيتم إطلاق NOORMEXA كتطبيق مستقل على سطح المكتب وقائمة البرامج.
                    </p>
                  </div>
                </div>
              )}

              {/* Android Instructions */}
              {activeTab === "android" && (
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-lg bg-orange-500 text-white font-black flex items-center justify-center text-[11px] shrink-0">1</span>
                    <p className="text-[12px] leading-relaxed">
                      اضغط على قائمة المتصفح <b>(الثلاث نقاط ⋮)</b> في أعلى أو أسفل يمين الشاشة.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-lg bg-orange-500 text-white font-black flex items-center justify-center text-[11px] shrink-0">2</span>
                    <p className="text-[12px] leading-relaxed">
                      اختر <b>«تثبيت التطبيق / Install app»</b> أو <b>«إضافة إلى الشاشة الرئيسية»</b>.
                    </p>
                  </div>
                </div>
              )}

              {/* iOS Instructions */}
              {activeTab === "ios" && (
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-lg bg-orange-500 text-white font-black flex items-center justify-center text-[11px] shrink-0">1</span>
                    <div className="text-[12px] leading-relaxed flex items-center gap-1.5 flex-wrap">
                      <span>اضغط على زر المشاركة</span>
                      <span className="p-0.5 px-1.5 rounded-md bg-blue-500/20 text-blue-400 inline-flex items-center">
                        <Share size={12} />
                      </span>
                      <span>في متصفح Safari أسفل الشاشة.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="w-5 h-5 rounded-lg bg-orange-500 text-white font-black flex items-center justify-center text-[11px] shrink-0">2</span>
                    <div className="text-[12px] leading-relaxed flex items-center gap-1.5 flex-wrap">
                      <span>اختر</span>
                      <span className="p-0.5 px-1.5 rounded-md bg-emerald-500/20 text-emerald-400 inline-flex items-center font-bold">
                        <PlusSquare size={12} className="mr-1" />
                        إضافة للشاشة الرئيسية
                      </span>
                      <span>وستظهر الأيقونة فوراً على شاشة هاتفك.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? "تم نسخ الرابط!" : "نسخ رابط التطبيق"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="py-2.5 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs transition-colors cursor-pointer shadow-md shadow-orange-500/20"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Helper function to trigger PWA install modal from anywhere in the app
 */
export function openPwaInstallModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("noormexa-trigger-pwa-install"));
  }
}
