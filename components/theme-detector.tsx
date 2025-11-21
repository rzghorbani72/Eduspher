'use client';

import { useEffect } from 'react';

export function ThemeDetector() {
  useEffect(() => {
    // Function to detect and apply system theme preference
    // Check both dark and light queries to handle browser overrides
    const applySystemTheme = () => {
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const lightQuery = window.matchMedia('(prefers-color-scheme: light)');
      const htmlElement = document.documentElement;
      
      // Priority: explicit light > explicit dark > default to light
      // This handles cases where browser extensions force dark mode
      let isDark = false;
      
      if (lightQuery.matches) {
        // Explicit light preference - highest priority
        isDark = false;
      } else if (darkQuery.matches && !lightQuery.matches) {
        // Explicit dark preference (and not light)
        isDark = true;
      } else {
        // No preference or ambiguous - default to light
        isDark = false;
      }
      
      if (isDark) {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    };

    // Apply theme immediately
    applySystemTheme();

    // Listen for system theme changes
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const handleChange = () => {
      const htmlElement = document.documentElement;
      const darkMatches = darkQuery.matches;
      const lightMatches = lightQuery.matches;
      
      // Priority: explicit light > explicit dark > default to light
      let isDark = false;
      
      if (lightMatches) {
        isDark = false;
      } else if (darkMatches && !lightMatches) {
        isDark = true;
      } else {
        isDark = false;
      }
      
      if (isDark) {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    };

    // Modern browsers
    if (darkQuery.addEventListener) {
      darkQuery.addEventListener('change', handleChange);
      lightQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      darkQuery.addListener(handleChange);
      lightQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (darkQuery.removeEventListener) {
        darkQuery.removeEventListener('change', handleChange);
        lightQuery.removeEventListener('change', handleChange);
      } else {
        darkQuery.removeListener(handleChange);
        lightQuery.removeListener(handleChange);
      }
    };
  }, []);

  return null;
}

