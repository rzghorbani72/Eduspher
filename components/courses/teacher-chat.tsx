'use client';

import { MessageCircle } from 'lucide-react';

import { DiscussionThread } from '@/components/discussion/discussion-thread';
import { Button } from '@/components/ui/button';
import Link from '@/components/ui/link';
import { useTranslation } from '@/lib/i18n/hooks';

interface TeacherChatProps {
  /** Set only when the viewer holds the course (bought, granted, or a class seat). */
  courseId: string | null;
  currentProfileId: string | null;
  loginHref: string | null;
}

/** Private student ↔ teacher chat on the course page's teacher tab. Zip files only. */
export function TeacherChat({ courseId, currentProfileId, loginHref }: TeacherChatProps) {
  const { t } = useTranslation();

  return (
    <section className="border-theme bg-card space-y-3 rounded-2xl border p-5">
      <h3 className="flex items-center gap-2 text-base font-bold text-(--theme-foreground)">
        <MessageCircle className="size-4 text-(--theme-primary)" aria-hidden="true" />
        {t('courses.teacherChatTitle')}
      </h3>
      {courseId && currentProfileId ? (
        <DiscussionThread
          courseId={courseId}
          currentProfileId={currentProfileId}
          placeholder={t('courses.teacherChatPlaceholder')}
          emptyDescription={t('courses.teacherChatHint')}
          composerHint={t('courses.teacherChatHint')}
          realtime
          allowAttachments
          zipOnly
        />
      ) : loginHref ? (
        <Link href={loginHref} className="text-sm font-bold text-(--theme-primary-ink)">
          {t('courses.teacherChatLogin')}
        </Link>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted text-sm">{t('courses.teacherChatJoinFirst')}</p>
          <Button asChild size="sm">
            <a href="#course-purchase">{t('courses.teacherChatEnroll')}</a>
          </Button>
        </div>
      )}
    </section>
  );
}
