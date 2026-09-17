'use client';

import { CalendarClock } from 'lucide-react';

import { useEnrollmentClosed } from '@/components/academy/enrollment-status-provider';
import type { CurrencyConfig } from '@/components/courses/purchase-panel';
import { CreditBalanceNote } from '@/components/purchase/credit-balance-note';
import { SlotChips } from '@/components/live/slot-chips';
import Link from '@/components/ui/link';
import type { PublicTutoringGroup } from '@/lib/api/server';
import {
  canBuyMoreSeats,
  groupAnchorId,
  isJoinablePublicGroup,
  liveEnterLabelKey,
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
  /** Classroom URL when this student already holds a seat or a teacher grant. */
  joinHref: string | null;
  loginHref: string;
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
  joinHref,
  loginHref,
}: LiveCoursePanelProps) {
  const { t, language } = useTranslation();
  const closed = useEnrollmentClosed();
  const openGroups = groups.filter((group) => isJoinablePublicGroup(group));
  const enrolledGroup = groups.find((group) => group.joined) ?? null;
  const format = (amount: number) => formatCurrencyWithAcademy(amount, currencyConfig, 1, language);
  const fromPrice = openGroups.length ? Math.min(...openGroups.map(seatPriceOfGroup)) : null;
  const seatsLeft = openGroups.reduce((sum, group) => sum + group.seats_left, 0);

  return (
    <div className="cd-side-card overflow-hidden rounded-2xl border shadow-2xl">
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-(--theme-primary-ink)">
          <CalendarClock className="size-4" aria-hidden="true" />
          {t('courses.liveCourse')}
        </div>

        {enrolledGroup && joinHref ? (
          <>
            <p className="text-sm text-(--theme-foreground)">
              {t(
                enrolledGroup.session_live
                  ? 'courses.liveSessionOnHint'
                  : 'courses.liveHasAccessHint',
              )}
            </p>
            <SlotChips slots={enrolledGroup.Slots} />
            <Link href={joinHref} className={ctaClassName}>
              {t(liveEnterLabelKey(enrolledGroup.session_live))}
            </Link>
            {canBuyMoreSeats(enrolledGroup) && !closed ? (
              <a href={`#${groupAnchorId(enrolledGroup.id)}`} className={secondaryCtaClassName}>
                {t('courses.groupBuyMoreSeats')}
              </a>
            ) : null}
          </>
        ) : openGroups.length ? (
          <>
            {fromPrice !== null ? (
              <div>
                <p className="text-muted text-[11px]">{t('courses.groupPerSeat')}</p>
                <p className="cd-price text-2xl font-black text-(--theme-foreground)">
                  {openGroups.length > 1
                    ? t('courses.fromPrice').replace('{price}', format(fromPrice))
                    : format(fromPrice)}
                </p>
                <p className="text-muted mt-1 text-xs">
                  {t('courses.openClasses').replace(
                    '{count}',
                    formatNumber(openGroups.length, language),
                  )}
                  {' · '}
                  {t('courses.groupSeatsLeft')}: {formatNumber(seatsLeft, language)}
                </p>
              </div>
            ) : null}
            <p className="text-muted text-xs">{t('courses.liveSidebarPickHint')}</p>
            <ul className="space-y-2">
              {openGroups.map((group) => (
                <li key={group.id}>
                  <a
                    href={`#${groupAnchorId(group.id)}`}
                    className="border-theme hover:bg-surface block rounded-xl border p-3 transition-colors"
                  >
                    <p className="truncate text-sm font-bold text-(--theme-foreground)">
                      {group.title}
                    </p>
                    <div className="mt-2">
                      <SlotChips slots={group.Slots} />
                    </div>
                    <p className="text-muted mt-2 text-[11px]">
                      {t('courses.groupSeatsLeft')}: {formatNumber(group.seats_left, language)}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
            {closed ? (
              <p className="text-muted text-sm">{t('courses.enrollmentClosed')}</p>
            ) : (
              <>
                <Link
                  href={isLoggedIn ? `#${GROUP_CLASSES_ANCHOR_ID}` : loginHref}
                  className={ctaClassName}
                >
                  {isLoggedIn ? t('courses.liveEnrollAndJoin') : t('courses.liveEnrollLogin')}
                </Link>
                {isLoggedIn ? <CreditBalanceNote /> : null}
              </>
            )}
          </>
        ) : (
          <p className="text-muted text-sm">{t('courses.liveNoClassesYet')}</p>
        )}
      </div>
    </div>
  );
}
