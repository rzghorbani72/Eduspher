"use client";

import { CalendarClock, Users } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { formatDate, formatNumber } from "@/lib/utils";
import { weekdayLabelKey } from "@/lib/courses/weekly-rule";
import type { PublicTutoringGroup } from "@/lib/api/server";

const minutesToTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60,
  ).padStart(2, "0")}`;

type Props = {
  group: PublicTutoringGroup;
  format: (amount: number) => string;
  seats: number;
  pending: boolean;
  onSeatsChange: (seats: number) => void;
  onJoin: () => void;
  enrolledHref?: string;
};

/**
 * One scheduled class as a student sees it before buying: when it meets, how
 * many seats are left, who it is for, and whether it is still waiting to fill.
 */
export const TutoringGroupCard = ({
  group,
  format,
  seats,
  pending,
  onSeatsChange,
  onJoin,
  enrolledHref,
}: Props) => {
  const { t, language } = useTranslation();
  const price = (group.Offer?.price ?? 0) * seats;
  const waiting = group.status === "WAITING";
  const needed = Math.max(group.min_students - group.seats_taken, 0);
  const empty = group.seats_taken === 0;
  // A student is buying a term, not just a weekday, so print the real dates.
  const termLabel = group.starts_on
    ? group.ends_on
      ? `${t("courses.groupTerm")}: ${formatDate(group.starts_on, language)} – ${formatDate(group.ends_on, language)}`
      : `${t("courses.groupStarts")}: ${formatDate(group.starts_on, language)}`
    : null;

  return (
    <article className="space-y-3 rounded-2xl border border-(--theme-border-color) bg-card p-4">
      <header className="space-y-1">
        <h3 className="text-base font-semibold text-(--theme-foreground)">
          {group.title}
        </h3>
        {group.Tutor?.display_name ? (
          <p className="text-xs text-muted">{group.Tutor.display_name}</p>
        ) : null}
      </header>

      <ul className="space-y-1.5">
        {group.Slots.map((slot, index) => {
          const key = weekdayLabelKey(slot.weekday);
          return (
            <li
              key={index}
              className="flex items-center gap-2 text-sm text-(--theme-foreground)"
            >
              <CalendarClock className="size-4 shrink-0 text-(--theme-primary)" />
              <span>
                {key ? t(key) : ""}{" "}
                <span dir="ltr">
                  {minutesToTime(slot.start_minute)}–
                  {minutesToTime(slot.start_minute + slot.duration_minutes)}
                </span>
              </span>
              {slot.Lesson ? (
                <span className="text-xs text-muted">
                  · {slot.Lesson.title}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      {termLabel ? (
        <p className="text-xs font-medium text-(--theme-foreground)">
          {termLabel}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Users className="size-3.5" />
          {t("courses.groupSeatsLeft")}:{" "}
          {formatNumber(group.seats_left, language)}
        </span>
        {group.age_min || group.age_max ? (
          <span>
            {t("courses.groupAgeRange")}:{" "}
            {formatNumber(group.age_min ?? 0, language)}–
            {formatNumber(group.age_max ?? 0, language)}
          </span>
        ) : null}
      </div>

      {waiting ? (
        <p className="rounded-lg bg-(--theme-primary-subtle) px-3 py-2 text-xs text-(--theme-primary-ink)">
          {needed > 0
            ? `${t("courses.groupWaiting")} (${formatNumber(needed, language)})`
            : t("courses.groupStartingSoon")}
        </p>
      ) : null}

      {/* An empty class can be booked whole, so a student can bring their own
          group instead of waiting for strangers to fill it. */}
      {empty && group.capacity > 1 ? (
        <label className="flex items-center justify-between gap-2 text-xs text-muted">
          {t("courses.groupReserveWhole")}
          <input
            type="number"
            min={1}
            max={group.capacity}
            dir="ltr"
            value={seats}
            onChange={(e) =>
              onSeatsChange(
                Math.min(
                  Math.max(Number(e.target.value) || 1, 1),
                  group.capacity,
                ),
              )
            }
            className="w-20 rounded-md border border-(--theme-border-color) bg-transparent px-2 py-1 text-end"
          />
        </label>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <span className="text-lg font-black text-(--theme-foreground)">
          {format(price)}
        </span>
        {group.joined && enrolledHref ? (
          <a
            href={enrolledHref}
            className="rounded-lg bg-(--theme-primary) px-4 py-2 text-sm font-semibold text-(--theme-on-primary)"
          >
            {t("courses.groupEnter")}
          </a>
        ) : (
          <button
            type="button"
            disabled={pending || group.seats_left < seats}
            onClick={onJoin}
            className="rounded-lg bg-(--theme-primary) px-4 py-2 text-sm font-semibold text-(--theme-on-primary) disabled:opacity-60"
          >
            {seats > 1 ? t("courses.groupBookWhole") : t("courses.groupJoin")}
          </button>
        )}
      </div>
    </article>
  );
};
