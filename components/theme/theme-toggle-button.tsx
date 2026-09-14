'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

import { useThemeConfig } from './theme-provider';
import { applyThemeCssVariables } from '@/lib/theme-apply';
import {
  readThemeModeOverride,
  writeThemeModeOverride,
  THEME_MODE_EVENT,
  type ThemeMode,
} from '@/lib/theme-mode';

const subscribe = (onChange: () => void) => {
  window.addEventListener(THEME_MODE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(THEME_MODE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
};

// Shown only when the theme allows both modes (dark_mode === null). Forces the
// light/dark CSS variables directly so it works even though resolveThemeIsDark
// treats a null dark_mode as light by default.
export function useThemeToggle() {
  const { theme } = useThemeConfig();
  const allowToggle = !!theme && (theme.dark_mode === null || theme.dark_mode === undefined);
  const mode = useSyncExternalStore<ThemeMode>(
    subscribe,
    () => readThemeModeOverride() ?? 'light',
    () => 'light',
  );

  const apply = useCallback(
    (next: ThemeMode) => {
      if (!theme) return;
      const isDark = next === 'dark';
      applyThemeCssVariables({ ...theme, dark_mode: isDark }, { prefersDark: isDark });
      document.documentElement.classList.toggle('dark', isDark);
    },
    [theme],
  );

  useEffect(() => {
    if (allowToggle) apply(mode);
  }, [allowToggle, mode, apply]);

  const toggle = useCallback(() => {
    writeThemeModeOverride(mode === 'dark' ? 'light' : 'dark');
  }, [mode]);

  return { allowToggle, mode, toggle };
}

// Inline icon button — hosted inside the site header to match the design.
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { allowToggle, mode, toggle } = useThemeToggle();
  if (!allowToggle) return null;

  return (
    <button
      type="button"
      aria-label="تغییر حالت روشن و تاریک"
      title="تغییر حالت روشن و تاریک"
      onClick={toggle}
      className={className}
    >
      {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

// Floating fallback for chrome-less layouts (auth/preview/panel) that have no
// site header to host the inline toggle.
export function ThemeToggleButton() {
  return (
    <ThemeToggle className="fixed bottom-5 left-5 z-[200] flex h-11 w-11 items-center justify-center rounded-full border border-(--theme-border-color) bg-(--theme-surface) text-(--theme-foreground) shadow-lg transition-transform hover:scale-105" />
  );
}
