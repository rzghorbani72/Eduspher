'use client';

import { useState } from 'react';

import { ClassAssignments } from '@/components/live/class-assignments';
import { ClassChat } from '@/components/live/class-chat';
import { ClassSyllabus } from '@/components/live/class-syllabus';
import { InviteFriendsCard } from '@/components/live/invite-friends-card';
import { LiveRoomTabs, type LiveTabKey } from '@/components/live/live-room-tabs';
import { MeetingRoom } from '@/components/live/meeting-room';
import { PrivateScheduleRequest } from '@/components/live/private-schedule-request';
import { SessionAfterClass } from '@/components/live/session-after-class';
import { SessionList } from '@/components/live/session-list';
import type { TutoringGroupRoom } from '@/lib/api/account-types';
import { useTranslation } from '@/lib/i18n/hooks';
import { pickPlaySession, sessionName } from '@/lib/live/session-state';
import { formatNumber } from '@/lib/utils';

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
  const liveId = timetable.find((session) => session.link_open)?.id ?? null;
  const preferred =
    manualId ??
    pickPlaySession(timetable, Date.now())?.id ??
    room.next_session?.id ??
    timetable[0]?.id ??
    null;
  // Soft refresh can leave a stale pick; prefer the open class when the pick is not open.
  if (liveId && !timetable.some((session) => session.id === preferred && session.link_open)) {
    return liveId;
  }
  return preferred ?? liveId;
};

/**
 * The classroom. Deliberately shaped like the recorded course's learn page —
 * the meeting takes the player's place, the timetable takes the curriculum's.
 * Everything below the stage is about the meeting picked in the timetable:
 * its chat, its homework, what it left behind.
 */
export function LiveRoomShell({
  room,
  currentProfileId,
  invitePath,
  courseHref,
  displayName = null,
}: LiveRoomShellProps) {
  const { t, language } = useTranslation();
  const [tab, setTab] = useState<LiveTabKey>('chat');
  const timetable = room.sessions.length ? room.sessions : room.planned_sessions;
  const [manualId, setManualId] = useState<string | null>(null);
  const selectedId = resolveSessionId(room, timetable, manualId);
  const selected = timetable.find((session) => session.id === selectedId) ?? null;
  const isPlanned = selected ? selected.id.startsWith('planned-') : false;
  const realSelectedId = selected && !isPlanned ? selected.id : null;
  const heading = selected ? sessionName(selected, room.title) : room.title;
  const awaitingSchedule = room.capacity === 1 && timetable.length === 0;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <main className="min-w-0 space-y-6">
        {awaitingSchedule ? (
          <PrivateScheduleRequest
            room={room}
            courseHref={courseHref}
            onOpenChat={() => setTab('chat')}
          />
        ) : (
          <MeetingRoom
            session={selected}
            title={heading}
            staffJoin={room.is_tutor}
            displayName={displayName}
            onGoAfterClass={() => setTab('afterClass')}
          />
        )}

        <div className="border-theme bg-card rounded-2xl border">
          <LiveRoomTabs value={tab} onChange={setTab} />
          <div className="p-5">
            {tab === 'chat' ? (
              <ClassChat
                sessionId={realSelectedId}
                groupThreadParent={room.group_thread_parent}
                privateThreadParent={room.private_thread_parent}
                currentProfileId={currentProfileId}
              />
            ) : null}
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

      <aside className="border-theme bg-card rounded-2xl border p-3 lg:sticky lg:top-24">
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
