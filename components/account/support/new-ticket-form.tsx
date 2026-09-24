'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TimePicker } from '@/components/ui/time-picker';
import { useTranslation } from '@/lib/i18n/hooks';
import {
  createSupportTicket,
  listSupportResponsibles,
  listTicketCourses,
  type TicketCategory,
  type TicketCourseOption,
  type TicketDetail,
  type TicketPriority,
  type TicketResponsible,
} from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { AttachmentInput } from './attachment-input';

const CATEGORIES: TicketCategory[] = [
  'COURSE_ACCESS',
  'LIVE_CLASS',
  'PAYMENT',
  'BILLING',
  'TECHNICAL',
  'CONTENT',
  'OTHER',
];
const PRIORITIES: TicketPriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const COURSE_CATEGORIES = new Set<TicketCategory>(['COURSE_ACCESS', 'LIVE_CLASS', 'CONTENT']);

interface Props {
  onCreated: (ticket: TicketDetail) => void;
  onCancel: () => void;
  /** Logged-in user's phone — sent with call requests, never shown as an input. */
  phoneNumber: string | null;
}

function combineDateAndTime(dateYmd: string, timeHm: string): string | undefined {
  if (!dateYmd || !timeHm) return undefined;
  const [y, m, d] = dateYmd.split('-').map(Number);
  const [hh, mm] = timeHm.split(':').map(Number);
  if (![y, m, d, hh, mm].every((n) => Number.isFinite(n))) return undefined;
  const local = new Date(y, m - 1, d, hh, mm, 0, 0);
  if (Number.isNaN(local.getTime())) return undefined;
  return local.toISOString();
}

function timeToMinutes(timeHm: string): number | null {
  const [hh, mm] = timeHm.split(':').map(Number);
  if (![hh, mm].every((n) => Number.isFinite(n))) return null;
  return hh * 60 + mm;
}

export function NewTicketForm({ onCreated, onCancel, phoneNumber }: Props) {
  const { t } = useTranslation();
  const [responsibles, setResponsibles] = useState<TicketResponsible[]>([]);
  const [courses, setCourses] = useState<TicketCourseOption[]>([]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('OTHER');
  const [priority, setPriority] = useState<TicketPriority>('NORMAL');
  const [responsibleId, setResponsibleId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [body, setBody] = useState('');
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [requestCall, setRequestCall] = useState(false);
  const [callDate, setCallDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courseRequired = COURSE_CATEGORIES.has(category);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([listSupportResponsibles(), listTicketCourses()])
      .then(([nextResponsibles, nextCourses]) => {
        if (cancelled) return;
        setResponsibles(nextResponsibles);
        setCourses(nextCourses);
      })
      .catch(() => {
        if (!cancelled) setError(t('support.error'));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only fetch
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responsibleId || !subject.trim() || !body.trim()) return;
    if (courseRequired && !courseId) {
      setError(t('support.selectCourse'));
      return;
    }

    if (requestCall) {
      if (!phoneNumber) {
        setError(t('support.phoneMissing'));
        return;
      }
      if (!callDate) {
        setError(t('support.selectCallDate'));
        return;
      }
      const startMins = timeToMinutes(startTime);
      const endMins = timeToMinutes(endTime);
      if (startMins == null || endMins == null || endMins <= startMins) {
        setError(t('support.invalidCallWindow'));
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      const preferredTime = requestCall ? combineDateAndTime(callDate, startTime) : undefined;
      const windowNote =
        requestCall && callDate
          ? `\n\n${t('support.callWindowNote')
              .replace('{date}', callDate)
              .replace('{start}', startTime)
              .replace('{end}', endTime)}`
          : '';

      const ticket = await createSupportTicket({
        subject,
        category,
        priority,
        responsible_id: responsibleId,
        body: `${body.trim()}${windowNote}`,
        image_ids: imageIds.length ? imageIds : undefined,
        ...(courseId ? { context_type: 'COURSE' as const, context_id: courseId } : {}),
        request_call: requestCall || undefined,
        phone: requestCall && phoneNumber ? phoneNumber : undefined,
        preferred_time: preferredTime,
      });
      onCreated(ticket);
    } catch {
      setError(t('support.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = (role: string) => {
    if (role === 'TEACHER') return t('support.roles.TEACHER');
    if (role === 'MANAGER') return t('support.roles.MANAGER');
    return role;
  };

  return (
    <form onSubmit={submit} className="w-full max-w-[575px] space-y-5">
      <Field label={t('support.responsible')}>
        <Select
          aria-label={t('support.responsible')}
          value={responsibleId}
          onChange={(e) => setResponsibleId(e.target.value)}
          required
        >
          <option value="">{t('support.selectResponsible')}</option>
          {responsibles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.display_name} ({roleLabel(r.role)})
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t('support.subject')}>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={255}
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('support.category')}>
          <Select
            aria-label={t('support.category')}
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`support.categories.${c}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('support.priority')}>
          <Select
            aria-label={t('support.priority')}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {t(`support.priorities.${p}`)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label={t('support.course')}
        hint={courses.length === 0 ? t('support.noCourses') : undefined}
      >
        <Select
          aria-label={t('support.course')}
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required={courseRequired}
        >
          <option value="">
            {courseRequired ? t('support.selectCourse') : t('support.courseOptional')}
          </option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t('support.message')}>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          maxLength={5000}
          placeholder={t('support.messagePlaceholder')}
          required
        />
      </Field>

      <AttachmentInput imageIds={imageIds} onChange={setImageIds} />

      <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-(--theme-primary)/5 px-3.5 py-3 text-sm text-(--theme-foreground)">
        <span
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
            requestCall
              ? 'border-(--theme-primary) bg-(--theme-primary) text-(--theme-on-primary)'
              : 'border-(--theme-foreground)/15 bg-(--theme-background)/80',
          )}
          aria-hidden="true"
        >
          {requestCall ? <Check className="size-3.5" strokeWidth={2.5} /> : null}
        </span>
        <input
          type="checkbox"
          checked={requestCall}
          onChange={(e) => setRequestCall(e.target.checked)}
          className="sr-only"
        />
        <span>{t('support.requestCall')}</span>
      </label>

      {requestCall ? (
        <div className="w-full min-w-0 space-y-4 rounded-xl bg-(--theme-background)/50 p-4">
          <Field label={t('support.preferredDate')}>
            <DatePicker
              value={callDate}
              onChange={setCallDate}
              minDate={today}
              aria-label={t('support.preferredDate')}
              placeholder={t('support.pickDate')}
            />
          </Field>
          <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2">
            <Field label={t('support.startTime')}>
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                aria-label={t('support.startTime')}
              />
            </Field>
            <Field label={t('support.endTime')}>
              <TimePicker value={endTime} onChange={setEndTime} aria-label={t('support.endTime')} />
            </Field>
          </div>
          {!phoneNumber ? (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t('support.phoneMissing')}
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitting ? t('support.sending') : t('support.submit')}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('support.cancel')}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label className="text-muted text-xs font-medium tracking-wide">{label}</Label>
      {children}
      {hint ? <p className="text-muted text-xs leading-relaxed">{hint}</p> : null}
    </div>
  );
}
