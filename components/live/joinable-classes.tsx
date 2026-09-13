"use client";

import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MoveToClassPanel } from "@/components/live/move-to-class-panel";
import { SlotChips } from "@/components/live/slot-chips";
import type { JoinableGroup } from "@/lib/api/account-types";
import { CLASS_SIZE_LABEL, classSizeOf } from "@/lib/courses/live-course";
import { useTranslation } from "@/lib/i18n/hooks";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface JoinableClassesProps {
  engagementId: string;
  groups: JoinableGroup[];
  paidValue: number;
  courseHref: string;
  onKeepPrivate: () => void;
}

/**
 * Open classes of the course a paid 1:1 student can sit in right now. Picking
 * one opens the move panel, where the paid value is spent on seats.
 */
export function JoinableClasses({
  engagementId,
  groups,
  paidValue,
  courseHref,
  onKeepPrivate,
}: JoinableClassesProps) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fmt = (amount: number) => formatCurrency(amount, { divideBy: 1 });

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
          <li key={group.id} className="space-y-3">
            <div className="space-y-3 rounded-2xl border border-theme bg-card p-4">
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
              <SlotChips slots={group.Slots} />
              <div className="flex items-center justify-between gap-3 border-t border-theme pt-3">
                <span className="text-xs text-muted">
                  {t("courses.groupPerSeat")}:{" "}
                  <span className="font-bold text-(--theme-foreground)">
                    {fmt(group.seat_price)}
                  </span>
                  {" · "}
                  {group.can_join_free
                    ? t("live.joinClassCovered")
                    : t("live.joinClassNeedsSeat")}
                </span>
                {group.can_join_free ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedId(selectedId === group.id ? null : group.id)
                    }
                    className="rounded-lg bg-(--theme-primary) px-4 py-2 text-sm font-semibold text-(--theme-on-primary)"
                  >
                    {t("live.joinClassButton")}
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
            </div>
            {selectedId === group.id ? (
              <MoveToClassPanel
                engagementId={engagementId}
                group={group}
                paidValue={paidValue}
                onMoved={() => router.refresh()}
                onKeepPrivate={() => {
                  setSelectedId(null);
                  onKeepPrivate();
                }}
              />
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
