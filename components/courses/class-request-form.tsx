"use client";

import { CalendarPlus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "@/components/ui/link";
import { Textarea } from "@/components/ui/textarea";
import { postJson } from "@/lib/api/client";
import { sortWeekdays, weekdayLabelKey } from "@/lib/courses/weekly-rule";
import { useTranslation } from "@/lib/i18n/hooks";
import { logger } from "@/lib/logging/app-logger";
import { errorFields } from "@/lib/logging/error-fields";

type Window = { weekday: number; from: string; to: string };

const WEEK = sortWeekdays([0, 1, 2, 3, 4, 5, 6]);
const toMinute = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

interface ClassRequestFormProps {
  courseId: string;
  isLoggedIn: boolean;
  loginHref: string;
}

/**
 * A student tells the teacher when they can attend. Nothing is booked here —
 * the teacher answers by opening a class, and the student then buys a seat.
 */
export function ClassRequestForm({
  courseId,
  isLoggedIn,
  loginHref,
}: ClassRequestFormProps) {
  const { t } = useTranslation();
  const [seats, setSeats] = useState("1");
  const [windows, setWindows] = useState<Window[]>([
    { weekday: WEEK[0], from: "16:00", to: "18:00" },
  ]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (index: number, patch: Partial<Window>) =>
    setWindows((all) =>
      all.map((w, i) => (i === index ? { ...w, ...patch } : w)),
    );

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await postJson("/class-requests", {
        course_id: courseId,
        seats: Math.max(1, Number(seats) || 1),
        windows: windows.map((w) => ({
          weekday: w.weekday,
          start_minute: toMinute(w.from),
          end_minute: toMinute(w.to),
        })),
        note: note.trim() || undefined,
      });
      setDone(true);
      logger.ok("ClassRequest", "Submitted", { course_id: courseId });
    } catch (err) {
      setError(t("courses.requestClassFailed"));
      logger.warn("ClassRequest", "SubmitFailed", errorFields(err));
    } finally {
      setBusy(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <Link
        href={loginHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-(--theme-primary-ink) underline-offset-4 hover:underline"
      >
        <CalendarPlus className="size-4" aria-hidden="true" />
        {t("courses.requestClassLogin")}
      </Link>
    );
  }

  if (done) {
    return (
      <p className="rounded-xl border border-theme bg-surface p-4 text-sm">
        {t("courses.requestClassDone")}
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="request-seats">{t("courses.requestClassSeats")}</Label>
        <Input
          id="request-seats"
          type="number"
          min={1}
          max={50}
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          className="max-w-32"
        />
        <p className="text-xs text-muted">
          {t("courses.requestClassSeatsHint")}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{t("courses.requestClassWindows")}</Label>
        {windows.map((w, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <select
              value={w.weekday}
              onChange={(e) =>
                update(index, { weekday: Number(e.target.value) })
              }
              className="h-10 rounded-lg border border-theme bg-card px-3 text-sm"
              aria-label={t("courses.requestClassDay")}
            >
              {WEEK.map((day) => (
                <option key={day} value={day}>
                  {t(weekdayLabelKey(day) ?? "")}
                </option>
              ))}
            </select>
            <Input
              type="time"
              value={w.from}
              onChange={(e) => update(index, { from: e.target.value })}
              className="w-28"
              aria-label={t("courses.requestClassFrom")}
            />
            <Input
              type="time"
              value={w.to}
              onChange={(e) => update(index, { to: e.target.value })}
              className="w-28"
              aria-label={t("courses.requestClassTo")}
            />
            {windows.length > 1 ? (
              <button
                type="button"
                onClick={() =>
                  setWindows((all) => all.filter((_, i) => i !== index))
                }
                className="text-muted hover:text-(--theme-foreground)"
                aria-label={t("common.delete")}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ))}
        {windows.length < 7 ? (
          <button
            type="button"
            onClick={() =>
              setWindows((all) => [
                ...all,
                { weekday: WEEK[0], from: "16:00", to: "18:00" },
              ])
            }
            className="inline-flex items-center gap-1 text-xs font-semibold text-(--theme-primary-ink)"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            {t("courses.requestClassAddWindow")}
          </button>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="request-note">{t("courses.requestClassNote")}</Label>
        <Textarea
          id="request-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" loading={busy} className="w-full">
        {t("courses.requestClassSubmit")}
      </Button>
    </form>
  );
}
