import { ArrowRight, Receipt } from "lucide-react";
import { notFound } from "next/navigation";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { StatusPill, toneForStatus } from "@/components/account/status-pill";
import { PaymentMetaLines } from "@/components/account/transactions/payment-meta-lines";
import { PaymentReceiptCard } from "@/components/account/transactions/payment-receipt-card";
import { RefundRequestForm } from "@/components/account/transactions/refund-request-form";
import Link from "@/components/ui/link";
import { getPayment, getPaymentReceipt } from "@/lib/api/account-server";
import { gatewayLabel } from "@/lib/account-labels";
import { paymentTrackingCode } from "@/lib/payment-display";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";
import {
  buildAcademyPath,
  formatCurrencyWithAcademy,
  formatDate,
  toPersianDigits,
} from "@/lib/utils";

const STATUS_KEY: Record<string, string> = {
  PAID: "account.statusPaid",
  PENDING: "account.statusPending",
  FAILED: "account.statusFailed",
  CANCELLED: "account.statusCancelled",
  REFUNDED: "account.statusRefunded",
  PARTIALLY_REFUNDED: "account.statusRefunded",
};

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const academyContext = await getAcademyContext();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;

  const [payment, academy] = await Promise.all([
    getPayment(id),
    academyContext.slug
      ? getAcademyBySlug(academyContext.slug).catch(() => null)
      : null,
  ]);

  if (!payment) notFound();

  // Only a completed payment has a receipt to issue.
  const receipt =
    payment.status === "PAID" ? await getPaymentReceipt(id) : null;

  const language = getAcademyLanguage(
    academy?.language ?? null,
    academy?.country_code ?? null,
  );
  const translate = (key: string) => t(key, language);
  const money = (value: number) =>
    toPersianDigits(formatCurrencyWithAcademy(value, academy), language);

  const hasPaymentDetails = Boolean(
    paymentTrackingCode(payment) ||
      payment.coupon_code?.trim() ||
      (payment.discount_amount != null && payment.discount_amount > 0) ||
      payment.Order?.order_number?.trim() ||
      payment.checkout_reference?.trim(),
  );

  return (
    <div className="space-y-6">
      <Link
        href={buildAcademyPath(slugForPaths, "/account/transactions")}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        {translate("account.backToTransactions")}
      </Link>

      <AccountPageHeader
        title={payment.Course?.title ?? translate("account.transactions")}
        icon={Receipt}
        actions={
          <StatusPill
            label={
              STATUS_KEY[payment.status]
                ? translate(STATUS_KEY[payment.status])
                : payment.status
            }
            tone={toneForStatus(payment.status)}
          />
        }
      />

      <section className="rounded-2xl border border-theme bg-card p-5">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Row
            label={translate("account.transactionAmount")}
            value={money(payment.amount)}
          />
          <Row
            label={translate("account.transactionDate")}
            value={formatDate(
              payment.paid_at ?? payment.created_at,
              language,
              true,
            )}
          />
          <Row
            label={translate("account.transactionMethod")}
            value={gatewayLabel(payment.provider ?? payment.gateway, translate)}
          />
          {payment.refund_amount ? (
            <Row
              label={translate("account.statusRefunded")}
              value={money(payment.refund_amount)}
            />
          ) : null}
        </dl>
      </section>

      {hasPaymentDetails ? (
        <section className="rounded-2xl border border-theme bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-(--theme-foreground)">
            {translate("account.paymentDetails")}
          </h2>
          <PaymentMetaLines
            payment={payment}
            t={translate}
            money={money}
            variant="rows"
          />
        </section>
      ) : null}

      {receipt ? (
        <PaymentReceiptCard
          receipt={receipt}
          language={language}
          academy={academy}
        />
      ) : (
        <p className="rounded-2xl border border-dashed border-theme bg-surface p-5 text-sm text-muted">
          {translate("account.receiptUnavailable")}
        </p>
      )}

      {payment.status === "PAID" && !payment.refund_amount ? (
        <RefundRequestForm paymentId={payment.id} />
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-(--theme-foreground)">{value}</dd>
    </div>
  );
}
