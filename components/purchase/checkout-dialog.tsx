"use client";

import { useState } from "react";
import { Loader2, Lock, X } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { cn, formatCurrencyWithAcademy, toPersianDigits } from "@/lib/utils";
import { useCheckoutQuote } from "@/components/purchase/use-checkout-quote";
import type { PurchaseGateway, PurchaseSelector } from "@/components/purchase/use-purchase";
import type { CurrencyConfig } from "@/components/courses/purchase-panel";
import { SummaryRow } from "@/components/purchase/summary-row";

interface CheckoutDialogProps {
  selector: PurchaseSelector;
  /** Shown until the server quote arrives. */
  fallbackAmount: number;
  fallbackTitle: string | null;
  /** Falls back to the academy-less format when the surface has no config. */
  currencyConfig?: CurrencyConfig | null;
  language?: string;
  busy: boolean;
  error: string | null;
  /** Non-empty when the buyer must choose which bank to pay through. */
  gateways: PurchaseGateway[];
  onPay: (couponCode: string | undefined, provider?: string) => void;
  onClose: () => void;
}

/**
 * The last step before the bank: what is being bought, what a coupon takes off,
 * the total (VAT included) and one Pay button — so nobody is redirected to a
 * gateway without seeing the exact amount first.
 */
export function CheckoutDialog({
  selector,
  fallbackAmount,
  fallbackTitle,
  currencyConfig = null,
  language: languageProp,
  busy,
  error,
  gateways,
  onPay,
  onClose,
}: CheckoutDialogProps) {
  const { t, language: uiLanguage } = useTranslation();
  const language = languageProp ?? uiLanguage;
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | undefined>(undefined);
  const { quote, loading, reprice } = useCheckoutQuote(selector, true);

  const fmt = (amount: number) =>
    toPersianDigits(
      formatCurrencyWithAcademy(Math.round(amount), currencyConfig, undefined, language),
      language,
    );

  const total = quote?.final_amount ?? fallbackAmount;
  const percent = Math.round((quote?.vat_rate ?? 0) * 100);

  const applyCode = async () => {
    const trimmed = code.trim();
    setApplied(trimmed || undefined);
    await reprice(trimmed || undefined);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-theme bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-theme px-5 py-4">
          <div>
            <h2 id="checkout-dialog-title" className="text-base font-black text-(--theme-foreground)">
              {t("checkout.confirmTitle")}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {quote?.title ?? fallbackTitle ?? t("checkout.confirmHint")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.cancel")}
            className="rounded-full p-1 text-muted hover:text-(--theme-foreground)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4 text-sm">
          <div className="flex items-center gap-2">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={t("checkout.discountCode")}
              className="h-11 min-w-0 flex-1 rounded-xl border border-theme bg-surface px-3 text-sm text-(--theme-foreground) outline-none focus:border-(--theme-primary)"
            />
            <button
              type="button"
              onClick={() => void applyCode()}
              disabled={loading}
              className="h-11 shrink-0 rounded-xl border border-theme px-4 text-xs font-bold text-(--theme-foreground) disabled:opacity-60"
            >
              {t("checkout.applyDiscount")}
            </button>
          </div>

          {quote?.coupon_invalid && (
            <p role="alert" className="text-xs text-red-600">
              {t("checkout.couponInvalid")}
            </p>
          )}

          <div className="space-y-2 rounded-xl bg-surface p-3.5">
            <SummaryRow label={t("checkout.itemPrice")} value={fmt(quote?.base_amount ?? fallbackAmount)} />
            {(quote?.discount_amount ?? 0) > 0 && (
              <SummaryRow
                label={t("checkout.discount")}
                value={`− ${fmt(quote?.discount_amount ?? 0)}`}
                tone="positive"
              />
            )}
            <div className="flex items-center justify-between border-t border-theme pt-2">
              <span className="font-bold text-(--theme-foreground)">{t("checkout.total")}</span>
              <span className="cd-price text-lg font-black text-(--theme-foreground)">
                {loading ? "…" : fmt(total)}
              </span>
            </div>
            {percent > 0 && (
              <p className="text-[11px] text-muted">
                {t("checkout.vatIncluded").replace(
                  "{percent}",
                  toPersianDigits(String(percent), language),
                )}
              </p>
            )}
          </div>

          {gateways.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-(--theme-foreground)">
                {t("checkout.chooseGateway")}
              </p>
              {gateways.map((gateway) => (
                <button
                  key={gateway.provider}
                  type="button"
                  onClick={() => onPay(applied, gateway.provider)}
                  className="w-full rounded-xl border border-theme px-4 py-3 text-start text-sm font-bold text-(--theme-foreground) hover:bg-surface"
                >
                  {gateway.display_name}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="space-y-2 px-5 pb-5">
          {gateways.length === 0 && (
            <button
              type="button"
              disabled={busy || loading}
              onClick={() => onPay(applied)}
              className={cn(
                "cd-cta-btn flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-extrabold text-white",
                busy || loading ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5",
              )}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("checkout.payNow")}
            </button>
          )}
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
            <Lock className="h-3 w-3" />
            {t("courses.securePaymentNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
