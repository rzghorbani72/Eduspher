import type { CSSProperties, ReactNode } from 'react';
import { resolveAssetUrl } from '@/lib/utils';
import type { SectionConfig } from './types';

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

  if (mode === 'fill' && url) {
    return (
      <div
        className={`relative overflow-hidden ${className ?? ''}`}
        data-media-editable={mediaKey}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className="h-full w-full object-cover" />
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
