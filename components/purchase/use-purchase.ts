"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { parseApiError } from "@/lib/api/api-error";
import { notifyApiError } from "@/lib/api/notify-api-error";
import { useTranslation } from "@/lib/i18n/hooks";
import { logger } from "@/lib/logging/app-logger";
import { track } from "@/lib/analytics/analytics";

/** Exactly one of these identifies what is being bought. */
export type PurchaseSelector =
  | { course_id: string }
  | { offer_id: string }
  | { academy_plan_id: string }
  | { tutoring_offer_id: string }
  | { tutoring_group_id: string }
  | { payment_plan_id: string };

export type PurchaseGateway = { provider: string; display_name: string };

/** How a purchase attempt ended, so a dialog knows whether to close. */
export type PurchaseOutcome = { ok: boolean; needsGateway: boolean };

type PurchaseOptions = {
  /** Where to send a signed-out visitor; they return here after logging in. */
  loginHref: string;
};

type PayOptions = {
  couponCode?: string;
  provider?: string;
  /** Group class only: seats to book at once, and a private class share code. */
  seats?: number;
  joinCode?: string;
};

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
    ): Promise<PurchaseOutcome> => {
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
            ...(options?.seats && options.seats > 1 && { seats: options.seats }),
            ...(options?.joinCode && { join_code: options.joinCode }),
          }),
        });

        const data = await response.json().catch(() => null);
        const payload =
          data && typeof data === "object" && "data" in data
            ? (data.data as Record<string, unknown> | null)
            : null;

        if (!response.ok) {
          logger.error("Payments", "CheckoutStartFailed", {
            kind,
            amount,
            http_status: response.status,
          });
          const parsed = parseApiError(response.status, data);
          const ux = notifyApiError(parsed, { loginHref });
          if (ux !== "login_required") {
            setError(parsed.message || t("checkout.paymentFailed"));
          }
          return { ok: false, needsGateway: false };
        }

        const availableGateways = Array.isArray(payload?.available_gateways)
          ? (payload.available_gateways as PurchaseGateway[])
          : [];
        if (payload?.needs_gateway_selection && availableGateways.length > 0) {
          setGateways(availableGateways);
          logger.ok("Payments", "CheckoutGatewayPrompted", {
            kind,
            amount,
            gateway_count: availableGateways.length,
          });
          return { ok: false, needsGateway: true };
        }

        const redirectUrl =
          typeof payload?.redirect_url === "string" ? payload.redirect_url : null;

        logger.ok("Payments", "CheckoutStarted", {
          kind,
          amount,
          gateway_redirect: Boolean(redirectUrl),
        });
        track("StudentCheckoutStarted", { kind, amount_toman: amount });

        if (redirectUrl) {
          window.location.assign(redirectUrl);
          return { ok: true, needsGateway: false };
        }

        toast.success(t("checkout.paymentSuccess"));
        router.refresh();
        return { ok: true, needsGateway: false };
      } catch (error) {
        logger.error("Payments", "CheckoutStartFailed", {
          kind,
          amount,
          http_status: 0,
        });
        notifyApiError(error);
        setError(t("checkout.paymentFailed"));
        return { ok: false, needsGateway: false };
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
