'use client';

import { CalendarClock } from 'lucide-react';

import { useEnrollmentClosed } from '@/components/academy/enrollment-status-provider';
import type { CurrencyConfig } from '@/components/courses/purchase-panel';
import { CreditBalanceNote } from '@/components/purchase/credit-balance-note';
import { SlotChips } from '@/components/live/slot-chips';
import Link from '@/components/ui/link';
import type { PublicTutoringGroup } from '@/lib/api/server';
import {
  CLOSED_REASON_KEY,
  canBuyMoreSeats,
  closedReasonOf,
  enrollHref,
  groupAnchorId,
  liveEnterLabelKey,
  liveRoomHref,
  seatPriceOfGroup,
} from '@/lib/courses/live-course';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatCurrencyWithAcademy, formatNumber } from '@/lib/utils';

export const CLASS_REQUEST_ANCHOR_ID = 'request-class';
export const GROUP_CLASSES_ANCHOR_ID = 'group-classes';

interface LiveCoursePanelProps {
  groups: PublicTutoringGroup[];
  currencyConfig: CurrencyConfig | null;
  isLoggedIn: boolean;
  /** Academy staff enter their classes and never buy a seat. */
  isStaff?: boolean;
  /** Classroom URL when this student already holds a seat or a teacher grant. */
  joinHref: string | null;
}

const ctaClassName =
  'flex h-11 items-center justify-center rounded-xl bg-(--theme-primary) text-sm font-bold text-(--theme-on-primary) transition-opacity hover:opacity-90';
const secondaryCtaClassName =
  'flex h-11 items-center justify-center rounded-xl border border-(--theme-primary) text-sm font-bold text-(--theme-primary-ink) transition-opacity hover:opacity-90';

/**
 * Course-page sidebar for a live course: pick a published open time, enroll,
 * or enter if the student already has a seat. Requesting a new time lives in
 * the page body, not here.
 */
export function LiveCoursePanel({
  groups,
  currencyConfig,
  isLoggedIn,
  isStaff = false,
  joinHref,
}: LiveCoursePanelProps) {
  const { t, language } = useTranslation();
  const closed = useEnrollmentClosed();
  const canPurchase = !closed && !isStaff;
  const buyableGroups = groups.filter((group) => canBuyMoreSeats(group));
  const enrolledGroup = groups.find((group) => group.joined) ?? null;
  const format = (amount: number) => formatCurrencyWithAcademy(amount, currencyConfig, 1, language);
  const fromPrice = groups.length ? Math.min(...groups.map(seatPriceOfGroup)) : null;
  const seatsLeft = groups.reduce((sum, group) => sum + group.seats_left, 0);

  return (
    <div className="cd-side-card overflow-hidden rounded-2xl border shadow-2xl">
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-(--theme-primary-ink)">
          <CalendarClock className="size-4" aria-hidden="true" />
          {t('courses.liveCourse')}
        </div>

        {joinHref ? (
          <>
            <p className="text-sm text-(--theme-foreground)">
              {t(
                enrolledGroup?.session_live
                  ? 'courses.liveSessionOnHint'
                  : 'courses.liveHasAccessHint',
              )}
            </p>
            {enrolledGroup ? <SlotChips slots={enrolledGroup.Slots} /> : null}
            <Link
              href={enrolledGroup ? liveRoomHref(joinHref, enrolledGroup.id) : joinHref}
              className={ctaClassName}
            >
              {t(liveEnterLabelKey(enrolledGroup?.session_live))}
            </Link>
            {enrolledGroup && canBuyMoreSeats(enrolledGroup) && canPurchase ? (
              <a href={`#${groupAnchorId(enrolledGroup.id)}`} className={secondaryCtaClassName}>
                {t('courses.groupBuyMoreSeats')}
              </a>
            ) : null}
          </>
        ) : groups.length ? (
          <>
            {fromPrice !== null ? (
              <div>
                <p className="text-muted text-[11px]">{t('courses.groupPerSeat')}</p>
                <p className="cd-price text-2xl font-black text-(--theme-foreground)">
                  {groups.length > 1
                    ? t('courses.fromPrice').replace('{price}', format(fromPrice))
                    : format(fromPrice)}
                </p>
                <p className="text-muted mt-1 text-xs">
                  {t('courses.openClasses').replace(
                    '{count}',
                    formatNumber(groups.length, language),
                  )}
                  {' · '}
                  {t('courses.groupSeatsLeft')}: {formatNumber(seatsLeft, language)}
                </p>
              </div>
            ) : null}
            {isStaff ? null : (
              <p className="text-muted text-xs">
                {buyableGroups.length > 1
                  ? t('courses.liveSidebarPickOne')
                  : isLoggedIn
                    ? t('courses.liveSidebarPickHint')
                    : t('courses.guestClassesHint')}
              </p>
            )}
            <ul className="space-y-2">
              {groups.map((group) => {
                const reason = closedReasonOf(group);
                return (
                  <li key={group.id}>
                    <Link
                      href={
                        reason || !canPurchase
                          ? `#${groupAnchorId(group.id)}`
                          : enrollHref(group.id)
                      }
                      className="border-theme hover:bg-surface block rounded-xl border p-3 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold text-(--theme-foreground)">
                          {group.title}
                        </p>
                        {reason ? (
                          <span className="bg-surface text-muted shrink-0 rounded-full px-2 py-0.5 text-[10px]">
                            {t('courses.groupClosedBadge')}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2">
                        <SlotChips slots={group.Slots} />
                      </div>
                      <p className="text-muted mt-2 text-[11px]">
                        {reason
                          ? t(CLOSED_REASON_KEY[reason])
                          : `${t('courses.groupSeatsLeft')}: ${formatNumber(group.seats_left, language)} · ${format(seatPriceOfGroup(group))}`}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {isStaff ? null : closed ? (
              <p className="text-muted text-sm">{t('courses.enrollmentClosed')}</p>
            ) : buyableGroups.length === 1 ? (
              <>
                <Link href={enrollHref(buyableGroups[0].id)} className={ctaClassName}>
                  {t('courses.liveEnrollAndJoin')}
                </Link>
                {isLoggedIn ? <CreditBalanceNote /> : null}
              </>
            ) : isLoggedIn && buyableGroups.length ? (
              <CreditBalanceNote />
            ) : null}
          </>
        ) : (
          <p className="text-muted text-sm">{t('courses.liveNoClassesYet')}</p>
        )}
      </div>
    </div>
  );
}
