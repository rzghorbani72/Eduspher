import { clockRangeLabel, minuteLabel } from '@/components/live/slot-chips';
import type { PublicTutoringGroup } from '@/lib/api/server';
import { sortWeekdays, weekdayLabelKey } from '@/lib/courses/weekly-rule';
import { formatLtrValue } from '@/lib/utils';

type Translate = (key: string) => string;
type SlotGroup = Pick<PublicTutoringGroup, 'Slots'>;

export const weekdaysOf = (group: SlotGroup): number[] =>
  sortWeekdays([...new Set(group.Slots.map((slot) => slot.weekday))]);

export const weekdayNamesOf = (group: SlotGroup, t: Translate): string =>
  weekdaysOf(group)
    .map((day) => t(weekdayLabelKey(day) ?? ''))
    .join(t('courses.weekdayJoiner'));

/** The class time shown on the card: its first weekly slot. */
export const firstSlotTimes = (group: SlotGroup, language: string) => {
  const slot = group.Slots.at(0);
  if (!slot) return null;
  return {
    start: formatLtrValue(minuteLabel(slot.start_minute), language),
    end: formatLtrValue(minuteLabel(slot.start_minute + slot.duration_minutes), language),
    range: clockRangeLabel(slot.start_minute, slot.duration_minutes, language),
  };
};
