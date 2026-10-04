'use client';

import { useState } from 'react';

import { ClassAssignments } from '@/components/live/class-assignments';
import { ClassSyllabus } from '@/components/live/class-syllabus';
import { InviteFriendsCard } from '@/components/live/invite-friends-card';
import { LiveRoomTabs, type LiveTabKey } from '@/components/live/live-room-tabs';
import { MeetLinkBar } from '@/components/live/meet-link-bar';
import { BackupLinkHint } from '@/components/live/backup-link-hint';
import { MeetingRoom } from '@/components/live/meeting-room';
import { PrivateScheduleRequest } from '@/components/live/private-schedule-request';
import { SessionAfterClass } from '@/components/live/session-after-class';
import { SessionList } from '@/components/live/session-list';
import { TheaterToggle } from '@/components/learning/theater-toggle';
import { useAcademyContext } from '@/components/providers/store-provider';
import type { TutoringGroupRoom } from '@/lib/api/account-types';
import { useNow } from '@/lib/hooks/use-now';
import { useTheaterMode } from '@/lib/hooks/use-theater-mode';
import { useTranslation } from '@/lib/i18n/hooks';
import { isJitsiMeetUrl, withMeetAppName } from '@/lib/live/embeddable';
import { pickPlaySession, sessionName, sessionState } from '@/lib/live/session-state';
import { cn, formatNumber } from '@/lib/utils';

interface LiveRoomShellProps {
  room: TutoringGroupRoom;
  currentProfileId: string;
  invitePath: string | null;
  courseHref: string;
  /** Optional display name for Mentoma Meet (JWT still carries the stable id). */
  displayName?: string | null;
}

const resolveSessionId = (
  room: TutoringGroupRoom,
  timetable: TutoringGroupRoom['sessions'],
  manualId: string | null,
): string | null => {
  // Explicit rail pick always wins — student may be reviewing a held session.
  if (manualId && timetable.some((session) => session.id === manualId)) {
    return manualId;
  }
  const liveId = timetable.find((session) => session.link_open)?.id ?? null;
  return (
    pickPlaySession(timetable, Date.now())?.id ??
    room.next_session?.id ??
    timetable[0]?.id ??
    liveId ??
    null
  );
};

const defaultTabFor = (state: ReturnType<typeof sessionState> | null): LiveTabKey =>
  state === 'held' ? 'afterClass' : 'sessions';

/**
 * The classroom. Deliberately shaped like the recorded course's learn page —
 * the meeting takes the player's place, the timetable takes the curriculum's.
 * Theater mode collapses the rail so the stage goes full width.
 */
export function LiveRoomShell({
  room,
  currentProfileId,
  invitePath,
  courseHref,
  displayName = null,
}: LiveRoomShellProps) {
  const { t, language } = useTranslation();
  const { name: academyName } = useAcademyContext();
  const { theater } = useTheaterMode();
  const now = useNow();
  const [tabBySession, setTabBySession] = useState<Record<string, LiveTabKey>>({});
  const timetable = room.sessions.length ? room.sessions : room.planned_sessions;
  const [manualId, setManualId] = useState<string | null>(null);
  const selectedId = resolveSessionId(room, timetable, manualId);
  const selected = timetable.find((session) => session.id === selectedId) ?? null;
  const isPlanned = selected ? selected.id.startsWith('planned-') : false;
  const realSelectedId = selected && !isPlanned ? selected.id : null;
  const heading = selected ? sessionName(selected, room.title) : room.title;
  const awaitingSchedule = room.capacity === 1 && timetable.length === 0;
  const selectedState = selected ? sessionState(selected, now) : null;
  const tabKey = selectedId ?? '__none';
  const tab = tabBySession[tabKey] ?? defaultTabFor(selectedState);
  const setTab = (next: LiveTabKey) => {
    setTabBySession((prev) => ({ ...prev, [tabKey]: next }));
  };
  const brandedMeetUrl = selected?.meeting_url
    ? withMeetAppName(selected.meeting_url, academyName, language)
    : null;

  return (
    <div
      className={cn(
        'grid items-start gap-6',
        theater ? 'grid-cols-1' : 'lg:grid-cols-[minmax(0,1fr)_320px]',
      )}
      data-theater={theater ? 'on' : 'off'}
    >
      <main className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {room.is_tutor && selectedState === 'upcoming' ? (
            <span className="rounded-full bg-(--theme-primary)/10 px-2.5 py-1 text-[11px] font-bold text-(--theme-primary)">
              {t('live.earlyJoinStaff')}
            </span>
          ) : null}
          {selectedState === 'live' ? (
            <span className="rounded-full bg-(--theme-primary) px-2.5 py-1 text-[11px] font-bold text-(--theme-on-primary)">
              {t('live.liveNow')}
            </span>
          ) : null}
          <TheaterToggle compact />
        </div>

        {awaitingSchedule ? (
          <PrivateScheduleRequest room={room} courseHref={courseHref} />
        ) : (
          <div className="space-y-3">
            <MeetingRoom
              session={selected}
              title={heading}
              staffJoin={room.is_tutor}
              displayName={displayName}
              onGoAfterClass={() => setTab('afterClass')}
            />
            {brandedMeetUrl &&
            (room.is_tutor || (selectedState === 'live' && !isJitsiMeetUrl(brandedMeetUrl))) ? (
              <MeetLinkBar meetingUrl={brandedMeetUrl} />
            ) : null}
            {room.backup_meeting_url ? <BackupLinkHint url={room.backup_meeting_url} /> : null}
          </div>
        )}

        <div className="border-theme bg-card rounded-2xl border">
          <LiveRoomTabs value={tab} onChange={setTab} />
          <div className="p-5">
            {tab === 'homework' ? (
              <ClassAssignments
                assignments={room.assignments}
                sessions={room.sessions}
                selectedSessionId={realSelectedId}
                currentProfileId={currentProfileId}
              />
            ) : null}
            {tab === 'afterClass' ? (
              <SessionAfterClass
                session={isPlanned ? null : selected}
                sessions={room.sessions}
                fallbackTitle={room.title}
                onSelect={setManualId}
              />
            ) : null}
            {tab === 'syllabus' ? (
              <ClassSyllabus topics={room.topics} sessions={room.sessions} />
            ) : null}
            {tab === 'sessions' ? (
              <SessionList
                sessions={timetable}
                selectedId={selectedId}
                onSelect={setManualId}
                detailed
              />
            ) : null}
          </div>
        </div>
      </main>

      <aside
        className={cn(
          'border-theme bg-card rounded-2xl border p-3 lg:sticky lg:top-24',
          theater && 'hidden',
        )}
        data-testid="live-session-rail"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <h2 className="font-semibold">{t('live.timetable')}</h2>
          <span className="text-muted text-xs">
            {room.capacity > 1
              ? `${formatNumber(room.seats_taken, language)}/${formatNumber(room.capacity, language)}`
              : t('live.sessionsCount').replace(
                  '{count}',
                  formatNumber(timetable.length, language),
                )}
          </span>
        </div>
        <SessionList sessions={timetable} selectedId={selectedId} onSelect={setManualId} />
        {invitePath && !room.is_tutor ? (
          <div className="mt-3">
            <InviteFriendsCard invitePath={invitePath} seatsLeft={room.seats_left} />
          </div>
        ) : null}
      </aside>
    </div>
  );
}
