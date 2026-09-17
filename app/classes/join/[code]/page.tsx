import { TutoringGroupsSection } from '@/components/courses/tutoring-groups-section';
import { EmptyState } from '@/components/ui/empty-state';
import { getCurrentUser, getPublicCourseDetail, getTutoringGroupByCode } from '@/lib/api/server';
import { resolveAcademyForRequest } from '@/lib/courses/academy-context';
import { liveClassPath } from '@/lib/content-paths';
import { getAcademyContext } from '@/lib/store-context';
import { buildAcademyPath } from '@/lib/utils';
import { t } from '@/lib/i18n/server-translations';

export const dynamic = 'force-dynamic';

/**
 * A share code is only an enrollment page when the parent course is live on
 * the storefront. Anything else — draft course, draft class, unknown code —
 * is the same empty state. Never 404: the visitor already has the link.
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
  const { language, currencyConfig } = await resolveAcademyForRequest(user, academyContext.slug);

  const unpublished = (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <EmptyState title={t('courses.groupInviteCourseNotPublished', language)} />
    </main>
  );

  if (lookup.status !== 'ok') return unpublished;

  const group = lookup.group;
  const publicCourse = await getPublicCourseDetail(group.course_id, { fresh: true });
  if (!publicCourse) return unpublished;

  const buildPath = (path: string) =>
    buildAcademyPath(academyContext.isSubdomain ? null : academyContext.slug, path);

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
        isLoggedIn={Boolean(user)}
        joinCode={code}
        liveClassHref={buildPath(liveClassPath(publicCourse.slug))}
      />
    </main>
  );
}
