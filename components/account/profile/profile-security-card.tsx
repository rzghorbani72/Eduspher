"use client";

import { LockKeyhole } from "lucide-react";

import { AccountSection } from "@/components/account/account-section";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { useTranslation } from "@/lib/i18n/hooks";

export function ProfileSecurityCard({ profileId }: { profileId: string }) {
  const { t } = useTranslation();

  return (
    <AccountSection title={t("account.changePassword")} icon={LockKeyhole}>
      <div className="max-w-xl">
        <ChangePasswordForm profileId={profileId} />
      </div>
    </AccountSection>
  );
}
