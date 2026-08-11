"use client";

import { ChangePasswordForm } from "@/components/account/change-password-form";
import { useTranslation } from "@/lib/i18n/hooks";

export function ProfileSecurityCard({ profileId }: { profileId: string }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-theme bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-(--theme-foreground)">
        {t("account.changePassword")}
      </h3>
      <ChangePasswordForm profileId={profileId} />
    </div>
  );
}
