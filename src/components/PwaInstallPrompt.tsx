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
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Ref to hold the triggerInstallFlow function safely for event listeners
  const installFlowRef = useRef<() => void>(() => {});

  // Trigger Install Flow
  const triggerInstallFlow = useCallback(async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setShowBanner(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else {
      // Fallback instruction
      alert("لتثبيت تطبيق NOORMEXA على جهازك:\n- على الكمبيوتر: اضغط على أيقونة التثبيت (➕ أو 💻) في شريط عنوان المتصفح أعلى الشاشة.\n- على الموبايل: افتح قائمة المتصفح واختر 'إضافة إلى الشاشة الرئيسية' أو 'Install App'.");
    }
  }, [deferredPrompt, isIOS]);

  useEffect(() => {
    installFlowRef.current = triggerInstallFlow;
  }, [triggerInstallFlow]);

  // Check standalone mode (already installed) and event listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register Service Worker
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

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error navigator.standalone on iOS
      Boolean(window.navigator.standalone) ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      const timer = setTimeout(() => setIsInstalled(true), 0);
      return () => clearTimeout(timer);
    }

    // Check if dismissed before in session
    const wasDismissed = window.sessionStorage.getItem("noormexa_pwa_dismissed");

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      /safari/.test(userAgent) &&
      !/chrome|crios|fxios|edgios/.test(userAgent);

    let bannerTimeout: NodeJS.Timeout | undefined;

    if (isAppleDevice) {
      setTimeout(() => setIsIOS(true), 0);
      if (isSafari && !wasDismissed) {
        // Show banner after brief delay
        bannerTimeout = setTimeout(() => setShowBanner(true), 3500);
      }
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

  if (isInstalled) return null;

  return (
    <>
      {/* 1. Floating World-Class PWA Install Banner */}
      {showBanner && (
        <div className="fixed bottom-20 md:bottom-6 start-3 end-3 sm:start-auto sm:end-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 rounded-3xl bg-slate-950/95 text-white border-2 border-orange-500/40 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
            {/* Ambient Gold Glow Accent */}
            <div className="absolute top-0 end-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3.5 relative z-10">
              {/* App Icon */}
              <div className="relative shrink-0 w-13 h-13 rounded-2xl bg-slate-900 border border-orange-500/40 p-1 flex items-center justify-center shadow-lg">
                <NoormexaEmblemSvg size={38} isDark={true} />
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
                  ثبّت التطبيق الآن على هاتفك أو الكمبيوتر لتجربة تسوق فائقة السرعة وتصفح بدون انقطاع!
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
                onClick={triggerInstallFlow}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Download size={14} className="stroke-[2.5]" />
                <span>تثبيت البرنامج مجاناً</span>
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

      {/* 2. iOS Safari Step-by-Step Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-3 select-none animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-950 text-white rounded-3xl p-6 border border-orange-500/30 shadow-2xl space-y-5 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-orange-500/40 p-1 flex items-center justify-center shadow-lg">
                  <NoormexaEmblemSvg size={34} isDark={true} />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">تثبيت NOORMEXA على آيفون / آيباد</h3>
                  <p className="text-xs text-orange-400 font-bold">بسيط وسريع في خطوتين فقط</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-3.5 text-xs text-slate-200">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <span>اضغط على أيقونة المشاركة</span>
                    <span className="p-1 rounded-md bg-blue-500/20 text-blue-400 inline-flex items-center">
                      <Share size={14} />
                    </span>
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    موجودة في أسفل شاشة متصفح Safari على الآيفون (أو أعلى شاشة الآيباد).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <span>اختر &quot;إضافة إلى الشاشة الرئيسية&quot;</span>
                    <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 inline-flex items-center">
                      <PlusSquare size={14} />
                    </span>
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    مرر القائمة لأسفل ثم اضغط على <b>Add to Home Screen</b> وستظهر أيقونة التطبيق فوراً على شاشتك.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs transition-colors shadow-lg cursor-pointer"
            >
              فهمت ذلك، تم ✓
            </button>
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
