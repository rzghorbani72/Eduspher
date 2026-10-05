'use client';

import type { CSSProperties } from 'react';
import { CalendarPlus } from 'lucide-react';

import { ClassRequestForm } from '@/components/courses/class-request-form';
import { useLiveClass } from '@/components/courses/live-class/live-class-provider';
import { CLASS_REQUEST_ANCHOR_ID } from '@/lib/courses/live-course';
import { useTranslation } from '@/lib/i18n/hooks';

interface ClassRequestSectionProps {
  courseId: string;
  isLoggedIn: boolean;
}

const PRIMARY_ACCENT: CSSProperties & Record<'--ac', string> = { '--ac': 'var(--theme-primary)' };

/** Always open: a student may ask for any number of new classes, each at free times. */
export function ClassRequestSection({ courseId, isLoggedIn }: ClassRequestSectionProps) {
  const { t } = useTranslation();
  const { groups } = useLiveClass();

  return (
    <section
      id={CLASS_REQUEST_ANCHOR_ID}
      aria-labelledby="request-class-title"
      style={PRIMARY_ACCENT}
      className="scroll-mt-24 space-y-3"
    >
      <div className="cd-class-offer flex items-center gap-3 rounded-[14px] border px-4 py-3">
        <span className="cd-class-icon grid size-11 shrink-0 place-items-center rounded-[14px]">
          <CalendarPlus className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="request-class-title" className="cd-class-ink text-base font-black">
            {t('courses.requestClassTitle')}
          </h2>
          <p className="text-muted text-xs">
            {groups.length
              ? t('courses.requestClassHintWithClasses')
              : t('courses.requestClassHint')}
          </p>
        </div>
      </div>
      <div className="cd-review-card rounded-2xl border p-5 md:p-6">
        <div className="max-w-xl">
          <ClassRequestForm courseId={courseId} isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </section>
  );
}
