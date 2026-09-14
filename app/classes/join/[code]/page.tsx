import { notFound } from 'next/navigation';

import { TutoringGroupsSection } from '@/components/courses/tutoring-groups-section';
import { getCurrentUser, getTutoringGroupByCode } from '@/lib/api/server';
import { resolveAcademyForRequest } from '@/lib/courses/academy-context';
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
  const [group, user] = await Promise.all([
    getTutoringGroupByCode(code),
    getCurrentUser().catch(() => null),
  ]);

  if (!group) return notFound();

  const { language, currencyConfig } = await resolveAcademyForRequest(user, academyContext.slug);
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
        joinCode={code}
      />
    </main>
  );
}
