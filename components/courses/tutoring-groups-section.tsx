"use client";

import { useState } from "react";

import { useTranslation } from "@/lib/i18n/hooks";
import { formatCurrencyWithAcademy } from "@/lib/utils";
import { useEnrollmentClosed } from "@/components/academy/enrollment-status-provider";
import { usePurchase } from "@/components/purchase/use-purchase";
import { CheckoutDialog } from "@/components/purchase/checkout-dialog";
import { TutoringGroupCard } from "@/components/courses/tutoring-group-card";
import type { PublicTutoringGroup } from "@/lib/api/server";
import type { CurrencyConfig } from "@/components/courses/purchase-panel";

interface Props {
  groups: PublicTutoringGroup[];
  currencyConfig: CurrencyConfig | null;
  language: string;
  loginHref: string;
  /** Present only for a private class opened through its share link. */
  joinCode?: string;
}

/**
 * The scheduled classes of a course. Each one is bought on its own because a
 * class is a commitment to a timetable, not just another price.
 */
export const TutoringGroupsSection = ({
  groups,
  currencyConfig,
  language,
  loginHref,
  joinCode,
}: Props) => {
  const { t } = useTranslation();
  const closed = useEnrollmentClosed();
  const { purchase, pendingKey, error, gateways, reset } = usePurchase({
    loginHref,
  });
  const [seatsByGroup, setSeatsByGroup] = useState<Record<string, number>>({});
  const [confirming, setConfirming] = useState<PublicTutoringGroup | null>(
    null,
  );

  if (!groups.length) return null;

  const format = (amount: number) =>
    formatCurrencyWithAcademy(amount, currencyConfig, 1, language);

  const seatsFor = (group: PublicTutoringGroup) => seatsByGroup[group.id] ?? 1;

  const pay = (
    group: PublicTutoringGroup,
    couponCode?: string,
    provider?: string,
  ) => {
    const seats = seatsFor(group);
    void purchase(
      { tutoring_group_id: group.id },
      (group.Offer?.price ?? 0) * seats,
      group.id,
      { seats, joinCode, provider, couponCode },
    );
  };

  return (
    <section className="space-y-4" aria-labelledby="group-classes-title">
      <div className="space-y-1">
        <h2
          id="group-classes-title"
          className="text-xl font-bold text-(--theme-foreground)"
        >
          {t("courses.groupClassesTitle")}
        </h2>
        <p className="text-sm text-muted">
          {t("courses.groupClassesSubtitle")}
        </p>
      </div>

      {closed ? (
        <p className="text-sm text-muted">{t("courses.enrollmentClosed")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <TutoringGroupCard
              key={group.id}
              group={group}
              format={format}
              seats={seatsFor(group)}
              pending={pendingKey === group.id}
              onSeatsChange={(seats) =>
                setSeatsByGroup((prev) => ({ ...prev, [group.id]: seats }))
              }
              onJoin={() => setConfirming(group)}
              enrolledHref={`/account/classes/${group.id}`}
            />
          ))}
        </div>
      )}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {confirming ? (
        <CheckoutDialog
          selector={{ tutoring_group_id: confirming.id }}
          fallbackAmount={(confirming.Offer?.price ?? 0) * seatsFor(confirming)}
          fallbackTitle={confirming.title}
          currencyConfig={currencyConfig}
          language={language}
          busy={pendingKey === confirming.id}
          error={error}
          gateways={gateways}
          extras={{
            seats: seatsFor(confirming),
            ...(joinCode ? { join_code: joinCode } : {}),
          }}
          onPay={(couponCode, provider) =>
            pay(confirming, couponCode, provider)
          }
          onClose={() => {
            reset();
            setConfirming(null);
          }}
        />
      ) : null}
    </section>
  );
};
