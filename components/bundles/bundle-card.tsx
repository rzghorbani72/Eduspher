"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useEnrollmentClosed } from "@/components/academy/enrollment-status-provider";
import { usePurchase } from "@/components/purchase/use-purchase";
import { CheckoutDialog } from "@/components/purchase/checkout-dialog";
import { useLocaleFormat } from "@/hooks/use-locale-digits";
import { useTranslation } from "@/lib/i18n/hooks";
import type { StudentBundle } from "@/lib/bundles";

interface BundleCardProps {
  bundle: StudentBundle;
  /** Sum of the courses' individual prices, when known — drives the savings badge. */
  listPrice: number;
  priceLabel: string;
  listPriceLabel: string;
  isFeatured: boolean;
  loginHref: string;
}

export function BundleCard({
  bundle,
  listPrice,
  priceLabel,
  listPriceLabel,
  isFeatured,
  loginHref,
}: BundleCardProps) {
  const { t } = useTranslation();
  const format = useLocaleFormat();
  const enrollmentClosed = useEnrollmentClosed();
  const { purchase, pendingKey, error, gateways, reset } = usePurchase({ loginHref });
  const [confirming, setConfirming] = useState(false);

  const busy = pendingKey === bundle.key;
  const discountPercent =
    listPrice > bundle.price
      ? Math.round(((listPrice - bundle.price) / listPrice) * 100)
      : 0;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all hover:shadow-lg ${
        isFeatured
          ? "border-(--theme-primary) bg-(--theme-primary)/5 ring-2 ring-(--theme-primary)/20"
          : "border-theme bg-card"
      }`}
    >
      {isFeatured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-(--theme-primary) px-4 py-1 text-xs font-bold text-(--theme-on-primary)">
            {t("bundles.mostPopular")}
          </span>
        </div>
      )}

      <h2 className="text-xl font-bold text-(--theme-foreground)">
        {bundle.name}
      </h2>
      {bundle.description && (
        <p className="mt-1 text-sm text-muted">{bundle.description}</p>
      )}

      <p className="mt-4 text-sm text-muted">
        {t("bundles.includes")} {format.number(bundle.courses.length)}{" "}
        {t("bundles.course")}
      </p>

      <ul className="mb-6 mt-3 space-y-2.5 text-sm">
        {bundle.courses.map((course) => (
          <li
            key={course.id}
            className="flex items-center gap-2 text-(--theme-foreground)"
          >
            <Check size={14} className="shrink-0 text-(--theme-primary)" />
            <span>{course.title}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-3">
        {discountPercent > 0 && (
          <p className="text-sm text-muted line-through">{listPriceLabel}</p>
        )}
        <div>
          <p className="text-2xl font-bold text-(--theme-foreground)">
            {priceLabel}
          </p>
          {discountPercent > 0 && (
            <Badge variant="success" className="mt-1">
              {t("bundles.save")} {format.percent(discountPercent)}
            </Badge>
          )}
        </div>

        <button
          type="button"
          disabled={busy || enrollmentClosed}
          onClick={() => setConfirming(true)}
          title={
            enrollmentClosed ? t("academyStatus.enrollmentClosed") : undefined
          }
          className={`inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition-all disabled:opacity-60 ${
            isFeatured
              ? "bg-(--theme-primary) text-(--theme-on-primary) hover:opacity-90"
              : "border border-theme bg-card text-(--theme-foreground) hover:bg-surface"
          }`}
        >
          {enrollmentClosed
            ? t("academyStatus.enrollmentClosedShort")
            : busy
              ? t("common.loading")
              : t("bundles.buyBundle")}
        </button>

        {error && <p className="text-center text-xs text-red-600">{error}</p>}
      </div>

      {confirming && (
        <CheckoutDialog
          selector={bundle.selector}
          fallbackAmount={bundle.price}
          fallbackTitle={bundle.name}
          busy={busy}
          error={error}
          gateways={gateways}
          onPay={(couponCode, provider) =>
            void purchase(bundle.selector, bundle.price, bundle.key, {
              couponCode,
              provider,
            })
          }
          onClose={() => {
            reset();
            setConfirming(false);
          }}
        />
      )}
    </div>
  );
}
