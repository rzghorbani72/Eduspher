"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { useThemeConfig } from "./theme-provider";
import { applyThemeCssVariables } from "@/lib/theme-apply";
import {
  readThemeModeOverride,
  writeThemeModeOverride,
  type ThemeMode,
} from "@/lib/theme-mode";

// Shown only when the theme allows both modes (dark_mode === null). Forces the
// light/dark CSS variables directly so it works even though resolveThemeIsDark
// treats a null dark_mode as light by default.
export function ThemeToggleButton() {
  const { theme } = useThemeConfig();
  const allowToggle =
    !!theme && (theme.dark_mode === null || theme.dark_mode === undefined);
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    setMode(readThemeModeOverride() ?? "light");
  }, []);

  const apply = useCallback(
    (next: ThemeMode) => {
      if (!theme) return;
      const isDark = next === "dark";
      applyThemeCssVariables({ ...theme, dark_mode: isDark }, { prefersDark: isDark });
      document.documentElement.classList.toggle("dark", isDark);
    },
    [theme],
  );

  useEffect(() => {
    if (allowToggle) apply(mode);
  }, [allowToggle, mode, apply]);

  if (!allowToggle) return null;

  const next: ThemeMode = mode === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label="تغییر حالت روشن و تاریک"
      title="تغییر حالت روشن و تاریک"
      onClick={() => {
        setMode(next);
        writeThemeModeOverride(next);
      }}
      className="fixed bottom-5 left-5 z-[200] flex h-11 w-11 items-center justify-center rounded-full border border-(--theme-border-color) bg-(--theme-surface) text-(--theme-foreground) shadow-lg transition-transform hover:scale-105"
    >
      {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
