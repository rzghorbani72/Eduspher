'use client';

import { useEffect, useRef } from 'react';

interface AnimatedGradientBackgroundProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  speed?: number;
  intensity?: number;
  className?: string;
}

export function AnimatedGradientBackground({
  primaryColor = 'var(--theme-primary)',
  secondaryColor = 'var(--theme-secondary)',
  accentColor = 'var(--theme-accent)',
  speed = 1,
  intensity = 0.15,
  className = '',
}: AnimatedGradientBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let angle = 0;
    let scale = 1;

    // Helper to get computed color value (handles CSS variables)
    const getComputedColor = (color: string): string => {
      if (typeof window === 'undefined') return color;
      
      // If it's a CSS variable, get its computed value
      if (color.startsWith('var(')) {
        const varName = color.match(/var\(([^)]+)\)/)?.[1];
        if (varName) {
          const computed = getComputedStyle(document.documentElement).getPropertyValue(varName.trim());
          return computed.trim() || color;
        }
      }
      return color;
    };

    // Helper to convert color to rgba
    const colorToRgba = (color: string, alpha: number): string => {
      const computedColor = getComputedColor(color);
      
      // Handle hex colors
      if (computedColor.startsWith('#')) {
        const hex = computedColor.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      
      // Handle rgb/rgba
      if (computedColor.startsWith('rgb')) {
        const rgbMatch = computedColor.match(/(\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
          return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
        }
      }
      
      // Fallback: try to use the color directly with opacity
      return color;
    };

    const animate = () => {
      timeRef.current += 0.01 * speed;
      angle += 0.3 * speed;
      scale = 1 + Math.sin(timeRef.current) * 0.1;

      const alpha1 = intensity;
      const alpha2 = intensity * 0.8;
      const alpha3 = intensity * 0.6;
      const alpha4 = intensity * 0.4;

      // Create dynamic gradient with multiple stops
      const gradient = `
        radial-gradient(
          ellipse ${100 * scale}% ${120 * scale}% at ${50 + Math.sin(angle * Math.PI / 180) * 20}% ${50 + Math.cos(angle * Math.PI / 180) * 20}%,
          ${colorToRgba(primaryColor, alpha1)},
          ${colorToRgba(secondaryColor, alpha2)},
          ${colorToRgba(accentColor, alpha3)},
          transparent 70%
        ),
        linear-gradient(
          ${angle}deg,
          ${colorToRgba(primaryColor, alpha4)},
          ${colorToRgba(secondaryColor, alpha4 * 1.2)},
          ${colorToRgba(accentColor, alpha4)},
          ${colorToRgba(primaryColor, alpha4)}
        )
      `;

      container.style.background = gradient;
      container.style.backgroundSize = '200% 200%';
      container.style.backgroundPosition = `${Math.sin(angle * Math.PI / 180) * 30 + 50}% ${Math.cos(angle * Math.PI / 180) * 30 + 50}%`;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [primaryColor, secondaryColor, accentColor, speed, intensity]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 -z-10 pointer-events-none ${className}`}
      style={{ opacity: 1 }}
    />
  );
}

