"use client";

import { useCallback, useEffect, useState } from "react";

import type { PurchaseSelector } from "@/components/purchase/use-purchase";

export type CheckoutQuote = {
  title: string;
  base_amount: number;
  discount_amount: number;
  final_amount: number;
  /** Already inside final_amount — never added on top. */
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
        setQuote(data?.success ? (data.quote as CheckoutQuote) : null);
      } catch {
        setQuote(null);
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
