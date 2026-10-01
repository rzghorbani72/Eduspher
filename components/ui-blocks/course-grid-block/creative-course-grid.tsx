import {
  COURSE_CARD_GRID_CLASS,
  COURSE_CARD_THUMB_CLASS,
} from '@/components/courses/course-card-layout';
import { CourseGridBlockProps, StaticCourse } from './shared';

// ── Creative (استودیوی خلاق) — 4-up class cards with play overlay ─────────────

export const CREATIVE_CG_GRADIENTS = [
  'bg-[linear-gradient(135deg,var(--theme-primary),color-mix(in_srgb,var(--theme-primary)_40%,var(--theme-secondary)))]',
  'bg-[linear-gradient(135deg,var(--theme-accent),color-mix(in_srgb,var(--theme-accent)_55%,var(--theme-primary)))]',
  'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--theme-primary)_65%,var(--theme-accent)),var(--theme-secondary))]',
  'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--theme-accent)_70%,var(--theme-primary)),color-mix(in_srgb,var(--theme-primary)_50%,var(--theme-secondary)))]',
];

export const CREATIVE_COURSES: StaticCourse[] = [
  {
    tag: 'تصویرسازی',
    title: 'پروکریت: خلاقیت خودت را شروع کن',
    instructor: 'لیسا باردوت',
    lessons: '۴۸ درس',
    rating: '۴.۹',
    stars: '★★★★★',
    ratingCount: '(۲.۱هزار)',
  },
  {
    tag: 'طراحی',
    title: 'UI/UX: از وایرفریم تا پیکسل',
    instructor: 'دانیل اسکات',
    lessons: '۶۲ درس',
    rating: '۴.۸',
    stars: '★★★★★',
    ratingCount: '(۳.۴هزار)',
  },
  {
    tag: 'عکاسی',
    title: 'عکاسی پرتره با نور طبیعی',
    instructor: 'جوردی واندپوت',
    lessons: '۳۴ درس',
    rating: '۴.۷',
    stars: '★★★★☆',
    ratingCount: '(۹۸۰)',
  },
  {
    tag: 'انیمیشن',
    title: 'موشن گرافیک: بوت‌کمپ After Effects',
    instructor: 'ایمونی لاروسا',
    lessons: '۵۵ درس',
    rating: '۴.۹',
    stars: '★★★★★',
    ratingCount: '(۱.۷هزار)',
  },
];

export function CreativeCourseGrid({ id, config }: CourseGridBlockProps) {
  const title = config?.title || 'کلاس‌های ویژه تصویرسازی';
  const viewAllText = config?.viewAllText || '← مشاهده همه';
  const courses = config?.courses?.length ? config.courses : CREATIVE_COURSES;

  return (
    <section id={id || 'courses'} className="bg-(--theme-background) py-[64px]">
      <div className="mx-auto max-w-[1200px] px-[40px]">
        <div className="mb-[32px] flex items-center justify-between">
          <div className="text-[22px] font-black text-(--theme-foreground)">{title}</div>
          <span className="text-[14px] font-extrabold text-(--theme-primary)">{viewAllText}</span>
        </div>

        <div className={COURSE_CARD_GRID_CLASS}>
          {courses.map((course, i) => (
            <div
              key={i}
              className="group overflow-hidden rounded-(--theme-border-radius) border-2 border-(--theme-border-color) bg-(--theme-surface) transition-all duration-200 hover:-translate-y-1 hover:border-(--theme-primary)"
            >
              <div className={COURSE_CARD_THUMB_CLASS}>
                <div
                  className={`h-full w-full ${CREATIVE_CG_GRADIENTS[i % CREATIVE_CG_GRADIENTS.length]}`}
                />
                <span className="absolute top-3 right-3 rounded-full bg-(--theme-primary) px-[10px] py-[4px] text-[10px] font-extrabold text-(--theme-on-primary)">
                  {course.tag}
                </span>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[16px] text-black">
                    ▶
                  </span>
                </div>
              </div>
              <div className="p-[16px]">
                <div className="mb-[6px] text-[13px] leading-[1.5] font-extrabold text-(--theme-foreground)">
                  {course.title}
                </div>
                <div className="mb-[10px] text-[12px] font-semibold text-(--theme-muted)">
                  {course.instructor}
                </div>
                <div className="flex flex-wrap items-center gap-[8px]">
                  <span className="rounded-full bg-(--theme-surface-alt) px-[10px] py-[3px] text-[11px] font-bold text-(--theme-muted)">
                    {course.lessons}
                  </span>
                  <span className="text-[12px] font-extrabold text-(--theme-accent)">
                    {course.rating}
                  </span>
                  <span className="text-[11px] text-(--theme-accent)">{course.stars}</span>
                  <span className="text-[11px] text-(--theme-muted)">{course.ratingCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
