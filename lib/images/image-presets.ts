/**
 * One place that decides how big every kind of image on the site is allowed to
 * download. `sizes` is the important half: it tells the browser the rendered
 * width, so it picks the smallest rung of the width ladder that still looks
 * sharp instead of always taking the largest.
 *
 * Kept apart from the component so a preset can also be read by plain <img>
 * call sites (CSS backgrounds, e-mail templates) without pulling in React.
 */

export type ImagePresetName = 'avatar' | 'thumb' | 'card' | 'cover' | 'banner' | 'logo';

export interface ImagePreset {
  /** Rendered width per breakpoint — the browser picks the srcset entry from this. */
  readonly sizes: string;
  /** Must be one of `images.qualities` in next.config.ts. */
  readonly quality: number;
  /** Above-the-fold presets skip lazy loading so the LCP image starts immediately. */
  readonly priority: boolean;
}

export const IMAGE_PRESETS: Record<ImagePresetName, ImagePreset> = {
  // Small and round: extra pixels are invisible here, so quality goes down too.
  avatar: { sizes: '48px', quality: 60, priority: false },
  thumb: { sizes: '96px', quality: 60, priority: false },
  // Grid cards: full width on phones, then two and three per row.
  card: {
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    quality: 75,
    priority: false,
  },
  // A single large image inside a content column.
  cover: {
    sizes: '(max-width: 1024px) 100vw, 66vw',
    quality: 75,
    priority: false,
  },
  // Edge-to-edge hero. The one preset that is eager by default.
  banner: { sizes: '100vw', quality: 75, priority: true },
  // Logos are flat art where compression artefacts show, so quality goes up.
  logo: { sizes: '160px', quality: 85, priority: false },
};

/**
 * A 1x1 grey pixel. next/image scales and blurs it under the real image, so a
 * slow photo fades in from a neutral block instead of flashing an empty hole.
 * Inline (~100 bytes) rather than generated per image, which would mean reading
 * every file at build time.
 */
export const IMAGE_BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlNGU0ZTciLz48L3N2Zz4=';
