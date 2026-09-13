"use client";

import { CalendarClock, Clock3, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { ClassRequestForm } from "@/components/courses/class-request-form";
import { JoinableClasses } from "@/components/live/joinable-classes";
import type { TutoringGroupRoom } from "@/lib/api/account-types";
import { weekdayLabelKey } from "@/lib/courses/weekly-rule";
import { useTranslation } from "@/lib/i18n/hooks";
import { toPersianDigits } from "@/lib/utils";

interface PrivateScheduleRequestProps {
  room: TutoringGroupRoom;
  courseHref: string;
  onOpenChat: () => void;
}

const minuteLabel = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

/**
 * The stage of a paid private class before its first session exists. Instead
 * of a dark, empty player the student is asked when they can meet; once sent,
 * the same spot shows what they asked for and that the teacher is on it.
 */
export function PrivateScheduleRequest({
  room,
  courseHref,
  onOpenChat,
}: PrivateScheduleRequestProps) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const pending = room.pending_request ?? null;
  const joinable = room.joinable_groups ?? [];

  return (
    <section className="rounded-2xl border border-theme bg-card p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--theme-primary)/10 text-(--theme-primary)">
          {pending ? (
            <Clock3 className="size-5" aria-hidden="true" />
          ) : (
            <CalendarClock className="size-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-lg font-bold text-(--theme-foreground)">
            {pending
              ? t("live.privateWaitingTitle")
              : t("live.privateAskTimesTitle")}
          </h2>
          <p className="text-sm text-muted">
            {pending
              ? t("live.privateWaitingHint").replace(
                  "{teacher}",
                  room.Tutor?.display_name ?? "",
                )
              : t("live.privateAskTimesHint")}
          </p>
        </div>
      </div>

      {joinable.length ? (
        <div className="mt-5 border-b border-theme pb-5">
          <JoinableClasses
            engagementId={room.id}
            groups={joinable}
            courseHref={courseHref}
          />
        </div>
      ) : null}

      <div className="mt-5">
        {joinable.length ? (
          <h3 className="mb-3 text-sm font-black text-(--theme-foreground)">
            {t("live.privateOrAskTimes")}
          </h3>
        ) : null}
        {pending ? (
          <ul className="flex flex-wrap gap-2">
            {pending.windows.map((w, index) => (
              <li
                key={index}
                className="rounded-lg border border-theme bg-surface px-3 py-1.5 text-sm"
              >
                {t(weekdayLabelKey(w.weekday) ?? "")}{" "}
                {toPersianDigits(
                  `${minuteLabel(w.start_minute)}–${minuteLabel(w.end_minute)}`,
                  language,
                )}
              </li>
            ))}
          </ul>
        ) : (
          <ClassRequestForm
            courseId={room.course_id}
            engagementId={room.id}
            isLoggedIn
            loginHref="#"
            onDone={() => router.refresh()}
          />
        )}
      </div>

      <button
        type="button"
        onClick={onOpenChat}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-(--theme-primary-ink) underline-offset-4 hover:underline"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        {t("live.privateMessageTeacher")}
      </button>
    </section>
  );
}
