import type { ReactNode } from 'react';
import { featureVisible, type SectionConfig } from './types';

const PLACEHOLDER_CLASS =
  'flex min-h-[min(12vh,120px)] w-full flex-col items-center justify-center gap-2 rounded-(--theme-border-radius) border-2 border-dashed border-zinc-400/70 bg-zinc-100/80 px-4 py-6 text-center transition-colors hover:border-(--theme-primary) hover:bg-(--theme-surface-alt)';

/**
 * Optional decoration inside a section (stats row, hero image, CTA button).
 * In the live site, hidden slots render nothing. In the template editor they
 * collapse to a dashed placeholder the manager can click to bring back.
 *
 * `mediaKey` marks a slot that is a photo replacement, not a decoration: its
 * "restore" is a direct photo upload (see hero.tsx `mode="fill"` usage),
 * which fully replaces the design's built-in visual — no separate design vs.
 * photo choice.
 */
export function RemovableSlot({
  config,
  flagKey,
  editMode = false,
  className = '',
  children,
  mediaKey,
}: {
  config?: SectionConfig;
  flagKey: string;
  editMode?: boolean;
  className?: string;
  children: ReactNode;
  mediaKey?: string;
}) {
  const visible = featureVisible(config, flagKey);

  if (visible) {
    return (
      <div data-removable={flagKey} className={className || undefined}>
        {children}
      </div>
    );
  }

  if (!editMode) return null;

  return (
    <button
      type="button"
      data-removable-restore={flagKey}
      data-removable-restore-media={mediaKey}
      className={`${PLACEHOLDER_CLASS} ${className}`.trim()}
    >
      <span className="text-xl leading-none text-zinc-400" aria-hidden="true">
        +
      </span>
      <span className="text-xs font-semibold text-zinc-600">
        {mediaKey ? 'بارگذاری عکس' : 'بازگرداندن بلوک'}
      </span>
    </button>
  );
}
