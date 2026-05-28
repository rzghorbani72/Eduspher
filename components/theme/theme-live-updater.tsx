"use client";

import { useCallback, useEffect } from "react";

import { useAcademyContext } from "@/components/providers/store-provider";
import { useThemeConfig } from "./theme-provider";
import { backendApiBaseUrl } from "@/lib/env";
import {
  applyThemeCssVariables,
  DEFAULT_PLATFORM_THEME,
  type ThemeConfigInput,
} from "@/lib/theme-apply";

async function fetchThemeConfig(slug: string): Promise<ThemeConfigInput | null> {
  try {
    const res = await fetch(`${backendApiBaseUrl}/theme/public/${slug}/config`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? json;
    return (data?.configs ?? data) as ThemeConfigInput;
  } catch {
    return null;
  }
}

export function ThemeLiveUpdater() {
  const { slug } = useAcademyContext();
  const { updateTheme } = useThemeConfig();
  const syncTheme = useCallback(async () => {
    if (!slug) {
      applyThemeCssVariables(null);
      updateTheme(DEFAULT_PLATFORM_THEME);
      return;
    }
    const theme = await fetchThemeConfig(slug);
    if (!theme) return;
    applyThemeCssVariables(theme);
    updateTheme(theme);
  }, [slug, updateTheme]);

  useEffect(() => {
    void syncTheme();
  }, [slug, syncTheme]);

  useEffect(() => {
    const handleFocus = () => void syncTheme();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [syncTheme]);

  return null;
}
