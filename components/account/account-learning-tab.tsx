"use client";

import type { ReactNode } from "react";
import useSWR from "swr";
import {
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  UserRoundCheck,
} from "lucide-react";

import Link from "@/components/ui/link";
import type { EnrollmentSummary } from "@/lib/api/types";
import {
  getLearningSummary,
  listAssignments,
  listSubmissions,
  listTutoringEngagements,
} from "@/lib/api/learning";
import { useTranslation } from "@/lib/i18n/hooks";
import { buildAcademyPath } from "@/lib/utils";

export type LearningAccountTab =
  | "progress"
  | "work"
  | "classes"
  | "results"
  | "tutoring";

interface LiveLessonLink {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
}

interface AccountLearningTabProps {
  tab: LearningAccountTab;
  enrollments: EnrollmentSummary[];
  liveLessons: LiveLessonLink[];
  storeSlug: string | null;
}

export function AccountLearningTab({
  tab,
  enrollments,
  liveLessons,
  storeSlug,
}: AccountLearningTabProps) {
  const { t, language } = useTranslation();
  const enrollmentIds = enrollments.map((item) => String(item.id));
  const courseIds = enrollments.map((item) => String(item.course_id));
  const needsWork = tab === "work" || tab === "results";

  const { data, error, isLoading } = useSWR(
    needsWork ? `account-work:${courseIds.join(",")}:${enrollmentIds.join(",")}` : null,
    async () => {
      const [assignmentResponses, submissionResponses] = await Promise.all([
        Promise.all(courseIds.map((courseId) => listAssignments({ courseId }))),
        Promise.all(
          enrollmentIds.map((enrollmentId) => listSubmissions({ enrollmentId })),
        ),
      ]);
      return {
        assignments: assignmentResponses.flatMap((item) => item.assignments),
        submissions: submissionResponses.flatMap((item) => item.submissions),
      };
    },
  );

  const {
    data: summary,
    error: summaryError,
    isLoading: summaryLoading,
  } = useSWR(tab === "progress" ? "account-learning-summary" : null, () =>
    getLearningSummary(),
  );

  const {
    data: tutoring,
    error: tutoringError,
    isLoading: tutoringLoading,
  } = useSWR(tab === "tutoring" ? "account-tutoring-engagements" : null, () =>
    listTutoringEngagements(),
  );

  if (tab === "progress") {
    if (summaryLoading) {
      return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
    }
    if (summaryError) {
      return <Unavailable text={t("account.learningDataUnavailable")} />;
    }

    const rows =
      summary?.enrollments?.length
        ? summary.enrollments
        : enrollments.map((enrollment) => ({
            id: String(enrollment.id),
            course_id: String(enrollment.course_id),
            progress_percent: enrollment.progress_percent,
            status: enrollment.status,
            last_accessed: enrollment.last_accessed,
            video_heartbeats: 0,
            Course: enrollment.course
              ? { id: String(enrollment.course.id), title: enrollment.course.title }
              : null,
          }));

    return (
      <TabSection title={t("account.myProgress")} icon={BookOpenCheck}>
        {rows.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {rows.map((row) => (
              <Link
                key={row.id}
                href={buildAcademyPath(storeSlug, `/learn/${row.course_id}`)}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40"
              >
                <p className="font-semibold">
                  {row.Course?.title ?? t("account.unknown")}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, Math.max(0, row.progress_percent))}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>
                    {Math.round(row.progress_percent)}% {t("account.complete")}
                  </span>
                  {"video_heartbeats" in row && row.video_heartbeats > 0 ? (
                    <span>
                      {row.video_heartbeats} {t("account.videoSessions")}
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Unavailable text={t("account.noProgressYet")} />
        )}
      </TabSection>
    );
  }

  if (tab === "classes") {
    return (
      <TabSection title={t("account.myClasses")} icon={CalendarClock}>
        {liveLessons.length ? (
          <div className="space-y-3">
            {liveLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={buildAcademyPath(
                  storeSlug,
                  `/learn/${lesson.courseId}/${lesson.id}`,
                )}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
              >
                <span>
                  <span className="block font-medium">{lesson.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {lesson.courseTitle}
                  </span>
                </span>
                <span className="text-sm font-semibold text-primary">
                  {t("account.openClass")}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <Unavailable text={t("account.noClasses")} />
        )}
      </TabSection>
    );
  }

  if (tab === "tutoring") {
    if (tutoringLoading) {
      return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
    }
    if (tutoringError) {
      return <Unavailable text={t("account.learningDataUnavailable")} />;
    }

    const active = (tutoring ?? []).filter(
      (item) => item.status === "ACTIVE" || item.status === "PENDING",
    );

    return (
      <TabSection title={t("account.privateTutoring")} icon={UserRoundCheck}>
        {active.length ? (
          <div className="space-y-3">
            {active.map((engagement) => {
              const endsAt = engagement.ends_at
                ? new Intl.DateTimeFormat(language, {
                    dateStyle: "medium",
                  }).format(new Date(engagement.ends_at))
                : null;
              return (
                <div
                  key={engagement.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {engagement.Course?.title ?? t("account.unknown")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t("account.tutorLabel")}:{" "}
                        {engagement.Tutor?.display_name ?? t("account.unknown")}
                      </p>
                      {endsAt ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("account.tutoringEnds")}: {endsAt}
                        </p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {engagement.status === "ACTIVE"
                        ? t("account.tutoringActive")
                        : t("account.tutoringPending")}
                    </span>
                  </div>
                  <Link
                    href={buildAcademyPath(
                      storeSlug,
                      `/learn/${engagement.course_id}`,
                    )}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {t("account.openTutoringCourse")}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <Unavailable text={t("account.noPrivateTutoring")} />
        )}
      </TabSection>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }
  if (error) {
    return <Unavailable text={t("account.learningDataUnavailable")} />;
  }

  const submissionsByAssignment = new Map(
    (data?.submissions ?? []).map((submission) => [
      submission.assignment_id,
      submission,
    ]),
  );

  if (tab === "work") {
    return (
      <TabSection title={t("account.myWork")} icon={ClipboardList}>
        {data?.assignments.length ? (
          <div className="space-y-3">
            {data.assignments.map((assignment) => {
              const submission = submissionsByAssignment.get(assignment.id);
              const courseId = assignment.Lesson?.Season?.course_id;
              return (
                <Link
                  key={assignment.id}
                  href={
                    courseId
                      ? buildAcademyPath(
                          storeSlug,
                          `/learn/${courseId}/${assignment.lesson_id}`,
                        )
                      : buildAcademyPath(storeSlug, "/account?tab=work")
                  }
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
                >
                  <span className="font-medium">{assignment.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {submission
                      ? t("learning.submitted")
                      : t("account.notSubmitted")}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <Unavailable text={t("account.noWork")} />
        )}
      </TabSection>
    );
  }

  const graded = (data?.submissions ?? []).filter(
    (item) => item.status === "GRADED",
  );
  return (
    <TabSection title={t("account.results")} icon={CheckCircle2}>
      {graded.length ? (
        <div className="space-y-3">
          {graded.map((submission) => (
            <div
              key={submission.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex justify-between gap-4">
                <p className="font-medium">{submission.Assignment?.title}</p>
                <p className="font-semibold text-primary">
                  {submission.score} / {submission.Assignment?.max_score}
                </p>
              </div>
              {submission.feedback ? (
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {submission.feedback}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <Unavailable text={t("account.noResults")} />
      )}
    </TabSection>
  );
}

function TabSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof BookOpenCheck;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Icon className="size-6 text-primary" aria-hidden="true" />
        {title}
      </h1>
      {children}
    </section>
  );
}

function Unavailable({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
