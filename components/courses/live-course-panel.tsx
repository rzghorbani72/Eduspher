'use client';

import type { ReactNode } from 'react';

import { SeatStepper } from '@/components/courses/class-card/seat-stepper';
import { firstSlotTimes, weekdayNamesOf } from '@/components/courses/class-card/schedule';
import {
  ClassEnrollAction,
  useBlockedReasonKey,
} from '@/components/courses/live-class/class-enroll-action';
import { useLiveClass } from '@/components/courses/live-class/live-class-provider';
import { CreditBalanceNote } from '@/components/purchase/credit-balance-note';
import { isWholeBooking, maxSeatsOf, sessionsOfGroup } from '@/lib/courses/live-course';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatNumber } from '@/lib/utils';

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="text-muted my-1.5 flex items-center justify-between gap-3 text-[13px]">
      <span>{label}</span>
      <b className="text-end text-(--theme-foreground)">{children}</b>
    </div>
  );
}

/** Desktop sidebar of a live course: a summary of the selected class and its one action. */
export function LiveCoursePanel() {
  const { t, language } = useTranslation();
  const {
    groups,
    selected,
    seats,
    setSeats,
    canPickSeats,
    total,
    format,
    hasAccess,
    isLoggedIn,
    canPurchase,
  } = useLiveClass();
  const blockedKey = useBlockedReasonKey();
  const hint = selected?.session_live
    ? 'courses.liveSessionOnHint'
    : (selected ? selected.joined : hasAccess)
      ? 'courses.liveHasAccessHint'
      : null;
  const sessions = selected ? sessionsOfGroup(selected) : 0;
  const times = selected ? firstSlotTimes(selected, language) : null;
  const days = selected ? weekdayNamesOf(selected, t) : '';
  const whole = Boolean(selected && canPickSeats && isWholeBooking(selected, seats));

  return (
    <div className="cd-side-card hidden rounded-[22px] border p-[22px] lg:block">
      <h3 className="border-theme mb-2.5 border-b pb-2.5 text-[17px] font-black text-(--theme-foreground)">
        {t('courses.enrollSummary')}
      </h3>

      {selected ? (
        <>
          <SummaryRow label={t('courses.summaryClass')}>{selected.title}</SummaryRow>
          {times ? (
            <SummaryRow label={t('courses.summaryTime')}>
              {days ? `${days} · ` : null}
              <span className="cd-price">{times.range}</span>
            </SummaryRow>
          ) : null}
          {sessions > 0 ? (
            <SummaryRow label={t('courses.summarySessions')}>
              <span className="cd-price">{formatNumber(sessions, language)}</span>
            </SummaryRow>
          ) : null}

          {whole ? (
            <>
              <SummaryRow label={t('courses.summaryBookingType')}>
                <span className="text-(--theme-primary-ink)">
                  {t('courses.summaryAllSeats').replace(
                    '{count}',
                    formatNumber(selected.seats_left, language),
                  )}
                </span>
              </SummaryRow>
              <button
                type="button"
                onClick={() => setSeats(1)}
                className="ms-auto block text-[13px] font-semibold text-(--theme-primary-ink)"
              >
                {t('courses.backToSingleSeat')}
              </button>
            </>
          ) : canPickSeats ? (
            <>
              <SummaryRow label={t('courses.groupReserveWhole')}>
                <SeatStepper value={seats} max={maxSeatsOf(selected)} onChange={setSeats} />
              </SummaryRow>
              <p className="text-muted text-xs">
                {t(selected.joined ? 'courses.groupBuyMoreHint' : 'courses.groupShareHint')}
              </p>
            </>
          ) : null}

          {blockedKey || total === null ? null : (
            <div className="border-theme mt-3 flex items-center justify-between border-t border-dashed pt-3">
              <span className="text-[13px] font-medium text-(--theme-foreground)">
                {t('courses.totalAmount')}
              </span>
              <span className="cd-price text-[22px] font-black text-(--theme-primary-ink)">
                {format(total)}
              </span>
            </div>
          )}
        </>
      ) : groups.length || hasAccess ? null : (
        <p className="text-muted text-sm">{t('courses.liveNoClassesYet')}</p>
      )}

      <div className="mt-3">
        <ClassEnrollAction />
      </div>
      {hint ? <p className="text-muted mt-2.5 text-xs">{t(hint)}</p> : null}
      {isLoggedIn && canPurchase && selected && !selected.joined && !blockedKey ? (
        <CreditBalanceNote />
      ) : null}
    </div>
  );
}
