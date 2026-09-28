'use client';

import { PanelRightClose } from 'lucide-react';
import { useMemo, useState } from 'react';

import { FreePreviewBanner } from '@/components/learning/free-preview-banner';
import { LearningCurriculum } from '@/components/learning/learning-curriculum';
import { LessonBody } from '@/components/learning/lesson-body';
import { LessonHeader } from '@/components/learning/lesson-header';
import { LessonNavFooter } from '@/components/learning/lesson-nav-footer';
import { MetaDot } from '@/components/learning/meta-dot';
import { LearningTopBar } from '@/components/learning/learning-top-bar';
import { Unavailable } from '@/components/learning/unavailable';
import { QuizBlockedNotice } from '@/components/learning/quiz-blocked-notice';
import { CourseWorkDialog } from '@/components/learning/course-work/course-work-dialog';
import type { CourseWork } from '@/components/learning/course-work/course-work';
import type { LessonQuizSummary, LessonSummary, SeasonSummary } from '@/lib/api/types';
import { getLearningLesson, getProgress } from '@/lib/api/learning';
import { useLessonProgress } from '@/hooks/use-lesson-progress';
import { useQuizGates } from '@/hooks/use-quiz-gates';
import { useAssignmentScores } from '@/hooks/use-assignment-scores';
import { useApiQuery } from '@/hooks/use-api-query';
import { useTheaterMode } from '@/lib/hooks/use-theater-mode';
import { useTranslation } from '@/lib/i18n/hooks';
import { flattenLessons, neighboursOf, watchPercent } from '@/lib/learning/lesson-list';
import { buildAcademyPath, cn, resolveAssetUrl, toPersianDigits } from '@/lib/utils';
import { formatSeconds } from '@/components/courses/curriculum/format';
import { coursePath, learnPath } from '@/lib/content-paths';

interface LearningShellProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  seasons: SeasonSummary[];
  /** The course's own quiz (e.g. the final exam), shown after the last season. */
  courseQuiz: LessonQuizSummary | null;
  selectedLesson: LessonSummary;
  /** Null when a free lesson is being watched without an enrollment. */
  enrollmentId: string | null;
  currentProfileId: string;
  /** Shown in the top bar; the design names the student watching. */
  studentName: string | null;
  storeSlug: string | null;
  /** The course's teacher, shown on a live lesson's stage. */
  teacherName: string | null;
}

export function LearningShell({
  courseId,
  courseSlug,
  courseTitle,
  seasons,
  courseQuiz,
  selectedLesson,
  enrollmentId,
  currentProfileId,
  studentName,
  storeSlug,
  teacherName,
}: LearningShellProps) {
  const { t, language } = useTranslation();
  const { theater, setTheater } = useTheaterMode();
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [openWork, setOpenWork] = useState<CourseWork | null>(null);
  const lessonId = String(selectedLesson.id);

  const openCurriculum = () => {
    setTheater(false);
    setCurriculumOpen(true);
  };
  const toggleCurriculum = () => {
    if (theater) {
      openCurriculum();
      return;
    }
    setCurriculumOpen((open) => !open);
  };
  const {
    data: lesson,
    error,
    isLoading,
  } = useApiQuery({
    queryKey: ['learning-lesson', lessonId],
    queryFn: (signal) => getLearningLesson(lessonId, { signal }),
  });
  const { data: courseProgress, refresh: refreshCourseProgress } = useApiQuery({
    queryKey: ['course-progress', courseId],
    queryFn: (signal) => getProgress({ courseId }, { signal }),
  });

  const flatLessons = useMemo(() => flattenLessons(seasons), [seasons]);
  const { previous, next, current } = neighboursOf(flatLessons, lessonId);
  const { gates, refresh: refreshGates } = useQuizGates(courseId, enrollmentId !== null);
  const blockedBy = gates[lessonId] ?? null;
  const assignmentScores = useAssignmentScores(courseId, enrollmentId !== null);
  const blockingLesson = blockedBy
    ? flatLessons.find((item) => item.id === blockedBy.lesson_id)
    : undefined;

  const type = (lesson?.lesson_type ?? selectedLesson.lesson_type ?? 'TEXT').toUpperCase();
  const { progress, initialPosition, heartbeat, complete, saving, saveFailed } = useLessonProgress(
    enrollmentId,
    lessonId,
    {
      useVideoHeartbeat: type === 'VIDEO' || type === 'AUDIO',
    },
  );

  const completedLessonIds = new Set(
    courseProgress?.progress
      .filter((item) => item.status === 'COMPLETED')
      .map((item) => item.lesson_id) ?? [],
  );
  if (progress?.status === 'COMPLETED') completedLessonIds.add(lessonId);
  const percent = watchPercent(flatLessons, [
    ...(courseProgress?.progress ?? []),
    ...(progress ? [progress] : []),
  ]);

  const markComplete = async () => {
    const saved = await complete();
    if (saved) await refreshCourseProgress();
    return saved;
  };

  const onQuizPassed = async () => {
    await Promise.all([refreshGates(), refreshCourseProgress()]);
  };

  // The server resolves this: the allow_download_* flags are per access route,
  // so only the backend knows which one applies to THIS student. Reading the
  // raw flags here would offer a download the server then refuses.
  const seasonTitle =
    seasons.find((season) => (season.Lesson ?? []).some((item) => String(item.id) === lessonId))
      ?.title ?? null;

  const courseSeconds = seasons.reduce(
    (total, season) =>
      total + (season.Lesson ?? []).reduce((sum, item) => sum + (item.duration ?? 0), 0),
    0,
  );

  const canDownload = lesson?.can_download === true;
  const videoDownloadUrl = lesson?.video_download_url ?? null;
  const isPreviewing = enrollmentId === null;

  const header = (
    <LessonHeader
      lessonTitle={selectedLesson.title}
      seasonTitle={seasonTitle}
      position={current?.index ?? 0}
      total={flatLessons.length}
      curriculumOpen={curriculumOpen}
      onToggleCurriculum={toggleCurriculum}
      downloadUrl={canDownload ? resolveAssetUrl(videoDownloadUrl) : null}
    />
  );

  // A media lesson's slot is the player box, so it stays black while it loads
  // rather than flashing a pale block where the picture is about to appear.
  const mediaStage = type === 'VIDEO' || type === 'LIVE';

  const body = isLoading ? (
    <>
      <div
        className={cn(
          'grid aspect-video w-full place-items-center rounded-[10px]',
          mediaStage ? 'bg-[#0d0c0c] text-sm text-white/70' : 'bg-surface-alt animate-pulse',
        )}
      >
        {mediaStage ? t('learning.videoLoading') : null}
      </div>
      {header}
    </>
  ) : blockedBy ? (
    <>
      {header}
      <QuizBlockedNotice
        gate={blockedBy}
        quizLessonHref={
          blockingLesson
            ? buildAcademyPath(
                storeSlug,
                learnPath(courseSlug, blockingLesson.lesson.slug ?? blockingLesson.id),
              )
            : null
        }
        onOpenSeasonQuiz={(seasonId) =>
          setOpenWork({
            type: 'quiz',
            parent: { kind: 'season', id: seasonId },
            title: blockedBy.title,
          })
        }
        t={t}
      />
    </>
  ) : error || !lesson ? (
    <>
      {header}
      <div className="pt-6">
        <Unavailable message={t('learning.lessonUnavailable')} tone="error" />
      </div>
    </>
  ) : (
    <LessonBody
      lesson={lesson}
      lessonId={lessonId}
      type={type}
      currentProfileId={currentProfileId}
      enrollmentId={enrollmentId}
      initialPosition={initialPosition}
      onHeartbeat={heartbeat}
      canDownload={canDownload}
      teacherName={teacherName}
      header={header}
      storeSlug={storeSlug}
      onQuizPassed={() => void onQuizPassed()}
    />
  );

  return (
    <div className="border-theme bg-background mx-auto max-w-[1500px] overflow-hidden rounded-2xl border shadow-sm">
      <LearningTopBar
        courseHref={buildAcademyPath(storeSlug, coursePath(courseSlug))}
        courseTitle={courseTitle}
        percent={isPreviewing ? null : percent}
        studentName={studentName}
      />

      <div
        className={cn(
          'grid items-start',
          theater ? 'grid-cols-1' : 'lg:grid-cols-[minmax(0,1fr)_372px]',
        )}
        data-theater={theater ? 'on' : 'off'}
      >
        <main className="min-w-0 px-4 pt-[26px] pb-10 sm:px-8">
          {isPreviewing ? (
            <div className="mb-5">
              <FreePreviewBanner courseSlug={courseSlug} storeSlug={storeSlug} />
            </div>
          ) : null}

          {body}

          {saveFailed ? (
            <p role="alert" className="mt-4 text-end text-sm text-red-600">
              {t('learning.progressSaveFailed')}
            </p>
          ) : null}
        </main>

        {/* Below lg the curriculum is a bottom sheet, so the lesson keeps the
            full width until the student asks for the list. */}
        {curriculumOpen ? (
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={() => setCurriculumOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        ) : null}

        <aside
          data-testid="learning-curriculum-rail"
          className={cn(
            'border-theme bg-card',
            curriculumOpen
              ? 'fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-hidden rounded-t-2xl shadow-2xl'
              : 'hidden',
            theater
              ? 'lg:hidden'
              : 'lg:sticky lg:inset-x-auto lg:top-24 lg:bottom-auto lg:z-auto lg:block lg:max-h-none lg:rounded-none lg:border-s lg:shadow-none',
          )}
        >
          <div className="grid place-items-center pt-2.5 lg:hidden">
            <span className="bg-border h-1 w-10 rounded-full" aria-hidden="true" />
          </div>
          <div className="border-theme border-b px-[22px] py-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[15px] font-extrabold">{t('learning.curriculum')}</h2>
              <button
                type="button"
                onClick={() => setCurriculumOpen(false)}
                className="text-muted hover:bg-surface rounded-md p-1 lg:hidden"
                aria-label={t('common.close')}
              >
                <PanelRightClose className="size-4" aria-hidden="true" />
              </button>
            </div>
            {/* Progress needs an enrollment to be recorded against, so a preview
                visitor is shown the lesson list without a permanent 0%. */}
            {isPreviewing ? null : (
              <>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-(--theme-border-color)"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-(--theme-primary) transition-[width] duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-muted mt-2 flex flex-wrap items-center text-xs">
                  <span>
                    {t('learning.progressSummary')
                      .replace('{done}', toPersianDigits(completedLessonIds.size, language))
                      .replace('{total}', toPersianDigits(flatLessons.length, language))}
                  </span>
                  {courseSeconds > 0 ? (
                    <>
                      <MetaDot />
                      <span>{formatSeconds(courseSeconds, language, t)}</span>
                    </>
                  ) : null}
                </p>
              </>
            )}
          </div>

          <div className="max-h-[65vh] overflow-y-auto">
            <LearningCurriculum
              courseId={courseId}
              courseSlug={courseSlug}
              courseQuiz={courseQuiz}
              onOpenWork={(work) => {
                setCurriculumOpen(false);
                setOpenWork(work);
              }}
              seasons={seasons}
              selectedLessonId={lessonId}
              completedLessonIds={completedLessonIds}
              quizGates={gates}
              assignmentScores={assignmentScores}
              storeSlug={storeSlug}
              lessonLabel={t('learning.curriculum')}
              language={language}
              t={t}
            />
          </div>
        </aside>
      </div>

      <CourseWorkDialog
        work={openWork}
        onClose={() => setOpenWork(null)}
        currentProfileId={currentProfileId}
        storeSlug={storeSlug}
        onQuizPassed={() => void onQuizPassed()}
      />

      <LessonNavFooter
        courseSlug={courseSlug}
        storeSlug={storeSlug}
        previous={previous}
        next={next}
        nextLockedBy={next ? (gates[next.id] ?? null) : null}
        isCompleted={progress?.status === 'COMPLETED'}
        saving={saving}
        onComplete={markComplete}
        canTrackProgress={!isPreviewing}
      />
    </div>
  );
}
