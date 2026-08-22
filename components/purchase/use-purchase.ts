"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/lib/i18n/hooks";
import { logger } from "@/lib/logging/app-logger";

/** Exactly one of these identifies what is being bought. */
export type PurchaseSelector =
  | { course_id: string }
  | { offer_id: string }
  | { academy_plan_id: string }
  | { tutoring_offer_id: string }
  | { payment_plan_id: string };

export type PurchaseGateway = { provider: string; display_name: string };

type PurchaseOptions = {
  /** Where to send a signed-out visitor; they return here after logging in. */
  loginHref: string;
};

type PayOptions = { couponCode?: string; provider?: string };

/**
 * The one place the storefront starts a purchase, so every buying path — course,
 * offer, plan, bundle, tutoring, installments — behaves identically: signed-out
 * goes to login, a gateway purchase redirects to the bank, and a free or
 * already-covered purchase just refreshes into the granted access.
 *
 * When the academy runs several gateways the backend answers with the list
 * instead of a redirect; the caller shows it and pays again with a provider.
 */
export const usePurchase = ({ loginHref }: PurchaseOptions) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gateways, setGateways] = useState<PurchaseGateway[]>([]);

  const purchase = useCallback(
    async (
      selector: PurchaseSelector,
      amount: number,
      key: string,
      options?: PayOptions,
    ) => {
      setPendingKey(key);
      setError(null);
      // One chart for every buying path; `kind` keeps them separable.
      const kind = Object.keys(selector)[0];
      try {
        const response = await fetch("/api/payment/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...selector,
            amount,
            ...(options?.provider && { provider: options.provider }),
            ...(options?.couponCode && { coupon_code: options.couponCode }),
          }),
        });

        if (response.status === 401) {
          window.location.assign(loginHref);
          return;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success) {
          logger.error("payments", "checkout_start_failed", {
            kind,
            amount,
            http_status: response.status,
          });
          setError(data?.error ?? t("checkout.paymentFailed"));
          return;
        }

        if (Array.isArray(data.gateways) && data.gateways.length > 0) {
          setGateways(data.gateways as PurchaseGateway[]);
          logger.ok("payments", "checkout_gateway_prompted", {
            kind,
            amount,
            gateway_count: data.gateways.length,
          });
          return;
        }

        logger.ok("payments", "checkout_started", {
          kind,
          amount,
          gateway_redirect: Boolean(data.redirect_url),
        });

        if (data.redirect_url) {
          window.location.assign(data.redirect_url);
          return;
        }

        router.refresh();
      } catch {
        logger.error("payments", "checkout_start_failed", { kind, amount, http_status: 0 });
        setError(t("checkout.paymentFailed"));
      } finally {
        setPendingKey(null);
      }
    },
    [loginHref, router, t],
  );

  const reset = useCallback(() => {
    setGateways([]);
    setError(null);
  }, []);

  return { purchase, pendingKey, error, gateways, reset };
};
