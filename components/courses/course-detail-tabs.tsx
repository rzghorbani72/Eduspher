'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';
import { isLiveCourse } from '@/lib/courses/live-course';
import type { CourseSummary } from '@/lib/api/types';
import type { CourseTabKey } from '@/lib/courses/course-tabs';
import type { CourseTopic } from '@/lib/api/account-types';
import { buildContentStats, buildCurriculum } from '@/lib/courses/curriculum';
import { CourseOverview } from '@/components/courses/course-overview';
import { CourseCurriculum } from '@/components/courses/curriculum';
import { CourseLiveSchedule } from '@/components/courses/course-live-schedule';
import { CourseInstructor } from '@/components/courses/course-instructor';
import { CourseReviews } from '@/components/courses/course-reviews';
import { CourseQnA } from '@/components/courses/course-qna';

interface CourseDetailTabsProps {
  course: CourseSummary;
  isLoggedIn: boolean;
  previewBasePath: string | null;
  /** The student owns the recorded lessons — the curriculum opens instead of locking. */
  hasLessonAccess?: boolean;
  prerequisiteHref: string | null;
  instructorAvatarUrl: string | null;
  /** Live-course syllabus, shown when there are no recorded lessons. */
  topics?: CourseTopic[];
  /** Live classes, under the overview; kept mounted so the `?class=` enroll resume always works. */
  classes?: ReactNode;
  /** Live course: the student's chat with the teacher, shown on the teacher tab. */
  teacherChat?: ReactNode;
  initialTab?: TabKey;
}

type TabKey = CourseTabKey;

export function CourseDetailTabs({
  course,
  isLoggedIn,
  previewBasePath,
  hasLessonAccess = false,
  prerequisiteHref,
  instructorAvatarUrl,
  topics = [],
  classes,
  teacherChat,
  initialTab = 'overview',
}: CourseDetailTabsProps) {
  const { t } = useTranslation();
  const seasons = useMemo(() => buildCurriculum(course), [course]);
  const stats = useMemo(
    () => buildContentStats(seasons, course.lessons_count, course.duration),
    [seasons, course.lessons_count, course.duration],
  );

  const tabs = useMemo<{ key: TabKey; label: string }[]>(
    () => [
      { key: 'overview', label: t('courses.tabIntro') },
      { key: 'instructor', label: t('courses.tabInstructor') },
      { key: 'reviews', label: t('courses.tabReviews') },
    ],
    [t],
  );
  const isLive = isLiveCourse(course);
  // A recorded course has no live timetable, even if an old lesson still carries a live session.
  const showLiveSchedule = isLive && stats.liveCount > 0;
  const showSyllabus = !isLive || seasons.length > 0 || topics.length > 0;

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  return (
    <div className="space-y-7">
      <div role="tablist" className="cd-tabs flex rounded-full p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 cursor-pointer rounded-full px-2 py-2 text-[13px] whitespace-nowrap transition-colors duration-200',
                isActive
                  ? 'cd-tab-on font-bold'
                  : 'text-(--theme-muted) hover:text-(--theme-foreground)',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-10">
          <CourseOverview
            course={course}
            stats={stats}
            prerequisiteHref={prerequisiteHref}
            showFacts={isLive}
          />
          {showSyllabus && (
            <CourseCurriculum
              seasons={seasons}
              stats={stats}
              previewBasePath={previewBasePath}
              hasLessonAccess={hasLessonAccess}
              topics={topics}
            />
          )}
          {showLiveSchedule && <CourseLiveSchedule seasons={seasons} />}
        </div>
      )}
      {classes ? <div hidden={activeTab !== 'overview'}>{classes}</div> : null}

      {activeTab === 'instructor' && (
        <div className="space-y-6">
          <CourseInstructor
            author={course.author ?? course.Profile ?? null}
            avatarUrl={instructorAvatarUrl}
            rating={course.rating ?? null}
            studentsCount={course.students_count ?? null}
          />
          {teacherChat}
        </div>
      )}

      {activeTab === 'reviews' && <CourseReviews courseId={course.id} isLoggedIn={isLoggedIn} />}

      <div className="border-t border-(--theme-border-color) pt-8">
        <CourseQnA courseId={course.id} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
