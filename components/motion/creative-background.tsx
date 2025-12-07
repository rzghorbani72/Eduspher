'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  storeIcons?: string[]; // Array of icon/image URLs from store
  className?: string;
}

export function CreativeBackground({ theme, storeIcons = [], className = '' }: CreativeBackgroundProps) {
  if (!theme) return null;

  // Track if component is mounted to prevent hydration mismatches
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    // On server, always use theme.dark_mode value (never system preference)
    if (typeof window === 'undefined') {
      return theme.dark_mode === true;
    }
    // On client initial render, match server behavior for hydration
    return theme.dark_mode === true;
  });

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Watch for dark mode changes after mount
  useEffect(() => {
    if (!mounted) return;
    
    const updateDarkMode = () => {
      const newIsDark = theme.dark_mode === true || (theme.dark_mode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
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
  }, [theme.dark_mode, mounted]);

  // Get colors - use light/dark variants based on current mode
  // Use consistent logic for server and initial client render
  const primaryColorRaw = isDark 
    ? (theme.primary_color_dark || theme.primary_color || '#60a5fa')
    : (theme.primary_color_light || theme.primary_color || '#3b82f6');
  const secondaryColorRaw = isDark
    ? (theme.secondary_color_dark || theme.secondary_color || '#818cf8')
    : (theme.secondary_color_light || theme.secondary_color || '#6366f1');
  const accentColorRaw = theme.accent_color || '#f59e0b';

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
        const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
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

  // Compute resolved colors - use mounted state to ensure consistent initial render
  const primaryColor = useMemo(() => resolveColor(primaryColorRaw, '#3b82f6'), [primaryColorRaw, isDark, mounted]);
  const secondaryColor = useMemo(() => resolveColor(secondaryColorRaw, '#6366f1'), [secondaryColorRaw, isDark, mounted]);
  const accentColor = useMemo(() => resolveColor(accentColorRaw, '#f59e0b'), [accentColorRaw, mounted]);
  
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
        <>
          <motion.div
            key={`blob-1-${primaryColor}-${secondaryColor}`}
            className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(secondaryColor, 0.85)})`,
            }}
            animate={{
              x: ['0vw', '70vw', '20vw', '0vw'],
              y: ['0vh', '60vh', '30vh', '0vh'],
              background: [
                `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(secondaryColor, 0.85)})`,
                `linear-gradient(to bottom right, ${withOpacity(secondaryColor, 0.8)}, ${withOpacity(primaryColor, 0.85)})`,
                `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(secondaryColor, 0.85)})`,
              ],
            }}
            transition={{
              duration: 20 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            key={`blob-2-${accentColor}-${primaryColor}`}
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(accentColor, 0.8)}, ${withOpacity(primaryColor, 0.85)})`,
            }}
            animate={{
              x: ['0vw', '-60vw', '-20vw', '0vw'],
              y: ['0vh', '50vh', '80vh', '0vh'],
              background: [
                `linear-gradient(to bottom right, ${withOpacity(accentColor, 0.8)}, ${withOpacity(primaryColor, 0.85)})`,
                `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(accentColor, 0.85)})`,
                `linear-gradient(to bottom right, ${withOpacity(accentColor, 0.8)}, ${withOpacity(primaryColor, 0.85)})`,
              ],
            }}
            transition={{
              duration: 25 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            key={`blob-3-${secondaryColor}-${accentColor}`}
            className="absolute bottom-0 left-1/2 w-[450px] h-[450px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(secondaryColor, 0.75)}, ${withOpacity(accentColor, 0.8)})`,
            }}
            animate={{
              x: ['0vw', '40vw', '-30vw', '0vw'],
              y: ['0vh', '-70vh', '-40vh', '0vh'],
            }}
            transition={{
              duration: 30 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      );
    }

    if (animationType === 'waves') {
      return (
        <>
          <motion.div
            className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.7)}, ${withOpacity(secondaryColor, 0.75)})`,
            }}
            animate={{
              x: ['0vw', '80vw', '10vw', '50vw', '0vw'],
              y: ['0vh', '40vh', '70vh', '20vh', '0vh'],
            }}
            transition={{
              duration: 25 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(secondaryColor, 0.7)}, ${withOpacity(accentColor, 0.75)})`,
            }}
            animate={{
              x: ['0vw', '-70vw', '-10vw', '-50vw', '0vw'],
              y: ['0vh', '60vh', '90vh', '30vh', '0vh'],
            }}
            transition={{
              duration: 30 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-1/2 w-[450px] h-[450px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(accentColor, 0.8)}, ${withOpacity(primaryColor, 0.85)})`,
            }}
            animate={{
              x: ['0vw', '50vw', '-40vw', '20vw', '0vw'],
              y: ['0vh', '-60vh', '-20vh', '-80vh', '0vh'],
            }}
            transition={{
              duration: 35 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(accentColor, 0.85)})`,
            }}
            animate={{
              x: ['0vw', '90vw', '30vw', '60vw', '0vw'],
              y: ['0vh', '-30vh', '40vh', '-10vh', '0vh'],
            }}
            transition={{
              duration: 28 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      );
    }

    if (animationType === 'particles') {
      return (
        <>
          {[...Array(6)].map((_, i) => {
            const startX = (i * 15) % 100;
            const startY = (i * 20) % 100;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full blur-[100px]"
                style={{
                  width: `${120 + i * 30}px`,
                  height: `${120 + i * 30}px`,
                  background: `linear-gradient(to bottom right, ${withOpacity(i % 2 === 0 ? primaryColor : secondaryColor, 0.75)}, ${withOpacity(i % 3 === 0 ? accentColor : primaryColor, 0.8)})`,
                  top: `${startY}%`,
                  left: `${startX}%`,
                }}
                animate={{
                  x: ['0vw', `${(i % 2 === 0 ? 1 : -1) * (60 + i * 15)}vw`, `${(i % 2 === 0 ? -1 : 1) * (40 + i * 10)}vw`, '0vw'],
                  y: ['0vh', `${(i % 3 === 0 ? 1 : -1) * (50 + i * 12)}vh`, `${(i % 3 === 0 ? -1 : 1) * (30 + i * 8)}vh`, '0vh'],
                  scale: [1, 1.3, 0.8, 1],
                }}
                transition={{
                  duration: (15 + i * 3) * baseDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.8,
                }}
              />
            );
          })}
        </>
      );
    }

    if (animationType === 'mesh') {
      return (
        <>
          <motion.div
            className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(secondaryColor, 0.85)})`,
            }}
            animate={{
              x: ['0vw', '70vw', '30vw', '0vw'],
              y: ['0vh', '60vh', '80vh', '0vh'],
            }}
            transition={{
              duration: 22 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(secondaryColor, 0.8)}, ${withOpacity(accentColor, 0.85)})`,
            }}
            animate={{
              x: ['0vw', '-60vw', '-20vw', '0vw'],
              y: ['0vh', '70vh', '50vh', '0vh'],
            }}
            transition={{
              duration: 28 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(accentColor, 0.75)}, ${withOpacity(primaryColor, 0.8)})`,
            }}
            animate={{
              x: ['0vw', '50vw', '10vw', '0vw'],
              y: ['0vh', '-70vh', '-40vh', '0vh'],
            }}
            transition={{
              duration: 26 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.75)}, ${withOpacity(secondaryColor, 0.8)})`,
            }}
            animate={{
              x: ['0vw', '-50vw', '-10vw', '0vw'],
              y: ['0vh', '-60vh', '-30vh', '0vh'],
            }}
            transition={{
              duration: 24 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      );
    }

    if (animationType === 'grid') {
      return (
        <>
          {[...Array(9)].map((_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full blur-[100px]"
                style={{
                  width: `${150 + (i % 3) * 40}px`,
                  height: `${150 + (i % 3) * 40}px`,
                  background: `linear-gradient(to bottom right, ${withOpacity(i % 2 === 0 ? primaryColor : secondaryColor, 0.75)}, ${withOpacity(i % 3 === 0 ? accentColor : primaryColor, 0.8)})`,
                  top: `${10 + row * 25}%`,
                  left: `${10 + col * 25}%`,
                }}
                animate={{
                  x: ['0vw', `${(i % 2 === 0 ? 1 : -1) * (40 + i * 5)}vw`, `${(i % 2 === 0 ? -1 : 1) * (20 + i * 3)}vw`, '0vw'],
                  y: ['0vh', `${(i % 3 === 0 ? 1 : -1) * (35 + i * 4)}vh`, `${(i % 3 === 0 ? -1 : 1) * (25 + i * 3)}vh`, '0vh'],
                }}
                transition={{
                  duration: (18 + i * 2) * baseDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
              />
            );
          })}
        </>
      );
    }

    if (animationType === 'gradient') {
      return (
        <>
          <motion.div
            className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(primaryColor, 0.8)}, ${withOpacity(secondaryColor, 0.85)})`,
            }}
            animate={{
              x: ['0vw', '75vw', '25vw', '0vw'],
              y: ['0vh', '65vh', '85vh', '0vh'],
              scale: [1, 1.3, 0.9, 1],
            }}
            transition={{
              duration: 20 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(secondaryColor, 0.8)}, ${withOpacity(accentColor, 0.85)})`,
            }}
            animate={{
              x: ['0vw', '-65vw', '-15vw', '0vw'],
              y: ['0vh', '-70vh', '-40vh', '0vh'],
              scale: [1, 1.4, 0.8, 1],
            }}
            transition={{
              duration: 25 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{
              background: `linear-gradient(to bottom right, ${withOpacity(accentColor, 0.75)}, ${withOpacity(primaryColor, 0.8)})`,
            }}
            animate={{
              x: ['0vw', '50vw', '-40vw', '20vw', '0vw'],
              y: ['0vh', '-50vh', '60vh', '-30vh', '0vh'],
              scale: [1, 1.5, 0.7, 1.2, 1],
            }}
            transition={{
              duration: 30 * baseDuration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      );
    }

    return null;
  };
  
  // Debug: Log animation type (remove in production)
  if (typeof window !== 'undefined' && animationType === 'waves') {
    console.log('Waves animation rendering:', { animationType, primaryColor, secondaryColor, accentColor, baseDuration });
  }

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
      {/* Motion-based animations for blobs, waves, particles, mesh, grid, gradient */}
      {(animationType === 'blobs' || animationType === 'waves' || animationType === 'particles' || 
        animationType === 'mesh' || animationType === 'grid' || animationType === 'gradient' || !animationType) && 
        renderMotionBlobs()
      }

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

