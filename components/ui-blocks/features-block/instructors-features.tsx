import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { buildAcademyPath } from '@/lib/utils';
import { FeaturesBlockProps } from './shared';

export const DEFAULT_INSTRUCTORS = [
  {
    name: 'علی محمدی',
    role: 'مهندس ارشد فرانت‌اند در دیجی‌کالا',
    experience: '۸+ سال',
    students: '۲,۴۰۰',
    avatar: '👨‍💻',
  },
  {
    name: 'سارا احمدی',
    role: 'توسعه‌دهنده بک‌اند در اسنپ',
    experience: '۶+ سال',
    students: '۱,۸۰۰',
    avatar: '👩‍💻',
  },
  {
    name: 'رضا کریمی',
    role: 'مدرس دوره‌های هوش مصنوعی',
    experience: '۱۰+ سال',
    students: '۳,۱۰۰',
    avatar: '🧑‍🏫',
  },
  {
    name: 'مریم رضایی',
    role: 'مهندس DevOps در آپارات',
    experience: '۷+ سال',
    students: '۲,۰۰۰',
    avatar: '👩‍🔧',
  },
  {
    name: 'امیر حسینی',
    role: 'مدیر فنی و مدرس معماری نرم‌افزار',
    experience: '۱۲+ سال',
    students: '۴,۵۰۰',
    avatar: '🧑‍💼',
  },
  {
    name: 'نگار صادقی',
    role: 'توسعه‌دهنده موبایل در دیوار',
    experience: '۵+ سال',
    students: '۱,۵۰۰',
    avatar: '👩‍🚀',
  },
];

export const DEFAULT_INSTRUCTOR_METRICS = [
  { value: '۸+ سال', label: 'میانگین سابقه کاری' },
  { value: '۹۴٪', label: 'نرخ رضایت دانش‌آموزان' },
  { value: '۸۵ نفر', label: 'مدرس فعال' },
  { value: '۲۴/۷', label: 'پشتیبانی آنلاین' },
];

// ── Instructors showcase (code / dark academy templates) ─────────────────────

export function InstructorsFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || 'از متخصصان واقعی صنعت یاد بگیر';
  const subtitle = config?.subtitle;
  const lead = DEFAULT_INSTRUCTORS[0];
  const metrics = DEFAULT_INSTRUCTOR_METRICS;

  return (
    <section
      id={id || 'features'}
      className="border-t border-(--theme-border-color) bg-(--theme-surface-alt) py-16 text-(--theme-foreground) sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p
              data-scroll-animate="fadeIn"
              className="mb-3 text-xs font-bold tracking-[0.08em] text-(--theme-primary) uppercase"
            >
              مدرسان برتر
            </p>
            <h2
              data-scroll-animate="slideRight"
              className="text-2xl font-bold tracking-tight text-(--theme-foreground) sm:text-4xl"
            >
              {title}
            </h2>
            {subtitle && (
              <p
                data-scroll-animate="slideRight"
                data-scroll-delay="0.1"
                className="mt-3 text-base leading-relaxed text-(--theme-foreground)/60"
              >
                {subtitle}
              </p>
            )}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {metrics.map((m, i) => (
                <div
                  key={i}
                  data-scroll-animate="fadeInUp"
                  data-scroll-delay={`${0.08 * i}`}
                  className="rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-5"
                >
                  <p className="text-2xl font-bold text-(--theme-primary) sm:text-3xl">{m.value}</p>
                  <p className="mt-1 text-sm text-(--theme-foreground)/60">{m.label}</p>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              asChild
              className="mt-8 rounded-full bg-(--theme-primary) text-(--theme-on-primary) hover:opacity-90"
            >
              <Link href={buildAcademyPath(null, '/courses')}>مشاهده همه مدرسان</Link>
            </Button>
          </div>

          <div data-scroll-animate="slideLeft" className="order-first lg:order-last">
            <div className="relative mx-auto aspect-4/5 w-full max-w-sm overflow-hidden rounded-3xl border border-(--theme-border-color) bg-(--theme-primary-subtle)">
              <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-90">
                {lead.avatar}
              </div>
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-(--theme-card-bg)/90 px-4 py-3 backdrop-blur">
                <p className="text-sm font-semibold text-(--theme-foreground)">{lead.name}</p>
                <p className="text-xs text-(--theme-foreground)/60">{lead.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
