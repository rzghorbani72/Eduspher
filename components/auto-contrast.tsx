'use client';

import { useEffect } from 'react';
import { getContrastColor } from '@/lib/contrast-utils';

/**
 * Automatically adjusts text color based on background color for better readability
 * Applies to buttons and elements with background colors
 */
export function AutoContrast() {
  useEffect(() => {
    const updateContrast = () => {
      // Find all elements that need contrast adjustment
      const elements = document.querySelectorAll<HTMLElement>(
        'button, a, [role="button"], [class*="bg-"]'
      );

      elements.forEach((element) => {
        // Skip if already has explicit text color
        if (element.classList.toString().includes('text-')) {
          return;
        }

        // Get computed background color
        const bgColor = window.getComputedStyle(element).backgroundColor;
        if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
          return;
        }

        // Determine appropriate text color
        const textColor = getContrastColor(bgColor);
        
        // Apply text color
        if (textColor === 'white') {
          element.style.color = 'white';
          // Remove any existing black text classes
          element.classList.remove('text-black', 'text-slate-900', 'text-gray-900');
        } else {
          element.style.color = '#1e293b'; // slate-800
          // Remove any existing white text classes
          element.classList.remove('text-white', 'text-slate-50', 'text-gray-50');
        }
      });
    };

    // Run on mount
    updateContrast();

    // Watch for dynamic content changes
    const observer = new MutationObserver(updateContrast);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    // Also update on theme changes
    const themeObserver = new MutationObserver(updateContrast);
    const htmlElement = document.documentElement;
    themeObserver.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return null;
}

