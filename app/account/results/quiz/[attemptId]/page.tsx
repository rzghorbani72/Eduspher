import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { StatusPill, toneForStatus } from '@/components/account/status-pill';
import { DiscussionThread } from '@/components/discussion/discussion-thread';
import Link from '@/components/ui/link';
import { getQuizAttempt } from '@/lib/api/account-server';
import { getAcademyBySlug } from '@/lib/api/server';
import { getSession } from '@/lib/auth/session';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { getAcademyContext } from '@/lib/store-context';
import { scoreLabel } from '@/lib/account-labels';
import { buildAcademyPath } from '@/lib/utils';

export default async function QuizAttemptResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const academyContext = await getAcademyContext();
  const session = await getSession();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;

  const [attempt, academy] = await Promise.all([
    getQuizAttempt(attemptId),
    academyContext.slug ? getAcademyBySlug(academyContext.slug).catch(() => null) : null,
  ]);

  if (!attempt) notFound();

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);

  const statusLabel =
    attempt.status === 'GRADED'
      ? translate('learning.graded')
      : attempt.status === 'PENDING_REVIEW'
        ? translate('learning.awaitingReview')
        : translate('account.statusPending');

  return (
    <div className="space-y-6">
      <Link
        href={buildAcademyPath(slugForPaths, '/account/results')}
        className="text-muted hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        {translate('account.backToResults')}
      </Link>

      <AccountPageHeader
        title={attempt.Quiz?.title ?? translate('account.quizResults')}
        icon={CheckCircle2}
        actions={<StatusPill label={statusLabel} tone={toneForStatus(attempt.status)} />}
      />

      <section className="border-theme bg-card space-y-3 rounded-2xl border p-5">
        <p className="text-lg font-semibold text-(--theme-primary-ink)">
          {translate('learning.score')}:{' '}
          {scoreLabel(attempt.score, attempt.max_score, translate, language)}
        </p>
        {attempt.passed != null ? (
          <StatusPill
            label={attempt.passed ? translate('learning.passed') : translate('learning.notPassed')}
            tone={attempt.passed ? 'success' : 'danger'}
          />
        ) : null}
        {attempt.status === 'PENDING_REVIEW' ? (
          <p className="text-muted text-sm">{translate('learning.shortAnswersPending')}</p>
        ) : null}
        {attempt.feedback ? (
          <div className="border-theme border-t pt-3">
            <h2 className="mb-1 text-sm font-semibold text-(--theme-foreground)">
              {translate('account.teacherFeedback')}
            </h2>
            <p className="text-muted text-sm whitespace-pre-wrap">{attempt.feedback}</p>
          </div>
        ) : null}
      </section>

      <section className="border-theme bg-card rounded-2xl border p-5">
        <DiscussionThread
          attemptId={attempt.id}
          currentProfileId={String(session?.profileId ?? '')}
        />
      </section>
    </div>
  );
}
