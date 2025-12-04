'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AnimatedBackground } from './animated-background';
import { SVGPattern } from './svg-patterns';

interface ThemeConfig {
  primary_color?: string;
  primary_color_light?: string;
  primary_color_dark?: string;
  secondary_color?: string;
  secondary_color_light?: string;
  secondary_color_dark?: string;
  accent_color?: string;
  background_color?: string;
  background_color_light?: string;
  background_color_dark?: string;
  dark_mode?: boolean | null;
  background_animation_type?: string;
  background_animation_speed?: string;
  background_svg_pattern?: string;
  element_animation_style?: string;
  border_radius_style?: string;
  shadow_style?: string;
}

interface ThemeContextType {
  theme: ThemeConfig | null;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  isDark: false,
});

export function useThemeConfig() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme: ThemeConfig | null;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig | null>(initialTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (theme) {
      setTheme(theme);
      
      const checkDarkMode = () => {
        if (theme.dark_mode === null) {
          setIsDark(
            window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          );
        } else {
          setIsDark(theme.dark_mode);
        }
      };

      checkDarkMode();

      if (theme.dark_mode === null) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }
    }
  }, [theme]);

  const animationType = theme?.background_animation_type || 'none';
  const animationSpeed = (theme?.background_animation_speed || 'medium') as 'slow' | 'medium' | 'fast';
  const svgPattern = theme?.background_svg_pattern || '';
  const primaryColor = isDark 
    ? (theme?.primary_color_dark || theme?.primary_color || '#60a5fa')
    : (theme?.primary_color_light || theme?.primary_color || '#3b82f6');
  const secondaryColor = isDark
    ? (theme?.secondary_color_dark || theme?.secondary_color || '#818cf8')
    : (theme?.secondary_color_light || theme?.secondary_color || '#6366f1');

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      <div className="relative min-h-screen">
        {animationType !== 'none' && (
          <AnimatedBackground
            type={animationType as any}
            speed={animationSpeed}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        )}
        {svgPattern && (
          <SVGPattern patternId={svgPattern} color={primaryColor} />
        )}
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

