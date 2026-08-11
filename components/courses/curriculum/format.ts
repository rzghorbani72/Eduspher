import { toPersianDigits } from "@/lib/utils";
import type { LiveView, UnlockRule } from "@/lib/courses/curriculum";

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
      timeZone: timezone || undefined,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat(localeOf(language), {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }
};

export const formatLiveWindow = (
  live: LiveView,
  language: string,
  t: Translate,
): string => {
  const start = formatDateTime(live.startsAt, language, live.timezone);
  const length = live.durationMinutes
    ? formatMinutes(live.durationMinutes, language, t)
    : "";
  const parts = [start, length].filter(Boolean);
  if (live.isRecurring) parts.push(t("courses.liveRecurring"));
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
