import type { LiveSessionSummary } from "@/lib/api/types";

/** The join button opens this long before the class starts. */
export const JOIN_OPENS_MINUTES_BEFORE = 15;

export type LivePhase = "BEFORE" | "LIVE" | "ENDED";

export interface LiveSchedule {
  phase: LivePhase;
  startsAt: Date | null;
  endsAt: Date | null;
}

const MINUTE = 60_000;

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Which of the three live states this session is in right now.
 *
 * A recurring class is measured from its next occurrence, not from the first
 * meeting the series ever had. When the end is unknown, a published recording
 * is what tells us the class is over — guessing a duration would either hide a
 * running class or leave a finished one looking live for hours.
 */
export function resolveLiveSchedule(
  session: Pick<
    LiveSessionSummary,
    | "starts_at"
    | "ends_at"
    | "duration_minutes"
    | "next_occurrence_at"
    | "playback_url"
  >,
  now: Date = new Date(),
): LiveSchedule {
  const startsAt =
    parseDate(session.next_occurrence_at) ?? parseDate(session.starts_at);
  if (!startsAt) {
    return { phase: "BEFORE", startsAt: null, endsAt: null };
  }

  const endsAt =
    parseDate(session.ends_at) ??
    (session.duration_minutes
      ? new Date(startsAt.getTime() + session.duration_minutes * MINUTE)
      : null);

  const opensAt = startsAt.getTime() - JOIN_OPENS_MINUTES_BEFORE * MINUTE;
  const ended = endsAt
    ? now.getTime() > endsAt.getTime()
    : Boolean(session.playback_url) && now.getTime() > startsAt.getTime();

  if (ended) {
    return { phase: "ENDED", startsAt, endsAt };
  }
  if (now.getTime() >= opensAt) {
    return { phase: "LIVE", startsAt, endsAt };
  }
  return { phase: "BEFORE", startsAt, endsAt };
}

/** "سه‌شنبه ۲۲ مهر ۱۴۰۴ · ۱۹:۰۰ تا ۲۰:۳۰" — one line, in the class's timezone. */
export function formatLiveSchedule(
  startsAt: Date | null,
  endsAt: Date | null,
  timezone: string | undefined,
  language: string,
  rangeSeparator: string,
): string {
  if (!startsAt) return "";
  const zone = timezone || undefined;
  const day = new Intl.DateTimeFormat(language, {
    dateStyle: "full",
    timeZone: zone,
  }).format(startsAt);
  const time = (date: Date) =>
    new Intl.DateTimeFormat(language, {
      timeStyle: "short",
      hourCycle: "h23",
      timeZone: zone,
    }).format(date);
  const clock = endsAt
    ? `${time(startsAt)} ${rangeSeparator} ${time(endsAt)}`
    : time(startsAt);
  return `${day} · ${clock}`;
}

/** Two letters for an avatar: "نازنین کریمی" -> "ن.ک". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => Array.from(part)[0] ?? "").join(".");
}

const icsStamp = (date: Date): string =>
  date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Escapes the characters iCalendar treats as syntax. */
const icsText = (value: string): string =>
  value.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

/**
 * A one-event .ics as a data URL, so "add to calendar" needs no endpoint.
 * Returns null when there is no start to write.
 */
export function buildCalendarUrl(
  title: string,
  startsAt: Date | null,
  endsAt: Date | null,
  meetingUrl: string | null,
): string | null {
  if (!startsAt) return null;
  const end = endsAt ?? new Date(startsAt.getTime() + 60 * MINUTE);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//academy//lesson//EN",
    "BEGIN:VEVENT",
    `UID:${icsStamp(startsAt)}-${Math.random().toString(36).slice(2, 10)}`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(startsAt)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsText(title)}`,
    meetingUrl ? `URL:${icsText(meetingUrl)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}
