import 'server-only';

import { logger } from '@/lib/logging/app-logger';
import { UnauthorizedError, serverFetchRaw } from './core';

// Theme and UI Template functions
export async function getStoreThemeConfig(storeSlug?: string, previewToken?: string) {
  try {
    // Theme config should always use public endpoint
    // If no storeSlug provided, we can't fetch theme (theme is store-specific)
    if (!storeSlug) {
      return null;
    }

    const path = previewToken
      ? `/theme/public/${storeSlug}/config?preview=${encodeURIComponent(previewToken)}`
      : `/theme/public/${storeSlug}/config`;
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        themeId?: string;
        name?: string;
        primary_color?: string;
        secondary_color?: string;
        accent_color?: string;
        background_color?: string;
        dark_mode?: boolean;
        configs?: {
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
          dark_mode?: boolean | string | null;
          background_animation_type?: string;
          background_animation_speed?: string;
          background_svg_pattern?: string;
          element_animation_style?: string;
          border_radius_style?: string;
          shadow_style?: string;
          [key: string]: unknown;
        };
        [key: string]: unknown;
      };
    }>(path, {
      includeAuth: false, // Always use public endpoint for theme config
      headers: { 'X-Academy-Slug': storeSlug },
      tags: ['theme', 'site'],
    });
    return result.data;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return null;
    }
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      const status = (error as Error & { status?: number }).status;
      if (status !== 404 && !error.message.includes('404')) {
        console.error('Failed to fetch theme config:', error);
      }
    }
    return null;
  }
}

/**
 * Get current UI template for authenticated user
 * Uses /ui-template/current endpoint with authentication
 */
/**
 * Get current UI template for authenticated user
 * Uses http://localhost:3000/api/ui-template/current endpoint with authentication
 */
export async function getCurrentUITemplate() {
  try {
    const path = '/ui-template/current';

    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id?: string;
        academy_id?: string;
        blocks?: Array<{
          id: string;
          type: string;
          order: number;
          isVisible: boolean;
          config?: Record<string, unknown>;
        }>;
        template_preset?: string;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
    }>(path, {
      includeAuth: true,
    });

    // Ensure we have valid data structure
    if (!result || !result.data) {
      return null;
    }

    // Return the data object with blocks sorted by order
    const templateData = result.data;
    if (templateData.blocks && Array.isArray(templateData.blocks)) {
      templateData.blocks = templateData.blocks.sort((a, b) => a.order - b.order);
    }

    return templateData;
  } catch {
    return null;
  }
}

export async function getStoreUITemplate(storeSlug?: string, previewToken?: string) {
  try {
    // Only use public endpoint if storeSlug is provided
    // Otherwise return null to avoid authentication issues
    if (!storeSlug) {
      return null;
    }

    const path = previewToken
      ? `/ui-template/public/${storeSlug}?preview=${encodeURIComponent(previewToken)}`
      : `/ui-template/public/${storeSlug}`;
    const result = await serverFetchRaw<{
      message: string;
      status: string;
      data: {
        id?: string;
        academy_id?: string;
        blocks?: Array<{
          id: string;
          type: string;
          order: number;
          isVisible: boolean;
          config?: Record<string, unknown>;
        }>;
        template_preset?: string;
        is_active?: boolean;
        academy_stats?: { courseCount: number; studentCount: number } | null;
      };
    }>(path, {
      includeAuth: false,
      headers: { 'X-Academy-Slug': storeSlug },
      tags: ['site'],
    });

    // Ensure we have valid data structure
    if (!result || !result.data) {
      return null;
    }

    // Return the data object with blocks sorted by order
    const templateData = result.data;
    if (templateData.blocks && Array.isArray(templateData.blocks)) {
      templateData.blocks = templateData.blocks.sort((a, b) => a.order - b.order);
    }

    return templateData;
  } catch (error) {
    // Log error details for debugging but don't throw
    // This is a non-critical feature, so we gracefully degrade
    if (error instanceof Error) {
      const status = (error as Error & { status?: number }).status;
      // Only log non-404 errors to avoid noise
      // 404 means store/template doesn't exist, which is acceptable
      if (status !== 404 && !error.message.includes('404')) {
        // Log with more context in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to fetch UI template for store "${storeSlug}":`, error.message);
        }
      }
    }
    // Return null to allow the app to continue with default UI
    return null;
  }
}

export interface PreviewPreset {
  id: string;
  name: string;
  blocks: Array<{
    id: string;
    type: string;
    order: number;
    isVisible: boolean;
    config?: Record<string, unknown>;
  }>;
  theme: Record<string, unknown> | null;
  academy_stats?: { courseCount: number; studentCount: number } | null;
  academy_id?: string | null;
  academy_name?: string | null;
  academy_slug?: string | null;
}

// Single template/preset by key, for the standalone /preview/blocks renderer.
// Academy scope is carried by the optional preview token.
export async function getPreviewPreset(
  key: string,
  previewToken?: string,
  draft = false,
): Promise<PreviewPreset | null> {
  try {
    const params = new URLSearchParams();
    if (previewToken) params.set('preview', previewToken);
    if (draft) params.set('draft', '1');
    const qs = params.toString();
    const path = qs
      ? `/ui-template/preset/${encodeURIComponent(key)}?${qs}`
      : `/ui-template/preset/${encodeURIComponent(key)}`;
    // Never cached: this renders the academy's unsaved draft inside the site
    // builder, so a 60s cache entry would both hide live edits and pin a
    // one-off failure (e.g. an expired preview token) for everyone reloading
    // the canvas.
    const result = await serverFetchRaw<{ data: PreviewPreset | null }>(path, {
      includeAuth: false,
      revalidate: 0,
    });
    const preset = result?.data ?? null;
    // The canvas can only render "No preview available" when this comes back
    // thin, so say WHY here — otherwise a blank site builder has no trace at all.
    if (!preset?.blocks?.length) {
      logger.warn('SitePreview', 'PresetEmpty', {
        template_key: key,
        draft: draft ? 1 : 0,
        has_token: previewToken ? 1 : 0,
        has_preset: preset ? 1 : 0,
      });
    }
    if (preset?.blocks) {
      preset.blocks = [...preset.blocks].sort((a, b) => a.order - b.order);
    }
    return preset;
  } catch (error) {
    logger.error('SitePreview', 'PresetFetchFailed', {
      template_key: key,
      draft: draft ? 1 : 0,
      has_token: previewToken ? 1 : 0,
      error_message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export interface CourseQnA {
  id: string;
  course_id: string;
  user_id: string;
  profile_id: string;
  question: string;
  answer: string | null;
  is_approved: boolean;
  answered_by: number | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
  };
  profile?: {
    id: string;
    display_name: string;
  };
  answerer?: {
    id: string;
    display_name: string;
  } | null;
}

function isCourseQnA(value: unknown): value is CourseQnA {
  if (typeof value !== 'object' || value === null) return false;
  if (!('id' in value) || !('question' in value)) return false;
  return typeof value.id === 'string' && typeof value.question === 'string';
}

export function qnaItemsFromPayload(payload: unknown): CourseQnA[] {
  if (Array.isArray(payload)) {
    return payload.filter(isCourseQnA);
  }
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'items' in payload &&
    Array.isArray(payload.items)
  ) {
    return payload.items.filter(isCourseQnA);
  }
  return [];
}
