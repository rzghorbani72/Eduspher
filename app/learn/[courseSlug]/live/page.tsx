import { CalendarClock } from 'lucide-react';
import { redirect } from 'next/navigation';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { LiveRoomShell } from '@/components/live/live-room-shell';
import { getMyLiveRoomForCourse, getTutoringGroupRoom } from '@/lib/api/account-server';
import { getPublicCourseDetail } from '@/lib/api/server';
import { getSession } from '@/lib/auth/session';
import { coursePath, decodePathSegment, liveClassPath } from '@/lib/content-paths';
import { getAcademyContext } from '@/lib/store-context';
import { buildAcademyPath } from '@/lib/utils';

/**
 * The live classroom of a course, at the same address family as the recorded
 * learn page. The backend decides membership on every request; a student who
 * holds no seat here is sent back to the sales page. `?class=` opens one class
 * directly — staff hold no seat, so this is how a manager or tutor gets in.
 */
export default async function LiveLearningPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ class?: string }>;
}) {
  const [{ courseSlug: courseSlugParam }, { class: classId }] = await Promise.all([
    params,
    searchParams,
  ]);
  const courseSlug = decodePathSegment(courseSlugParam);
  const [session, storeContext] = await Promise.all([getSession(), getAcademyContext()]);
  const storeSlug = storeContext.isSubdomain ? null : storeContext.slug;

  if (!session) {
    const returnPath = buildAcademyPath(storeSlug, liveClassPath(courseSlug));
    redirect(
      `${buildAcademyPath(storeSlug, '/auth/login')}?redirect=${encodeURIComponent(returnPath)}`,
    );
  }

  const course = await getPublicCourseDetail(courseSlug);
  if (!course) redirect(buildAcademyPath(storeSlug, '/courses'));

  const pickedRoom = classId ? await getTutoringGroupRoom(classId) : null;
  const room =
    pickedRoom?.course_id === course.id ? pickedRoom : await getMyLiveRoomForCourse(course.id);
  if (!room) redirect(buildAcademyPath(storeSlug, coursePath(course.slug)));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <AccountPageHeader
        title={room.title}
        description={room.Tutor?.display_name ?? course.title}
        icon={CalendarClock}
      />
      <LiveRoomShell
        room={room}
        currentProfileId={session.profileId ?? ''}
        courseHref={buildAcademyPath(storeSlug, coursePath(course.slug))}
        invitePath={
          room.invite_code ? buildAcademyPath(storeSlug, `/classes/join/${room.invite_code}`) : null
        }
      />
    </div>
  );
}
