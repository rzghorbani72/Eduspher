"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { formatCurrencyWithAcademy, toPersianDigits, cn } from "@/lib/utils";
import { useEnrollmentClosed } from "@/components/academy/enrollment-status-provider";
import { usePurchase } from "@/components/purchase/use-purchase";
import { CheckoutDialog } from "@/components/purchase/checkout-dialog";
import type { PurchaseOptionView } from "@/lib/courses/purchase-options";
import { totalOf } from "@/lib/courses/purchase-options";
import { PurchaseOptionRow } from "@/components/courses/purchase-option-row";

export interface CurrencyConfig {
  currency?: string;
  currency_symbol?: string;
  currency_position?: "before" | "after";
  country_code?: string;
  language?: string;
}

interface PurchasePanelProps {
  options: PurchaseOptionView[];
  language: string;
  currencyConfig: CurrencyConfig | null;
  loginHref: string;
  /** Set when the visitor already owns the course; buying is replaced by "continue". */
  continueHref: string | null;
}

const CTA_KEY: Record<string, string> = {
  FREE: "courses.enrollFree",
  ONE_TIME: "courses.ctaBuy",
  PAYMENT_PLAN: "courses.ctaStartInstallments",
  SUBSCRIPTION: "courses.ctaSubscribe",
  TUTORING: "courses.ctaSubscribe",
  PRIVATE: "courses.ctaRequestPrivate",
};

/**
 * The single buy box: every published way to pay for this course — one-off,
 * installments, content subscription, private tutoring — as one radio group
 * with one call to action, so the student makes one decision.
 */
export function PurchasePanel({
  options,
  language,
  currencyConfig,
  loginHref,
  continueHref,
}: PurchasePanelProps) {
  const { t } = useTranslation();
  const enrollmentClosed = useEnrollmentClosed();
  const { purchase, pendingKey, error, gateways, reset } = usePurchase({ loginHref });
  const [confirming, setConfirming] = useState(false);
  const [selectedKey, setSelectedKey] = useState(options[0]?.key ?? "");

  const selected =
    options.find((option) => option.key === selectedKey) ?? options[0];

  const fmt = (amount: number) =>
    toPersianDigits(
      formatCurrencyWithAcademy(
        Math.round(amount),
        currencyConfig,
        undefined,
        language,
      ),
      language,
    );

  if (!selected) return null;

  if (continueHref) {
    return (
      <div className="cd-side-card rounded-2xl border p-6 text-center shadow-2xl">
        <p className="text-sm font-bold text-(--theme-foreground)">
          {t("courses.alreadyEnrolled")}
        </p>
        <a
          href={continueHref}
          className="cd-cta-btn mt-4 flex h-13 w-full items-center justify-center rounded-full text-base font-extrabold text-white transition-all hover:-translate-y-0.5"
        >
          {t("courses.continueLearning")}
        </a>
      </div>
    );
  }

  const isBusy = pendingKey === selected.key;
  const disabled = isBusy || enrollmentClosed;

  return (
    <div className="cd-side-card overflow-hidden rounded-2xl border shadow-2xl">
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-lg font-black text-(--theme-foreground)">
          {t("courses.chooseEnrollMethod")}
        </h2>
        <p className="mt-1 text-[13px] text-(--theme-muted)">
          {options.length > 1
            ? t("courses.chooseEnrollMethodHint")
            : t("courses.singleEnrollMethodHint")}
        </p>
      </div>

      <div role="radiogroup" className="space-y-2.5 px-4 py-3">
        {options.map((option) => (
          <PurchaseOptionRow
            key={option.key}
            option={option}
            selected={option.key === selected.key}
            onSelect={() => setSelectedKey(option.key)}
            format={fmt}
            language={language}
          />
        ))}
      </div>

      <div className="px-5 pb-5">
        <button
          type="button"
          disabled={disabled}
          title={enrollmentClosed ? t("academyStatus.enrollmentClosed") : undefined}
          onClick={() => setConfirming(true)}
          className={cn(
            "cd-cta-btn flex h-13 w-full items-center justify-center rounded-full text-base font-extrabold text-white transition-all",
            disabled ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5",
          )}
        >
          {enrollmentClosed
            ? t("academyStatus.enrollmentClosedShort")
            : isBusy
              ? t("common.loading")
              : t(CTA_KEY[selected.kind] ?? "courses.ctaBuy")}
        </button>

        {selected.installments && (
          <p className="cd-price mt-2.5 text-center text-xs text-(--theme-muted)">
            {t("courses.installmentTotal").replace("{total}", fmt(totalOf(selected)))}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-2.5 text-center text-xs text-red-600">
            {error}
          </p>
        )}

        <p className="mt-3.5 flex items-center justify-center gap-1.5 text-xs text-(--theme-muted)">
          <Lock className="h-3.5 w-3.5" />
          {t("courses.securePaymentNote")}
        </p>
      </div>

      {confirming && (
        <CheckoutDialog
          selector={selected.selector}
          fallbackAmount={selected.price}
          fallbackTitle={selected.title}
          currencyConfig={currencyConfig}
          language={language}
          busy={isBusy}
          error={error}
          gateways={gateways}
          onPay={(couponCode, provider) =>
            void purchase(selected.selector, selected.price, selected.key, {
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
