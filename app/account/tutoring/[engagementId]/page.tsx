import { UserRoundCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { LiveRoomShell } from "@/components/live/live-room-shell";
import { getTutoringEngagementRoom } from "@/lib/api/account-server";
import { getSession } from "@/lib/auth/session";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";

/** The 1:1 classroom. The backend decides membership on every request. */
export default async function PrivateTutoringRoomPage({
  params,
}: {
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const academyContext = await getAcademyContext();

  const [room, academy, session] = await Promise.all([
    getTutoringEngagementRoom(engagementId),
    academyContext.slug
      ? getAcademyBySlug(academyContext.slug).catch(() => null)
      : null,
    getSession(),
  ]);

  if (!room) return notFound();

  const language = getAcademyLanguage(
    academy?.language ?? null,
    academy?.country_code ?? null,
  );

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={room.title}
        description={
          room.Tutor?.display_name ?? t("account.privateTutoring", language)
        }
        icon={UserRoundCheck}
      />
      <LiveRoomShell room={room} currentProfileId={session?.profileId ?? ""} />
    </div>
  );
}
