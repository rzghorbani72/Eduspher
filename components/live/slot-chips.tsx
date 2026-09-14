'use client';

import { CalendarClock } from 'lucide-react';

import { weekdayLabelKey } from '@/lib/courses/weekly-rule';
import { useTranslation } from '@/lib/i18n/hooks';
import { formatLtrValue } from '@/lib/utils';

export type SlotLike = {
  weekday: number;
  start_minute: number;
  duration_minutes: number;
};

export const minuteLabel = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

export const clockRangeLabel = (startMinute: number, durationMinutes: number, language?: string) =>
  formatLtrValue(
    `${minuteLabel(startMinute)}–${minuteLabel(startMinute + durationMinutes)}`,
    language,
  );

/** The weekly meeting times of a class as small chips. */
export function SlotChips({ slots }: { slots: SlotLike[] }) {
  const { t, language } = useTranslation();
  return (
    <ul className="flex flex-wrap gap-2">
      {slots.map((slot, index) => (
        <li
          key={index}
          className="border-theme bg-surface inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs text-(--theme-foreground)"
        >
          <CalendarClock className="size-3.5 text-(--theme-primary)" aria-hidden="true" />
          {t(weekdayLabelKey(slot.weekday) ?? '')}
          <span className="cd-price">
            {clockRangeLabel(slot.start_minute, slot.duration_minutes, language)}
          </span>
        </li>
      ))}
    </ul>
  );
}
