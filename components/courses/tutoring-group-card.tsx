"use client";

import { CalendarClock, Users } from "lucide-react";

import { TutoringGroupPricing } from "@/components/courses/tutoring-group-pricing";
import { clockRangeLabel } from "@/components/live/slot-chips";
import {
  CLASS_SIZE_LABEL,
  classSizeOf,
  groupAnchorId,
  seatPriceOfGroup,
  sessionsOfGroup,
} from "@/lib/courses/live-course";
import { useTranslation } from "@/lib/i18n/hooks";
import { formatDate, formatNumber } from "@/lib/utils";
import { weekdayLabelKey } from "@/lib/courses/weekly-rule";
import type { PublicTutoringGroup } from "@/lib/api/server";

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
  const seatPrice = seatPriceOfGroup(group);
  const price = seatPrice * seats;
  const waiting = group.status === "WAITING";
  const needed = Math.max(group.min_students - group.seats_taken, 0);
  const sessions = sessionsOfGroup(group);
  const sessionLabel =
    sessions > 0
      ? t("courses.sessionCount").replace(
          "{count}",
          formatNumber(sessions, language),
        )
      : null;
  // A student is buying a term, not just a weekday, so print the real dates.
  const termLabel = group.starts_on
    ? group.ends_on
      ? `${t("courses.groupTerm")}: ${formatDate(group.starts_on, language)} – ${formatDate(group.ends_on, language)}`
      : `${t("courses.groupStarts")}: ${formatDate(group.starts_on, language)}`
    : null;
  const termFacts = [sessionLabel, termLabel].filter(Boolean).join(" · ");

  return (
    <article
      id={groupAnchorId(group.id)}
      className="scroll-mt-24 space-y-3 rounded-2xl border border-(--theme-border-color) bg-card p-4"
    >
      <header className="space-y-1">
        <span className="inline-block rounded-md bg-(--theme-primary-subtle) px-2 py-0.5 text-[11px] font-bold text-(--theme-primary-ink)">
          {t(CLASS_SIZE_LABEL[classSizeOf(group.capacity)])}
        </span>
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
                <span className="cd-price">
                  {clockRangeLabel(
                    slot.start_minute,
                    slot.duration_minutes,
                    language,
                  )}
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

      {termFacts ? (
        <p className="text-xs font-medium text-(--theme-foreground)">
          {termFacts}
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

      <TutoringGroupPricing
        group={group}
        seatPrice={seatPrice}
        seats={seats}
        format={format}
        onSeatsChange={onSeatsChange}
      />

      <div className="flex items-center justify-between gap-3">
        <span className="cd-price text-lg font-black whitespace-nowrap text-(--theme-foreground)">
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
            {seats === group.capacity && group.capacity > 1
              ? t("courses.groupBookWhole")
              : t("courses.groupJoin")}
          </button>
        )}
      </div>
    </article>
  );
};
