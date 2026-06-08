interface StaticCourse {
  thumbLabel?: string;
  tag?: string;
  title?: string;
  instructor?: string;
  duration?: string;
  rating?: string;
  ratingCount?: string;
  students?: string;
}

interface CourseGridBlockProps {
  id?: string;
  config?: {
    label?: string;
    title?: string;
    viewAllText?: string;
    pills?: string[];
    courses?: StaticCourse[];
  };
}

// Decorative gradient thumbnails — built only from theme tokens, cycled per card.
const THUMB_GRADIENTS = [
  "bg-[linear-gradient(135deg,var(--theme-primary),color-mix(in_srgb,var(--theme-primary)_35%,var(--theme-secondary)))]",
  "bg-[linear-gradient(135deg,var(--theme-accent),color-mix(in_srgb,var(--theme-accent)_55%,var(--theme-primary)))]",
  "bg-[linear-gradient(135deg,var(--theme-secondary),color-mix(in_srgb,var(--theme-secondary)_45%,var(--theme-accent)))]",
];

const DEFAULT_PILLS = ["همه دوره‌ها", "طراحی", "توسعه", "کسب‌وکار", "بازاریابی", "داده"];

const DEFAULT_COURSES: StaticCourse[] = [
  {
    thumbLabel: "فیگما",
    tag: "طراحی",
    title: "فیگما: مبانی متخصص",
    instructor: "سارا چن · ۱۱ درس · ۳ واحد",
    duration: "۴ ساعت ۳۲ دقیقه",
    rating: "۴.۹",
    ratingCount: "(۳۴۲)",
    students: "۲.۱هزار ثبت‌نام",
  },
  {
    thumbLabel: "ری‌اکت",
    tag: "تکنولوژی",
    title: "ری‌اکت و تایپ‌اسکریپت کامل",
    instructor: "الکس کیم · ۱۳ درس · ۴ واحد",
    duration: "۶ ساعت ۱۰ دقیقه",
    rating: "۴.۸",
    ratingCount: "(۱۹۸)",
    students: "۱.۸هزار ثبت‌نام",
  },
  {
    thumbLabel: "برند",
    tag: "کسب‌وکار",
    title: "استراتژی برند از پایه",
    instructor: "میا تورز · ۹ درس · ۳ واحد",
    duration: "۳ ساعت ۴۸ دقیقه",
    rating: "۴.۷",
    ratingCount: "(۸۷)",
    students: "۹۴۰ ثبت‌نام",
  },
];

export function CourseGridBlock({ id, config }: CourseGridBlockProps) {
  const label = config?.label || "کتابخانه دوره‌ها";
  const title = config?.title || "آموزش هوشمندتر UX/UI";
  const viewAllText = config?.viewAllText || "← مشاهده همه";
  const pills = config?.pills?.length ? config.pills : DEFAULT_PILLS;
  const courses = config?.courses?.length ? config.courses : DEFAULT_COURSES;

  return (
    <section id={id || "courses"} className="bg-(--theme-surface) py-[60px]">
      <div className="mx-auto max-w-[1240px] px-[48px]">
        <div className="mb-[40px] flex items-end justify-between">
          <div>
            <div className="mb-[12px] text-[12px] font-bold text-(--theme-primary)">{label}</div>
            <div className="text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.3] text-(--theme-foreground)">
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
                  ? "rounded-full border-[1.5px] border-(--theme-primary) bg-(--theme-primary-subtle) px-[18px] py-2 text-[13px] font-semibold text-(--theme-primary)"
                  : "rounded-full border-[1.5px] border-(--theme-border-color) px-[18px] py-2 text-[13px] font-semibold text-(--theme-muted)"
              }
            >
              {pill}
            </span>
          ))}
        </div>

        <div className="grid gap-[24px] md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-background) transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="relative h-[180px] overflow-hidden">
                <div
                  className={`flex h-full items-center justify-center ${THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]}`}
                >
                  <span className="text-[12px] font-semibold text-white/85">{course.thumbLabel}</span>
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
                <div className="mb-[6px] text-[14px] font-bold text-(--theme-foreground)">{course.title}</div>
                <div className="mb-[12px] text-[12px] text-(--theme-muted)">{course.instructor}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[12px] font-bold text-(--theme-foreground)">
                    <span className="text-[11px] text-(--theme-accent)">★★★★★</span>
                    <span>{course.rating}</span>
                    <span className="text-[11px] font-normal text-(--theme-muted)">{course.ratingCount}</span>
                  </div>
                  <div className="text-[12px] text-(--theme-muted)">{course.students}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
