'use client';

import { BadgeCheck, ShieldAlert, UserRound } from 'lucide-react';

import { AccountSection } from '@/components/account/account-section';
import { AddContactForm } from '@/components/account/add-contact-form';
import { EditDisplayNameForm } from '@/components/account/edit-display-name-form';
import { StatusPill } from '@/components/account/status-pill';
import { useLocaleFormat } from '@/hooks/use-locale-digits';
import { useTranslation } from '@/lib/i18n/hooks';

interface ProfileIdentityCardProps {
  profileId: string;
  displayName: string;
  email: string | null;
  phoneNumber: string | null;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  primaryMethod: 'phone' | 'email';
  secondaryMethod: 'phone' | 'email';
  needsSecondaryMethod: boolean;
  defaultCountryCode?: string;
}

export function ProfileIdentityCard({
  profileId,
  displayName,
  email,
  phoneNumber,
  emailConfirmed,
  phoneConfirmed,
  primaryMethod,
  secondaryMethod,
  needsSecondaryMethod,
  defaultCountryCode,
}: ProfileIdentityCardProps) {
  const { t } = useTranslation();
  const { phone: formatPhone } = useLocaleFormat();

  return (
    <AccountSection title={t('account.identity')} icon={UserRound}>
      <div className="space-y-5">
        <EditDisplayNameForm profileId={profileId} currentDisplayName={displayName} />

        <dl className="space-y-2">
          <ContactRow
            label={t('account.email')}
            value={email}
            confirmed={emailConfirmed}
            confirmedLabel={t('account.verified')}
            unconfirmedLabel={t('account.notVerified')}
          />
          <ContactRow
            label={t('account.phone')}
            value={phoneNumber ? formatPhone(phoneNumber) : null}
            confirmed={phoneConfirmed}
            confirmedLabel={t('account.verified')}
            unconfirmedLabel={t('account.notVerified')}
          />
        </dl>

        {needsSecondaryMethod ? (
          <div className="border-theme bg-surface/60 rounded-2xl border border-dashed p-4">
            <h3 className="mb-3 text-sm font-semibold text-(--theme-foreground)">
              {secondaryMethod === 'email' ? t('account.addEmail') : t('account.addPhoneNumber')}
            </h3>
            <AddContactForm
              method={secondaryMethod}
              primaryMethod={primaryMethod}
              defaultCountryCode={defaultCountryCode}
            />
          </div>
        ) : null}
      </div>
    </AccountSection>
  );
}

function ContactRow({
  label,
  value,
  confirmed,
  confirmedLabel,
  unconfirmedLabel,
}: {
  label: string;
  value: string | null;
  confirmed: boolean;
  confirmedLabel: string;
  unconfirmedLabel: string;
}) {
  if (!value) return null;
  return (
    <div className="bg-surface flex flex-wrap items-center justify-between gap-3 rounded-xl px-3.5 py-3">
      <dt className="text-muted text-sm">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2 font-medium text-(--theme-foreground)">
        <span className="text-sm break-all" dir="ltr">
          {value}
        </span>
        {confirmed ? (
          <StatusPill
            label={confirmedLabel}
            tone="success"
            icon={<BadgeCheck className="size-3.5" aria-hidden="true" />}
          />
        ) : (
          <StatusPill
            label={unconfirmedLabel}
            tone="warning"
            icon={<ShieldAlert className="size-3.5" aria-hidden="true" />}
          />
        )}
      </dd>
    </div>
  );
}
