import type { PaymentReceipt } from "@/lib/api/account-types";
import type { LanguageCode } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/server-translations";
import {
  formatCurrencyWithAcademy,
  formatDate,
  toPersianDigits,
} from "@/lib/utils";

interface PaymentReceiptCardProps {
  receipt: PaymentReceipt;
  language: LanguageCode;
  academy: Parameters<typeof formatCurrencyWithAcademy>[1];
}

/**
 * The legal receipt: the academy is the seller and the platform only collects on
 * its behalf, so both identities are printed side by side rather than merged.
 */
export function PaymentReceiptCard({
  receipt,
  language,
  academy,
}: PaymentReceiptCardProps) {
  const translate = (key: string) => t(key, language);
  const money = (value: number) =>
    toPersianDigits(formatCurrencyWithAcademy(value, academy), language);

  return (
    <section className="space-y-4 rounded-2xl border border-theme bg-card p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-theme pb-3">
        <h2 className="text-base font-semibold text-(--theme-foreground)">
          {translate("account.receipt")}
        </h2>
        <p className="text-sm text-muted">
          {translate("account.receiptNumber")}:{" "}
          <span className="font-mono">{receipt.invoice_number}</span>
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Party title={translate("account.seller")} name={receipt.seller.name} />
        <Party
          title={translate("account.collectingAgent")}
          name={receipt.collecting_agent.name}
        />
      </div>

      <dl className="space-y-2 border-t border-theme pt-3 text-sm">
        <Row
          label={translate("account.buyer")}
          value={receipt.buyer.name ?? "—"}
        />
        <Row
          label={translate("account.transactionItem")}
          value={receipt.item ?? "—"}
        />
        <Row
          label={translate("account.transactionDate")}
          value={formatDate(receipt.issued_at, language, true)}
        />
        {receipt.amounts.discount > 0 ? (
          <Row
            label={translate("checkout.discount")}
            value={money(receipt.amounts.discount)}
          />
        ) : null}
        {receipt.amounts.vat_amount > 0 ? (
          <Row label="VAT" value={money(receipt.amounts.vat_amount)} />
        ) : null}
        <Row
          label={translate("account.transactionAmount")}
          value={money(receipt.amounts.gross)}
          emphasis
        />
        {receipt.amounts.refunded > 0 ? (
          <Row
            label={translate("account.statusRefunded")}
            value={money(receipt.amounts.refunded)}
          />
        ) : null}
      </dl>
    </section>
  );
}

function Party({ title, name }: { title: string; name: string | null }) {
  return (
    <div className="rounded-xl border border-theme p-3">
      <p className="text-xs text-muted">{title}</p>
      <p className="mt-0.5 font-medium text-(--theme-foreground)">
        {name ?? "—"}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd
        className={
          emphasis
            ? "text-base font-bold text-(--theme-primary-ink)"
            : "font-medium text-(--theme-foreground)"
        }
      >
        {value}
      </dd>
    </div>
  );
}
