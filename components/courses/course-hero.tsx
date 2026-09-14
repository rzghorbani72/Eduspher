import Link from '@/components/ui/link';

import type { CourseSummary } from '@/lib/api/types';
import type { CourseContentStats } from '@/lib/courses/curriculum';
import { formatDate, toPersianDigits } from '@/lib/utils';
import { t } from '@/lib/i18n/server-translations';
import { isLiveCourse } from '@/lib/courses/live-course';
import { renderMarkdown } from '@/lib/markdown';
import type { LanguageCode } from '@/lib/i18n/config';
import { AppImage } from '@/components/ui/app-image';
import { CollapsibleHtml } from '@/components/courses/collapsible-html';

interface CourseHeroProps {
  course: CourseSummary;
  stats: CourseContentStats;
  language: LanguageCode;
  coursesHref: string;
  accessLabel: string;
  durationLabel: string;
  avatarUrl: string | null;
}

const DIFFICULTY_KEY: Record<string, string> = {
  BEGINNER: 'courses.beginner',
  INTERMEDIATE: 'courses.intermediate',
  ADVANCED: 'courses.advanced',
  EXPERT: 'courses.expert',
};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="cd-white-badge rounded-full px-3 py-1.5 text-[13px] font-bold">{children}</span>
);

/** Server-rendered so the title, summary and stats stay crawlable. */
export function CourseHero({
  course,
  stats,
  language,
  coursesHref,
  accessLabel,
  durationLabel,
  avatarUrl,
}: CourseHeroProps) {
  const translate = (key: string) => t(key, language);
  const updatedAt = course.updated_at ?? course.published_at ?? null;
  // Only the course type decides this: a recorded course never reads as live,
  // even if an old lesson still carries a live session.
  const isLive = isLiveCourse(course);
  const descriptionMarkdown = course.description?.trim() || course.short_description?.trim() || '';

  return (
    <section className="cd-hero relative -mt-8 overflow-hidden sm:-mt-10 lg:-mt-12">
      <div className="cd-hero-orb-left" />
      <div className="cd-hero-orb-right" />

      <div className="relative mx-auto max-w-[1240px] px-4 pt-10 pb-36 sm:px-6 lg:px-8">
        <nav
          aria-label="breadcrumb"
          className="cd-hero-breadcrumb mb-6 flex flex-wrap items-center gap-2 text-[13.5px]"
        >
          <Link href={coursesHref} className="transition-colors hover:text-white">
            {translate('pages.courseCatalogue')}
          </Link>
          {course.Category && (
            <>
              <span aria-hidden>/</span>
              <span className="cd-hero-breadcrumb-dim">{course.Category.name}</span>
            </>
          )}
          <span aria-hidden>/</span>
          <span className="font-semibold text-white">{course.title}</span>
        </nav>

        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          {isLive && (
            <span className="cd-live-badge flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-bold">
              <span className="cd-blink-dot h-2 w-2 rounded-full" />
              {translate('courses.liveCourse')}
            </span>
          )}
          {course.difficulty && (
            <Badge>{translate(DIFFICULTY_KEY[course.difficulty] ?? 'courses.beginner')}</Badge>
          )}
          <Badge>{accessLabel}</Badge>
          {course.is_certificate && <Badge>{translate('courses.certificate')}</Badge>}
          {course.is_featured && <Badge>{translate('courses.featured')}</Badge>}
          {updatedAt && (
            <Badge>
              {translate('courses.lastUpdated')}{' '}
              <span className="cd-price">
                {toPersianDigits(formatDate(updatedAt, language), language)}
              </span>
            </Badge>
          )}
        </div>

        <h1 className="m-0 max-w-[780px] text-[clamp(26px,4.6vw,46px)] leading-tight font-black tracking-tight">
          {course.title}
        </h1>

        {descriptionMarkdown ? (
          <CollapsibleHtml
            html={renderMarkdown(descriptionMarkdown)}
            className="prose-description cd-hero-desc mt-3.5 max-w-[680px] text-lg leading-relaxed"
            collapsedClassName="max-h-[7.5rem]"
            toggleClassName="text-white/90 hover:text-white"
          />
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-5">
          {course.rating != null && course.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#f5a623" aria-hidden>
                <path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 6.9L12 17.6 5.8 21l1.4-6.9L2 9.3l7-.8z" />
              </svg>
              <span className="cd-price text-base font-extrabold">
                {toPersianDigits(course.rating.toFixed(1), language)}
              </span>
              {course.rating_count ? (
                <span className="cd-hero-breadcrumb cd-price text-sm">
                  ({toPersianDigits(course.rating_count, language)}{' '}
                  {translate('courses.reviewsWord')})
                </span>
              ) : null}
            </div>
          )}

          {course.students_count != null && course.students_count > 0 ? (
            <div className="cd-hero-stat-dim flex items-center gap-1.5 text-sm">
              <span className="cd-price">
                {toPersianDigits(course.students_count.toLocaleString('en-US'), language)}
              </span>
              <span>{translate('courses.students')}</span>
            </div>
          ) : (
            <div className="cd-hero-stat-dim text-sm">{translate('courses.beFirstStudent')}</div>
          )}

          {stats.lessonCount > 0 && (
            <div className="cd-hero-stat-dim flex items-center gap-1.5 text-sm">
              <span className="cd-price">{toPersianDigits(stats.lessonCount, language)}</span>
              <span>
                {translate('courses.lessons')}
                {durationLabel ? ` · ${durationLabel}` : null}
              </span>
            </div>
          )}
        </div>

        {course.author && (
          <div className="mt-6 flex items-center gap-3">
            {avatarUrl ? (
              <AppImage
                src={avatarUrl}
                alt={course.author.display_name}
                preset="avatar"
                width={44}
                height={44}
                sizes="44px"
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="cd-teacher-avatar grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg font-extrabold text-white">
                {course.author.display_name.charAt(0)}
              </span>
            )}
            <div>
              <div className="cd-hero-meta text-xs">{translate('courses.instructor')}</div>
              <div className="text-base font-extrabold">{course.author.display_name}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
