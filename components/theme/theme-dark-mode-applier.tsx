'use client';

import { useEffect } from 'react';
import { useThemeConfig } from './theme-provider';

interface ThemeDarkModeApplierProps {
  darkMode?: boolean | null;
}

export function ThemeDarkModeApplier({ darkMode: initialDarkMode }: ThemeDarkModeApplierProps) {
  const { theme } = useThemeConfig();

  // Use live context value when available, fall back to SSR prop
  const darkMode = theme !== null ? theme?.dark_mode : initialDarkMode;

  useEffect(() => {
    const html = document.documentElement;

    const apply = (dark: boolean) => {
      if (dark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    };

    if (darkMode === null || darkMode === undefined) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => apply(mq.matches);
      handler();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      apply(darkMode === true);
    }
  }, [darkMode]);

  return null;
}
