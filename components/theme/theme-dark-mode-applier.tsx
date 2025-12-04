'use client';

import { useEffect } from 'react';

interface ThemeDarkModeApplierProps {
  darkMode: boolean | null | undefined;
}

/**
 * Applies the 'dark' class to the HTML element based on theme's dark_mode setting
 * This is required for Tailwind's class-based dark mode to work
 */
export function ThemeDarkModeApplier({ darkMode }: ThemeDarkModeApplierProps) {
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (darkMode === null) {
      // Use system preference when dark_mode is null
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystemTheme = () => {
        if (mediaQuery.matches) {
          htmlElement.classList.add('dark');
        } else {
          htmlElement.classList.remove('dark');
        }
      };
      
      // Apply immediately
      applySystemTheme();
      
      // Listen for changes
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', applySystemTheme);
        return () => mediaQuery.removeEventListener('change', applySystemTheme);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(applySystemTheme);
        return () => mediaQuery.removeListener(applySystemTheme);
      }
    } else if (darkMode === true) {
      // Force dark mode
      htmlElement.classList.add('dark');
    } else {
      // Force light mode (darkMode === false)
      htmlElement.classList.remove('dark');
    }
  }, [darkMode]);

  return null; // This component doesn't render anything
}

