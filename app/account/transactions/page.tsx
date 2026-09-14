import { Receipt } from 'lucide-react';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { StatusPill, toneForStatus } from '@/components/account/status-pill';
import { PaymentMetaLines } from '@/components/account/transactions/payment-meta-lines';
import { DataList, type DataColumn } from '@/components/shared/data-list/data-list';
import { DataPanel } from '@/components/shared/data-list/data-panel';
import { EmptyState } from '@/components/ui/empty-state';
import Link from '@/components/ui/link';
import { getPayments } from '@/lib/api/account-server';
import type { PaymentSummary } from '@/lib/api/account-types';
import { gatewayLabel } from '@/lib/account-labels';
import { getAcademyBySlug } from '@/lib/api/server';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { getAcademyContext } from '@/lib/store-context';
import {
  buildAcademyPath,
  formatCurrencyWithAcademy,
  formatDate,
  toPersianDigits,
} from '@/lib/utils';

const STATUS_KEY: Record<string, string> = {
  PAID: 'account.statusPaid',
  PENDING: 'account.statusPending',
  FAILED: 'account.statusFailed',
  CANCELLED: 'account.statusCancelled',
  REFUNDED: 'account.statusRefunded',
  PARTIALLY_REFUNDED: 'account.statusRefunded',
};

export default async function AccountTransactionsPage() {
  const academyContext = await getAcademyContext();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;

  const [{ payments }, academy] = await Promise.all([
    getPayments(),
    academyContext.slug ? getAcademyBySlug(academyContext.slug).catch(() => null) : null,
  ]);

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);
  const money = (value: number) =>
    toPersianDigits(formatCurrencyWithAcademy(value, academy), language);

  const columns: DataColumn<PaymentSummary>[] = [
    {
      id: 'item',
      header: translate('account.transactionItem'),
      cell: (payment) => (
        <div className="min-w-0">
          <Link
            href={buildAcademyPath(slugForPaths, `/account/transactions/${payment.id}`)}
            className="font-medium hover:underline"
          >
            {payment.Course?.title ?? payment.Order?.order_number ?? translate('account.unknown')}
          </Link>
          <PaymentMetaLines payment={payment} t={translate} money={money} />
        </div>
      ),
    },
    {
      id: 'date',
      header: translate('account.transactionDate'),
      cell: (payment) => formatDate(payment.paid_at ?? payment.created_at, language),
    },
    {
      id: 'method',
      header: translate('account.transactionMethod'),
      cell: (payment) => gatewayLabel(payment.provider ?? payment.gateway, translate),
    },
    {
      id: 'amount',
      header: translate('account.transactionAmount'),
      align: 'end',
      cell: (payment) => (
        <span className="font-semibold text-(--theme-foreground)">{money(payment.amount)}</span>
      ),
    },
    {
      id: 'status',
      header: translate('account.transactionStatus'),
      align: 'end',
      cell: (payment) => (
        <StatusPill
          label={
            STATUS_KEY[payment.status] ? translate(STATUS_KEY[payment.status]) : payment.status
          }
          tone={toneForStatus(payment.status)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={translate('account.transactions')}
        description={translate('account.transactionsDescription')}
        icon={Receipt}
      />
      <DataPanel>
        <DataList
          items={payments}
          columns={columns}
          rowKey={(payment) => payment.id}
          emptyState={
            <EmptyState
              compact
              icon={<Receipt className="size-7" aria-hidden="true" />}
              title={translate('account.noTransactions')}
              description={translate('account.noTransactionsDescription')}
            />
          }
        />
      </DataPanel>
    </div>
  );
}
