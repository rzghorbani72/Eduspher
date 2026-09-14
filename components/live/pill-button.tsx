'use client';

import { cn } from '@/lib/utils';

interface PillButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

/** A small toggle pill used for the classroom's inner filters. */
export function PillButton({ active, onClick, label }: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'bg-(--theme-primary) text-(--theme-on-primary)'
          : 'bg-surface text-muted hover:text-(--theme-foreground)',
      )}
    >
      {label}
    </button>
  );
}
