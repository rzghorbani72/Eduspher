import { notFound } from 'next/navigation';

import { TutoringGroupsSection } from '@/components/courses/tutoring-groups-section';
import { EmptyState } from '@/components/ui/empty-state';
import { getCurrentUser, getCourseById, getTutoringGroupByCode } from '@/lib/api/server';
import { resolveAcademyForRequest } from '@/lib/courses/academy-context';
import { liveClassPath } from '@/lib/content-paths';
import { getAcademyContext } from '@/lib/store-context';
import { buildAcademyPath } from '@/lib/utils';
import { t } from '@/lib/i18n/server-translations';

/**
 * A private class opened by its share code. This is how a student gathers their
 * own friends into a class instead of waiting for strangers to fill it.
 */
export default async function JoinClassByCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const academyContext = await getAcademyContext();
  const [lookup, user] = await Promise.all([
    getTutoringGroupByCode(code),
    getCurrentUser().catch(() => null),
  ]);

  if (lookup.status === 'course_unpublished') {
    const { language } = await resolveAcademyForRequest(user, academyContext.slug);
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <EmptyState title={t('courses.groupInviteCourseNotPublished', language)} />
      </main>
    );
  }

  if (lookup.status !== 'ok') return notFound();

  const group = lookup.group;
  const { language, currencyConfig } = await resolveAcademyForRequest(user, academyContext.slug);
  const buildPath = (path: string) =>
    buildAcademyPath(academyContext.isSubdomain ? null : academyContext.slug, path);

  const course = await getCourseById(group.course_id).catch(() => null);
  const liveClassHref = course?.slug
    ? buildPath(liveClassPath(course.slug))
    : buildPath('/account/classes');

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-(--theme-foreground)">
        {t('courses.groupInviteTitle', language)}
      </h1>
      <TutoringGroupsSection
        groups={[group]}
        currencyConfig={currencyConfig}
        language={language}
        loginHref={buildPath(`/auth/login?redirect=/classes/join/${code}`)}
        joinCode={code}
        liveClassHref={liveClassHref}
      />
    </main>
  );
}
