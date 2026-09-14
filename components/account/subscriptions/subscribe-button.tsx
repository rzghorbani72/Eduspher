'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { usePurchase } from '@/components/purchase/use-purchase';
import { CheckoutDialog } from '@/components/purchase/checkout-dialog';
import { useTranslation } from '@/lib/i18n/hooks';

/**
 * Buying a subscription goes through `POST /payments/checkout` with an
 * `academy_plan_id`; `POST /academy-plans/:id/subscribe` is manager-only.
 * The server recomputes the price from the plan, so nothing here is trusted.
 */
export function SubscribeButton({
  planId,
  amount,
  loginHref,
}: {
  planId: string;
  amount: number;
  loginHref: string;
}) {
  const { t } = useTranslation();
  const { purchase, pendingKey, error, gateways, reset } = usePurchase({ loginHref });
  const [confirming, setConfirming] = useState(false);
  const busy = pendingKey === planId;

  return (
    <div className="space-y-2">
      <Button type="button" onClick={() => setConfirming(true)} disabled={busy} className="w-full">
        {busy ? <Loader2 className="me-2 size-4 animate-spin" /> : null}
        {t('account.subscribe')}
      </Button>
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {confirming && (
        <CheckoutDialog
          selector={{ academy_plan_id: planId }}
          fallbackAmount={amount}
          fallbackTitle={null}
          gateways={gateways}
          onPay={(couponCode, provider) =>
            purchase({ academy_plan_id: planId }, amount, planId, {
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
