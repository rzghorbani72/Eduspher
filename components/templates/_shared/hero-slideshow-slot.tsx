'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { resolveHeroMediaUrl } from './hero-media';
import type { SectionConfig } from './types';

/**
 * Multi-image hero visual — same canvas photo-upload wiring as `HeroVisualSlot`
 * (each slide is its own `data-media-editable` target, so the existing iframe
 * upload button attaches to it with no new AdminPanel plumbing), just spread
 * across several config keys instead of one. Zero images behaves exactly like
 * an empty `HeroVisualSlot`; one image is static; two or more auto-rotate.
 */
export function HeroSlideshowSlot({
  config,
  mediaKeys,
  className = '',
  alt = '',
  editMode = false,
  intervalMs = 4000,
  children,
}: {
  config?: SectionConfig;
  mediaKeys: readonly string[];
  className?: string;
  alt?: string;
  editMode?: boolean;
  intervalMs?: number;
  children?: ReactNode;
}) {
  const urls = mediaKeys
    .map((key) => resolveHeroMediaUrl(config, key))
    .filter((url): url is string => Boolean(url));
  const [rawActive, setActive] = useState(0);
  const primaryKey = mediaKeys[0];
  // Derived instead of clamped in an effect: a shrinking slide count (a
  // manager removing an upload) never leaves `active` pointing past the end.
  const active = urls.length > 0 ? rawActive % urls.length : 0;

  useEffect(() => {
    if (urls.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % urls.length), intervalMs);
    return () => clearInterval(id);
  }, [urls.length, intervalMs]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {urls.length > 0 ? (
        // Absolute, not `h-full`: callers size this slot with `min-h-*`, and a
        // percentage height never resolves against a min-height, so the layer
        // collapsed to 0 and every uploaded slide was invisible.
        <div className="absolute inset-0" data-media-editable={primaryKey}>
          {urls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={alt}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
              style={{ opacity: i === active ? 1 : 0 }}
            />
          ))}
          {urls.length > 1 && (
            <div className="absolute inset-x-0 top-3 z-[1] flex justify-center gap-1.5">
              {urls.map((url, i) => (
                <span
                  key={url}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: i === active ? '#fff' : 'rgba(255,255,255,0.45)' }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div data-media-editable={primaryKey} className="flex h-full w-full items-center justify-center">
          {children}
        </div>
      )}

      {editMode && mediaKeys.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-[2] flex gap-1.5 bg-black/40 p-1.5 backdrop-blur-sm">
          {mediaKeys.slice(1).map((key) => {
            const url = resolveHeroMediaUrl(config, key);
            return (
              <div
                key={key}
                data-media-editable={key}
                title="افزودن اسلاید"
                className="grid h-9 w-9 flex-none place-items-center overflow-hidden rounded border border-white/50 bg-white/10 text-white"
              >
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm leading-none">+</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
