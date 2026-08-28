"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Language = "ar" | "en";

export const LANGUAGE_KEY = "noormexa-language";
export const LANGUAGE_CHANGE_EVENT = "noormexa-language-change";

interface LanguageContextType {
  language: Language;
  isAr: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getLanguageSnapshot = (): Language => {
  if (typeof window === "undefined") return "ar";
  const stored = window.localStorage.getItem(LANGUAGE_KEY);
  if (stored === "ar" || stored === "en") return stored;
  return "ar";
};

const getServerSnapshot = (): Language => "ar";

const subscribeToLanguage = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(LANGUAGE_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
};

export const applyLanguageToDOM = (lang: Language) => {
  if (typeof document === "undefined") return;
  const isRtl = lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  const root = document.documentElement;
  root.lang = lang;
  root.dir = dir;
  root.setAttribute("lang", lang);
  root.setAttribute("dir", dir);

  if (document.body) {
    document.body.setAttribute("dir", dir);
    if (isRtl) {
      document.body.classList.add("rtl");
      document.body.classList.remove("ltr");
    } else {
      document.body.classList.add("ltr");
      document.body.classList.remove("rtl");
    }
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const language = useSyncExternalStore<Language>(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    applyLanguageToDOM(language);
  }, [language]);

  const setLanguage = useCallback((nextLang: Language) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_KEY, nextLang);
      applyLanguageToDOM(nextLang);
      window.dispatchEvent(
        new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: nextLang })
      );
      window.dispatchEvent(new Event("storage"));
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    const current = getLanguageSnapshot();
    const next: Language = current === "ar" ? "en" : "ar";
    setLanguage(next);
  }, [setLanguage]);

  const value = useMemo(
    () => ({
      language,
      isAr: language === "ar",
      setLanguage,
      toggleLanguage,
    }),
    [language, setLanguage, toggleLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const useNoormexaLanguage = (): Language => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useNoormexaLanguage must be used within a LanguageProvider");
  }
  return context.language;
};
