import { notFound, redirect } from 'next/navigation';

import { getTutoringGroupRoom } from '@/lib/api/account-server';
import { getCourseById } from '@/lib/api/server';
import { liveClassPath } from '@/lib/content-paths';
import { getAcademyContext } from '@/lib/store-context';
import { buildAcademyPath } from '@/lib/utils';

/**
 * Legacy URL — live classrooms live under `/learn/:slug/live` like recorded
 * lessons. Keep this route so old bookmarks and invite follow-ups still work.
 */
export default async function GroupClassRedirectPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const academyContext = await getAcademyContext();
  const storeSlug = academyContext.isSubdomain ? null : academyContext.slug;

  const room = await getTutoringGroupRoom(groupId);
  if (!room) return notFound();

  const course = await getCourseById(room.course_id).catch(() => null);
  if (!course?.slug) return notFound();

  redirect(buildAcademyPath(storeSlug, liveClassPath(course.slug)));
}
