'use client';

import { CalendarClock } from 'lucide-react';

import type { CurrencyConfig } from '@/components/courses/purchase-panel';
import { CreditBalanceNote } from '@/components/purchase/credit-balance-note';
import Link from '@/components/ui/link';
import type { PublicTutoringGroup } from '@/lib/api/server';
import { seatPriceOfGroup } from '@/lib/courses/live-course';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatCurrencyWithAcademy, formatNumber } from '@/lib/utils';

export const CLASS_REQUEST_ANCHOR_ID = 'request-class';
export const GROUP_CLASSES_ANCHOR_ID = 'group-classes';

interface LiveCoursePanelProps {
  groups: PublicTutoringGroup[];
  currencyConfig: CurrencyConfig | null;
  isLoggedIn: boolean;
  /** Classroom URL when this student already has a seat or a grant. */
  joinHref: string | null;
  loginHref: string;
}

const ctaClassName =
  'flex h-11 items-center justify-center rounded-xl bg-(--theme-primary) text-sm font-bold text-(--theme-on-primary) transition-opacity hover:opacity-90';

/**
 * Live-course buy box: enter the classroom if the student already has access,
 * otherwise enroll in an open class (or ask for a time when none exist yet).
 */
export function LiveCoursePanel({
  groups,
  currencyConfig,
  isLoggedIn,
  joinHref,
  loginHref,
}: LiveCoursePanelProps) {
  const { t, language } = useTranslation();
  const hasOpenClasses = groups.length > 0;
  const format = (amount: number) => formatCurrencyWithAcademy(amount, currencyConfig, 1, language);
  const fromPrice = hasOpenClasses ? Math.min(...groups.map(seatPriceOfGroup)) : null;
  const seatsLeft = groups.reduce((sum, group) => sum + group.seats_left, 0);

  if (joinHref) {
    return (
      <div className="cd-side-card overflow-hidden rounded-2xl border shadow-2xl">
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-(--theme-primary-ink)">
            <CalendarClock className="size-4" aria-hidden="true" />
            {t('courses.liveCourse')}
          </div>
          <p className="text-sm text-(--theme-foreground)">{t('courses.liveHasAccessHint')}</p>
          <Link href={joinHref} className={ctaClassName}>
            {t('courses.groupEnter')}
          </Link>
        </div>
      </div>
    );
  }

  const enrollHref = hasOpenClasses
    ? `#${GROUP_CLASSES_ANCHOR_ID}`
    : isLoggedIn
      ? `#${CLASS_REQUEST_ANCHOR_ID}`
      : loginHref;
  const enrollLabel = hasOpenClasses
    ? t('courses.liveEnrollAndJoin')
    : isLoggedIn
      ? t('courses.requestClassTitle')
      : t('courses.liveEnrollLogin');

  return (
    <div className="cd-side-card overflow-hidden rounded-2xl border shadow-2xl">
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-(--theme-primary-ink)">
          <CalendarClock className="size-4" aria-hidden="true" />
          {t('courses.liveCourse')}
        </div>

        {fromPrice !== null ? (
          <div>
            <p className="text-muted text-[11px]">{t('courses.groupPerSeat')}</p>
            <p className="cd-price text-2xl font-black text-(--theme-foreground)">
              {groups.length > 1
                ? t('courses.fromPrice').replace('{price}', format(fromPrice))
                : format(fromPrice)}
            </p>
            <p className="text-muted mt-1 text-xs">
              {t('courses.openClasses').replace('{count}', formatNumber(groups.length, language))}
              {' · '}
              {t('courses.groupSeatsLeft')}: {formatNumber(seatsLeft, language)}
            </p>
          </div>
        ) : (
          <p className="text-muted text-sm">{t('courses.liveNoClassesYet')}</p>
        )}

        <Link href={enrollHref} className={ctaClassName}>
          {enrollLabel}
        </Link>

        {isLoggedIn ? <CreditBalanceNote /> : null}
      </div>

      {hasOpenClasses ? (
        <a
          href={`#${CLASS_REQUEST_ANCHOR_ID}`}
          className="border-theme hover:bg-surface block border-t px-5 py-3 text-center text-xs font-semibold text-(--theme-primary-ink) transition-colors"
        >
          {t('courses.requestClassLinkWithClasses')}
        </a>
      ) : null}
    </div>
  );
}
