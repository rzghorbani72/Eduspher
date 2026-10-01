'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { FlyingIcons } from './flying-icons';
import { GridBackground } from './creative-background/grid-background';
import { GradientBackground } from './creative-background/gradient-background';
import { MeshBackground } from './creative-background/mesh-background';
import { ParticlesBackground } from './creative-background/particles-background';
import { WavesBackground } from './creative-background/waves-background';
import { BlobsBackground } from './creative-background/blobs-background';

const subscribeNoop = () => () => {};

interface CreativeBackgroundProps {
  theme?: {
    primary_color?: string;
    primary_color_light?: string;
    primary_color_dark?: string;
    secondary_color?: string;
    secondary_color_light?: string;
    secondary_color_dark?: string;
    accent_color?: string;
    dark_mode?: boolean | null;
    background_animation_type?: string;
    background_animation_speed?: string;
  } | null;
  storeIcons?: string[]; // Array of icon/image URLs from store
  className?: string;
}

export function CreativeBackground({
  theme,
  storeIcons = [],
  className = '',
}: CreativeBackgroundProps) {
  // Hooks must run unconditionally; the `!theme` early return lives below them.
  // `mounted` is false during SSR/first render and true after hydration, which
  // keeps CSS-variable resolution and system-pref matching off the server.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [isDark, setIsDark] = useState(() => theme?.dark_mode === true);

  // Watch for dark mode changes after mount
  useEffect(() => {
    if (!mounted || !theme) return;

    const updateDarkMode = () => {
      const newIsDark =
        theme.dark_mode === true ||
        (theme.dark_mode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDark(newIsDark);
    };

    updateDarkMode();

    // Listen for system preference changes
    if (theme.dark_mode === null) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateDarkMode);

      return () => {
        mediaQuery.removeEventListener('change', updateDarkMode);
      };
    }
  }, [theme, mounted]);

  // Get colors - use light/dark variants based on current mode
  // Use consistent logic for server and initial client render
  const primaryColorRaw = isDark
    ? theme?.primary_color_dark || theme?.primary_color || '#60a5fa'
    : theme?.primary_color_light || theme?.primary_color || '#3b82f6';
  const secondaryColorRaw = isDark
    ? theme?.secondary_color_dark || theme?.secondary_color || '#818cf8'
    : theme?.secondary_color_light || theme?.secondary_color || '#6366f1';
  const accentColorRaw = theme?.accent_color || '#f59e0b';

  // Resolve colors on client side (handle CSS variables) - only after mount
  const resolveColor = (color: string, fallback: string): string => {
    // If color is a CSS variable, use fallback on server/initial render to prevent hydration mismatch
    if (color.startsWith('var(')) {
      // On server or before mount, use fallback to ensure consistent initial render
      if (typeof window === 'undefined' || !mounted) {
        return fallback;
      }
      // After mount, resolve CSS variables
      const varName = color.match(/var\(([^)]+)\)/)?.[1]?.trim();
      if (varName) {
        const computed = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
        return computed || fallback;
      }
      return fallback;
    }

    // Convert rgb to hex if needed
    if (color.startsWith('rgb')) {
      const rgbMatch = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    }

    // Return color as-is (should be hex format)
    return color || fallback;
  };

  // Compute resolved colors (the React Compiler memoizes these automatically).
  const primaryColor = resolveColor(primaryColorRaw, '#3b82f6');
  const secondaryColor = resolveColor(secondaryColorRaw, '#6366f1');
  const accentColor = resolveColor(accentColorRaw, '#f59e0b');

  if (!theme) return null;

  // Animation settings from API response - can be: gradient, blobs, particles, waves, mesh, grid, or none
  // Normalize the animation type (handle both "blob" and "blobs" for compatibility)
  const rawAnimationType = theme.background_animation_type || 'blobs';
  const animationType = rawAnimationType === 'blob' ? 'blobs' : rawAnimationType;
  const animationSpeed = theme.background_animation_speed || 'slow';

  const speedMap: Record<string, number> = {
    slow: 0.05,
    medium: 1,
    fast: 2,
  };

  const speed = speedMap[animationSpeed] || 0.05;

  // Duration multipliers based on speed - higher values = slower animation (almost stopping)
  // Note: Lower duration = faster animation, higher duration = slower animation
  const durationMap: Record<string, number> = {
    slow: 0.6,
    medium: 1,
    fast: 15,
  };

  const baseDuration = durationMap[animationSpeed] || 0.6;

  // Helper to add opacity to hex color - ensure color is hex format
  const withOpacity = (color: string, opacity: number) => {
    // Ensure we have a valid hex color
    let hexColor = color;

    // If it's not a hex, try to convert it
    if (!color.startsWith('#')) {
      // If it's rgb, convert to hex
      if (color.startsWith('rgb')) {
        const rgbMatch = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1], 10);
          const g = parseInt(rgbMatch[2], 10);
          const b = parseInt(rgbMatch[3], 10);
          hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        } else {
          hexColor = '#3b82f6'; // fallback
        }
      } else {
        hexColor = `#${color.replace('#', '')}`;
      }
    }

    // Remove # if present
    const cleanColor = hexColor.replace('#', '');

    // Ensure it's 6 characters
    if (cleanColor.length !== 6) {
      return `rgba(59, 130, 246, ${opacity})`; // fallback blue
    }

    // Convert to rgba for better browser support
    const r = parseInt(cleanColor.slice(0, 2), 16);
    const g = parseInt(cleanColor.slice(2, 4), 16);
    const b = parseInt(cleanColor.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Icons should already be resolved URLs from server
  const resolvedIcons = storeIcons.filter(Boolean);

  // Render motion-based animations for different types
  const renderMotionBlobs = () => {
    if (animationType === 'blobs' || !animationType) {
      return (
        <BlobsBackground
          accentColor={accentColor}
          baseDuration={baseDuration}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          withOpacity={withOpacity}
        />
      );
    }

    if (animationType === 'waves') {
      return (
        <WavesBackground
          accentColor={accentColor}
          baseDuration={baseDuration}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          withOpacity={withOpacity}
        />
      );
    }

    if (animationType === 'particles') {
      return (
        <ParticlesBackground
          accentColor={accentColor}
          baseDuration={baseDuration}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          withOpacity={withOpacity}
        />
      );
    }

    if (animationType === 'mesh') {
      return (
        <MeshBackground
          accentColor={accentColor}
          baseDuration={baseDuration}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          withOpacity={withOpacity}
        />
      );
    }

    if (animationType === 'grid') {
      return (
        <GridBackground
          accentColor={accentColor}
          baseDuration={baseDuration}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          withOpacity={withOpacity}
        />
      );
    }

    if (animationType === 'gradient') {
      return (
        <GradientBackground
          accentColor={accentColor}
          baseDuration={baseDuration}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          withOpacity={withOpacity}
        />
      );
    }

    return null;
  };

  return (
    <div className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Motion-based animations for blobs, waves, particles, mesh, grid, gradient */}
      {(animationType === 'blobs' ||
        animationType === 'waves' ||
        animationType === 'particles' ||
        animationType === 'mesh' ||
        animationType === 'grid' ||
        animationType === 'gradient' ||
        !animationType) &&
        renderMotionBlobs()}

      {/* Flying icons from store - always rendered if icons are available */}
      {resolvedIcons.length > 0 && (
        <FlyingIcons
          icons={resolvedIcons}
          count={Math.min(8, resolvedIcons.length * 2)}
          speed={speed * 0.02}
          size={50}
        />
      )}
    </div>
  );
}
