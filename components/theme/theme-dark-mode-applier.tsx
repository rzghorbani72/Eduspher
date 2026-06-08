'use client';

import { useEffect } from 'react';
import { useThemeConfig } from './theme-provider';
import { readThemeModeOverride, THEME_MODE_EVENT } from '@/lib/theme-mode';

interface ThemeDarkModeApplierProps {
  darkMode?: boolean | null;
}

export function ThemeDarkModeApplier({ darkMode: initialDarkMode }: ThemeDarkModeApplierProps) {
  const { theme } = useThemeConfig();

  // Use live context value when available, fall back to SSR prop
  const darkMode = theme !== null ? theme?.dark_mode : initialDarkMode;

  useEffect(() => {
    const html = document.documentElement;
    const isBoth = darkMode === null || darkMode === undefined;

    const apply = () => {
      // "both" → follow the visitor's toggle choice (defaults to light).
      const dark = isBoth ? readThemeModeOverride() === 'dark' : darkMode === true;
      html.classList.toggle('dark', dark);
    };

    apply();
    if (!isBoth) return;

    window.addEventListener(THEME_MODE_EVENT, apply);
    return () => window.removeEventListener(THEME_MODE_EVENT, apply);
  }, [darkMode]);

  return null;
}
