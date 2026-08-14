/**
 * Reads the weekly repeat rule a live group class is stored with
 * (`FREQ=WEEKLY` or `FREQ=WEEKLY;BYDAY=SA,MO`). Weekday numbers are
 * `Date.getDay()` values, so 0 = Sunday.
 */

const WEEKDAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

const RULE_PATTERN =
  /^FREQ=WEEKLY(;BYDAY=(SU|MO|TU|WE|TH|FR|SA)(,(SU|MO|TU|WE|TH|FR|SA))*)?$/i;

/** Empty when the class does not repeat, or repeats on its start weekday only. */
export const parseWeeklyRule = (rule?: string | null): number[] => {
  if (!rule || !RULE_PATTERN.test(rule)) return [];
  const byDay = /BYDAY=([A-Z,]+)/i.exec(rule);
  if (!byDay) return [];
  return byDay[1]
    .toUpperCase()
    .split(",")
    .map((code) => WEEKDAY_CODES.indexOf(code as (typeof WEEKDAY_CODES)[number]))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b);
};

const WEEKDAY_KEYS: Record<number, string> = {
  0: "courses.weekdaySunday",
  1: "courses.weekdayMonday",
  2: "courses.weekdayTuesday",
  3: "courses.weekdayWednesday",
  4: "courses.weekdayThursday",
  5: "courses.weekdayFriday",
  6: "courses.weekdaySaturday",
};

/** Saturday first, the way a Persian week reads. */
const WEEK_ORDER: readonly number[] = [6, 0, 1, 2, 3, 4, 5];

export const weekdayLabelKey = (day: number): string | undefined =>
  WEEKDAY_KEYS[day];

export const sortWeekdays = (days: readonly number[]): number[] =>
  [...days].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
