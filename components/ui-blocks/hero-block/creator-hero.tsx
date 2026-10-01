import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { buildAcademyPath, cn } from '@/lib/utils';
import { HeroBlockProps } from './shared';

// ── Creator (Bold creator economy) ────────────────────────────────────────────

export function CreatorHero({ id, config, storeContext }: HeroBlockProps) {
  const title = config?.title || 'پلتفرم جامع برای مدرسان مدرن';
  const subtitle =
    config?.subtitle || 'دوره‌ها، محصولات دیجیتال و اشتراک‌ها را از یک فروشگاه زیبا بفروشید';
  const ctaText = config?.ctaText || 'شروع رایگان';
  const ctaSecondary = config?.ctaSecondary || 'مشاهده دمو';

  const products = [
    { icon: '📚', label: 'دوره‌ها' },
    { icon: '🎁', label: 'محصولات دیجیتال' },
    { icon: '👥', label: 'اشتراک‌ها' },
    { icon: '🎙️', label: 'مشاوره' },
  ];

  return (
    <section
      id={id || 'hero'}
      className="relative overflow-hidden bg-(--theme-background) py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-(--theme-primary)/15 opacity-60 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-(--theme-accent)/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Text */}
          <div>
            <div
              data-scroll-animate="slideLeft"
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-(--theme-primary) px-4 py-1.5 text-sm font-semibold text-(--theme-on-primary) shadow-lg"
            >
              ✨ ساخته‌شده برای مدرسانی مثل شما
            </div>
            <h1
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.1"
              className="text-4xl leading-[1.1] font-extrabold tracking-tight text-(--theme-foreground) sm:text-5xl lg:text-6xl"
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
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button
                size="lg"
                asChild
                className="rounded-full bg-(--theme-primary) px-8 font-bold text-(--theme-on-primary) shadow-xl hover:opacity-90"
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
                  variant="ghost"
                  asChild
                  className="gap-2 font-semibold text-(--theme-primary) hover:bg-(--theme-primary-subtle)"
                >
                  <Link
                    href={buildAcademyPath(
                      storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                      '/about',
                    )}
                    className="text-(--theme-primary)"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--theme-primary-subtle)">
                      ▶
                    </span>
                    {ctaSecondary}
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Product pills grid */}
          <div data-scroll-animate="slideRight" className="grid grid-cols-2 gap-4">
            {products.map((p, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-5 shadow-sm transition-shadow hover:shadow-md',
                  i % 2 === 1 ? 'mt-6' : '',
                )}
              >
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-(--theme-foreground)">{p.label}</p>
                  <span className="mt-1 inline-block rounded-full bg-(--theme-primary-subtle) px-2 py-0.5 text-xs font-medium text-(--theme-primary)">
                    آماده فروش
                  </span>
                </div>
              </div>
            ))}
            {/* Revenue widget */}
            <div
              className="col-span-2 rounded-2xl p-5 text-(--theme-on-primary) shadow-xl"
              style={{
                background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))',
              }}
            >
              <p className="text-sm font-medium opacity-80">درآمد این ماه</p>
              <p className="mt-1 text-3xl font-bold">۱۲٬۸۴۰ هزار تومان</p>
              <p className="mt-1 text-xs opacity-70">↑ ۲۴٪ نسبت به ماه قبل</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
