'use client';

import { useCallback, useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

import { CourseQnAForm } from '@/components/courses/course-qna-form';
import { CourseQnAItem } from '@/components/courses/course-qna-item';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useRequireLogin } from '@/components/courses/quick-enroll/login-dialog-provider';
import { useTranslation } from '@/lib/i18n/hooks';
import { getCourseQnAs, type CourseQnAList } from '@/lib/api/client';

type CourseQnASectionProps = {
  courseId: string;
  isLoggedIn: boolean;
};

const formatQnADate = (iso: string, language: string) =>
  new Date(iso).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export function CourseQnA({ courseId, isLoggedIn }: CourseQnASectionProps) {
  const { t, language } = useTranslation();
  const requireLogin = useRequireLogin();
  const [list, setList] = useState<CourseQnAList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadFailed(false);
      setList(await getCourseQnAs(courseId));
    } catch {
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (isLoggedIn) {
      void load();
    }
  }, [isLoggedIn, load]);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-(--theme-foreground)">{t('courseQnA.title')}</h2>
        <p className="mt-1 text-sm text-(--theme-muted)">{t('courseQnA.reviewHint')}</p>
      </div>

      {!isLoggedIn ? (
        <div className="cd-review-card rounded-2xl border p-5">
          <EmptyState
            compact
            icon={<MessageCircle className="h-6 w-6 text-(--theme-primary)" />}
            title={t('courseQnA.loginToAsk')}
            description={t('courseQnA.loginToAskDescription')}
            action={
              <Button
                onClick={() => requireLogin()}
                className="cd-cta-btn h-11 px-6 text-sm font-extrabold text-white hover:scale-100"
              >
                {t('navigation.login')}
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <CourseQnAForm courseId={courseId} onSubmitted={load} />

          {isLoading ? (
            <div className="cd-review-card h-28 animate-pulse rounded-2xl border" />
          ) : loadFailed ? (
            <p className="cd-review-card rounded-2xl border p-5 text-sm font-semibold text-red-600">
              {t('courseQnA.loadFailed')}
            </p>
          ) : (list?.items ?? []).length === 0 ? (
            <div className="cd-review-card rounded-2xl border p-5">
              <EmptyState
                compact
                icon={<MessageCircle className="h-6 w-6 text-(--theme-primary)" />}
                title={t('courseQnA.noQuestionsYet')}
                description={t('courseQnA.reviewHint')}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {(list?.items ?? []).map((item) => (
                <CourseQnAItem
                  key={item.id}
                  item={item}
                  canModerate={list?.can_moderate === true}
                  dateLabel={formatQnADate(item.created_at, language)}
                  onChanged={load}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
