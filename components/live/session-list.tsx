"use client";

import { CalendarClock, CheckCircle2, Circle, XCircle } from "lucide-react";

import type { MyTutoringGroupSession } from "@/lib/api/account-types";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn, formatDate } from "@/lib/utils";
import { useNow } from "@/lib/hooks/use-now";

interface SessionListProps {
  sessions: MyTutoringGroupSession[];
  selectedId: string | null;
  onSelect: (sessionId: string) => void;
}

const nameOf = (session: MyTutoringGroupSession, fallback: string): string =>
  session.title ?? session.Topic?.title ?? fallback;

/**
 * The timetable, read the way a curriculum sidebar reads: what each meeting
 * covers, which one is next, and which have already happened.
 */
export function SessionList({
  sessions,
  selectedId,
  onSelect,
}: SessionListProps) {
  const { t, language } = useTranslation();
  const now = useNow();

  const nextId = sessions.find(
    (session) =>
      session.status === "SCHEDULED" &&
      new Date(session.ends_at ?? session.starts_at).getTime() >= now,
  )?.id;

  return (
    <ol className="space-y-1">
      {sessions.map((session, index) => {
        const past =
          new Date(session.ends_at ?? session.starts_at).getTime() < now;
        const cancelled = session.status === "CANCELLED";
        const selected = session.id === selectedId;
        return (
          <li key={session.id}>
            <button
              type="button"
              onClick={() => onSelect(session.id)}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-start transition-colors",
                selected ? "bg-(--theme-primary)/10" : "hover:bg-surface",
                cancelled && "opacity-60",
              )}
            >
              <span className="mt-0.5 shrink-0 text-muted">
                {cancelled ? (
                  <XCircle className="size-4" aria-hidden="true" />
                ) : past ? (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                ) : session.id === nextId ? (
                  <CalendarClock
                    className="size-4 text-(--theme-primary)"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle className="size-4" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {nameOf(session, `${t("live.session")} ${index + 1}`)}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {formatDate(session.starts_at, language)}
                  {cancelled ? ` · ${t("live.sessionCancelled")}` : ""}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
