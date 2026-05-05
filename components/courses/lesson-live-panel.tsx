"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { getLesson, getLessonLiveSession } from "@/lib/api/client";
import type { LessonSummary, LiveSessionSummary } from "@/lib/api/types";
import { useTranslation } from "@/lib/i18n/hooks";

type Props = {
  lesson: LessonSummary;
  isLoggedIn: boolean;
  loginHref: string;
  enrollHref: string;
};

function formatRange(
  startsAt: string,
  endsAt: string | null | undefined,
  timezone: string,
  locale: string
) {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;
  const opts: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone || undefined,
  };
  try {
    const a = start.toLocaleString(locale, opts);
    if (end && !Number.isNaN(end.getTime())) {
      return `${a} — ${end.toLocaleString(locale, opts)}`;
    }
    return a;
  } catch {
    return start.toLocaleString(locale);
  }
}

const panelStyle = {
  background:
    'linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 22%, #000), color-mix(in srgb, var(--theme-secondary) 12%, #000))',
  color: 'var(--theme-on-primary)',
};

const dividerStyle = {
  borderColor: 'color-mix(in srgb, var(--theme-on-primary) 15%, transparent)',
};

export const LessonLivePanel = ({
  lesson,
  isLoggedIn,
  loginHref,
  enrollHref,
}: Props) => {
  const { t, language } = useTranslation();
  const [live, setLive] = useState<LiveSessionSummary | null>(
    lesson.LiveSession ?? null
  );
  const [joinError, setJoinError] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  useEffect(() => {
    setLive(lesson.LiveSession ?? null);
    setJoinError(null);
  }, [lesson.id, lesson.LiveSession]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingDetail(true);
      try {
        const detail = await getLesson(lesson.id);
        if (cancelled || !detail) return;
        const ls = (detail as { LiveSession?: LiveSessionSummary | null })
          .LiveSession;
        if (ls) setLive(ls);
      } catch {
        /* keep embedded snapshot */
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [lesson.id]);

  const loadJoinLink = useCallback(async () => {
    if (!isLoggedIn) return;
    setJoinError(null);
    setLoadingJoin(true);
    try {
      const row = await getLessonLiveSession(lesson.id);
      const url = row?.meeting_url?.trim();
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
      setJoinError(t("courses.liveNoLinkYet"));
    } catch (e) {
      setJoinError(
        e instanceof Error ? e.message : t("courses.liveEnrollToJoin")
      );
    } finally {
      setLoadingJoin(false);
    }
  }, [isLoggedIn, lesson.id, t]);

  if (!live) {
    return (
      <div
        className="flex aspect-video w-full flex-col items-center justify-center gap-2 px-6 text-center"
        style={panelStyle}
      >
        <span className="text-sm font-medium opacity-70">
          {loadingDetail ? t("common.loading") : t("courses.liveNoLinkYet")}
        </span>
      </div>
    );
  }

  const locale = language || "en";
  const range = formatRange(live.starts_at, live.ends_at, live.timezone, locale);

  return (
    <div className="flex w-full flex-col gap-4 p-6" style={panelStyle}>
      <div>
        {/* Live indicator */}
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: 'color-mix(in srgb, var(--theme-on-primary) 15%, transparent)' }}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {t("courses.liveSession")}
        </div>
        <h3 className="text-lg font-semibold">{lesson.title}</h3>
        <p className="mt-1.5 text-sm opacity-70">{range}</p>
        <p className="mt-0.5 text-xs opacity-50">
          {t("courses.liveSessionTimezone")}: {live.timezone}
        </p>
        {live.provider_label ? (
          <p className="mt-0.5 text-xs opacity-40">{live.provider_label}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {!isLoggedIn ? (
          <Link
            href={loginHref}
            className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold shadow-lg transition-all hover:scale-105 hover:opacity-90"
            style={{ backgroundColor: 'var(--theme-on-primary)', color: 'var(--theme-primary)' }}
          >
            {t("courses.liveLoginToJoin")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => void loadJoinLink()}
            disabled={loadingJoin}
            className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold shadow-lg transition-all hover:scale-105 hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--theme-on-primary)', color: 'var(--theme-primary)' }}
          >
            {loadingJoin ? t("common.loading") : t("courses.liveJoinLiveLesson")}
          </button>
        )}
        <Link
          href={enrollHref}
          className="inline-flex h-10 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-all hover:scale-105"
          style={{ borderColor: 'color-mix(in srgb, var(--theme-on-primary) 30%, transparent)', color: 'var(--theme-on-primary)', opacity: 0.85 }}
        >
          {t("courses.enrollNow")}
        </Link>
      </div>

      {joinError ? (
        <p className="rounded-lg px-3 py-2 text-xs"
          style={{ backgroundColor: 'color-mix(in srgb, var(--theme-on-primary) 10%, transparent)' }}>
          {joinError}
        </p>
      ) : null}

      {live.playback_url ? (
        <a
          href={live.playback_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium underline transition-opacity hover:opacity-100 opacity-70"
        >
          {t("courses.livePlayback")} →
        </a>
      ) : null}
    </div>
  );
};
