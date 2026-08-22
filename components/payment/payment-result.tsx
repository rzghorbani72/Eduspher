import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export type PaymentResultRow = { label: string; value: string };

export type PaymentResultAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

interface PaymentResultProps {
  variant: "success" | "failure";
  title: string;
  message: string;
  /** The purchased item, shown big above the amount. */
  itemTitle?: string | null;
  amountLabel?: string | null;
  rows?: PaymentResultRow[];
  actions: PaymentResultAction[];
  footer?: React.ReactNode;
}

/**
 * The single screen a buyer lands on when the bank sends them back — one card,
 * one clear verdict, one next step. Both outcomes share it so a failed payment
 * never looks like a broken page.
 */
export function PaymentResult({
  variant,
  title,
  message,
  itemTitle,
  amountLabel,
  rows = [],
  actions,
  footer,
}: PaymentResultProps) {
  const ok = variant === "success";
  const Icon = ok ? CheckCircle2 : XCircle;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-14">
      <div className="cd-side-card overflow-hidden rounded-3xl border bg-card shadow-xl">
        <div
          className={cn(
            "flex flex-col items-center gap-4 px-6 pt-10 pb-6 text-center",
            ok ? "bg-emerald-500/10" : "bg-red-500/10",
          )}
        >
          <span
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              ok ? "bg-emerald-500/15" : "bg-red-500/15",
            )}
          >
            <Icon
              className={cn("h-9 w-9", ok ? "text-emerald-600" : "text-red-600")}
              aria-hidden
            />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-(--theme-foreground)">
              {title}
            </h1>
            <p className="text-sm text-muted">{message}</p>
          </div>
        </div>

        {(itemTitle || amountLabel) && (
          <div className="space-y-1 border-b border-theme px-6 py-5 text-center">
            {itemTitle && (
              <p className="text-sm font-bold text-(--theme-foreground)">
                {itemTitle}
              </p>
            )}
            {amountLabel && (
              <p className="cd-price text-3xl font-black text-(--theme-foreground)">
                {amountLabel}
              </p>
            )}
          </div>
        )}

        {rows.length > 0 && (
          <dl className="divide-y divide-(--theme-border) px-6">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 py-3.5 text-sm"
              >
                <dt className="text-muted">{row.label}</dt>
                <dd className="text-end font-medium text-(--theme-foreground)">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="space-y-2.5 px-6 py-6">
          {actions.map((action) => (
            <Link
              key={action.href + action.label}
              href={action.href}
              className={cn(
                "flex h-12 w-full items-center justify-center rounded-full text-sm font-bold transition-all",
                action.variant === "secondary"
                  ? "border border-theme text-(--theme-foreground) hover:bg-surface"
                  : "cd-cta-btn text-white hover:-translate-y-0.5",
              )}
            >
              {action.label}
            </Link>
          ))}
          {footer && (
            <div className="pt-2 text-center text-xs text-muted">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}
