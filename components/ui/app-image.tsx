import Image, { type ImageProps } from 'next/image';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import {
  IMAGE_BLUR_PLACEHOLDER,
  IMAGE_PRESETS,
  type ImagePresetName,
} from '@/lib/images/image-presets';

/**
 * The single image component for edusphere. Use it instead of next/image or a
 * bare <img> so every picture on the site gets the same three things:
 *
 *  1. the right download size — `preset` sets `sizes`, and the loader turns
 *     that into `?w=` on the backend, so a 48px avatar fetches 48px of pixels;
 *  2. progressive loading — lazy below the fold, blurred placeholder while it
 *     arrives, async decoding so it never blocks the main thread;
 *  3. a safe empty state — `src` may be null (a course with no cover), and we
 *     render `fallback` instead of a broken-image icon.
 *
 * It stays a server component (no "use client"), because the public pages are
 * server-rendered for SEO and an image must not drag a client boundary up.
 */

type Props = Omit<
  ImageProps,
  'src' | 'sizes' | 'quality' | 'priority' | 'loading' | 'placeholder'
> & {
  /** Nullable on purpose — most covers/avatars are optional in the API. */
  src: string | null | undefined;
  preset: ImagePresetName;
  /** Rendered when there is no `src`. Defaults to nothing. */
  fallback?: ReactNode;
  /** Override the preset, e.g. the one hero image that is actually first. */
  priority?: boolean;
  /** Override the preset when a call site knows its real rendered width. */
  sizes?: string;
  /** Skip the blur, e.g. for a logo on a coloured background. */
  placeholder?: 'blur' | 'empty';
};

export function AppImage({
  src,
  preset,
  fallback = null,
  priority,
  sizes,
  placeholder = 'blur',
  className,
  alt,
  ...rest
}: Props) {
  if (!src) return <>{fallback}</>;

  const config = IMAGE_PRESETS[preset];
  const isPriority = priority ?? config.priority;

  return (
    <Image
      {...rest}
      src={src}
      alt={alt}
      sizes={sizes ?? config.sizes}
      quality={config.quality}
      priority={isPriority}
      // `priority` already implies eager; setting both is a React warning.
      loading={isPriority ? undefined : 'lazy'}
      decoding="async"
      placeholder={placeholder}
      blurDataURL={placeholder === 'blur' ? IMAGE_BLUR_PLACEHOLDER : undefined}
      className={cn(className)}
    />
  );
}
