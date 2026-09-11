"use client";

import { useCallback, useEffect, useState } from "react";

import type { PurchaseSelector } from "@/components/purchase/use-purchase";
import { parseApiError } from "@/lib/api/api-error";
import { notifyApiError } from "@/lib/api/notify-api-error";

export type CheckoutQuote = {
  title: string;
  base_amount: number;
  discount_amount: number;
  final_amount: number;
  /** Added on top of the discounted price — already inside final_amount. */
  vat_amount: number;
  vat_rate: number;
  coupon_applied: boolean;
  coupon_invalid: boolean;
  installment_count: number | null;
};

/**
 * Prices the selected purchase server-side, so the confirmation step shows the
 * amount the bank will actually charge instead of a figure the page guessed.
 */
export const useCheckoutQuote = (
  selector: PurchaseSelector,
  enabled: boolean,
  /** Extra pricing inputs a selector alone cannot carry, e.g. group seats. */
  extras?: Record<string, string | number>,
) => {
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const key = JSON.stringify({ ...selector, ...extras });

  const load = useCallback(
    async (couponCode?: string) => {
      setLoading(true);
      try {
        const response = await fetch("/api/payment/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(JSON.parse(key) as Record<string, unknown>),
            ...(couponCode && { coupon_code: couponCode }),
          }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          setQuote(null);
          // Legacy BFF `{ success, error }` still appears until every pod rolls.
          const legacyError =
            data &&
            typeof data === "object" &&
            typeof (data as { error?: unknown }).error === "string"
              ? {
                  status: response.status,
                  code:
                    typeof (data as { code?: unknown }).code === "string"
                      ? (data as { code: string }).code
                      : `HTTP_${response.status}`,
                  message: (data as { error: string }).error,
                }
              : null;
          notifyApiError(legacyError ?? parseApiError(response.status, data));
          return;
        }
        const quotePayload =
          data?.data ??
          (data?.success ? data.quote : null) ??
          null;
        setQuote(quotePayload ? (quotePayload as CheckoutQuote) : null);
      } catch (error) {
        setQuote(null);
        notifyApiError(error);
      } finally {
        setLoading(false);
      }
    },
    [key],
  );

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  return { quote, loading, reprice: load };
};
