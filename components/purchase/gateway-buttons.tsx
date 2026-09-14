'use client';

import { Loader2 } from 'lucide-react';

import type { PurchaseGateway } from '@/components/purchase/use-purchase';
import { gatewayLabel } from '@/lib/account-labels';
import { useTranslation } from '@/lib/i18n/hooks';

interface GatewayButtonsProps {
  gateways: PurchaseGateway[];
  busy: boolean;
  disabled: boolean;
  payingProvider: string | null;
  onPick: (provider: string) => void;
}

/** One button per bank when the buyer must choose which rail to pay through. */
export function GatewayButtons({
  gateways,
  busy,
  disabled,
  payingProvider,
  onPick,
}: GatewayButtonsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-(--theme-foreground)">{t('checkout.chooseGateway')}</p>
      {gateways.map((gateway) => {
        const label = gatewayLabel(gateway.provider, t);
        const showLabel =
          label.toUpperCase() === gateway.provider.toUpperCase() ? gateway.display_name : label;
        return (
          <button
            key={gateway.provider}
            type="button"
            disabled={busy || disabled}
            onClick={() => onPick(gateway.provider)}
            className="border-theme hover:bg-surface flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-start text-sm font-bold text-(--theme-foreground) disabled:opacity-60"
          >
            {busy && payingProvider === gateway.provider && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {showLabel}
          </button>
        );
      })}
    </div>
  );
}
