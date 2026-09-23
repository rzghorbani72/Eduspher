'use client';

import { Maximize2, Minimize2 } from 'lucide-react';

import { useTheaterMode } from '@/lib/hooks/use-theater-mode';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

interface TheaterToggleProps {
  className?: string;
  /** Compact icon-only control for dense toolbars. */
  compact?: boolean;
}

/**
 * Shared focus control for live Meet and offline video — collapses the
 * curriculum / session rail without leaving the page.
 */
export function TheaterToggle({ className, compact = false }: TheaterToggleProps) {
  const { t } = useTranslation();
  const { theater, toggleTheater } = useTheaterMode();
  const label = theater ? t('learning.exitTheater') : t('learning.theater');
  const Icon = theater ? Minimize2 : Maximize2;

  return (
    <button
      type="button"
      onClick={toggleTheater}
      aria-pressed={theater}
      aria-label={label}
      title={label}
      data-testid="theater-toggle"
      data-theater={theater ? 'on' : 'off'}
      className={cn(
        'border-theme bg-card hover:bg-surface inline-flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-[13px] font-bold transition-colors',
        compact && 'px-2.5',
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {compact ? null : <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}
