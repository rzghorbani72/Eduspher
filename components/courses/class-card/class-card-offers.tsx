'use client';

import type { ReactNode } from 'react';

import { CLASS_REQUEST_ANCHOR_ID } from '@/lib/courses/live-course';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatNumber } from '@/lib/utils';

type Props = {
  seatsLeft: number;
  seatPrice: number;
  format: (amount: number) => string;
  /** Present only when this buyer may take every free seat. */
  onReserveAll: (() => void) | null;
  showRequest: boolean;
};

function OfferBox({ title, hint, action }: { title: string; hint: string; action: ReactNode }) {
  return (
    <div className="cd-class-offer mt-2.5 flex items-center justify-between gap-2.5 rounded-[14px] border px-3 py-2.5 text-[13px]">
      <div className="min-w-0">
        <b className="cd-class-ink">{title}</b>
        <small className="text-muted block text-[11px]">{hint}</small>
      </div>
      {action}
    </div>
  );
}

/** Two ways past a single seat: book the whole class, or ask for another time. */
export function ClassCardOffers({
  seatsLeft,
  seatPrice,
  format,
  onReserveAll,
  showRequest,
}: Props) {
  const { t, language } = useTranslation();
  const count = formatNumber(seatsLeft, language);

  return (
    <>
      {onReserveAll ? (
        <OfferBox
          title={t('courses.reserveAllTitle')}
          hint={t('courses.reserveAllHint')
            .replace('{count}', count)
            .replace('{total}', format(seatPrice * seatsLeft))
            .replace('{price}', format(seatPrice))}
          action={
            <button
              type="button"
              onClick={onReserveAll}
              className="cd-class-offer-btn shrink-0 rounded-[9px] px-3.5 py-1.5 text-xs font-bold whitespace-nowrap"
            >
              {t('courses.reserveAllButton').replace('{count}', count)}
            </button>
          }
        />
      ) : null}
      {showRequest ? (
        <OfferBox
          title={t('courses.otherTimeTitle')}
          hint={t('courses.otherTimeHint')}
          action={
            <a
              href={`#${CLASS_REQUEST_ANCHOR_ID}`}
              className="shrink-0 rounded-[9px] border border-(--theme-primary) px-3.5 py-1.5 text-xs font-bold whitespace-nowrap text-(--theme-primary-ink)"
            >
              {t('courses.otherTimeButton')}
            </a>
          }
        />
      ) : null}
    </>
  );
}
