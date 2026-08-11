"use client";

import { GraduationCap, Lock } from "lucide-react";

import { useTranslation } from "@/lib/i18n/hooks";
import { usePurchase } from "@/components/purchase/use-purchase";
import { formatCurrencyWithAcademy, toPersianDigits, cn } from "@/lib/utils";
import type { PublicTutoringOffer } from "@/lib/api/server";

interface CurrencyConfig {
  currency?: string;
  currency_symbol?: string;
  currency_position?: "before" | "after";
  country_code?: string;
  language?: string;
}

interface TutoringOfferCardProps {
  offers: PublicTutoringOffer[];
  language: string;
  currencyConfig: CurrencyConfig | null;
  loginHref: string;
}

export function TutoringOfferCard({
  offers,
  language,
  currencyConfig,
  loginHref,
}: TutoringOfferCardProps) {
  const { t } = useTranslation();
  const { purchase, pendingKey, error } = usePurchase({ loginHref });

  if (offers.length === 0) return null;

  const fmt = (amount: number) =>
    toPersianDigits(
      formatCurrencyWithAcademy(Math.round(amount), currencyConfig, undefined, language),
      language,
    );

  const subscribe = (offer: PublicTutoringOffer) =>
    purchase({ tutoring_offer_id: offer.id }, offer.price, offer.id);

  return (
    <div className="cd-side-card mt-4 overflow-hidden rounded-2xl border shadow-2xl">
      <div className="flex items-center justify-end gap-2 px-6 pt-6 pb-2 text-right">
        <div>
          <h2 className="text-lg font-black text-(--theme-foreground)">
            {t("courses.tutoringTitle")}
          </h2>
          <p className="mt-1 text-[13px] text-(--theme-muted)">
            {t("courses.tutoringHint")}
          </p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-(--theme-primary) text-white">
          <GraduationCap className="h-[18px] w-[18px]" />
        </span>
      </div>

      <div className="space-y-2.5 px-4 py-3">
        {offers.map((offer) => (
          <div key={offer.id} className={cn("rounded-xl border p-3.5 text-right", "cd-method")}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="cd-price text-xl font-black text-(--theme-foreground)">
                {fmt(offer.price)}
              </span>
              <span className="text-[15px] font-extrabold text-(--theme-foreground)">
                {offer.title}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-end gap-x-2 text-xs text-(--theme-muted)">
              {offer.duration_days ? (
                <span>
                  {toPersianDigits(String(offer.duration_days), language)}{" "}
                  {t("courses.tutoringDaysUnit")}
                </span>
              ) : null}
              {offer.Tutor?.display_name ? (
                <span>· {offer.Tutor.display_name}</span>
              ) : null}
            </div>
            {offer.description ? (
              <p className="mt-1 text-xs text-(--theme-muted)">{offer.description}</p>
            ) : null}
            <button
              type="button"
              disabled={pendingKey === offer.id}
              onClick={() => void subscribe(offer)}
              className="cd-cta-btn mt-3 flex h-11 w-full items-center justify-center rounded-full text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
            >
              {pendingKey === offer.id ? t("common.loading") : t("courses.ctaSubscribe")}
            </button>
          </div>
        ))}
        {error && <p className="text-center text-xs text-red-600">{error}</p>}
        <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-(--theme-muted)">
          <Lock className="h-3.5 w-3.5" />
          {t("courses.securePaymentNote")}
        </p>
      </div>
    </div>
  );
}
