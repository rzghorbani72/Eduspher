'use client';

import { AnimatedGradientBackground } from './animated-gradient-background';
import { AnimatedGradientBlobs } from './animated-gradient-blobs';
import { FlyingIcons } from './flying-icons';

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
  schoolIcons?: string[]; // Array of icon/image URLs from school
  className?: string;
}

export function CreativeBackground({ theme, schoolIcons = [], className = '' }: CreativeBackgroundProps) {
  if (!theme) return null;

  // Determine if dark mode is active
  // For server-side, we can't detect system preference, so use theme.dark_mode if set
  // Client-side ThemeProvider will handle system preference when dark_mode is null
  const isDark = typeof window !== 'undefined' 
    ? (theme.dark_mode === true || (theme.dark_mode === null && window.matchMedia('(prefers-color-scheme: dark)').matches))
    : (theme.dark_mode === true);

  // Get colors - use light/dark variants based on current mode
  const primaryColor = isDark 
    ? (theme.primary_color_dark || theme.primary_color || '#60a5fa')
    : (theme.primary_color_light || theme.primary_color || '#3b82f6');
  const secondaryColor = isDark
    ? (theme.secondary_color_dark || theme.secondary_color || '#818cf8')
    : (theme.secondary_color_light || theme.secondary_color || '#6366f1');
  const accentColor = theme.accent_color || '#f59e0b';
  
  // Animation settings from API response - can be: gradient, blobs, particles, waves, mesh, grid, or none
  // Normalize the animation type (handle both "blob" and "blobs" for compatibility)
  const rawAnimationType = theme.background_animation_type || 'blobs';
  const animationType = rawAnimationType === 'blob' ? 'blobs' : rawAnimationType;
  const animationSpeed = theme.background_animation_speed || 'medium';

  const speedMap: Record<string, number> = {
    slow: 0.5,
    medium: 1,
    fast: 2,
  };

  const speed = speedMap[animationSpeed] || 1;

  // Icons should already be resolved URLs from server
  const resolvedIcons = schoolIcons.filter(Boolean);

  console.log("theme", theme);
  
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Animated gradient blobs - for "blobs" type or default */}
      {animationType === 'blobs' && (
        <AnimatedGradientBlobs
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
        />
      )}

      {/* Animated gradient background - for gradient, particles, waves, mesh, grid types */}
      {(animationType === 'gradient' || animationType === 'particles' || animationType === 'waves' || animationType === 'mesh' || animationType === 'grid') && (
        <AnimatedGradientBackground
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
          speed={speed}
          intensity={0.08}
        />
      )}

      {/* Default to blobs if animationType is not specified (but not if explicitly 'none') */}
      {!animationType && (
        <AnimatedGradientBlobs
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
        />
      )}

      {/* Flying icons from school - always rendered if icons are available */}
      {resolvedIcons.length > 0 && (
        <FlyingIcons
          icons={resolvedIcons}
          count={Math.min(8, resolvedIcons.length * 2)}
          speed={speed * 0.8}
          size={50}
        />
      )}
    </div>
  );
}

