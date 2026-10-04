'use client';

import { CalendarClock, Clock3, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { CLASS_REQUEST_ANCHOR_ID } from '@/components/courses/live-course-panel';
import { JoinableClasses } from '@/components/live/joinable-classes';
import Link from '@/components/ui/link';
import type { TutoringGroupRoom } from '@/lib/api/account-types';
import { teacherChatHref } from '@/lib/courses/live-course';
import { weekdayLabelKey } from '@/lib/courses/weekly-rule';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPersianDigits } from '@/lib/utils';

interface PrivateScheduleRequestProps {
  room: TutoringGroupRoom;
  courseHref: string;
}

const minuteLabel = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

/**
 * Stage of a paid private class before its first session exists. Open published
 * classes of this course are listed here; asking for a new time lives on the
 * course page, not in this classroom.
 */
export function PrivateScheduleRequest({ room, courseHref }: PrivateScheduleRequestProps) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const pending = room.pending_request ?? null;
  const joinable = room.joinable_groups ?? [];
  const requestHref = `${courseHref}#${CLASS_REQUEST_ANCHOR_ID}`;

  return (
    <section className="border-theme bg-card rounded-2xl border p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--theme-primary)/10 text-(--theme-primary)">
          {pending ? (
            <Clock3 className="size-5" aria-hidden="true" />
          ) : (
            <CalendarClock className="size-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-lg font-bold text-(--theme-foreground)">
            {pending ? t('live.privateWaitingTitle') : t('live.privateAskTimesTitle')}
          </h2>
          <p className="text-muted text-sm">
            {pending
              ? t('live.privateWaitingHint').replace('{teacher}', room.Tutor?.display_name ?? '')
              : t('live.privateAskTimesHint')}
          </p>
        </div>
      </div>

      {joinable.length ? (
        <div className="border-theme mt-5 border-b pb-5">
          <JoinableClasses
            engagementId={room.id}
            groups={joinable}
            paidValue={room.paid_value ?? 0}
            courseHref={courseHref}
            onKeepPrivate={() => router.push(requestHref)}
          />
        </div>
      ) : null}

      {pending ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {pending.windows.map((w, index) => (
            <li
              key={index}
              className="border-theme bg-surface rounded-lg border px-3 py-1.5 text-sm"
            >
              {t(weekdayLabelKey(w.weekday) ?? '')}{' '}
              {toPersianDigits(
                `${minuteLabel(w.start_minute)}–${minuteLabel(w.end_minute)}`,
                language,
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Link
          href={requestHref}
          className="mt-5 inline-flex text-sm font-semibold text-(--theme-primary-ink) underline-offset-4 hover:underline"
        >
          {t('courses.requestClassTitle')}
        </Link>
      )}

      <Link
        href={teacherChatHref(courseHref)}
        className="mt-5 flex items-center gap-2 text-sm font-semibold text-(--theme-primary-ink) underline-offset-4 hover:underline"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        {t('live.privateMessageTeacher')}
      </Link>
    </section>
  );
}
