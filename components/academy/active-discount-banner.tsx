"use client";

import { Fragment, useState } from "react";
import { Tag } from "lucide-react";

import {
  formatActiveDiscountOffer,
  type PublicActiveDiscount,
} from "@/lib/discounts/format-active-discount";
import { useTranslation } from "@/lib/i18n/hooks";

type ActiveDiscountBannerProps = {
  discounts: PublicActiveDiscount[];
  currencyCode?: string;
};

function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  return Object.entries(params).reduce(
    (text, [key, value]) =>
      text.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value)),
    template,
  );
}

function DiscountCodeButton({
  code,
  copyLabel,
  copiedLabel,
}: {
  code: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; keep UI quiet.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copyLabel}
      title={copyLabel}
      className="mx-0.5 cursor-pointer border-0 bg-transparent p-0 font-mono text-[0.95em] font-extrabold tracking-wider text-black underline decoration-2 underline-offset-2 hover:opacity-80"
    >
      {copied ? copiedLabel : code}
    </button>
  );
}

/** Full-width strip shown on every academy page while student coupons are live. */
export function ActiveDiscountBanner({
  discounts,
  currencyCode = "IRR",
}: ActiveDiscountBannerProps) {
  const { t, language } = useTranslation();

  if (discounts.length === 0) return null;

  const tr = (key: string, params: Record<string, string | number> = {}) =>
    interpolate(t(key), params);

  const labels = {
    percentOff: (percent: number) =>
      tr("activeDiscount.percentOff", { percent }),
    fixedOff: (amount: string) => tr("activeDiscount.fixedOff", { amount }),
    fullOff: () => t("activeDiscount.fullOff"),
    freeTrial: (days: number) => tr("activeDiscount.freeTrial", { days }),
  };

  const latestEnd = discounts.reduce((latest, discount) => {
    const end = new Date(discount.end_date);
    return end > latest ? end : latest;
  }, new Date(discounts[0].end_date));

  const validUntil = latestEnd.toLocaleDateString(
    language === "fa" ? "fa-IR" : language,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(language === "fa" ? { calendar: "persian" as const } : {}),
    },
  );

  const codeButton = (code: string) => (
    <DiscountCodeButton
      code={code}
      copyLabel={tr("activeDiscount.copyCode", { code })}
      copiedLabel={t("activeDiscount.codeCopied")}
    />
  );

  const message =
    discounts.length === 1 ? (
      <>
        {t("activeDiscount.codeIntro")} {codeButton(discounts[0].code)}{" "}
        {tr("activeDiscount.codeSingleTail", {
          offer: formatActiveDiscountOffer(discounts[0], labels, {
            currencyCode,
            language,
          }),
        })}
      </>
    ) : (
      <>
        {t("activeDiscount.codesIntro")}{" "}
        {discounts.map((discount, index) => {
          const offer = formatActiveDiscountOffer(discount, labels, {
            currencyCode,
            language,
          });
          return (
            <Fragment key={discount.code}>
              {index > 0 ? " · " : null}
              {codeButton(discount.code)}
              <span> ({offer})</span>
            </Fragment>
          );
        })}{" "}
        {t("activeDiscount.codesTail")}
      </>
    );

  return (
    <div
      role="status"
      className="w-full border-b border-black/15 px-3 py-2.5 text-center text-xs font-semibold sm:text-sm"
      style={{
        backgroundColor: "var(--theme-primary)",
        color: "var(--theme-on-primary)",
      }}
    >
      <p className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-1 gap-y-1">
        <Tag className="h-4 w-4 shrink-0" aria-hidden />
        <span>{message}</span>
        <span className="hidden shrink-0 sm:inline">
          · {tr("activeDiscount.validUntil", { date: validUntil })}
        </span>
      </p>
    </div>
  );
}
