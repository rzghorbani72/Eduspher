import "server-only";

import { getSchoolContext } from "./school-context";
import { getSchoolThemeConfig, getSchoolUITemplate, getCurrentUITemplate } from "./api/server";
import { TEMPLATE_PRESETS, type TemplatePreset } from "./template-presets";

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

    // Try to fetch from authenticated endpoint first if user is authenticated
    // Otherwise fallback to public endpoint with school slug
    let templateData = null;
    let themeData = null;

    // Theme config is always public - use school slug
    // Template can use authenticated endpoint if available
    if (schoolContext.slug) {
      // Try authenticated template endpoint first, but always use public theme endpoint
      const [publicThemeData, authTemplateData] = await Promise.allSettled([
        getSchoolThemeConfig(schoolContext.slug), // Always use public endpoint for theme
        getCurrentUITemplate(), // Uses /ui-template/current with auth
      ]);

      themeData = publicThemeData.status === 'fulfilled' ? publicThemeData.value : null;
      templateData = authTemplateData.status === 'fulfilled' ? authTemplateData.value : null;

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[getSchoolThemeAndTemplate] Auth template fetch:', {
          success: authTemplateData.status === 'fulfilled',
          hasData: !!templateData,
          blocksCount: templateData?.blocks?.length || 0
        });
      }

      // If authenticated template endpoint failed, fallback to public template endpoint
      if (!templateData && schoolContext.slug) {
        const publicTemplateResult = await Promise.allSettled([
          getSchoolUITemplate(schoolContext.slug),
        ]);
        templateData = publicTemplateResult[0].status === 'fulfilled' ? publicTemplateResult[0].value : null;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[getSchoolThemeAndTemplate] Public template fetch:', {
            success: publicTemplateResult[0].status === 'fulfilled',
            hasData: !!templateData,
            blocksCount: templateData?.blocks?.length || 0
          });
        }
      }
    } else {
      // Not authenticated, use public endpoints
      if (!schoolContext.slug) {
        return {
          theme: null,
          template: null,
        };
      }

      // Fetch theme and template in parallel, but handle errors gracefully
      const [publicThemeData, publicTemplateData] = await Promise.allSettled([
        getSchoolThemeConfig(schoolContext.slug),
        getSchoolUITemplate(schoolContext.slug),
      ]);

      themeData = publicThemeData.status === 'fulfilled' ? publicThemeData.value : null;
      templateData = publicTemplateData.status === 'fulfilled' ? publicTemplateData.value : null;
    }

    // Log errors if any occurred (only in development)
    if (process.env.NODE_ENV === 'development') {
      // Errors are already handled by Promise.allSettled, but we can log if needed
    }

    return {
      theme: themeData
        ? {
            primary_color: themeData.primary_color || "#3b82f6",
            secondary_color: themeData.secondary_color || "#6366f1",
            accent_color: themeData.accent_color || "#f59e0b",
            background_color: themeData.background_color || "#f8fafc",
            dark_mode: themeData.dark_mode || false,
          }
        : null,
      template: templateData
        ? {
            blocks: (() => {
              if (!Array.isArray(templateData.blocks) || templateData.blocks.length === 0) {
                // If no blocks but we have a template_preset, use preset blocks
                if (templateData.template_preset && TEMPLATE_PRESETS[templateData.template_preset as TemplatePreset]) {
                  return TEMPLATE_PRESETS[templateData.template_preset as TemplatePreset].blocks;
                }
                return [];
              }
              
              // Filter out empty blocks and validate they have required fields
              const validBlocks = templateData.blocks
                .filter((b) => {
                  // Check if block has at least type or id (not completely empty)
                  const hasType = b && typeof b === 'object' && (b.type || b.id);
                  return hasType && b.isVisible !== false;
                })
                .map((b) => ({
                  id: b.id || `block-${b.order || 0}`,
                  type: b.type || "",
                  order: b.order || 0,
                  isVisible: b.isVisible !== false,
                  config: b.config || {},
                }))
                .filter((b) => b.type) // Only keep blocks that have a type
                .sort((a, b) => (a.order || 0) - (b.order || 0));
              
              // If no valid blocks but we have a template_preset, use preset blocks as fallback
              if (validBlocks.length === 0 && templateData.template_preset) {
                if (TEMPLATE_PRESETS[templateData.template_preset as TemplatePreset]) {
                  return TEMPLATE_PRESETS[templateData.template_preset as TemplatePreset].blocks;
                }
              }
              
              return validBlocks;
            })(),
            template_preset: templateData.template_preset,
          }
        : null,
    };
  } catch (error) {
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

  // Use backend colors as-is - no conversion based on dark_mode
  // The system preference will determine dark/light mode
  const vars = [
    `--theme-primary: ${theme.primary_color || "#3b82f6"};`,
    `--theme-secondary: ${theme.secondary_color || "#6366f1"};`,
    `--theme-accent: ${theme.accent_color || "#f59e0b"};`,
    `--theme-background: ${theme.background_color || "#f8fafc"};`,
  ].join("\n  ");

  return `:root {\n  ${vars}\n}`;
}

