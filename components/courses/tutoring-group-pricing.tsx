"use client";

import { Minus, Plus } from "lucide-react";

import type { PublicTutoringGroup } from "@/lib/api/server";
import { sessionsOfGroup } from "@/lib/courses/live-course";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn, formatNumber } from "@/lib/utils";

type Props = {
  group: PublicTutoringGroup;
  seatPrice: number;
  seats: number;
  format: (amount: number) => string;
  onSeatsChange: (seats: number) => void;
};

/** Seat price, whole-class price, and how many seats to buy now. */
export const TutoringGroupPricing = ({
  group,
  seatPrice,
  seats,
  format,
  onSeatsChange,
}: Props) => {
  const { t, language } = useTranslation();
  const sessions = sessionsOfGroup(group);
  const maxSeats = group.whole_class_booking
    ? group.seats_left
    : Math.min(group.seats_left, group.capacity - 1);

  return (
    <>
      <dl className="grid grid-cols-2 gap-3 rounded-xl bg-surface p-3">
        <div className="space-y-0.5">
          <dt className="text-[11px] text-muted">
            {t("courses.groupSeatPrice")}
          </dt>
          <dd className="cd-price text-sm font-black text-(--theme-foreground)">
            {format(seatPrice)}
          </dd>
          {sessions > 0 ? (
            <dd className="text-[11px] text-muted">
              {t("courses.groupPerSession").replace(
                "{price}",
                format(Math.round(seatPrice / sessions)),
              )}
            </dd>
          ) : null}
        </div>
        {group.capacity > 1 ? (
          <div className="space-y-0.5">
            <dt className="text-[11px] text-muted">
              {t("courses.groupWholePrice").replace(
                "{count}",
                formatNumber(group.capacity, language),
              )}
            </dt>
            <dd className="cd-price text-sm font-black text-(--theme-foreground)">
              {format(seatPrice * group.capacity)}
            </dd>
          </div>
        ) : null}
      </dl>

      {group.seats_left > 1 ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted">
              {t("courses.groupReserveWhole")}
            </span>
            <div
              role="group"
              aria-label={t("courses.groupReserveWhole")}
              className="inline-flex h-9 items-center overflow-hidden rounded-lg border border-theme"
            >
              <button
                type="button"
                aria-label={t("courses.seatsDecrease")}
                disabled={seats <= 1}
                onClick={() => onSeatsChange(seats - 1)}
                className={cn(
                  "grid size-9 place-items-center text-(--theme-foreground)",
                  "hover:bg-surface disabled:opacity-40",
                )}
              >
                <Minus className="size-3.5" aria-hidden="true" />
              </button>
              <span className="cd-price min-w-8 px-1 text-center text-sm font-bold tabular-nums">
                {formatNumber(seats, language)}
              </span>
              <button
                type="button"
                aria-label={t("courses.seatsIncrease")}
                disabled={seats >= maxSeats}
                onClick={() => onSeatsChange(seats + 1)}
                className={cn(
                  "grid size-9 place-items-center text-(--theme-foreground)",
                  "hover:bg-surface disabled:opacity-40",
                )}
              >
                <Plus className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-muted">{t("courses.groupShareHint")}</p>
        </div>
      ) : null}
    </>
  );
};
