'use client';

import { Check } from 'lucide-react';

import { SlotChips, type SlotLike } from '@/components/live/slot-chips';
import { sessionsOfGroup } from '@/lib/courses/live-course';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatDate, formatNumber } from '@/lib/utils';

export type SummarizedClass = {
  title: string;
  capacity: number;
  starts_on: string | null;
  ends_on: string | null;
  term_weeks: number;
  session_count: number | null;
  Slots: SlotLike[];
  Tutor?: { display_name: string | null } | null;
};

interface ClassPurchaseSummaryProps {
  group: SummarizedClass;
  seats: number;
  seatPrice: number;
  format: (amount: number) => string;
}

/**
 * What the student is about to pay for, spelled out: which class, when it
 * meets, how long, and whether this is N seats or the whole class.
 */
export function ClassPurchaseSummary({
  group,
  seats,
  seatPrice,
  format,
}: ClassPurchaseSummaryProps) {
  const { t, language } = useTranslation();
  const wholeClass = group.capacity > 1 && seats === group.capacity;
  const sessions = sessionsOfGroup(group);
  const term = group.starts_on
    ? group.ends_on
      ? `${formatDate(group.starts_on, language)} – ${formatDate(group.ends_on, language)}`
      : formatDate(group.starts_on, language)
    : null;

  const facts = [
    wholeClass
      ? t('checkout.wholeClassPrivate').replace('{count}', formatNumber(group.capacity, language))
      : t('checkout.seatsOfTotal')
          .replace('{n}', formatNumber(seats, language))
          .replace('{m}', formatNumber(group.capacity, language)),
    t('checkout.sessionCount').replace('{count}', formatNumber(sessions, language)),
    ...(term ? [`${t('checkout.termDates')}: ${term}`] : []),
    `${t('checkout.perSeat')}: ${format(seatPrice)} × ${formatNumber(seats, language)} = ${format(seatPrice * seats)}`,
  ];

  return (
    <section className="border-theme space-y-2 rounded-xl border p-3">
      <p className="text-muted text-xs">{t('checkout.classSummaryTitle')}</p>
      <header className="space-y-1">
        <p className="text-sm font-bold text-(--theme-foreground)">{group.title}</p>
        {group.Tutor?.display_name ? (
          <p className="text-muted text-xs">
            {t('checkout.teacher')}: {group.Tutor.display_name}
          </p>
        ) : null}
      </header>
      <SlotChips slots={group.Slots} />
      <ul className="space-y-1">
        {facts.map((fact) => (
          <li key={fact} className="flex items-start gap-1.5 text-xs text-(--theme-foreground)">
            <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
            {fact}
          </li>
        ))}
      </ul>
    </section>
  );
}
