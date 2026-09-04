// No 'use client': these are static decorative layers with no hooks, so they
// stay server-renderable and can be used from any hero.
import styles from './backdrop.module.css';

/** Atmosphere layers a template can stack behind its hero. */
export type BackdropVariant = 'aurora' | 'grain' | 'grid' | 'spotlight';

const VARIANT_CLASS: Record<BackdropVariant, string> = {
  aurora: styles.aurora,
  grain: styles.grain,
  grid: styles.grid,
  spotlight: styles.spotlight,
};

/**
 * One decorative layer, absolutely positioned over its nearest positioned
 * ancestor. Compose them — `aurora` under `grain` is the whole "modern mesh"
 * look — rather than adding new variants for each combination.
 *
 * `tone="deep"` adapts the layer to a dark ground: the same fields need less
 * blur and a different line colour to register against `--theme-deep`.
 *
 * `motion` opts the layer into the shared ambient loop. Leave it off for a
 * still backdrop; a page where every layer moves is noise, not life.
 */
export function Backdrop({
  variant,
  tone = 'page',
  motion,
  className = '',
}: {
  variant: BackdropVariant;
  tone?: 'page' | 'deep';
  motion?: 'drift' | 'wash' | 'hue';
  className?: string;
}) {
  const toneClass =
    tone === 'deep'
      ? variant === 'aurora'
        ? styles.auroraDeep
        : variant === 'grid'
          ? styles.gridOnDeep
          : ''
      : '';

  return (
    <div
      aria-hidden="true"
      data-motion={motion}
      className={`${styles.layer} ${VARIANT_CLASS[variant]} ${toneClass} ${className}`.trim()}
    />
  );
}

/**
 * A gradient hairline used to open or close a band of the page. With
 * `animated`, the gradient travels along it — the one place a moving gradient
 * is unambiguously decoration and never sits under text.
 */
export function GlowBand({
  animated = true,
  className = '',
}: {
  animated?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-motion={animated ? 'hue' : undefined}
      className={`${styles.band} ${className}`.trim()}
    />
  );
}
