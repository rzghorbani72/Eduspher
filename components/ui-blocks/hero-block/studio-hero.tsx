import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { buildAcademyPath } from '@/lib/utils';
import { HeroBlockProps } from './shared';

// ── Studio (Warm split — for educators & studio owners) ───────────────────────

export function StudioHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || 'استودیوی شما، قوانین شما';
  const subtitle =
    config?.subtitle || 'با یک پلتفرم جامع و زیبا دوره‌هایتان را بسازید، تدریس کنید و بفروشید';
  const ctaText = config?.ctaText || 'شروع به ساخت';
  const ctaSecondary = config?.ctaSecondary || 'کاوش ویژگی‌ها';

  return (
    <section
      id={id || 'hero'}
      className="relative overflow-hidden bg-(--theme-surface-alt) py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-(--theme-secondary)/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-(--theme-accent)/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Text side */}
          <div>
            <div
              data-scroll-animate="slideLeft"
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-(--theme-border-color) bg-(--theme-secondary-subtle) px-4 py-1.5 text-sm font-medium text-(--theme-secondary)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              برای مدرسان ساخته شده
            </div>
            <h1
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.1"
              className="text-4xl leading-tight font-bold tracking-tight text-(--theme-foreground) sm:text-5xl lg:text-6xl"
            >
              {title}
            </h1>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.2"
              className="mt-5 text-lg leading-relaxed text-(--theme-foreground)/70"
            >
              {subtitle}
            </p>

            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.3"
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                asChild
                className="bg-(--theme-primary) font-semibold text-(--theme-on-primary) shadow-lg hover:opacity-90"
              >
                <Link
                  href={buildAcademyPath(
                    storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                    '/courses',
                  )}
                  className="text-(--theme-on-primary)"
                >
                  {ctaText}
                </Link>
              </Button>
              {ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-(--theme-border-strong) text-(--theme-foreground)/70 hover:bg-(--theme-surface)"
                >
                  <Link
                    href={buildAcademyPath(
                      storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                      '/about',
                    )}
                    className="text-(--theme-foreground)/70"
                  >
                    {ctaSecondary}
                  </Link>
                </Button>
              )}
            </div>

            {/* Trust indicators */}
            <div
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.4"
              className="mt-10 grid grid-cols-3 gap-4"
            >
              {[
                ['۵هزار+', 'دوره'],
                ['۹۸٪', 'رضایت‌مندی'],
                ['۲۴/۷', 'پشتیبانی'],
              ].map(([val, label], i) => (
                <div
                  key={i}
                  className="rounded-xl border border-(--theme-border-color) bg-(--theme-card-bg) p-3 text-center shadow-sm"
                >
                  <p className="text-xl font-bold text-(--theme-primary)">{val}</p>
                  <p className="mt-0.5 text-xs text-(--theme-foreground)/55">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual side */}
          <div data-scroll-animate="slideRight" className="relative">
            <div className="relative rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-4 shadow-2xl">
              {/* Mock course card */}
              <div
                className="mb-3 rounded-xl p-5 text-(--theme-on-primary)"
                style={{
                  background:
                    'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))',
                }}
              >
                <p className="text-xs font-medium opacity-80">دوره برگزیده</p>
                <p className="mt-1 text-lg leading-tight font-bold">تسلط بر مهارت در ۳۰ روز</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm">
                    👩‍🏫
                  </div>
                  <span className="text-xs opacity-80">۱۲ درس · ۴ ساعت محتوا</span>
                </div>
              </div>
              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-2">
                {['🎓 یادگیری', '🏆 گواهینامه', '🚀 رشد'].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-(--theme-surface-alt) p-2 text-center text-xs font-medium text-(--theme-foreground)/80"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 rounded-xl bg-(--theme-primary) px-3 py-2 text-(--theme-on-primary) shadow-lg">
              <p className="text-xs font-bold">🔥 محبوب</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
