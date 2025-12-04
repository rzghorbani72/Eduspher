'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedGradientBlobsProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  className?: string;
}

/**
 * Animated gradient blobs that smoothly move and change colors
 * Uses Framer Motion for smooth animations
 * Only renders on client side - doesn't affect SSR/SEO
 */
export function AnimatedGradientBlobs({
  primaryColor = '#3b82f6',
  secondaryColor = '#6366f1',
  accentColor = '#f59e0b',
  className = '',
}: AnimatedGradientBlobsProps) {
  // Convert rgb() to hex for consistency
  const rgbToHex = (rgb: string): string | null => {
    const match = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;
    const [r, g, b] = match.slice(1).map((v) => Number(v));
    const toHex = (v: number) => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Resolve CSS variable or rgb/hex to hex; fall back to provided default
  const resolveColor = (color: string, fallback: string) => {
    if (typeof window === 'undefined') return fallback;
    if (color.startsWith('var(')) {
      const varName = color.match(/var\(([^)]+)\)/)?.[1]?.trim();
      if (varName) {
        const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        if (computed) {
          if (computed.startsWith('#')) return computed;
          if (computed.startsWith('rgb')) {
            const hex = rgbToHex(computed);
            if (hex) return hex;
          }
          return computed;
        }
      }
      return fallback;
    }
    if (color.startsWith('rgb')) {
      return rgbToHex(color) || fallback;
    }
    return color || fallback;
  };

  const [resolvedPrimary, setResolvedPrimary] = useState(primaryColor);
  const [resolvedSecondary, setResolvedSecondary] = useState(secondaryColor);
  const [resolvedAccent, setResolvedAccent] = useState(accentColor);

  useEffect(() => {
    setResolvedPrimary(resolveColor(primaryColor, '#3b82f6'));
    setResolvedSecondary(resolveColor(secondaryColor, '#6366f1'));
    setResolvedAccent(resolveColor(accentColor, '#f59e0b'));
  }, [primaryColor, secondaryColor, accentColor]);

  // Helper to add opacity to hex color (for Tailwind-like /20, /30, etc.)
  const withOpacity = (color: string, opacity: number) => {
    // Convert opacity percentage to hex (0-255)
    const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    // Remove # if present and add opacity
    const cleanColor = color.replace('#', '');
    return `#${cleanColor}${opacityHex}`;
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* First blob - primary to secondary */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br rounded-full blur-3xl"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(resolvedPrimary, 0.2)}, ${withOpacity(resolvedSecondary, 0.3)})`,
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Second blob - accent to primary */}
      <motion.div
        className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-br rounded-full blur-3xl"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(resolvedAccent, 0.2)}, ${withOpacity(resolvedPrimary, 0.25)})`,
        }}
        animate={{
          x: [0, -25, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Third blob - secondary to accent */}
      <motion.div
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br rounded-full blur-3xl"
        style={{
          background: `linear-gradient(to bottom right, ${withOpacity(resolvedSecondary, 0.15)}, ${withOpacity(resolvedAccent, 0.2)})`,
        }}
        animate={{
          x: [0, 20, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
