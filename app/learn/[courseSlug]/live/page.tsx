import { CalendarClock } from 'lucide-react';
import { redirect } from 'next/navigation';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { LiveRoomShell } from '@/components/live/live-room-shell';
import {
  getCourseAccess,
  getMyLiveRoomForCourse,
  getTutoringGroupRoom,
} from '@/lib/api/account-server';
import { RoleBadges } from '@/components/account/role-badges';
import Link from '@/components/ui/link';
import { t } from '@/lib/i18n/server-translations';
import { getCurrentUser, getPublicCourseDetail } from '@/lib/api/server';
import { viewerRoles } from '@/lib/courses/staff-access';
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
  const courseHref = buildAcademyPath(storeSlug, coursePath(course.slug));
  if (!room) {
    const access = await getCourseAccess();
    if (!access.some((row) => row.course_id === course.id)) redirect(courseHref);
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <AccountPageHeader
          title={course.title}
          description={t('courses.liveNoClassesYet')}
          icon={CalendarClock}
        />
        <Link href={courseHref} className="text-sm font-bold text-(--theme-primary-ink)">
          {t('courses.backToCourse')}
        </Link>
      </div>
    );
  }

  const user = await getCurrentUser().catch(() => null);
  const roles = viewerRoles(
    user ? { id: String(user.id), role: user.role } : null,
    room.Tutor?.id === String(user?.id) || course.author?.id === String(user?.id),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <RoleBadges roles={roles} />
      <AccountPageHeader
        title={room.title}
        description={room.Tutor?.display_name ?? course.title}
        icon={CalendarClock}
      />
      <LiveRoomShell
        room={room}
        currentProfileId={session.profileId ?? ''}
        courseHref={courseHref}
        invitePath={
          room.invite_code ? buildAcademyPath(storeSlug, `/classes/join/${room.invite_code}`) : null
        }
      />
    </div>
  );
}
