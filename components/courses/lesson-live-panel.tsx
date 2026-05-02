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
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-slate-900 px-6 text-center text-slate-200">
        <span className="text-sm font-medium">
          {loadingDetail ? t("common.loading") : t("courses.liveNoLinkYet")}
        </span>
      </div>
    );
  }

  const locale = language || "en";
  const range = formatRange(
    live.starts_at,
    live.ends_at,
    live.timezone,
    locale
  );

  return (
    <div className="flex w-full flex-col gap-4 bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-slate-100">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/90">
          {t("courses.liveSession")}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">{lesson.title}</h3>
        <p className="mt-2 text-sm text-slate-300">{range}</p>
        <p className="mt-1 text-xs text-slate-400">
          {t("courses.liveSessionTimezone")}: {live.timezone}
        </p>
        {live.provider_label ? (
          <p className="mt-1 text-xs text-slate-500">{live.provider_label}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {!isLoggedIn ? (
          <Link
            href={loginHref}
            className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white shadow hover:bg-emerald-400"
          >
            {t("courses.liveLoginToJoin")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => void loadJoinLink()}
            disabled={loadingJoin}
            className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white shadow hover:bg-emerald-400 disabled:opacity-60"
          >
            {loadingJoin
              ? t("common.loading")
              : t("courses.liveJoinLiveLesson")}
          </button>
        )}
        <Link
          href={enrollHref}
          className="inline-flex h-10 items-center justify-center rounded-full border border-slate-600 px-5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
        >
          {t("courses.enrollNow")}
        </Link>
      </div>
      {joinError ? (
        <p className="text-xs text-amber-300">{joinError}</p>
      ) : null}
      {live.playback_url ? (
        <a
          href={live.playback_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-sky-300 underline hover:text-sky-200"
        >
          {t("courses.livePlayback")}
        </a>
      ) : null}
    </div>
  );
};
