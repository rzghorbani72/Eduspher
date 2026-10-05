'use client';

import { Box, CalendarClock, GraduationCap, Package, RefreshCw, Users } from 'lucide-react';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import type { PurchaseKind, PurchaseOptionView } from '@/lib/courses/purchase-options';

const KIND_ICON: Record<PurchaseKind, typeof Box> = {
  FREE: Package,
  ONE_TIME: Box,
  PAYMENT_PLAN: CalendarClock,
  SUBSCRIPTION: RefreshCw,
  TUTORING: GraduationCap,
  PRIVATE: Users,
};

export const KIND_TITLE: Record<PurchaseKind, string> = {
  FREE: 'courses.offeringFREE',
  ONE_TIME: 'courses.offeringONE_TIME',
  PAYMENT_PLAN: 'courses.offeringPAYMENT_PLAN',
  SUBSCRIPTION: 'courses.offeringSUBSCRIPTION',
  TUTORING: 'courses.offeringTUTORING',
  PRIVATE: 'courses.offeringPRIVATE',
};

export const KIND_DESC: Record<PurchaseKind, string> = {
  FREE: 'courses.methodFreeDesc',
  ONE_TIME: 'courses.methodOneTimeDesc',
  PAYMENT_PLAN: 'courses.methodInstallmentDesc',
  SUBSCRIPTION: 'courses.methodSubscriptionDesc',
  TUTORING: 'courses.methodTutoringDesc',
  PRIVATE: 'courses.methodPrivateDesc',
};

interface PurchaseOptionRowProps {
  option: PurchaseOptionView;
  selected: boolean;
  onSelect: () => void;
  format: (amount: number) => string;
}

/** One way to pay. Its details show in the price header and the includes grid. */
export function PurchaseOptionRow({ option, selected, onSelect, format }: PurchaseOptionRowProps) {
  const { t } = useTranslation();
  const Icon = KIND_ICON[option.kind];
  const isFree = option.kind === 'FREE' || option.price <= 0;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-start transition-colors',
        selected ? 'cd-method-active' : 'cd-method',
      )}
    >
      <span
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-lg',
          selected
            ? 'bg-(--theme-primary-subtle) text-(--theme-primary-ink)'
            : 'bg-(--theme-surface) text-(--theme-muted)',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-(--theme-foreground)">
        {option.title || t(KIND_TITLE[option.kind])}
      </span>
      <span className="cd-price shrink-0 text-[13px] font-bold text-(--theme-foreground)">
        {isFree ? t('courses.free') : format(option.price)}
      </span>
      <span
        className={cn(
          'grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2',
          selected ? 'border-(--theme-primary)' : 'border-(--theme-border-strong)',
        )}
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-(--theme-primary)" /> : null}
      </span>
    </button>
  );
}
