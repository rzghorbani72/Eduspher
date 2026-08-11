"use client";

import { Tag } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { formatCurrencyWithAcademy, toPersianDigits, cn } from "@/lib/utils";
import { useEnrollmentClosed } from "@/components/academy/enrollment-status-provider";
import { usePurchase } from "@/components/purchase/use-purchase";
import type { PublicCourseOffering, PublicPaymentPlan } from "@/lib/api/server";

interface CurrencyConfig {
  currency?: string;
  currency_symbol?: string;
  currency_position?: "before" | "after";
  country_code?: string;
  language?: string;
}

interface CourseOfferingsCardProps {
  offerings: PublicCourseOffering[];
  /** Empty unless the deployment has installments enabled. */
  paymentPlans: PublicPaymentPlan[];
  language: string;
  currencyConfig: CurrencyConfig | null;
  loginHref: string;
}

// Storefront: lists every active offering for a course (a course can be sold as
// one-time AND subscription AND private at once). The offer carries the price
// and the access term, so checkout is driven by offer_id, never by the course.
export function CourseOfferingsCard({
  offerings,
  paymentPlans,
  language,
  currencyConfig,
  loginHref,
}: CourseOfferingsCardProps) {
  const { t } = useTranslation();
  const enrollmentClosed = useEnrollmentClosed();
  const { purchase, pendingKey, error } = usePurchase({ loginHref });

  if (offerings.length === 0 && paymentPlans.length === 0) return null;

  const fmt = (amount: number) =>
    toPersianDigits(
      formatCurrencyWithAcademy(Math.round(amount), currencyConfig, undefined, language),
      language,
    );

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Tag className="h-4 w-4" />
        {t("courses.offeringsTitle")}
      </div>
      <ul className="space-y-3">
        {offerings.map((o) => {
          const free = o.type === "FREE";
          return (
            <li
              key={o.id}
              className="flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {t(`courses.offering${o.type}` as never)}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {free ? t("courses.offeringFREE") : fmt(o.price)}
                </span>
              </div>
              <button
                type="button"
                disabled={pendingKey === o.id || enrollmentClosed}
                title={
                  enrollmentClosed
                    ? t("academyStatus.enrollmentClosed")
                    : undefined
                }
                onClick={() => purchase({ offer_id: o.id }, o.price, o.id)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium",
                  "bg-primary text-primary-foreground hover:opacity-90",
                  (pendingKey === o.id || enrollmentClosed) && "opacity-60",
                  enrollmentClosed && "cursor-not-allowed",
                )}
              >
                {enrollmentClosed
                  ? t("academyStatus.enrollmentClosedShort")
                  : free
                    ? t("courses.offeringFree")
                    : t("courses.offeringBuy")}
              </button>
            </li>
          );
        })}
        {paymentPlans.map((plan) => (
          <li
            key={plan.id}
            className="flex items-center justify-between gap-3 rounded-xl border p-3"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{t("courses.offeringPAYMENT_PLAN")}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {toPersianDigits(String(plan.installment_count), language)} ×{" "}
                {fmt(plan.installment_amount)}
              </span>
            </div>
            <button
              type="button"
              disabled={pendingKey === plan.id || enrollmentClosed}
              onClick={() =>
                purchase({ payment_plan_id: plan.id }, plan.installment_amount, plan.id)
              }
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium",
                "bg-primary text-primary-foreground hover:opacity-90",
                (pendingKey === plan.id || enrollmentClosed) && "opacity-60",
              )}
            >
              {enrollmentClosed
                ? t("academyStatus.enrollmentClosedShort")
                : t("courses.offeringBuy")}
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </div>
  );
}
