import { Bell } from "lucide-react";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { NotificationList } from "@/components/account/notifications/notification-list";
import { getNotifications } from "@/lib/api/account-server";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";

export default async function AccountNotificationsPage() {
  const academyContext = await getAcademyContext();

  const [{ notifications }, academy] = await Promise.all([
    getNotifications(),
    academyContext.slug ? getAcademyBySlug(academyContext.slug).catch(() => null) : null,
  ]);

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={t("notifications.title", language)}
        description={t("notifications.description", language)}
        icon={Bell}
      />
      <NotificationList initialItems={notifications} language={language} />
    </div>
  );
}
