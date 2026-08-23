import { CalendarClock } from "lucide-react";
import { notFound } from "next/navigation";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { DataPanel } from "@/components/shared/data-list/data-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { GroupClassJoin } from "@/components/account/group-class-join";
import { GroupClassMessages } from "@/components/account/group-class-messages";
import { getTutoringGroupRoom } from "@/lib/api/account-server";
import { getAcademyBySlug } from "@/lib/api/server";
import { getAcademyLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/server-translations";
import { getAcademyContext } from "@/lib/store-context";
import { formatDate, formatNumber } from "@/lib/utils";
import { weekdayLabelKey } from "@/lib/courses/weekly-rule";

const minutesToTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60,
  ).padStart(2, "0")}`;

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

  const [room, academy] = await Promise.all([
    getTutoringGroupRoom(groupId),
    academyContext.slug
      ? getAcademyBySlug(academyContext.slug).catch(() => null)
      : null,
  ]);

  if (!room) return notFound();

  const language = getAcademyLanguage(
    academy?.language ?? null,
    academy?.country_code ?? null,
  );
  const translate = (key: string) => t(key, language);
  const waiting = room.status === "WAITING";

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

      <DataPanel title={translate("account.groupNextSession")}>
        <div className="p-5">
          {room.next_session ? (
            <GroupClassJoin
              startsAt={room.next_session.starts_at}
              meetingUrl={room.meeting_url}
              language={language}
            />
          ) : (
            <EmptyState
              compact
              title={translate("account.groupNoSessionYet")}
            />
          )}
        </div>
      </DataPanel>

      <DataPanel title={translate("account.groupTimetable")}>
        <ul className="space-y-2 p-5">
          {room.Slots.map((slot, index) => {
            const key = weekdayLabelKey(slot.weekday);
            return (
              <li key={index} className="text-sm">
                {key ? translate(key) : ""}{" "}
                <span dir="ltr">
                  {minutesToTime(slot.start_minute)}–
                  {minutesToTime(slot.start_minute + slot.duration_minutes)}
                </span>
                {slot.Lesson ? (
                  <span className="text-muted"> · {slot.Lesson.title}</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </DataPanel>

      <DataPanel title={translate("account.groupSessions")}>
        {room.sessions.length ? (
          <ul className="divide-y divide-(--theme-hairline)">
            {room.sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <span>{formatDate(session.starts_at, language)}</span>
                <span className="text-muted">
                  {session.Lesson?.title ?? ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState compact title={translate("account.groupNoSessionYet")} />
        )}
      </DataPanel>

      <DataPanel title={translate("account.groupMessages")}>
        <div className="p-5">
          <GroupClassMessages groupId={room.id} />
        </div>
      </DataPanel>
    </div>
  );
}
