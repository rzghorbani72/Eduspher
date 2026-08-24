import { formatCurrency } from "@/lib/utils";

export type PublicActiveDiscount = {
  code: string;
  coupon_type: "PERCENT" | "FIXED" | "FREE_TRIAL" | "FULL_DISCOUNT";
  discount_value: number;
  free_trial_days: number | null;
  end_date: string;
};

type DiscountLabelParams = {
  percentOff: (percent: number) => string;
  fixedOff: (amount: string) => string;
  fullOff: () => string;
  freeTrial: (days: number) => string;
};

export function formatActiveDiscountOffer(
  discount: PublicActiveDiscount,
  labels: DiscountLabelParams,
  options?: { currencyCode?: string; language?: string },
): string {
  const currencyCode = options?.currencyCode ?? "IRR";
  const language = options?.language;

  switch (discount.coupon_type) {
    case "FULL_DISCOUNT":
      return labels.fullOff();
    case "FREE_TRIAL":
      return labels.freeTrial(discount.free_trial_days ?? 0);
    case "FIXED":
      return labels.fixedOff(
        formatCurrency(discount.discount_value, {
          currency: currencyCode,
          language,
        }),
      );
    default:
      return labels.percentOff(discount.discount_value);
  }
}

export function formatActiveDiscountSummary(
  discounts: PublicActiveDiscount[],
  labels: DiscountLabelParams & {
    bannerSingle: (code: string, offer: string) => string;
    bannerMultiple: (codes: string) => string;
  },
  options?: { currencyCode?: string; language?: string },
): string {
  if (discounts.length === 0) return "";

  if (discounts.length === 1) {
    const discount = discounts[0];
    const offer = formatActiveDiscountOffer(discount, labels, options);
    return labels.bannerSingle(discount.code, offer);
  }

  const codes = discounts
    .map((discount) => {
      const offer = formatActiveDiscountOffer(discount, labels, options);
      return `${discount.code} (${offer})`;
    })
    .join(" · ");

  return labels.bannerMultiple(codes);
}
