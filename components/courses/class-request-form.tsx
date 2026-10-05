'use client';

import { CalendarPlus, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ClassRequestWindowRow,
  type RequestWindow,
} from '@/components/courses/class-request-window-row';
import { useRequireLogin } from '@/components/courses/quick-enroll/login-dialog-provider';
import { useTeacherBusyTimes } from '@/hooks/use-teacher-busy-times';
import { postJson } from '@/lib/api/client';
import { windowProblemAt, type WeeklyWindow } from '@/lib/courses/class-request-windows';
import { sortWeekdays } from '@/lib/courses/weekly-rule';
import { useTranslation } from '@/lib/i18n/hooks';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

const WEEK = sortWeekdays([0, 1, 2, 3, 4, 5, 6]);
const toMinute = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};
const FIRST_WINDOW: RequestWindow = { weekday: WEEK[0], from: '16:00', duration: 90 };
const toWeekly = (w: RequestWindow): WeeklyWindow => ({
  weekday: w.weekday,
  start_minute: toMinute(w.from),
  end_minute: toMinute(w.from) + w.duration,
});

interface ClassRequestFormProps {
  courseId: string;
  isLoggedIn: boolean;
  /** The student's own paid private class: one seat, asked from its classroom. */
  engagementId?: string;
  onDone?: () => void;
}

/**
 * A student tells the teacher when they can attend. Nothing is booked here —
 * the teacher answers by opening a class, and the student then buys a seat.
 * Requests are unlimited, but each time must be free and valid (the server re-checks).
 */
export function ClassRequestForm({
  courseId,
  isLoggedIn,
  engagementId,
  onDone,
}: ClassRequestFormProps) {
  const { t } = useTranslation();
  const requireLogin = useRequireLogin();
  const [seats, setSeats] = useState('1');
  const [windows, setWindows] = useState<RequestWindow[]>([FIRST_WINDOW]);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useTeacherBusyTimes(courseId, isLoggedIn);
  const weekly = windows.map(toWeekly);
  const problems = weekly.map((_, index) => windowProblemAt(weekly, index, busy));

  const update = (index: number, patch: Partial<RequestWindow>) =>
    setWindows((all) => all.map((w, i) => (i === index ? { ...w, ...patch } : w)));

  const submit = async () => {
    setSending(true);
    setError(null);
    try {
      await postJson('/class-requests', {
        course_id: courseId,
        engagement_id: engagementId,
        seats: engagementId ? 1 : Math.max(1, Number(seats) || 1),
        windows: weekly,
        note: note.trim() || undefined,
      });
      setDone(true);
      onDone?.();
      logger.ok('ClassRequest', 'Submitted', { course_id: courseId });
    } catch (err) {
      setError(t('courses.requestClassFailed'));
      logger.warn('ClassRequest', 'SubmitFailed', errorFields(err));
    } finally {
      setSending(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={() => requireLogin()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-(--theme-primary-ink) underline-offset-4 hover:underline"
      >
        <CalendarPlus className="size-4" aria-hidden="true" />
        {t('courses.requestClassLogin')}
      </button>
    );
  }

  if (done) {
    return (
      <div className="bg-surface space-y-3 rounded-xl p-4 text-sm">
        <p>{t('courses.requestClassDone')}</p>
        <button
          type="button"
          onClick={() => {
            setWindows([FIRST_WINDOW]);
            setNote('');
            setDone(false);
          }}
          className="inline-flex items-center gap-1 text-sm font-bold text-(--theme-primary-ink)"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t('courses.requestClassAnother')}
        </button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      {engagementId ? null : (
        <div className="space-y-1.5">
          <Label htmlFor="request-seats">{t('courses.requestClassSeats')}</Label>
          <Input
            id="request-seats"
            type="number"
            min={1}
            max={50}
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            className="max-w-32"
          />
          <p className="text-muted text-xs">{t('courses.requestClassSeatsHint')}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t('courses.requestClassWindows')}</Label>
        {windows.map((w, index) => (
          <ClassRequestWindowRow
            key={index}
            window={w}
            problem={problems[index] ?? null}
            busy={busy}
            removable={windows.length > 1}
            onChange={(patch) => update(index, patch)}
            onRemove={() => setWindows((all) => all.filter((_, i) => i !== index))}
          />
        ))}
        {windows.length < 7 ? (
          <button
            type="button"
            onClick={() => setWindows((all) => [...all, FIRST_WINDOW])}
            className="inline-flex items-center gap-1 text-xs font-semibold text-(--theme-primary-ink)"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            {t('courses.requestClassAddWindow')}
          </button>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="request-note">{t('courses.requestClassNote')}</Label>
        <Textarea
          id="request-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button
        type="submit"
        loading={sending}
        disabled={problems.some(Boolean)}
        className="cd-cta-btn h-12 w-full rounded-[14px]"
      >
        {t('courses.requestClassSubmit')}
      </Button>
    </form>
  );
}
