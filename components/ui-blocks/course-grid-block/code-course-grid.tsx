import {
  COURSE_CARD_GRID_CLASS,
  COURSE_CARD_THUMB_CLASS,
} from '@/components/courses/course-card-layout';
import { CourseGridBlockProps, StaticCourse, THUMB_GRADIENTS } from './shared';

// ── Code (کدیار) — topic tabs + image-style course cards ─────────────────────

export const CODE_TOPICS = [
  'همه دوره‌ها',
  'JavaScript',
  'Python',
  'React & Next.js',
  'Node.js',
  'Docker & DevOps',
  'پایگاه‌داده',
  'هوش مصنوعی',
  'امنیت',
];

export const CODE_COURSES: StaticCourse[] = [
  {
    thumbLabel: 'Python',
    tag: '🐍 Python',
    title: 'Python برای همه — از صفر تا ساخت پروژه',
    instructor: 'علی محمدی',
    duration: '⏱ ۳۲ ساعت',
    level: 'مبتدی',
    rating: '۴.۸',
    ratingCount: '(۲,۱۰۴)',
    badge: 'جدید',
    price: '۸۵۰,۰۰۰ ت',
  },
  {
    thumbLabel: 'React',
    tag: '⚛️ React',
    title: 'React 18 + Next.js 14 — دوره کامل و پروژه‌محور',
    instructor: 'سارا احمدی',
    duration: '⏱ ۵۵ ساعت',
    level: 'متوسط',
    rating: '۴.۹',
    ratingCount: '(۵,۷۲۳)',
    badge: 'پرفروش',
    price: '۱,۴۰۰,۰۰۰ ت',
  },
  {
    thumbLabel: 'Node.js',
    tag: '🟢 Node.js',
    title: 'Node.js و Express — ساخت API و سرویس‌های حرفه‌ای',
    instructor: 'رضا کریمی',
    duration: '⏱ ۴۲ ساعت',
    level: 'متوسط',
    rating: '۴.۷',
    ratingCount: '(۱,۸۳۶)',
    price: '۱,۱۵۰,۰۰۰ ت',
  },
  {
    thumbLabel: 'Docker',
    tag: '🐋 Docker',
    title: 'Docker و Kubernetes — استقرار حرفه‌ای اپلیکیشن',
    instructor: 'مهسا صادقی',
    duration: '⏱ ۲۸ ساعت',
    level: 'پیشرفته',
    rating: '۴.۸',
    ratingCount: '(۹۴۱)',
    badge: 'جدید',
    price: '۱,۳۵۰,۰۰۰ ت',
  },
  {
    thumbLabel: 'AI',
    tag: '🤖 هوش مصنوعی',
    title: 'Machine Learning با Python — عملی و پروژه‌محور',
    instructor: 'کاوه ناصری',
    duration: '⏱ ۳۸ ساعت',
    level: 'متوسط',
    rating: '۴.۹',
    ratingCount: '(۳,۴۰۱)',
    badge: 'پرفروش',
    price: '۱,۶۰۰,۰۰۰ ت',
  },
  {
    thumbLabel: 'SQL',
    tag: '🗄️ پایگاه‌داده',
    title: 'SQL و PostgreSQL — از صفر تا مدیریت پروژه',
    instructor: 'نیلوفر رستمی',
    duration: '⏱ ۲۴ ساعت',
    level: 'مبتدی',
    rating: '۴.۶',
    ratingCount: '(۷۶۸)',
    price: '۷۵۰,۰۰۰ ت',
  },
];

export function CodeCourseGrid({ id, config }: CourseGridBlockProps) {
  const label = config?.label || 'پرطرفدارترین دوره‌ها';
  const title = config?.title || 'با بهترین دوره‌ها یادگیری را شروع کن';
  const viewAllText = config?.viewAllText || 'مشاهده همه ←';
  const topics = config?.topics?.length ? config.topics : CODE_TOPICS;
  const courses = config?.courses?.length ? config.courses : CODE_COURSES;

  return (
    <>
      <div className="border-y border-(--theme-border-color) bg-(--theme-surface-alt)">
        <div className="mx-auto flex max-w-[1240px] items-center gap-1 overflow-x-auto px-[48px] [scrollbar-width:none]">
          {topics.map((topic, i) => (
            <span
              key={i}
              className={
                i === 0
                  ? 'shrink-0 border-b-[2.5px] border-(--theme-primary) px-[18px] py-[16px] text-[13.5px] font-semibold text-(--theme-primary)'
                  : 'shrink-0 border-b-[2.5px] border-transparent px-[18px] py-[16px] text-[13.5px] font-semibold text-(--theme-muted)'
              }
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <section id={id || 'courses'} className="bg-(--theme-background) py-[72px]">
        <div className="mx-auto max-w-[1240px] px-[48px]">
          <div className="mb-[32px] flex flex-wrap items-end justify-between gap-[20px]">
            <div>
              <div className="mb-[6px] text-[11px] font-bold tracking-[0.08em] text-(--theme-primary) uppercase">
                {label}
              </div>
              <div className="text-[28px] font-bold text-(--theme-foreground)">{title}</div>
            </div>
            <span className="text-[13.5px] font-semibold text-(--theme-primary)">
              {viewAllText}
            </span>
          </div>

          <div className={COURSE_CARD_GRID_CLASS}>
            {courses.map((course, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-card-bg) transition-transform duration-200 hover:-translate-y-1"
              >
                <div className={COURSE_CARD_THUMB_CLASS}>
                  <div
                    className={`flex h-full items-center justify-center ${THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]}`}
                  >
                    <span className="text-[12px] font-semibold text-white/85">
                      {course.thumbLabel}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-[12px]">
                    {course.duration && (
                      <span className="rounded-full bg-black/60 px-[9px] py-1 text-[10.5px] font-semibold text-white backdrop-blur-sm">
                        {course.duration}
                      </span>
                    )}
                    {course.level && (
                      <span className="rounded-full bg-(--theme-accent-subtle) px-[9px] py-1 text-[10.5px] font-bold text-(--theme-accent)">
                        {course.level}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-[18px]">
                  <span className="mb-[10px] inline-flex items-center gap-[5px] rounded-full bg-(--theme-primary-subtle) px-[10px] py-[3px] text-[11px] font-bold text-(--theme-primary)">
                    {course.tag}
                  </span>
                  <div className="mb-[5px] text-[15px] leading-[1.45] font-bold text-(--theme-foreground)">
                    {course.title}
                  </div>
                  <div className="mb-[14px] flex items-center gap-[6px] text-[12px] text-(--theme-muted)">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-(--theme-primary-subtle) text-[10px] font-bold text-(--theme-primary)">
                      {course.instructor?.[0]}
                    </span>
                    {course.instructor}
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-(--theme-border-color) pt-[12px]">
                    <div className="flex items-center gap-1 text-[12.5px] font-bold text-(--theme-foreground)">
                      <span className="text-[12px] text-(--theme-accent)">★★★★★</span>
                      <span>{course.rating}</span>
                      <span className="text-[11.5px] font-normal text-(--theme-muted)">
                        {course.ratingCount}
                      </span>
                    </div>
                    {course.badge && (
                      <span className="rounded-full bg-(--theme-accent-subtle) px-[8px] py-[2px] text-[10px] font-bold text-(--theme-accent)">
                        {course.badge}
                      </span>
                    )}
                    <div className="text-[16px] font-bold text-(--theme-primary)">
                      {course.price}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
