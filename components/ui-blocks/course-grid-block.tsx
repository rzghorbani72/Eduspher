import {
  COURSE_CARD_GRID_CLASS,
  COURSE_CARD_THUMB_CLASS,
} from '@/components/courses/course-card-layout';
import { PlaceholderCard } from './slot-grid';
import { resolveSlots } from '@/lib/slot-config';
import { getCurrentAcademy } from '@/lib/api/server';
import { getAcademyLanguage } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/server-translations';
import { CodeCourseGrid } from './course-grid-block/code-course-grid';
import { CreativeCourseGrid } from './course-grid-block/creative-course-grid';
import { CourseGridBlockProps, StaticCourse, THUMB_GRADIENTS } from './course-grid-block/shared';

const DEFAULT_PILLS = ['همه دوره‌ها', 'طراحی', 'توسعه', 'کسب‌وکار', 'بازاریابی', 'داده'];

const DEFAULT_COURSES: StaticCourse[] = [
  {
    thumbLabel: 'فیگما',
    tag: 'طراحی',
    title: 'فیگما: مبانی متخصص',
    instructor: 'سارا چن · ۱۱ درس · ۳ واحد',
    duration: '۴ ساعت ۳۲ دقیقه',
    rating: '۴.۹',
    ratingCount: '(۳۴۲)',
    students: '۲.۱هزار ثبت‌نام',
  },
  {
    thumbLabel: 'ری‌اکت',
    tag: 'تکنولوژی',
    title: 'ری‌اکت و تایپ‌اسکریپت کامل',
    instructor: 'الکس کیم · ۱۳ درس · ۴ واحد',
    duration: '۶ ساعت ۱۰ دقیقه',
    rating: '۴.۸',
    ratingCount: '(۱۹۸)',
    students: '۱.۸هزار ثبت‌نام',
  },
  {
    thumbLabel: 'برند',
    tag: 'کسب‌وکار',
    title: 'استراتژی برند از پایه',
    instructor: 'میا تورز · ۹ درس · ۳ واحد',
    duration: '۳ ساعت ۴۸ دقیقه',
    rating: '۴.۷',
    ratingCount: '(۸۷)',
    students: '۹۴۰ ثبت‌نام',
  },
];

export async function CourseGridBlock({ id, config }: CourseGridBlockProps) {
  const currentAcademy = await getCurrentAcademy().catch(() => null);
  const language = getAcademyLanguage(
    currentAcademy?.language || null,
    currentAcademy?.country_code || null,
  );
  const tr = (key: string) => t(key, language);

  if (config?.style === 'code') return <CodeCourseGrid id={id} config={config} />;
  if (config?.style === 'creative') return <CreativeCourseGrid id={id} config={config} />;

  const label = config?.text?.label ?? config?.label ?? tr('blocks.courseGridLabel');
  const title = config?.text?.title ?? config?.title ?? tr('blocks.courseGridTitle');
  const viewAllText =
    config?.text?.viewAllText ?? config?.viewAllText ?? tr('blocks.courseGridViewAll');
  const pills = config?.pills?.length ? config.pills : DEFAULT_PILLS;
  const courses = config?.courses?.length ? config.courses : DEFAULT_COURSES;

  return (
    <section id={id || 'courses'} className="bg-(--theme-surface) py-[60px]">
      <div className="mx-auto max-w-[1240px] px-[48px]">
        <div className="mb-[40px] flex items-end justify-between">
          <div>
            <div className="mb-[12px] text-[12px] font-bold text-(--theme-primary)">{label}</div>
            <div className="text-[clamp(28px,3.5vw,44px)] leading-[1.3] font-extrabold text-(--theme-foreground)">
              {title}
            </div>
          </div>
          <span className="text-[14px] font-semibold text-(--theme-primary)">{viewAllText}</span>
        </div>

        <div className="mb-[32px] flex flex-wrap gap-2">
          {pills.map((pill, i) => (
            <span
              key={i}
              className={
                i === 0
                  ? 'rounded-full border-[1.5px] border-(--theme-primary) bg-(--theme-primary-subtle) px-[18px] py-2 text-[13px] font-semibold text-(--theme-primary)'
                  : 'rounded-full border-[1.5px] border-(--theme-border-color) px-[18px] py-2 text-[13px] font-semibold text-(--theme-muted)'
              }
            >
              {pill}
            </span>
          ))}
        </div>

        <div className={COURSE_CARD_GRID_CLASS}>
          {resolveSlots(courses, config?.slots, courses.length).map((slot, i) => {
            if (slot.kind !== 'live') return <PlaceholderCard key={i} text={slot.text} />;
            const course = slot.data;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-background) transition-transform duration-200 hover:-translate-y-1"
              >
                <div className={COURSE_CARD_THUMB_CLASS}>
                  <div
                    className={`flex h-full items-center justify-center ${THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]}`}
                  >
                    <span className="text-[12px] font-semibold text-white/85">
                      {course.thumbLabel}
                    </span>
                  </div>
                  {course.duration && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/65 px-[10px] py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                      {course.duration}
                    </span>
                  )}
                </div>
                <div className="p-[20px]">
                  <span className="mb-[10px] inline-block rounded-full bg-(--theme-primary-subtle) px-[10px] py-[3px] text-[11px] font-bold text-(--theme-primary)">
                    {course.tag}
                  </span>
                  <div className="mb-[6px] text-[14px] font-bold text-(--theme-foreground)">
                    {course.title}
                  </div>
                  <div className="mb-[12px] text-[12px] text-(--theme-muted)">
                    {course.instructor}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[12px] font-bold text-(--theme-foreground)">
                      <span className="text-[11px] text-(--theme-accent)">★★★★★</span>
                      <span>{course.rating}</span>
                      <span className="text-[11px] font-normal text-(--theme-muted)">
                        {course.ratingCount}
                      </span>
                    </div>
                    <div className="text-[12px] text-(--theme-muted)">{course.students}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
