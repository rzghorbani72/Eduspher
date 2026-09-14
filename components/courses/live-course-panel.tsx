'use client';

import { CalendarClock } from 'lucide-react';

import { LiveClassOptions } from '@/components/courses/live-class-options';
import type { CurrencyConfig } from '@/components/courses/purchase-panel';
import { CreditBalanceNote } from '@/components/purchase/credit-balance-note';
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
}

/**
 * The compact buy box of a live course: lowest seat price, how many classes
 * are open, and a jump to the class list. The time-request form lives below.
 */
export function LiveCoursePanel({ groups, currencyConfig, isLoggedIn }: LiveCoursePanelProps) {
  const { t, language } = useTranslation();
  const hasOpenClasses = groups.length > 0;
  const format = (amount: number) => formatCurrencyWithAcademy(amount, currencyConfig, 1, language);
  const fromPrice = hasOpenClasses ? Math.min(...groups.map(seatPriceOfGroup)) : null;
  const seatsLeft = groups.reduce((sum, group) => sum + group.seats_left, 0);

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

        {hasOpenClasses ? <LiveClassOptions groups={groups} /> : null}

        {hasOpenClasses ? (
          <a
            href={`#${GROUP_CLASSES_ANCHOR_ID}`}
            className="flex h-11 items-center justify-center rounded-xl bg-(--theme-primary) text-sm font-bold text-(--theme-on-primary) transition-opacity hover:opacity-90"
          >
            {t('courses.liveChooseClass')}
          </a>
        ) : null}

        {isLoggedIn ? <CreditBalanceNote /> : null}
      </div>

      <a
        href={`#${CLASS_REQUEST_ANCHOR_ID}`}
        className="border-theme hover:bg-surface block border-t px-5 py-3 text-center text-xs font-semibold text-(--theme-primary-ink) transition-colors"
      >
        {hasOpenClasses ? t('courses.requestClassLinkWithClasses') : t('courses.requestClassTitle')}
      </a>
    </div>
  );
}
