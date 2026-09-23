'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
}

const fieldClass =
  'h-11 w-full rounded-full border border-theme bg-surface px-4 text-sm text-foreground focus:border-primary focus:outline-none';

export function NewTicketForm({ onCreated, onCancel }: Props) {
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
  const [phone, setPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courseRequired = COURSE_CATEGORIES.has(category);

  useEffect(() => {
    void Promise.all([listSupportResponsibles(), listTicketCourses()])
      .then(([nextResponsibles, nextCourses]) => {
        setResponsibles(nextResponsibles);
        setCourses(nextCourses);
      })
      .catch(() => setError(t('support.error')));
  }, [t]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responsibleId || !subject.trim() || !body.trim()) return;
    if (courseRequired && !courseId) {
      setError(t('support.selectCourse'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await createSupportTicket({
        subject,
        category,
        priority,
        responsible_id: responsibleId,
        body,
        image_ids: imageIds.length ? imageIds : undefined,
        ...(courseId ? { context_type: 'COURSE' as const, context_id: courseId } : {}),
        request_call: requestCall || undefined,
        phone: requestCall ? phone : undefined,
        preferred_time:
          requestCall && preferredTime ? new Date(preferredTime).toISOString() : undefined,
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
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label>{t('support.responsible')}</Label>
        <select
          aria-label={t('support.responsible')}
          className={fieldClass}
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
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>{t('support.subject')}</Label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={255}
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t('support.category')}</Label>
          <select
            aria-label={t('support.category')}
            className={fieldClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`support.categories.${c}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>{t('support.priority')}</Label>
          <select
            aria-label={t('support.priority')}
            className={fieldClass}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {t(`support.priorities.${p}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>{t('support.course')}</Label>
        <select
          aria-label={t('support.course')}
          className={fieldClass}
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
        </select>
        {courses.length === 0 ? (
          <p className="text-muted text-xs">{t('support.noCourses')}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label>{t('support.message')}</Label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          maxLength={5000}
          placeholder={t('support.messagePlaceholder')}
          required
        />
      </div>

      <AttachmentInput imageIds={imageIds} onChange={setImageIds} />

      <label className="bg-surface flex items-center gap-2 rounded-xl px-3.5 py-3 text-sm text-(--theme-foreground)">
        <input
          type="checkbox"
          checked={requestCall}
          onChange={(e) => setRequestCall(e.target.checked)}
          className="border-theme size-4 rounded"
        />
        {t('support.requestCall')}
      </label>
      {requestCall ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t('support.phone')}</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required={requestCall}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('support.preferredTime')}</Label>
            <Input
              type="datetime-local"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="flex flex-wrap gap-3 pt-1">
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
