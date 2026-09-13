"use client";

import type { PublicTutoringGroup } from "@/lib/api/server";
import { sessionsOfGroup } from "@/lib/courses/live-course";
import { useTranslation } from "@/lib/i18n/hooks";
import { formatNumber } from "@/lib/utils";

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

  return (
    <>
      <dl className="grid grid-cols-2 gap-2 rounded-xl bg-surface p-3 text-xs">
        <div>
          <dt className="text-muted">{t("courses.groupSeatPrice")}</dt>
          <dd className="font-bold text-(--theme-foreground)">
            {format(seatPrice)}
          </dd>
          <dd className="text-[11px] text-muted">
            {t("courses.groupPerSession")
              .replace("{count}", formatNumber(sessions, language))
              .replace("{price}", format(Math.round(seatPrice / sessions)))}
          </dd>
        </div>
        {group.capacity > 1 ? (
          <div>
            <dt className="text-muted">
              {t("courses.groupWholePrice").replace(
                "{count}",
                formatNumber(group.capacity, language),
              )}
            </dt>
            <dd className="font-bold text-(--theme-foreground)">
              {format(seatPrice * group.capacity)}
            </dd>
          </div>
        ) : null}
      </dl>

      {/* Buy one seat and invite friends by link, or pay for several at once. */}
      {group.seats_left > 1 ? (
        <div className="space-y-1">
          <label className="flex items-center justify-between gap-2 text-xs text-muted">
            {t("courses.groupReserveWhole")}
            <input
              type="number"
              min={1}
              max={group.seats_left}
              dir="ltr"
              value={seats}
              onChange={(e) =>
                onSeatsChange(
                  Math.min(
                    Math.max(Number(e.target.value) || 1, 1),
                    group.seats_left,
                  ),
                )
              }
              className="w-20 rounded-md border border-(--theme-border-color) bg-transparent px-2 py-1 text-end"
            />
          </label>
          <p className="text-[11px] text-muted">
            {t("courses.groupShareHint")}
          </p>
        </div>
      ) : null}
    </>
  );
};
