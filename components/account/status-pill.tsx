import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/**
 * High-contrast chips: light surface + dark ink so labels stay readable on
 * any card/row background (including themed academy surfaces).
 */
const TONE_CLASS: Record<Tone, string> = {
  success:
    'border-green-200 bg-white text-green-800 dark:border-green-800 dark:bg-white dark:text-green-800',
  warning:
    'border-amber-200 bg-white text-amber-900 dark:border-amber-800 dark:bg-white dark:text-amber-900',
  danger:
    'border-red-200 bg-white text-red-800 dark:border-red-800 dark:bg-white dark:text-red-800',
  info: 'border-blue-200 bg-white text-blue-800 dark:border-blue-800 dark:bg-white dark:text-blue-800',
  neutral:
    'border-(--theme-border) bg-white text-(--theme-foreground) dark:border-(--theme-border) dark:bg-white dark:text-zinc-900',
};

/** One status chip shared by assignments, payments, profile and tutoring. */
export function StatusPill({
  label,
  tone = 'neutral',
  icon,
  className,
}: {
  label: string;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        TONE_CLASS[tone],
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}

/** Maps the backend status vocabulary onto a chip tone. */
export const toneForStatus = (status: string): Tone => {
  switch (status.toUpperCase()) {
    case 'PAID':
    case 'ACTIVE':
    case 'GRADED':
    case 'COMPLETED':
    case 'RESOLVED':
    case 'CLOSED':
      return 'success';
    case 'PENDING':
    case 'SUBMITTED':
    case 'WAITING_ON_USER':
      return 'warning';
    case 'FAILED':
    case 'CANCELLED':
    case 'REJECTED':
    case 'EXPIRED':
      return 'danger';
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
    case 'OPEN':
    case 'REOPENED':
      return 'info';
    default:
      return 'neutral';
  }
};
