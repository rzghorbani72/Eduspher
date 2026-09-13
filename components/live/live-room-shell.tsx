"use client";

import { useState } from "react";
import {
  CalendarClock,
  ListChecks,
  MessageSquare,
  NotebookPen,
  Users,
  Video,
} from "lucide-react";

import { DiscussionThread } from "@/components/discussion/discussion-thread";
import { MeetingRoom } from "@/components/live/meeting-room";
import { SessionList } from "@/components/live/session-list";
import { ClassAssignments } from "@/components/live/class-assignments";
import { SessionRecordings } from "@/components/live/session-recordings";
import { EmptyState } from "@/components/ui/empty-state";
import type { TutoringGroupRoom } from "@/lib/api/account-types";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn, formatDate } from "@/lib/utils";

type TabKey = "chat" | "homework" | "recordings" | "syllabus" | "sessions";
type ChatMode = "group" | "private";

interface LiveRoomShellProps {
  room: TutoringGroupRoom;
  currentProfileId: string;
}

/**
 * The classroom. Deliberately shaped like the recorded course's learn page —
 * the meeting takes the player's place, the timetable takes the curriculum's —
 * so a student who has taken either kind of course already knows their way.
 */
export function LiveRoomShell({ room, currentProfileId }: LiveRoomShellProps) {
  const { t, language } = useTranslation();
  const [tab, setTab] = useState<TabKey>("chat");
  const [chatMode, setChatMode] = useState<ChatMode>(
    room.group_thread_parent ? "group" : "private",
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    room.next_session?.id ?? room.sessions[0]?.id ?? null,
  );

  const selected =
    room.sessions.find((session) => session.id === selectedId) ??
    room.next_session;
  const heading = selected?.title ?? selected?.Topic?.title ?? room.title;

  const tabs: { key: TabKey; label: string; icon: typeof MessageSquare }[] = [
    { key: "chat", label: t("live.tabChat"), icon: MessageSquare },
    { key: "homework", label: t("live.tabHomework"), icon: NotebookPen },
    { key: "recordings", label: t("live.tabRecordings"), icon: Video },
    { key: "syllabus", label: t("live.tabSyllabus"), icon: ListChecks },
    { key: "sessions", label: t("live.tabSessions"), icon: CalendarClock },
  ];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <main className="min-w-0 space-y-6">
        <MeetingRoom
          meetingUrl={room.meeting_url}
          startsAt={room.next_session?.starts_at ?? null}
          title={heading}
          language={language}
        />

        {selected?.notes ? (
          <p className="whitespace-pre-wrap rounded-xl border border-theme bg-card p-4 text-sm">
            {selected.notes}
          </p>
        ) : null}

        <div className="rounded-2xl border border-theme bg-card">
          <div
            role="tablist"
            className="flex gap-1 overflow-x-auto border-b border-(--theme-hairline) p-2"
          >
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  tab === key
                    ? "bg-(--theme-primary)/10 text-(--theme-primary)"
                    : "text-muted hover:bg-surface",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === "chat" ? (
              <div className="space-y-4">
                {room.group_thread_parent && room.private_thread_parent ? (
                  <div className="flex gap-1">
                    <ChatModeButton
                      active={chatMode === "group"}
                      onClick={() => setChatMode("group")}
                      label={t("live.chatGroup")}
                    />
                    <ChatModeButton
                      active={chatMode === "private"}
                      onClick={() => setChatMode("private")}
                      label={t("live.chatPrivate")}
                    />
                  </div>
                ) : null}
                {chatMode === "group" && room.group_thread_parent ? (
                  <DiscussionThread
                    key="group"
                    groupId={room.group_thread_parent}
                    currentProfileId={currentProfileId}
                    title={t("live.chatGroup")}
                    placeholder={t("live.chatGroupPlaceholder")}
                  />
                ) : (
                  <DiscussionThread
                    key="private"
                    engagementId={room.private_thread_parent ?? undefined}
                    currentProfileId={currentProfileId}
                    title={t("live.chatPrivate")}
                    placeholder={t("live.chatPrivatePlaceholder")}
                  />
                )}
              </div>
            ) : null}

            {tab === "homework" ? (
              <ClassAssignments
                assignments={room.assignments}
                sessions={room.sessions}
                currentProfileId={currentProfileId}
              />
            ) : null}

            {tab === "recordings" ? (
              <SessionRecordings
                sessions={room.sessions}
                fallbackTitle={room.title}
              />
            ) : null}

            {tab === "syllabus" ? (
              room.topics.length ? (
                <ol className="space-y-3">
                  {room.topics.map((topic, index) => (
                    <li key={topic.id} className="flex gap-3">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold">
                        {index + 1}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">
                          {topic.title}
                        </span>
                        {topic.description ? (
                          <span className="mt-0.5 block text-xs text-muted">
                            {topic.description}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState compact title={t("live.noTopics")} />
              )
            ) : null}

            {tab === "sessions" ? (
              <ul className="divide-y divide-(--theme-hairline) text-sm">
                {room.sessions.map((session) => (
                  <li
                    key={session.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <span className="font-medium">
                      {session.title ?? session.Topic?.title ?? room.title}
                    </span>
                    <span className="text-muted">
                      {formatDate(session.starts_at, language)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </main>

      <aside className="rounded-2xl border border-theme bg-card p-3 lg:sticky lg:top-24">
        <div className="flex items-center justify-between px-3 py-2">
          <h2 className="font-semibold">{t("live.timetable")}</h2>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Users className="size-3.5" aria-hidden="true" />
            {room.seats_taken}/{room.capacity}
          </span>
        </div>
        <SessionList
          sessions={room.sessions}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </aside>
    </div>
  );
}

function ChatModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-(--theme-primary) text-(--theme-on-primary)"
          : "bg-surface text-muted hover:text-(--theme-foreground)",
      )}
    >
      {label}
    </button>
  );
}
