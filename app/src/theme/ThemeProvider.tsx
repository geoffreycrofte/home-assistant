import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import {
  type ColorMode,
  DEFAULT_MODE,
  DEFAULT_THEME,
  isColorMode,
  isThemeId,
  STORAGE_KEYS,
  type ThemeId,
} from "./themes";

interface ThemeContextValue {
  theme: ThemeId;
  mode: ColorMode;
  /** Mode effectivement appliqué ("system" résolu en clair ou sombre). */
  resolvedMode: "light" | "dark";
  setTheme: (theme: ThemeId) => void;
  setMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function stored<T>(key: string, guard: (v: unknown) => v is T, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return guard(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* stockage indisponible : le choix ne sera pas mémorisé */
  }
}

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function resolve(mode: ColorMode): "light" | "dark" {
  return mode === "system" ? (darkQuery.matches ? "dark" : "light") : mode;
}

/** Applique le thème sur <html> : data-theme et data-mode (toujours "light" ou "dark"). */
function apply(theme: ThemeId, resolved: "light" | "dark") {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.mode = resolved;
  const bg = getComputedStyle(root).getPropertyValue("--color-bg").trim();
  if (bg) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => stored(STORAGE_KEYS.theme, isThemeId, DEFAULT_THEME));
  const [mode, setModeState] = useState<ColorMode>(() => stored(STORAGE_KEYS.mode, isColorMode, DEFAULT_MODE));

  const [resolvedMode, setResolvedMode] = useState(() => resolve(mode));

  useEffect(() => {
    const update = () => setResolvedMode(resolve(mode));
    update();
    if (mode !== "system") return;
    darkQuery.addEventListener("change", update);
    return () => darkQuery.removeEventListener("change", update);
  }, [mode]);

  useEffect(() => apply(theme, resolvedMode), [theme, resolvedMode]);

  const value: ThemeContextValue = {
    theme,
    mode,
    resolvedMode,
    setTheme: (t) => {
      persist(STORAGE_KEYS.theme, t);
      setThemeState(t);
    },
    setMode: (m) => {
      persist(STORAGE_KEYS.mode, m);
      setModeState(m);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé dans <ThemeProvider>");
  return ctx;
}
