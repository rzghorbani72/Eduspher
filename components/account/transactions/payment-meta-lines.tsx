import type { PaymentSummary } from "@/lib/api/account-types";
import { paymentTrackingCode } from "@/lib/payment-display";
import { cn } from "@/lib/utils";

type Translate = (key: string) => string;

type Props = {
  payment: PaymentSummary;
  t: Translate;
  money: (value: number) => string;
  /** Compact muted line under a table cell vs full detail rows. */
  variant?: "inline" | "rows";
  className?: string;
};

/**
 * Tracking code, applied voucher, and related payment extras for the student.
 * Only renders fields that exist — empty payments stay clean.
 */
export function PaymentMetaLines({
  payment,
  t,
  money,
  variant = "inline",
  className,
}: Props) {
  const tracking = paymentTrackingCode(payment);
  const voucher = payment.coupon_code?.trim() || null;
  const discount =
    payment.discount_amount != null && payment.discount_amount > 0
      ? payment.discount_amount
      : null;
  const orderNumber = payment.Order?.order_number?.trim() || null;
  const checkoutRef = payment.checkout_reference?.trim() || null;

  const entries: { label: string; value: string; mono?: boolean }[] = [];
  if (tracking) {
    entries.push({
      label: t("account.trackingCode"),
      value: tracking,
      mono: true,
    });
  }
  if (voucher) {
    entries.push({
      label: t("account.voucherApplied"),
      value: voucher,
      mono: true,
    });
  }
  if (discount != null) {
    entries.push({
      label: t("checkout.discount"),
      value: money(discount),
    });
  }
  if (orderNumber) {
    entries.push({
      label: t("account.orderNumber"),
      value: orderNumber,
      mono: true,
    });
  }
  if (checkoutRef && checkoutRef !== tracking && checkoutRef !== orderNumber) {
    entries.push({
      label: t("account.paymentReference"),
      value: checkoutRef,
      mono: true,
    });
  }

  if (entries.length === 0) return null;

  if (variant === "rows") {
    return (
      <dl className={cn("grid gap-3 sm:grid-cols-2", className)}>
        {entries.map((entry) => (
          <div
            key={entry.label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <dt className="text-muted">{entry.label}</dt>
            <dd
              className={cn(
                "font-medium text-(--theme-foreground)",
                entry.mono && "font-mono text-xs tracking-wide",
              )}
              dir="ltr"
            >
              {entry.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <ul className={cn("mt-1 space-y-0.5 text-xs text-muted", className)}>
      {entries.map((entry) => (
        <li key={entry.label} className="truncate">
          <span>{entry.label}: </span>
          <span
            className={cn(
              "text-(--theme-foreground)",
              entry.mono && "font-mono tracking-wide",
            )}
            dir="ltr"
          >
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
