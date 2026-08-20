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

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = "noormexa-theme";

const getThemeSnapshot = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "light";
};

const getServerSnapshot = (): Theme => "light";

const subscribeToTheme = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("noormexa-theme-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("noormexa-theme-change", callback);
    window.removeEventListener("storage", callback);
  };
};

const applyThemeToDOM = (theme: Theme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;

  if (theme === "dark") {
    root.classList.add("dark");
    if (body) body.classList.add("dark");
  } else {
    root.classList.remove("dark");
    if (body) body.classList.remove("dark");
  }

  root.dataset.theme = theme;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  if (body) {
    body.dataset.theme = theme;
    body.setAttribute("data-theme", theme);
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = useSyncExternalStore<Theme>(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
      applyThemeToDOM(nextTheme);
      window.dispatchEvent(
        new CustomEvent("noormexa-theme-change", { detail: nextTheme })
      );
      window.dispatchEvent(new Event("storage"));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getThemeSnapshot();
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
