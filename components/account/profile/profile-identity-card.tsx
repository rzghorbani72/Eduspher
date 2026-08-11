"use client";

import { BadgeCheck, ShieldAlert } from "lucide-react";

import { AddContactForm } from "@/components/account/add-contact-form";
import { EditDisplayNameForm } from "@/components/account/edit-display-name-form";
import { useTranslation } from "@/lib/i18n/hooks";

interface ProfileIdentityCardProps {
  profileId: string;
  displayName: string;
  email: string | null;
  phoneNumber: string | null;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  primaryMethod: "phone" | "email";
  secondaryMethod: "phone" | "email";
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

  return (
    <div className="space-y-5 rounded-xl border border-theme bg-card p-5 shadow-sm">
      <div>
        <h3 className="mb-4 text-base font-semibold text-(--theme-foreground)">
          {t("account.identity")}
        </h3>
        <EditDisplayNameForm profileId={profileId} currentDisplayName={displayName} />
      </div>

      <dl className="space-y-2 text-sm">
        <ContactRow
          label={t("account.email")}
          value={email}
          confirmed={emailConfirmed}
          confirmedLabel={t("account.verified")}
          unconfirmedLabel={t("account.notVerified")}
        />
        <ContactRow
          label={t("account.phone")}
          value={phoneNumber}
          confirmed={phoneConfirmed}
          confirmedLabel={t("account.verified")}
          unconfirmedLabel={t("account.notVerified")}
        />
      </dl>

      {needsSecondaryMethod ? (
        <div className="border-t border-theme pt-4">
          <h4 className="mb-3 text-sm font-semibold text-(--theme-foreground)">
            {secondaryMethod === "email"
              ? t("account.addEmail")
              : t("account.addPhoneNumber")}
          </h4>
          <AddContactForm
            method={secondaryMethod}
            primaryMethod={primaryMethod}
            defaultCountryCode={defaultCountryCode}
          />
        </div>
      ) : null}
    </div>
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
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="flex items-center gap-2 font-medium text-(--theme-foreground)">
        <span className="break-all">{value}</span>
        {confirmed ? (
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <BadgeCheck className="size-3.5" aria-hidden="true" />
            {confirmedLabel}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
            <ShieldAlert className="size-3.5" aria-hidden="true" />
            {unconfirmedLabel}
          </span>
        )}
      </dd>
    </div>
  );
}
