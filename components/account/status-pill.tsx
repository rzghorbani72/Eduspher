import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/**
 * High-contrast chips: light surface + dark ink so labels stay readable on
 * any card/row background (including themed academy surfaces).
 */
const TONE_CLASS: Record<Tone, string> = {
  success: 'border-transparent bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300',
  warning: 'border-transparent bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  danger: 'border-transparent bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  info: 'border-transparent bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  neutral:
    'border-transparent bg-(--theme-foreground)/5 text-(--theme-foreground) dark:bg-white/10 dark:text-zinc-100',
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
