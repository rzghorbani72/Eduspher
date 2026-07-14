"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { formatCurrencyWithAcademy, toPersianDigits, cn } from "@/lib/utils";
import type { PublicCourseOffering } from "@/lib/api/server";

interface CurrencyConfig {
  currency?: string;
  currency_symbol?: string;
  currency_position?: "before" | "after";
  country_code?: string;
  language?: string;
}

interface CourseOfferingsCardProps {
  courseId: string;
  offerings: PublicCourseOffering[];
  language: string;
  currencyConfig: CurrencyConfig | null;
  loginHref: string;
}

// Storefront: lists every active offering for a course (a course can be sold as
// one-time AND subscription AND private at once). "Buy" drives the offering-aware
// checkout via /api/payment/initiate with the chosen offering_id.
export function CourseOfferingsCard({
  courseId,
  offerings,
  language,
  currencyConfig,
  loginHref,
}: CourseOfferingsCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (offerings.length === 0) return null;

  const fmt = (amount: number) =>
    toPersianDigits(
      formatCurrencyWithAcademy(Math.round(amount), currencyConfig, undefined, language),
      language,
    );

  const buy = async (offering: PublicCourseOffering) => {
    setPendingId(offering.id);
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          offering_id: offering.id,
          amount: offering.price,
        }),
      });
      if (res.status === 401) {
        router.push(loginHref);
        return;
      }
      const data = await res.json();
      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        // Free / subscription-covered enrollment resolves without a gateway.
        router.refresh();
      }
    } finally {
      setPendingId(null);
    }
  };

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
                disabled={pendingId === o.id}
                onClick={() => buy(o)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium",
                  "bg-primary text-primary-foreground hover:opacity-90",
                  pendingId === o.id && "opacity-60",
                )}
              >
                {free ? t("courses.offeringFree") : t("courses.offeringBuy")}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
