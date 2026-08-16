import type { ReactNode } from 'react';
import { resolveAssetUrl } from '@/lib/utils';
import type { SectionConfig } from './types';

export function resolveHeroMediaUrl(config?: SectionConfig): string | null {
  const raw = config?.bgImage ?? config?.backgroundImage;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  return resolveAssetUrl(raw);
}

/**
 * Hero visual slot — shows uploaded image when set, otherwise CSS/default children.
 * Marked for canvas upload via data-media-editable.
 */
export function HeroVisualSlot({
  config,
  className,
  children,
  alt = '',
  mediaKey = 'bgImage',
}: {
  config?: SectionConfig;
  className?: string;
  children?: ReactNode;
  alt?: string;
  mediaKey?: string;
}) {
  const url = resolveHeroMediaUrl(config);

  return (
    <div
      className={`relative ${className ?? ''}`}
      data-media-editable={mediaKey}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} className="h-full w-full object-cover" />
      ) : (
        children
      )}
    </div>
  );
}
