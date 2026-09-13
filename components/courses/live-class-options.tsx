"use client";

import { Users } from "lucide-react";

import type { PublicTutoringGroup } from "@/lib/api/server";
import {
  CLASS_SIZE_LABEL,
  classSizeOf,
  groupAnchorId,
  seatPriceOfGroup,
  sortBySize,
} from "@/lib/courses/live-course";
import { useTranslation } from "@/lib/i18n/hooks";
import { formatNumber } from "@/lib/utils";

interface LiveClassOptionsProps {
  groups: PublicTutoringGroup[];
  format: (amount: number) => string;
}

/**
 * The open classes of a live course as enrol options: a private class, a small
 * group and a big public class each carry their own seat price, so a student
 * picks a size first and then buys the seat on that class's card.
 */
export function LiveClassOptions({ groups, format }: LiveClassOptionsProps) {
  const { t, language } = useTranslation();

  return (
    <ul className="space-y-2">
      {sortBySize(groups).map((group) => (
        <li key={group.id}>
          <a
            href={`#${groupAnchorId(group.id)}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-theme bg-surface px-3 py-2.5 transition-colors hover:border-(--theme-primary)"
          >
            <span className="min-w-0 space-y-0.5">
              <span className="block text-[11px] font-bold text-(--theme-primary-ink)">
                {t(CLASS_SIZE_LABEL[classSizeOf(group.capacity)])}
              </span>
              <span className="block truncate text-sm font-semibold text-(--theme-foreground)">
                {group.title}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted">
                <Users className="size-3" aria-hidden="true" />
                {t("courses.groupSeatsLeft")}:{" "}
                {formatNumber(group.seats_left, language)}
                {" / "}
                {formatNumber(group.capacity, language)}
              </span>
            </span>
            <span className="shrink-0 text-end">
              <span className="cd-price block text-sm font-black whitespace-nowrap text-(--theme-foreground)">
                {format(seatPriceOfGroup(group))}
              </span>
              <span className="block text-[11px] text-muted">
                {t("courses.groupPerSeat")}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
