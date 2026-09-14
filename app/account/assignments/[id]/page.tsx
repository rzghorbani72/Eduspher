import { ArrowRight, ClipboardList } from 'lucide-react';
import { notFound } from 'next/navigation';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { StatusPill, toneForStatus } from '@/components/account/status-pill';
import { DiscussionThread } from '@/components/discussion/discussion-thread';
import Link from '@/components/ui/link';
import { getAssignment, getSubmissions } from '@/lib/api/account-server';
import { getAcademyBySlug } from '@/lib/api/server';
import { getSession } from '@/lib/auth/session';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { getAcademyContext } from '@/lib/store-context';
import { scoreLabel } from '@/lib/account-labels';
import { learnPath } from '@/lib/content-paths';
import { buildAcademyPath, formatDate, formatNumber } from '@/lib/utils';

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const academyContext = await getAcademyContext();
  const session = await getSession();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;

  const [assignment, submissions, academy] = await Promise.all([
    getAssignment(id),
    getSubmissions(),
    academyContext.slug ? getAcademyBySlug(academyContext.slug).catch(() => null) : null,
  ]);

  if (!assignment) notFound();

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);
  const submission = submissions.find((item) => item.assignment_id === assignment.id) ?? null;
  const courseSlug = assignment.Lesson?.Course?.slug ?? assignment.Lesson?.Season?.Course?.slug;
  const lessonSlug = assignment.Lesson?.slug;

  return (
    <div className="space-y-6">
      <Link
        href={buildAcademyPath(slugForPaths, '/account/assignments')}
        className="text-muted hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        {translate('account.backToAssignments')}
      </Link>

      <AccountPageHeader
        title={assignment.title}
        description={assignment.Lesson?.Season?.Course?.title ?? undefined}
        icon={ClipboardList}
        actions={
          courseSlug && lessonSlug ? (
            <Link
              href={buildAcademyPath(slugForPaths, learnPath(courseSlug, lessonSlug))}
              className="inline-flex h-10 items-center rounded-full bg-(--theme-primary) px-5 text-sm font-semibold text-(--theme-on-primary) transition-opacity hover:opacity-90"
            >
              {translate('account.openAssignment')}
            </Link>
          ) : null
        }
      />

      <section className="border-theme bg-card space-y-3 rounded-2xl border p-5">
        <div className="text-muted flex flex-wrap items-center gap-3 text-sm">
          <span>
            {translate('account.assignmentDue')}:{' '}
            {assignment.due_at
              ? formatDate(assignment.due_at, language)
              : translate('account.noDueDate')}
          </span>
          <span>
            {translate('learning.points')}: {formatNumber(assignment.max_score, language)}
          </span>
        </div>
        {assignment.description ? (
          <p className="text-sm whitespace-pre-wrap text-(--theme-foreground)">
            {assignment.description}
          </p>
        ) : null}
      </section>

      <section className="border-theme bg-card space-y-3 rounded-2xl border p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-(--theme-foreground)">
            {translate('account.yourSubmission')}
          </h2>
          {submission ? (
            <StatusPill
              label={
                submission.status === 'GRADED'
                  ? translate('learning.graded')
                  : translate('learning.submitted')
              }
              tone={toneForStatus(submission.status)}
            />
          ) : (
            <StatusPill label={translate('account.notSubmitted')} tone="neutral" />
          )}
        </div>

        {submission ? (
          <>
            {submission.content ? (
              <p className="text-sm whitespace-pre-wrap text-(--theme-foreground)">
                {submission.content}
              </p>
            ) : null}
            <p className="text-muted text-xs">
              {translate('learning.submitted')}:{' '}
              {formatDate(submission.submitted_at, language, true)}
            </p>
            <div className="border-theme border-t pt-3">
              <h3 className="mb-1 text-sm font-semibold text-(--theme-foreground)">
                {translate('account.teacherFeedback')}
              </h3>
              {submission.status === 'GRADED' ? (
                <>
                  <p className="font-semibold text-(--theme-primary-ink)">
                    {translate('learning.score')}:{' '}
                    {scoreLabel(submission.score, assignment.max_score, translate, language)}
                  </p>
                  {submission.feedback ? (
                    <p className="text-muted mt-2 text-sm whitespace-pre-wrap">
                      {submission.feedback}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-muted text-sm">{translate('account.awaitingGrade')}</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-muted text-sm">{translate('account.notSubmitted')}</p>
        )}
      </section>

      {submission ? (
        <section className="border-theme bg-card rounded-2xl border p-5">
          <DiscussionThread
            submissionId={submission.id}
            threadId={submission.thread_id ?? undefined}
            currentProfileId={String(session?.profileId ?? '')}
          />
        </section>
      ) : null}
    </div>
  );
}
