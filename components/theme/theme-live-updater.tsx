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
import { readThemeModeOverride } from "@/lib/theme-mode";

async function fetchThemeConfig(slug: string): Promise<ThemeConfigInput | null> {
  try {
    // In preview/embed mode the URL carries ?preview=<token>. Forward it so the
    // client re-applies the SAME draft theme the server rendered — without it we
    // would fetch the published theme and overwrite the draft preview.
    const previewToken =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("preview")
        : null;
    const url = `${backendApiBaseUrl}/theme/public/${slug}/config${
      previewToken ? `?preview=${encodeURIComponent(previewToken)}` : ""
    }`;
    const res = await fetch(url, { cache: "no-store" });
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
    // When the theme allows both modes, honor the visitor's toggle choice.
    const mode = readThemeModeOverride();
    const applied =
      (theme.dark_mode === null || theme.dark_mode === undefined) && mode
        ? { ...theme, dark_mode: mode === "dark" }
        : theme;
    applyThemeCssVariables(applied, { prefersDark: applied.dark_mode === true });
    updateTheme(theme); // keep original dark_mode so the toggle stays available
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
