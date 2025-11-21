import "server-only";

import { getSchoolContext } from "./school-context";
import { getSchoolThemeConfig, getSchoolUITemplate } from "./api/server";

export interface ThemeConfig {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  dark_mode?: boolean;
  [key: string]: any;
}

export interface UIBlockConfig {
  id: string;
  type: string;
  order: number;
  isVisible: boolean;
  config?: Record<string, any>;
}

export interface UITemplateConfig {
  blocks?: UIBlockConfig[];
  template_preset?: string;
}

export async function getSchoolThemeAndTemplate() {
  try {
    const schoolContext = await getSchoolContext();
    
    if (!schoolContext.slug) {
      return {
        theme: null,
        template: null,
      };
    }

    // Fetch theme and template in parallel, but handle errors gracefully
    const [themeData, templateData] = await Promise.allSettled([
      getSchoolThemeConfig(schoolContext.slug),
      getSchoolUITemplate(schoolContext.slug),
    ]);

    const resolvedTheme = themeData.status === 'fulfilled' ? themeData.value : null;
    const resolvedTemplate = templateData.status === 'fulfilled' ? templateData.value : null;

    // Log errors if any occurred
    if (themeData.status === 'rejected') {
      console.error("Failed to fetch theme config:", themeData.reason);
    }
    if (templateData.status === 'rejected') {
      console.error("Failed to fetch UI template:", templateData.reason);
    }

    return {
      theme: resolvedTheme
        ? {
            primary_color: resolvedTheme.primary_color || "#3b82f6",
            secondary_color: resolvedTheme.secondary_color || "#6366f1",
            accent_color: resolvedTheme.accent_color || "#f59e0b",
            background_color: resolvedTheme.background_color || "#f8fafc",
            dark_mode: resolvedTheme.dark_mode || false,
          }
        : null,
      template: resolvedTemplate
        ? {
            blocks: resolvedTemplate.blocks
              ?.filter((b) => b.isVisible)
              .sort((a, b) => a.order - b.order) || [],
            template_preset: resolvedTemplate.template_preset,
          }
        : null,
    };
  } catch (error) {
    console.error("Failed to fetch theme and template:", error);
    return {
      theme: null,
      template: null,
    };
  }
}

export function generateThemeCSSVariables(theme: ThemeConfig | null): string {
  if (!theme) {
    return "";
  }

  const vars = [
    `--theme-primary: ${theme.primary_color || "#3b82f6"};`,
    `--theme-secondary: ${theme.secondary_color || "#6366f1"};`,
    `--theme-accent: ${theme.accent_color || "#f59e0b"};`,
    `--theme-background: ${theme.background_color || "#f8fafc"};`,
  ].join("\n  ");

  return `:root {\n  ${vars}\n}`;
}

