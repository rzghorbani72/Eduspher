import type { CSSProperties, ReactNode } from 'react';
import { resolveAssetUrl } from '@/lib/utils';
import { HeroVideoSlot, resolveHeroVideoUrl } from './hero-video-slot';
import type { SectionConfig } from './types';
import { AppImage } from "@/components/ui/app-image";

export function resolveHeroMediaUrl(
  config?: SectionConfig,
  mediaKey = 'bgImage',
): string | null {
  const raw =
    config?.[mediaKey] ??
    (mediaKey === 'bgImage' ? config?.backgroundImage : undefined);
  if (typeof raw !== 'string' || !raw.trim()) return null;
  return resolveAssetUrl(raw);
}

type HeroMediaMode = 'background' | 'fill';

/**
 * Hero visual slot — canvas-upload target for gallery heroes.
 * `background` keeps decorative children and paints the image behind them.
 * `fill` replaces the slot content with a cover image (rare slots only).
 */
export function HeroVisualSlot({
  config,
  className,
  children,
  alt = '',
  mediaKey = 'bgImage',
  mode = 'background',
}: {
  config?: SectionConfig;
  className?: string;
  children?: ReactNode;
  alt?: string;
  mediaKey?: string;
  mode?: HeroMediaMode;
}) {
  const url = resolveHeroMediaUrl(config, mediaKey);
  const videoUrl = resolveHeroVideoUrl(config);

  // A hero video takes the visual's place in the same frame. `fill` hands the
  // whole slot over; `background` keeps the decorative children on top and
  // plays the video behind them, exactly where the photo would have been.
  if (videoUrl && mode === 'fill') {
    return (
      <HeroVideoSlot config={config} className={className} poster={url} />
    );
  }
  if (videoUrl) {
    return (
      <div className={`relative overflow-hidden ${className ?? ''}`}>
        <HeroVideoSlot config={config} className="absolute inset-0" poster={url} />
        <div className="relative">{children}</div>
      </div>
    );
  }

  if (mode === 'fill' && url) {
    return (
      <div
        className={`relative overflow-hidden ${className ?? ''}`}
        data-media-editable={mediaKey}
      >
        <AppImage
          src={url}
          alt={alt}
          preset="banner"
          fill
          data-motion="parallax"
          className="scale-[1.06] object-cover"
        />
      </div>
    );
  }

  const bgStyle: CSSProperties | undefined = url
    ? {
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <div
      className={`relative ${className ?? ''}`}
      data-media-editable={mediaKey}
      style={bgStyle}
    >
      {children}
    </div>
  );
}
