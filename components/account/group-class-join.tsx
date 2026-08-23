"use client";

import { useEffect, useState } from "react";

import { useTranslation } from "@/lib/i18n/hooks";
import { formatDate } from "@/lib/utils";

type Props = {
  startsAt: string;
  /** Null until the join window opens — the page never holds the link early. */
  meetingUrl: string | null;
  language: string;
};

const countdownParts = (target: number, now: number) => {
  const diff = Math.max(target - now, 0);
  const minutes = Math.floor(diff / 60000);
  return {
    days: Math.floor(minutes / (60 * 24)),
    hours: Math.floor((minutes % (60 * 24)) / 60),
    minutes: minutes % 60,
  };
};

/**
 * The next meeting with a live countdown. The Join button exists only while the
 * backend is willing to hand over the link, so there is nothing to click early.
 */
export const GroupClassJoin = ({ startsAt, meetingUrl, language }: Props) => {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const target = new Date(startsAt).getTime();
  const { days, hours, minutes } = countdownParts(target, now);
  const started = target <= now;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="font-medium">{formatDate(startsAt, language, true)}</p>
        {!started ? (
          <p className="text-sm text-muted" dir="ltr">
            {days}d {hours}h {minutes}m
          </p>
        ) : null}
      </div>
      {meetingUrl ? (
        <a
          href={meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-(--theme-primary) px-4 py-2 text-sm font-semibold text-(--theme-on-primary)"
        >
          {t("account.groupJoinNow")}
        </a>
      ) : (
        <span className="text-sm text-muted">
          {t("account.groupLinkOpensSoon")}
        </span>
      )}
    </div>
  );
};
