import type { CSSProperties } from 'react';
import type { SectionConfig } from './types';

export const MEDIA_HEIGHT_BOUNDS = { min: 120, max: 720 } as const;

/**
 * Selectable box shapes: the common web banner/slider ratios, plus portrait for
 * phone-shaped artwork. `free` falls back to the height slider / template default.
 */
export const MEDIA_RATIOS = ['free', '3:1', '21:9', '16:9', '4:3', '1:1', '9:16'] as const;
export type MediaRatio = (typeof MEDIA_RATIOS)[number];

/** Owner-set slot height in px, clamped so a bad stored value cannot break the layout. */
function clampMediaHeight(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.min(MEDIA_HEIGHT_BOUNDS.max, Math.max(MEDIA_HEIGHT_BOUNDS.min, value));
}

function readMediaRatio(value: unknown): MediaRatio | null {
  return typeof value === 'string' &&
    (MEDIA_RATIOS as readonly string[]).includes(value) &&
    value !== 'free'
    ? (value as MediaRatio)
    : null;
}

/**
 * Box shape, shared by every hero media slot so a slideshow and a video sit in
 * exactly the same frame. A ratio wins over the pixel height and clears the
 * template's own `min-h-*`, so the box keeps that shape at every screen width
 * instead of being floored at the template's minimum.
 */
export function resolveBoxStyle(config?: SectionConfig): CSSProperties | undefined {
  const ratio = readMediaRatio(config?.mediaRatio);
  if (ratio) {
    return {
      aspectRatio: ratio.replace(':', ' / '),
      minHeight: 0,
      height: 'auto',
    };
  }
  const height = clampMediaHeight(config?.mediaHeight);
  return height ? { minHeight: height, height } : undefined;
}
