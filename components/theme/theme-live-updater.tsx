'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useThemeConfig } from './theme-provider';
import { useAcademyContext } from '@/components/providers/store-provider';
import { backendApiBaseUrl } from '@/lib/env';

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
  element_animation_style?: string;
  border_radius_style?: string;
  shadow_style?: string;
}

const BORDER_RADIUS_MAP: Record<string, string> = {
  rounded: '16px',
  soft: '24px',
  sharp: '4px',
};

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  strong: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

function hexContrast(hex: string): string {
  const c = hex.replace('#', '');
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  const luminance = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return luminance > 0.5 ? '#0f172a' : '#f8fafc';
}

function applyThemeCSSVars(theme: ThemeConfig) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Derive dark mode from theme config, not from DOM class (which may not be updated yet)
  const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const isDark = theme.dark_mode === true || (theme.dark_mode === null && prefersDark);

  const primary = isDark
    ? (theme.primary_color_dark || theme.primary_color || '#60a5fa')
    : (theme.primary_color_light || theme.primary_color || '#3b82f6');
  const secondary = isDark
    ? (theme.secondary_color_dark || theme.secondary_color || '#818cf8')
    : (theme.secondary_color_light || theme.secondary_color || '#6366f1');
  const background = isDark
    ? (theme.background_color_dark || theme.background_color || '#0f172a')
    : (theme.background_color_light || theme.background_color || '#f8fafc');

  const accent = theme.accent_color || '#f59e0b';
  const foreground = hexContrast(background);

  root.style.setProperty('--theme-primary', primary);
  root.style.setProperty('--theme-secondary', secondary);
  root.style.setProperty('--theme-accent', accent);
  root.style.setProperty('--theme-background', background);
  root.style.setProperty('--theme-foreground', foreground);
  root.style.setProperty('--theme-on-primary', hexContrast(primary));
  root.style.setProperty('--theme-on-secondary', hexContrast(secondary));
  root.style.setProperty('--theme-on-accent', hexContrast(accent));
  root.style.setProperty('--theme-border-radius', BORDER_RADIUS_MAP[theme.border_radius_style || 'rounded'] || '16px');
  root.style.setProperty('--theme-shadow', SHADOW_MAP[theme.shadow_style || 'medium'] || SHADOW_MAP.medium);
  root.style.setProperty('--theme-element-animation', theme.element_animation_style || 'subtle');

  // Update body background directly to avoid flash
  document.body.style.backgroundColor = background;
  document.body.style.color = foreground;

  // Sync dark class on <html> so Tailwind dark: utilities still work
  if (theme.dark_mode === true || (theme.dark_mode === null && prefersDark)) {
    root.classList.add('dark');
  } else if (theme.dark_mode === false) {
    root.classList.remove('dark');
  }
}

async function fetchThemeConfig(slug: string): Promise<ThemeConfig | null> {
  try {
    const res = await fetch(`${backendApiBaseUrl}/theme/public/${slug}/config`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? json;
    const configs = data?.configs ?? data;
    return configs;
  } catch {
    return null;
  }
}

export function ThemeLiveUpdater() {
  const { slug } = useAcademyContext();
  const { updateTheme } = useThemeConfig();
  const lastSlugRef = useRef<string | null>(null);

  const syncTheme = useCallback(async () => {
    if (!slug) return;
    const theme = await fetchThemeConfig(slug);
    if (!theme) return;
    applyThemeCSSVars(theme);
    updateTheme(theme);
  }, [slug, updateTheme]);

  // Sync when slug first becomes available
  useEffect(() => {
    if (slug && slug !== lastSlugRef.current) {
      lastSlugRef.current = slug;
      syncTheme();
    }
  }, [slug, syncTheme]);

  // Re-sync when the tab regains focus (catches changes made in AdminPanel)
  useEffect(() => {
    const handleFocus = () => syncTheme();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncTheme]);

  return null;
}
