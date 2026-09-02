import { toPersianDigits } from "@/lib/utils";
import type { LiveView, UnlockRule } from "@/lib/courses/curriculum";
import { sortWeekdays, weekdayLabelKey } from "@/lib/courses/weekly-rule";

type Translate = (key: string) => string;

const localeOf = (language: string) => (language === "fa" ? "fa-IR" : language || "en");

/** "1:05" for over an hour, "۴۵ دقیقه" below it. Empty when unknown. */
export const formatMinutes = (
  minutes: number | null | undefined,
  language: string,
  t: Translate,
): string => {
  if (!minutes || minutes <= 0) return "";
  if (minutes < 60) return `${toPersianDigits(minutes, language)} ${t("courses.min")}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hoursLabel = `${toPersianDigits(hours, language)} ${t("courses.hours")}`;
  if (rest === 0) return hoursLabel;
  return `${hoursLabel} ${toPersianDigits(rest, language)} ${t("courses.min")}`;
};

/** Lesson lengths come in seconds: "۳۱ ثانیه" under a minute, minutes above. */
export const formatSeconds = (
  seconds: number | null | undefined,
  language: string,
  t: Translate,
): string => {
  if (!seconds || seconds <= 0) return "";
  if (seconds < 60) return `${toPersianDigits(seconds, language)} ${t("courses.sec")}`;
  return formatMinutes(Math.round(seconds / 60), language, t);
};

export const formatDateTime = (
  iso: string,
  language: string,
  timezone?: string,
): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(localeOf(language), {
      dateStyle: "medium",
      timeStyle: "short",
      hourCycle: "h23",
      timeZone: timezone || undefined,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(localeOf(language), {
      dateStyle: "medium",
      timeStyle: "short",
      hourCycle: "h23",
    }).format(date);
  }
};

/**
 * "Every Saturday, Monday" for a group class, or the plain "Repeats" label when
 * the rule carries no weekdays (it then follows the start day).
 */
export const formatLiveRepeat = (live: LiveView, t: Translate): string => {
  if (!live.isRecurring) return "";
  const names = sortWeekdays(live.weekdays)
    .map((day) => weekdayLabelKey(day))
    .filter((key): key is string => Boolean(key))
    .map((key) => t(key));
  if (names.length === 0) return t("courses.liveRecurring");
  return t("courses.liveWeekdays").replace("{days}", names.join("، "));
};

/**
 * A weekly class started months ago, so its `starts_at` is not the answer to
 * "when do we meet". The server computes the next occurrence; the row shows
 * that, and falls back to the original time once the series is over.
 */
export const formatLiveWindow = (
  live: LiveView,
  language: string,
  t: Translate,
): string => {
  const when = live.nextOccurrenceAt ?? live.startsAt;
  const meeting = formatDateTime(when, language, live.timezone);
  const start = live.nextOccurrenceAt
    ? `${t("courses.liveNextSession")} ${meeting}`
    : meeting;
  const length = live.durationMinutes
    ? formatMinutes(live.durationMinutes, language, t)
    : "";
  const parts = [start, length].filter(Boolean);
  const repeat = formatLiveRepeat(live, t);
  if (repeat) parts.push(repeat);
  return parts.join(" · ");
};

export const formatUnlockRule = (
  unlock: UnlockRule,
  language: string,
  t: Translate,
): string =>
  unlock.kind === "date"
    ? t("courses.unlocksOn").replace(
        "{date}",
        formatDateTime(String(unlock.value), language),
      )
    : t("courses.unlocksAfterDays").replace(
        "{days}",
        toPersianDigits(Number(unlock.value), language),
      );

/** null access_duration_days means the purchase never expires. */
export const formatAccessTerm = (
  days: number | null | undefined,
  language: string,
  t: Translate,
): string => {
  if (days == null || days <= 0) return t("courses.accessLifetime");
  if (days % 365 === 0) {
    return t("courses.accessYears").replace(
      "{count}",
      toPersianDigits(days / 365, language),
    );
  }
  if (days % 30 === 0) {
    return t("courses.accessMonths").replace(
      "{count}",
      toPersianDigits(days / 30, language),
    );
  }
  return t("courses.accessDays").replace("{count}", toPersianDigits(days, language));
};
