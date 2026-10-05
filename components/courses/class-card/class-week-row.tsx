'use client';

import { weekdayNamesOf, weekdaysOf } from '@/components/courses/class-card/schedule';
import type { PublicTutoringGroup } from '@/lib/api/server';
import { sortWeekdays, weekdayLabelKey } from '@/lib/courses/weekly-rule';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

const WEEK = sortWeekdays([0, 1, 2, 3, 4, 5, 6]);

/** A one-letter week strip with the class days lit, then the days and session count. */
export function ClassWeekRow({
  group,
  sessionLabel,
}: {
  group: Pick<PublicTutoringGroup, 'Slots'>;
  sessionLabel: string | null;
}) {
  const { t } = useTranslation();
  const classDays = new Set(weekdaysOf(group));

  return (
    <div className="mt-3.5 mb-1.5 flex flex-wrap items-center gap-2">
      <div className="flex gap-1" aria-hidden="true">
        {WEEK.map((day) => (
          <span
            key={day}
            className={cn(
              'cd-day grid size-[26px] place-items-center rounded-[9px] text-xs',
              classDays.has(day) && 'cd-day-on font-bold',
            )}
          >
            {t(weekdayLabelKey(day) ?? '').charAt(0)}
          </span>
        ))}
      </div>
      {classDays.size ? <span className="cd-class-chip">{weekdayNamesOf(group, t)}</span> : null}
      {sessionLabel ? <span className="cd-class-chip">{sessionLabel}</span> : null}
    </div>
  );
}
