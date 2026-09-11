// No 'use client': this renders a plain <video> with no hooks, so it stays
// server-renderable and can be called from both server and client heroes.
import type { ReactNode } from 'react';
import { resolveAssetUrl } from '@/lib/utils';
import { getBackendApiBaseUrl } from '@/lib/env';
import { resolveBoxStyle } from './hero-box';
import type { SectionConfig } from './types';

/** Config keys a hero video reads. Mirrored by the AdminPanel picker. */
export const HERO_VIDEO_KEYS = {
  url: 'heroVideoUrl',
  poster: 'heroVideoPoster',
  autoplay: 'heroVideoAutoplay',
} as const;

/**
 * A hero video is stored as the API's relative stream path (`/videos/stream/:id`),
 * so unlike a static asset it must resolve under the versioned API base.
 */
export function resolveHeroVideoUrl(config?: SectionConfig): string | null {
  const raw = config?.[HERO_VIDEO_KEYS.url];
  if (typeof raw !== 'string' || !raw.trim()) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${getBackendApiBaseUrl()}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

export function resolveHeroVideoPoster(config?: SectionConfig): string | null {
  const raw = config?.[HERO_VIDEO_KEYS.poster];
  return typeof raw === 'string' ? resolveAssetUrl(raw) : null;
}

/**
 * Single-video hero visual — the video twin of `HeroSlideshowSlot`: same frame,
 * same ratio/height controls, same place in the layout, so a template can show
 * a reel where it would otherwise show photos.
 *
 * The video is picked from the academy's media library in the sidebar rather
 * than uploaded on the canvas, because the canvas uploader is image-only and
 * video has to go through the quota-checked direct-upload path.
 */
export function HeroVideoSlot({
  config,
  className = '',
  poster,
  children,
}: {
  config?: SectionConfig;
  className?: string;
  /** Falls back to the template's own cover when the video has no poster. */
  poster?: string | null;
  children?: ReactNode;
}) {
  const url = resolveHeroVideoUrl(config);
  const posterUrl = resolveHeroVideoPoster(config) ?? poster ?? undefined;
  const autoplay = config?.[HERO_VIDEO_KEYS.autoplay] === true;

  return (
    <div className={`relative overflow-hidden ${className}`} style={resolveBoxStyle(config)}>
      {url ? (
        <div className="absolute inset-0">
          <video
            key={`${url}-${autoplay ? 'auto' : 'manual'}`}
            src={url}
            poster={posterUrl}
            controls={!autoplay}
            // Autoplay only ever runs muted and looping — a hero that makes
            // noise on load is a bug, and browsers block it anyway. When it is
            // off nothing but the poster loads, so a visit costs no egress.
            autoPlay={autoplay}
            muted={autoplay}
            loop={autoplay}
            playsInline
            preload={autoplay ? 'auto' : 'none'}
            controlsList="nodownload"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">{children}</div>
      )}
    </div>
  );
}
