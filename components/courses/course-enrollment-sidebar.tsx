"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Box, CreditCard, Video, Package, Check, Lock } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { formatCurrencyWithAcademy, toPersianDigits, cn } from "@/lib/utils";
import { useEnrollmentClosed } from "@/components/academy/enrollment-status-provider";
import { ENROLLMENT_METHODS, type MethodIcon } from "@/components/courses/course-mock-data";

interface CurrencyConfig {
  currency?: string;
  currency_symbol?: string;
  currency_position?: "before" | "after";
  country_code?: string;
  language?: string;
}

interface CourseEnrollmentSidebarProps {
  isFree: boolean;
  basePrice: number;
  originalPrice: number | null;
  enrollHref: string;
  language: string;
  currencyConfig: CurrencyConfig | null;
  freePriceLabel: string;
}

const ICONS: Record<MethodIcon, typeof Box> = {
  box: Box,
  card: CreditCard,
  video: Video,
  bundle: Package,
};

const CTA_CLASS =
  "cd-cta-btn flex h-13 w-full items-center justify-center rounded-full text-base font-extrabold text-white";

/** The buy/enroll call to action — inert while the academy takes no new students. */
function EnrollCta({ href, label }: { href: string; label: string }) {
  const { t } = useTranslation();
  const closed = useEnrollmentClosed();

  if (closed) {
    return (
      <span
        aria-disabled="true"
        title={t("academyStatus.enrollmentClosed")}
        className={cn(CTA_CLASS, "cursor-not-allowed opacity-60")}
      >
        {t("academyStatus.enrollmentClosedShort")}
      </span>
    );
  }

  return (
    <a href={href} className={cn(CTA_CLASS, "transition-all hover:-translate-y-0.5")}>
      {label}
    </a>
  );
}

export function CourseEnrollmentSidebar({
  isFree,
  basePrice,
  originalPrice,
  enrollHref,
  language,
  currencyConfig,
  freePriceLabel,
}: CourseEnrollmentSidebarProps) {
  const { t } = useTranslation();
  const recommended = ENROLLMENT_METHODS.find((m) => m.recommended) ?? ENROLLMENT_METHODS[0];
  const [selectedKey, setSelectedKey] = useState(recommended.key);

  const fmt = (amount: number) =>
    toPersianDigits(
      formatCurrencyWithAcademy(Math.round(amount), currencyConfig, undefined, language),
      language,
    );

  if (isFree) {
    return (
      <div className="cd-side-card rounded-2xl border p-6 text-center shadow-2xl">
        <div className="text-3xl font-black text-(--theme-foreground)">{freePriceLabel}</div>
        <div className="mt-5">
          <EnrollCta href={enrollHref} label={t("courses.enrollFree")} />
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-(--theme-muted)">
          <Lock className="h-3.5 w-3.5" />
          {t("courses.securePaymentNote")}
        </p>
      </div>
    );
  }

  return (
    <div className="cd-side-card overflow-hidden rounded-2xl border shadow-2xl">
      <div className="px-6 pt-6 pb-2 text-right">
        <h2 className="text-lg font-black text-(--theme-foreground)">
          {t("courses.chooseEnrollMethod")}
        </h2>
        <p className="mt-1 text-[13px] text-(--theme-muted)">
          {t("courses.chooseEnrollMethodHint")}
        </p>
      </div>

      <div className="space-y-2.5 px-4 py-3">
        {ENROLLMENT_METHODS.map((method) => {
          const Icon = ICONS[method.icon];
          const isSelected = selectedKey === method.key;
          const price = fmt(basePrice * method.priceFactor);
          const original =
            method.originalFactor != null
              ? fmt(basePrice * method.originalFactor)
              : originalPrice != null && method.priceFactor === 1
                ? fmt(originalPrice)
                : null;
          const interval =
            method.interval === "month" ? t("courses.intervalMonth") : t("courses.intervalOnce");

          return (
            <button
              key={method.key}
              type="button"
              onClick={() => setSelectedKey(method.key)}
              className={cn(
                "w-full rounded-xl border p-3.5 text-right transition-all duration-200",
                isSelected ? "cd-method-active" : "cd-method",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors",
                    isSelected
                      ? "bg-(--theme-primary) text-white"
                      : "bg-(--theme-surface) text-(--theme-muted)",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {method.badgeKey && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-bold",
                          method.badgeTone === "popular" ? "cd-badge-popular" : "cd-badge-save",
                        )}
                      >
                        {t(method.badgeKey)}
                      </span>
                    )}
                    <span className="text-[15px] font-extrabold text-(--theme-foreground)">
                      {t(method.titleKey)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-(--theme-muted)">{t(method.descKey)}</p>
                </div>

                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                    isSelected ? "border-(--theme-primary)" : "border-(--theme-border-strong)",
                  )}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="cd-radio-dot"
                      className="h-2.5 w-2.5 rounded-full bg-(--theme-primary)"
                    />
                  )}
                </span>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 border-t border-(--theme-border-color) pt-4">
                    <div className="flex flex-wrap items-baseline justify-end gap-x-2 gap-y-1">
                      {original && (
                        <span className="text-sm font-semibold text-(--theme-muted) line-through">
                          {original}
                        </span>
                      )}
                      <span className="text-sm text-(--theme-muted)">{interval}</span>
                      <span className="cd-price text-2xl font-black text-(--theme-foreground)">
                        {price}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-2">
                      {method.featureKeys.map((featureKey) => (
                        <li
                          key={featureKey}
                          className="flex items-center justify-end gap-2 text-[13px] text-(--theme-foreground)"
                        >
                          {t(featureKey)}
                          <Check className="h-4 w-4 shrink-0 text-(--theme-primary)" />
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-5 pb-5">
        <EnrollCta
          href={enrollHref}
          label={t(
            ENROLLMENT_METHODS.find((m) => m.key === selectedKey)?.ctaKey ?? "courses.ctaBuy",
          )}
        />
        <p className="mt-3.5 flex items-center justify-center gap-1.5 text-xs text-(--theme-muted)">
          <Lock className="h-3.5 w-3.5" />
          {t("courses.securePaymentNote")}
        </p>
      </div>
    </div>
  );
}
