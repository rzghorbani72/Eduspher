'use client';

import { CalendarClock } from 'lucide-react';

import {
  ClassEnrollAction,
  useBlockedReasonKey,
} from '@/components/courses/live-class/class-enroll-action';
import { useLiveClass } from '@/components/courses/live-class/live-class-provider';
import { CreditBalanceNote } from '@/components/purchase/credit-balance-note';
import { SlotChips } from '@/components/live/slot-chips';
import {
  GROUP_CLASSES_ANCHOR_ID,
  canBuyMoreSeats,
  seatPriceOfGroup,
} from '@/lib/courses/live-course';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatNumber } from '@/lib/utils';

/** Desktop sidebar of a live course: the selected class and its one action. */
export function LiveCoursePanel() {
  const { t, language } = useTranslation();
  const { groups, selected, seats, format, isLoggedIn, canPurchase, hasAccess } = useLiveClass();
  const blockedKey = useBlockedReasonKey();
  const buyable = Boolean(selected && canPurchase && canBuyMoreSeats(selected));
  const showTotal = buyable && isLoggedIn && !selected?.joined;
  const hint = selected?.session_live
    ? 'courses.liveSessionOnHint'
    : (selected ? selected.joined : hasAccess)
      ? 'courses.liveHasAccessHint'
      : null;

  return (
    <div className="cd-side-card hidden overflow-hidden rounded-2xl border lg:block">
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-(--theme-primary-ink)">
          <CalendarClock className="size-4" aria-hidden="true" />
          {t('courses.liveCourse')}
        </div>

        {selected ? (
          <div className="space-y-2">
            <p className="text-muted text-[11px]">{t('courses.selectedClass')}</p>
            <p className="text-sm font-bold text-(--theme-foreground)">{selected.title}</p>
            <SlotChips slots={selected.Slots} />
            {blockedKey ? null : (
              <>
                <p className="cd-price text-2xl font-black text-(--theme-foreground)">
                  {format(seatPriceOfGroup(selected) * (showTotal ? seats : 1))}
                </p>
                <p className="text-muted text-xs">
                  {t('courses.groupSeatsLeft')}: {formatNumber(selected.seats_left, language)}
                </p>
              </>
            )}
          </div>
        ) : groups.length || hasAccess ? null : (
          <p className="text-muted text-sm">{t('courses.liveNoClassesYet')}</p>
        )}

        {hint ? <p className="text-sm text-(--theme-foreground)">{t(hint)}</p> : null}

        <ClassEnrollAction />

        {groups.length > 1 ? (
          <a
            href={`#${GROUP_CLASSES_ANCHOR_ID}`}
            className="block text-center text-sm font-bold text-(--theme-primary-ink) underline-offset-4 hover:underline"
          >
            {t('courses.changeClass')}
          </a>
        ) : null}

        {showTotal ? <CreditBalanceNote /> : null}
      </div>
    </div>
  );
}
