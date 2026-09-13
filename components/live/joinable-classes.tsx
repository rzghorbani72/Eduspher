"use client";

import { CalendarClock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { JoinableGroup } from "@/lib/api/account-types";
import { postJson } from "@/lib/api/client";
import { CLASS_SIZE_LABEL, classSizeOf } from "@/lib/courses/live-course";
import { weekdayLabelKey } from "@/lib/courses/weekly-rule";
import { useTranslation } from "@/lib/i18n/hooks";
import { logger } from "@/lib/logging/app-logger";
import { errorFields } from "@/lib/logging/error-fields";
import { formatNumber, toPersianDigits } from "@/lib/utils";

interface JoinableClassesProps {
  engagementId: string;
  groups: JoinableGroup[];
  courseHref: string;
}

const minuteLabel = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

/**
 * Open classes of the course a paid 1:1 student can sit in right now. Joining
 * is final: the private seat becomes a seat in that class's timetable.
 */
export function JoinableClasses({
  engagementId,
  groups,
  courseHref,
}: JoinableClassesProps) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const join = async (group: JoinableGroup) => {
    if (!window.confirm(t("live.joinClassConfirm"))) return;
    setBusyId(group.id);
    setError(null);
    try {
      await postJson(`/tutoring/engagements/${engagementId}/join-group`, {
        group_id: group.id,
      });
      logger.ok("Tutoring", "JoinedClassFromPrivate", { group_id: group.id });
      router.refresh();
    } catch (err) {
      setError(t("live.joinClassFailed"));
      logger.warn("Tutoring", "JoinClassFailed", errorFields(err));
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-black text-(--theme-foreground)">
          {t("live.joinClassTitle")}
        </h3>
        <p className="text-xs text-muted">{t("live.joinClassHint")}</p>
      </div>
      <ul className="space-y-3">
        {groups.map((group) => (
          <li
            key={group.id}
            className="space-y-3 rounded-2xl border border-theme bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <span className="inline-block rounded-md bg-(--theme-primary-subtle) px-2 py-0.5 text-[11px] font-bold text-(--theme-primary-ink)">
                  {t(CLASS_SIZE_LABEL[classSizeOf(group.capacity)])}
                </span>
                <p className="truncate text-base font-bold text-(--theme-foreground)">
                  {group.title}
                </p>
                {group.Tutor?.display_name ? (
                  <p className="text-xs text-muted">
                    {group.Tutor.display_name}
                  </p>
                ) : null}
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
                <Users className="size-3.5" aria-hidden="true" />
                {t("courses.groupSeatsLeft")}:{" "}
                {formatNumber(group.seats_left, language)}
              </span>
            </div>

            <ul className="flex flex-wrap gap-2">
              {group.Slots.map((slot, index) => (
                <li
                  key={index}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-theme bg-surface px-2.5 py-1 text-xs text-(--theme-foreground)"
                >
                  <CalendarClock
                    className="size-3.5 text-(--theme-primary)"
                    aria-hidden="true"
                  />
                  {t(weekdayLabelKey(slot.weekday) ?? "")}
                  <span dir="ltr">
                    {toPersianDigits(
                      `${minuteLabel(slot.start_minute)}–${minuteLabel(slot.start_minute + slot.duration_minutes)}`,
                      language,
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-3 border-t border-theme pt-3">
              <span className="text-xs text-muted">
                {group.can_join_free
                  ? t("live.joinClassCovered")
                  : t("live.joinClassNeedsSeat")}
              </span>
              {group.can_join_free ? (
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => void join(group)}
                  className="rounded-lg bg-(--theme-primary) px-4 py-2 text-sm font-semibold text-(--theme-on-primary) disabled:opacity-60"
                >
                  {busyId === group.id
                    ? t("common.loading")
                    : t("live.joinClassButton")}
                </button>
              ) : (
                <a
                  href={`${courseHref}#class-${group.id}`}
                  className="rounded-lg border border-(--theme-primary) px-4 py-2 text-sm font-semibold text-(--theme-primary-ink)"
                >
                  {t("live.joinClassBuySeat")}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </section>
  );
}
