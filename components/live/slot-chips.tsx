"use client";

import { CalendarClock } from "lucide-react";

import { weekdayLabelKey } from "@/lib/courses/weekly-rule";
import { useTranslation } from "@/lib/i18n/hooks";
import { toPersianDigits } from "@/lib/utils";

export type SlotLike = {
  weekday: number;
  start_minute: number;
  duration_minutes: number;
};

export const minuteLabel = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

/** The weekly meeting times of a class as small chips. */
export function SlotChips({ slots }: { slots: SlotLike[] }) {
  const { t, language } = useTranslation();
  return (
    <ul className="flex flex-wrap gap-2">
      {slots.map((slot, index) => (
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
  );
}
