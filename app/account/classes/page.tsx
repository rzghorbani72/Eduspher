import { CalendarClock } from 'lucide-react';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { DataPanel } from '@/components/shared/data-list/data-panel';
import { EmptyState } from '@/components/ui/empty-state';
import Link from '@/components/ui/link';
import { getAcademyBySlug, getCourseById, getEnrollments } from '@/lib/api/server';
import { getMyTutoringGroups } from '@/lib/api/account-server';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { getAcademyContext } from '@/lib/store-context';
import { learnPath } from '@/lib/content-paths';
import { buildAcademyPath, formatDate } from '@/lib/utils';

type LiveLesson = {
  id: string;
  title: string;
  courseSlug: string;
  lessonSlug: string;
  courseTitle: string;
  startsAt: string | null;
};

/**
 * Reading the clock is a side effect, so it stays out of the render body. A
 * lesson with no scheduled time counts as upcoming — it has not happened yet.
 */
async function splitByStartTime(lessons: readonly LiveLesson[]) {
  const now = Date.now();
  const isPast = (lesson: LiveLesson) =>
    Boolean(lesson.startsAt && new Date(lesson.startsAt).getTime() < now);
  return {
    upcoming: lessons.filter((lesson) => !isPast(lesson)),
    past: lessons.filter(isPast),
  };
}

export default async function AccountClassesPage() {
  const academyContext = await getAcademyContext();
  const slugForPaths = academyContext.isSubdomain ? null : academyContext.slug;

  const [enrollmentsData, academy, groupRows] = await Promise.all([
    getEnrollments({ limit: 100 }).catch(() => null),
    academyContext.slug ? getAcademyBySlug(academyContext.slug).catch(() => null) : null,
    getMyTutoringGroups(),
  ]);

  const language = getAcademyLanguage(academy?.language ?? null, academy?.country_code ?? null);
  const translate = (key: string) => t(key, language);
  const enrollments = enrollmentsData?.enrollments ?? [];

  const courses = await Promise.all(
    enrollments.map((enrollment) => getCourseById(enrollment.course_id).catch(() => null)),
  );

  const liveLessons: LiveLesson[] = courses.flatMap((course) =>
    course
      ? (course.Season ?? []).flatMap((season) =>
          (season.Lesson ?? [])
            .filter((lesson) => lesson.lesson_type === 'LIVE')
            .map((lesson) => ({
              id: String(lesson.id),
              title: lesson.title,
              courseSlug: course.slug,
              lessonSlug: lesson.slug ?? lesson.id,
              courseTitle: course.title,
              startsAt: (lesson as { live_starts_at?: string | null }).live_starts_at ?? null,
            })),
        )
      : [],
  );

  const { upcoming, past } = await splitByStartTime(liveLessons);

  return (
    <div className="space-y-6">
      <AccountPageHeader
        title={translate('account.myClasses')}
        description={translate('account.classesDescription')}
        icon={CalendarClock}
      />

      {groupRows.length ? (
        <DataPanel title={translate('account.groupClasses')}>
          <ul className="space-y-3">
            {groupRows.map((row) => (
              <li key={row.engagement_id}>
                <Link
                  href={buildAcademyPath(slugForPaths, `/account/classes/${row.group.id}`)}
                  className="border-theme bg-card flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 transition hover:border-(--theme-primary)/40"
                >
                  <span className="font-medium">{row.group.title}</span>
                  <span className="text-muted text-sm">
                    {row.group.next_session
                      ? formatDate(row.group.next_session.starts_at, language)
                      : translate('account.groupWaitingToStart')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </DataPanel>
      ) : null}

      <DataPanel title={translate('account.upcomingClasses')}>
        <LessonList
          lessons={upcoming}
          storeSlug={slugForPaths}
          language={language}
          emptyLabel={translate('account.noClasses')}
          openLabel={translate('account.openClass')}
        />
      </DataPanel>

      <DataPanel title={translate('account.pastClasses')}>
        <LessonList
          lessons={past}
          storeSlug={slugForPaths}
          language={language}
          emptyLabel={translate('account.noPastClasses')}
          openLabel={translate('account.openClass')}
        />
      </DataPanel>
    </div>
  );
}

function LessonList({
  lessons,
  storeSlug,
  language,
  emptyLabel,
  openLabel,
}: {
  lessons: readonly LiveLesson[];
  storeSlug: string | null;
  language: string;
  emptyLabel: string;
  openLabel: string;
}) {
  if (lessons.length === 0) return <EmptyState compact title={emptyLabel} />;

  return (
    <ul className="space-y-3">
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          <Link
            href={buildAcademyPath(storeSlug, learnPath(lesson.courseSlug, lesson.lessonSlug))}
            className="border-theme bg-card flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 transition hover:border-(--theme-primary)/40"
          >
            <span>
              <span className="block font-medium text-(--theme-foreground)">{lesson.title}</span>
              <span className="text-muted mt-1 block text-sm">
                {lesson.courseTitle}
                {lesson.startsAt ? ` · ${formatDate(lesson.startsAt, language, true)}` : ''}
              </span>
            </span>
            <span className="text-sm font-semibold text-(--theme-primary-ink)">{openLabel}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
