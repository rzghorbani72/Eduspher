"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/hooks";
import { logger } from "@/lib/logging/app-logger";

/**
 * Buying a subscription goes through `POST /payments/checkout` with an
 * `academy_plan_id`; `POST /academy-plans/:id/subscribe` is manager-only.
 * The server recomputes the price from the plan, so nothing here is trusted.
 */
export function SubscribeButton({ planId, amount }: { planId: string; amount: number }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/payment/plan/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academy_plan_id: planId, amount }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.redirect_url) {
        throw new Error(payload.error ?? t("payment.initiateFailed"));
      }
      logger.ok("payments", "subscription_checkout_started", { plan_id: planId });
      window.location.href = payload.redirect_url;
    } catch (err) {
      logger.error("payments", "subscription_checkout_failed", { plan_id: planId });
      setError(err instanceof Error ? err.message : t("common.error"));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" onClick={handleSubscribe} disabled={busy} className="w-full">
        {busy ? <Loader2 className="me-2 size-4 animate-spin" /> : null}
        {t("account.subscribe")}
      </Button>
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
