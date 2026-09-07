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
import { MyAccessPanel } from "@/components/courses/my-access-panel";
import type { CourseAccessRow } from "@/lib/api/account-types";

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
  /** Where each owned way is entered. */
  learnHref: string;
  liveClassesHref: string;
  tutoringHref: string;
  /** How this student got in, and until when. Null if they have no access. */
  access: CourseAccessRow | null;
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
  learnHref,
  liveClassesHref,
  tutoringHref,
  access,
}: PurchasePanelProps) {
  const { t } = useTranslation();
  const enrollmentClosed = useEnrollmentClosed();
  const { purchase, pendingKey, error, gateways, reset } = usePurchase({
    loginHref,
  });
  const [confirming, setConfirming] = useState(false);
  const ownedOptions = options.filter((option) => option.owned);
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

  // A student who already holds this course — bought it, was granted it by a
  // teacher or manager, or reaches it through their student group — is a paid
  // student: they see how to keep going, never a price again.
  const hasAccess =
    ownedOptions.length > 0 || continueHref !== null || access !== null;

  if (hasAccess) {
    return (
      <div className="cd-side-card overflow-hidden rounded-2xl border shadow-2xl">
        {ownedOptions.length > 0 || access ? (
          <MyAccessPanel
            access={access}
            owned={ownedOptions}
            learnHref={continueHref ?? learnHref}
            liveClassesHref={liveClassesHref}
            tutoringHref={tutoringHref}
          />
        ) : (
          <div className="px-5 py-5 text-center">
            <p className="text-xs font-bold text-(--theme-foreground)">
              {t("courses.alreadyEnrolled")}
            </p>
            <a
              href={continueHref ?? learnHref}
              className="cd-cta-btn mt-2.5 flex h-11 w-full items-center justify-center rounded-full text-sm font-extrabold text-white transition-all hover:-translate-y-0.5"
            >
              {t("courses.continueLearning")}
            </a>
          </div>
        )}
      </div>
    );
  }

  if (!selected) return null;

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
          title={
            enrollmentClosed ? t("academyStatus.enrollmentClosed") : undefined
          }
          onClick={() => setConfirming(true)}
          className={cn(
            "cd-cta-btn flex h-13 w-full items-center justify-center rounded-full text-base font-extrabold text-white transition-all",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "hover:-translate-y-0.5",
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
            {t("courses.installmentTotal").replace(
              "{total}",
              fmt(totalOf(selected)),
            )}
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
          gateways={gateways}
          onPay={(couponCode, provider) =>
            purchase(selected.selector, selected.price, selected.key, {
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
