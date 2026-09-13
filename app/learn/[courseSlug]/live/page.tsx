import { CalendarClock } from "lucide-react";
import { redirect } from "next/navigation";

import { AccountPageHeader } from "@/components/account/account-page-header";
import { LiveRoomShell } from "@/components/live/live-room-shell";
import { getMyLiveRoomForCourse } from "@/lib/api/account-server";
import { getCourseById } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { coursePath, decodePathSegment, learnPath } from "@/lib/content-paths";
import { getAcademyContext } from "@/lib/store-context";
import { buildAcademyPath } from "@/lib/utils";

/**
 * The live classroom of a course, at the same address family as the recorded
 * learn page. The backend decides membership on every request; a student who
 * holds no seat here is sent back to the sales page.
 */
export default async function LiveLearningPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug: courseSlugParam } = await params;
  const courseSlug = decodePathSegment(courseSlugParam);
  const [session, storeContext] = await Promise.all([
    getSession(),
    getAcademyContext(),
  ]);
  const storeSlug = storeContext.isSubdomain ? null : storeContext.slug;

  if (!session) {
    const returnPath = buildAcademyPath(
      storeSlug,
      `${learnPath(courseSlug)}/live`,
    );
    redirect(
      `${buildAcademyPath(storeSlug, "/auth/login")}?redirect=${encodeURIComponent(returnPath)}`,
    );
  }

  const course = await getCourseById(courseSlug).catch(() => null);
  if (!course) redirect(buildAcademyPath(storeSlug, coursePath(courseSlug)));

  const room = await getMyLiveRoomForCourse(course.id);
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
        currentProfileId={session.profileId ?? ""}
        courseHref={buildAcademyPath(storeSlug, coursePath(course.slug))}
        invitePath={
          room.invite_code
            ? buildAcademyPath(storeSlug, `/classes/join/${room.invite_code}`)
            : null
        }
      />
    </div>
  );
}
