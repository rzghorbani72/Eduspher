'use client';

import { Trash2 } from 'lucide-react';

import { clockRangeLabel } from '@/components/live/slot-chips';

import { Select } from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker';
import {
  WINDOW_PROBLEM_KEY,
  type WeeklyWindow,
  type WindowProblem,
} from '@/lib/courses/class-request-windows';
import { sortWeekdays, weekdayLabelKey } from '@/lib/courses/weekly-rule';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatNumber } from '@/lib/utils';

export type RequestWindow = { weekday: number; from: string; duration: number };

const WEEK = sortWeekdays([0, 1, 2, 3, 4, 5, 6]);
const DURATIONS = [60, 90, 120] as const;

interface ClassRequestWindowRowProps {
  window: RequestWindow;
  problem: WindowProblem | null;
  /** The teacher's weekly classes, shown for the chosen day. */
  busy: readonly WeeklyWindow[];
  removable: boolean;
  onChange: (patch: Partial<RequestWindow>) => void;
  onRemove: () => void;
}

/** One free slot: weekday, start time and how long — same shape as a class slot. */
export function ClassRequestWindowRow({
  window: w,
  problem,
  busy,
  removable,
  onChange,
  onRemove,
}: ClassRequestWindowRowProps) {
  const { t, language } = useTranslation();
  const busyToday = busy.filter((slot) => slot.weekday === w.weekday);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={w.weekday}
          onChange={(e) => onChange({ weekday: Number(e.target.value) })}
          className="w-36"
          aria-label={t('courses.requestClassDay')}
        >
          {WEEK.map((day) => (
            <option key={day} value={day}>
              {t(weekdayLabelKey(day) ?? '')}
            </option>
          ))}
        </Select>
        <TimePicker
          value={w.from}
          onChange={(value) => onChange({ from: value })}
          className="w-28"
          aria-label={t('courses.requestClassStart')}
        />
        <Select
          value={w.duration}
          onChange={(e) => onChange({ duration: Number(e.target.value) })}
          className="w-32"
          aria-label={t('courses.requestClassDuration')}
        >
          {DURATIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {t('courses.requestClassMinutes').replace('{count}', formatNumber(minutes, language))}
            </option>
          ))}
        </Select>
        {removable ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-muted hover:text-(--theme-foreground)"
            aria-label={t('common.delete')}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {busyToday.length ? (
        <p className="text-muted text-xs">
          {t('courses.requestClassBusyOn')}{' '}
          <span className="cd-price">
            {busyToday
              .map((slot) =>
                clockRangeLabel(slot.start_minute, slot.end_minute - slot.start_minute, language),
              )
              .join('، ')}
          </span>
        </p>
      ) : null}
      {problem ? (
        <p role="alert" className="text-xs text-red-600">
          {t(WINDOW_PROBLEM_KEY[problem])}
        </p>
      ) : null}
    </div>
  );
}
