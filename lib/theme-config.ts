import "server-only";

import { getAcademyContext } from "./store-context";
import { getStoreThemeConfig, getStoreUITemplate, getCurrentUITemplate } from "./api/server";
import { getPreviewToken } from "./preview-token";
import { TEMPLATE_PRESETS, type TemplatePreset } from "./template-presets";
import {
  buildThemeCssVariables,
  DEFAULT_PLATFORM_THEME,
  themeCssVariablesToBlock,
} from "./theme-apply";

export interface ThemeConfig {
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
  css_variables?: Record<string, string>;
  css_block?: string;
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

export async function getStoreThemeAndTemplate() {
  try {
    const storeContext = await getAcademyContext();
    const previewToken = await getPreviewToken();

    // Try to fetch from authenticated endpoint first if user is authenticated
    // Otherwise fallback to public endpoint with store slug
    let templateData = null;
    let themeData = null;

    // Theme config is always public - use store slug
    // Template can use authenticated endpoint if available
    if (storeContext.slug) {
      if (previewToken) {
        const [publicThemeData, publicTemplateData] = await Promise.allSettled([
          getStoreThemeConfig(storeContext.slug, previewToken),
          getStoreUITemplate(storeContext.slug, previewToken),
        ]);
        themeData = publicThemeData.status === 'fulfilled' ? publicThemeData.value : null;
        templateData = publicTemplateData.status === 'fulfilled' ? publicTemplateData.value : null;
      } else {
        const [publicThemeData, authTemplateData] = await Promise.allSettled([
          getStoreThemeConfig(storeContext.slug),
          getCurrentUITemplate(),
        ]);

        themeData = publicThemeData.status === 'fulfilled' ? publicThemeData.value : null;
        templateData = authTemplateData.status === 'fulfilled' ? authTemplateData.value : null;

        if (!templateData && storeContext.slug) {
          const publicTemplateResult = await Promise.allSettled([
            getStoreUITemplate(storeContext.slug),
          ]);
          templateData = publicTemplateResult[0].status === 'fulfilled' ? publicTemplateResult[0].value : null;
        }
      }
    } else {
      // Not authenticated, use public endpoints
      if (!storeContext.slug) {
        return {
          theme: null,
          template: null,
        };
      }

      const [publicThemeData, publicTemplateData] = await Promise.allSettled([
        getStoreThemeConfig(storeContext.slug, previewToken),
        getStoreUITemplate(storeContext.slug, previewToken),
      ]);

      themeData = publicThemeData.status === 'fulfilled' ? publicThemeData.value : null;
      templateData = publicTemplateData.status === 'fulfilled' ? publicTemplateData.value : null;
    }

    // Log errors if any occurred (only in development)
    if (process.env.NODE_ENV === 'development') {
      // Errors are already handled by Promise.allSettled, but we can log if needed
    }

    // Extract configs from response - API returns { data: { configs: {...} } }
    const configs = (themeData as any)?.configs || {};
    const themeId = (themeData as any)?.themeId;
    const themeName = (themeData as any)?.name;
    
    return {
      theme: themeData
        ? {
            // Use configs first (from API response), then fallback to themeData root, then defaults
            primary_color: configs.primary_color || themeData.primary_color || "#3b82f6",
            primary_color_light: configs.primary_color_light || themeData.primary_color_light || configs.primary_color || themeData.primary_color || "#3b82f6",
            primary_color_dark: configs.primary_color_dark || themeData.primary_color_dark || configs.primary_color || themeData.primary_color || "#60a5fa",
            secondary_color: configs.secondary_color || themeData.secondary_color || "#6366f1",
            secondary_color_light: configs.secondary_color_light || themeData.secondary_color_light || configs.secondary_color || themeData.secondary_color || "#6366f1",
            secondary_color_dark: configs.secondary_color_dark || themeData.secondary_color_dark || configs.secondary_color || themeData.secondary_color || "#818cf8",
            accent_color: configs.accent_color || themeData.accent_color || "#f59e0b",
            background_color: configs.background_color || themeData.background_color || "#f8fafc",
            background_color_light: configs.background_color_light || themeData.background_color_light || configs.background_color || themeData.background_color || "#f8fafc",
            background_color_dark: configs.background_color_dark || themeData.background_color_dark || configs.background_color || themeData.background_color || "#0f172a",
            // Handle dark_mode: can be boolean, string "true"/"false", or null
            dark_mode: configs.dark_mode !== undefined
              ? (configs.dark_mode === null || (typeof configs.dark_mode === 'string' && configs.dark_mode === 'null')
                  ? null
                  : configs.dark_mode === true || (typeof configs.dark_mode === 'string' && (configs.dark_mode === 'true' || configs.dark_mode === '1')))
              : (themeData.dark_mode !== undefined
                  ? (themeData.dark_mode === null || (typeof themeData.dark_mode === 'string' && themeData.dark_mode === 'null')
                      ? null
                      : themeData.dark_mode === true || (typeof themeData.dark_mode === 'string' && (themeData.dark_mode === 'true' || themeData.dark_mode === '1')))
                  : false),
            // Animation and style settings from configs
            background_animation_type: configs.background_animation_type || themeData.background_animation_type || 'none',
            background_animation_speed: configs.background_animation_speed || themeData.background_animation_speed || 'medium',
            background_svg_pattern: configs.background_svg_pattern || themeData.background_svg_pattern || '',
            element_animation_style: configs.element_animation_style || themeData.element_animation_style || 'subtle',
            border_radius_style: configs.border_radius_style || themeData.border_radius_style || 'rounded',
            shadow_style: configs.shadow_style || themeData.shadow_style || 'medium',
            css_variables: (themeData as { css_variables?: Record<string, string> }).css_variables,
            css_block: (themeData as { css_block?: string }).css_block,
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
  if (theme?.css_block) {
    return theme.css_block;
  }
  const vars = buildThemeCssVariables(theme ?? DEFAULT_PLATFORM_THEME, {
    prefersDark: theme?.dark_mode === true,
  });
  return themeCssVariablesToBlock(vars);
}

