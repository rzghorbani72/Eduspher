import { CalendarClock } from "lucide-react";
import { notFound } from "next/navigation";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { LiveRoomShell } from "@/components/live/live-room-shell";
import { getTutoringGroupRoom } from "@/lib/api/account-server";
import { getSession } from "@/lib/auth/session";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";
import { coursePath } from "@/lib/content-paths";
import { buildAcademyPath, formatNumber } from "@/lib/utils";

/**
 * The class page only a member sees. Membership is decided by the backend on
 * every request — a non-member gets nothing here, not a hidden button.
 */
export default async function GroupClassPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const academyContext = await getAcademyContext();

  const [room, academy, session] = await Promise.all([
    getTutoringGroupRoom(groupId),
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
  const translate = (key: string) => t(key, language);
  const waiting = room.status === "WAITING";
  const currentProfileId = session?.profileId ?? "";

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={room.title}
        description={
          room.Tutor?.display_name ?? translate("account.groupClasses")
        }
        icon={CalendarClock}
      />

      {waiting ? (
        <p className="rounded-xl border border-theme bg-card p-4 text-sm text-muted">
          {translate("account.groupWaitingExplain")}{" "}
          {formatNumber(
            Math.max(room.min_students - room.seats_taken, 0),
            language,
          )}
        </p>
      ) : null}

      <LiveRoomShell
        room={room}
        currentProfileId={currentProfileId}
        courseHref={buildAcademyPath(
          academyContext.isSubdomain ? null : academyContext.slug,
          coursePath(room.course_id),
        )}
        invitePath={
          room.invite_code
            ? buildAcademyPath(
                academyContext.isSubdomain ? null : academyContext.slug,
                `/classes/join/${room.invite_code}`,
              )
            : null
        }
      />
    </div>
  );
}
