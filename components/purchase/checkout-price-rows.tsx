"use client";

import type { CheckoutQuote } from "@/components/purchase/use-checkout-quote";
import { SummaryRow } from "@/components/purchase/summary-row";
import { useTranslation } from "@/lib/i18n/hooks";
import { toPersianDigits } from "@/lib/utils";

interface CheckoutPriceRowsProps {
  quote: CheckoutQuote | null;
  fallbackAmount: number;
  loading: boolean;
  useCredit: boolean;
  onUseCreditChange: (next: boolean) => void;
  fmt: (amount: number) => string;
}

/** Listed price − coupon − store credit + VAT = what the bank charges. */
export function CheckoutPriceRows({
  quote,
  fallbackAmount,
  loading,
  useCredit,
  onUseCreditChange,
  fmt,
}: CheckoutPriceRowsProps) {
  const { t, language } = useTranslation();
  const total = quote?.final_amount ?? fallbackAmount;
  const percent = Math.round((quote?.vat_rate ?? 0) * 100);
  const creditBalance = quote?.credit_balance ?? 0;

  return (
    <div className="space-y-2 rounded-xl bg-surface p-3.5">
      <SummaryRow
        label={t("checkout.itemPrice")}
        value={fmt(quote?.base_amount ?? fallbackAmount)}
      />
      {(quote?.discount_amount ?? 0) > 0 && (
        <SummaryRow
          label={t("checkout.discount")}
          value={`− ${fmt(quote?.discount_amount ?? 0)}`}
          tone="positive"
        />
      )}
      {creditBalance > 0 && (
        <label className="flex cursor-pointer items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-muted">
            <input
              type="checkbox"
              checked={useCredit}
              onChange={(event) => onUseCreditChange(event.target.checked)}
              className="size-4 accent-(--theme-primary)"
            />
            {t("checkout.creditApplied")}
            <span className="text-[11px]">
              (
              {t("checkout.creditAvailable").replace(
                "{amount}",
                fmt(creditBalance),
              )}
              )
            </span>
          </span>
          <span className="cd-price font-medium text-emerald-600">
            {useCredit ? `− ${fmt(quote?.credit_amount ?? 0)}` : "—"}
          </span>
        </label>
      )}
      {(quote?.vat_amount ?? 0) > 0 && (
        <SummaryRow
          label={t("checkout.vatIncluded").replace(
            "{percent}",
            toPersianDigits(String(percent), language),
          )}
          value={`+ ${fmt(quote?.vat_amount ?? 0)}`}
        />
      )}
      <div className="flex items-center justify-between border-t border-theme pt-2">
        <span className="font-bold text-(--theme-foreground)">
          {t("checkout.total")}
        </span>
        <span className="cd-price text-lg font-black text-(--theme-foreground)">
          {loading ? "…" : fmt(total)}
        </span>
      </div>
      {creditBalance > 0 && useCredit ? (
        <p className="text-[11px] text-muted">{t("checkout.creditNotCash")}</p>
      ) : null}
    </div>
  );
}
