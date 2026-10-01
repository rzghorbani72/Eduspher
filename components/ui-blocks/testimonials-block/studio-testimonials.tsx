import { TestimonialsBlockProps, testimonials } from './shared';
import { Stars } from './stars';

// ── Studio testimonials (warm amber/teal grid) ────────────────────────────────

export function StudioTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || 'Loved by creators everywhere';
  const items = testimonials.slice(0, 3);

  return (
    <section id={id || 'testimonials'} className="bg-(--theme-surface-alt) py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-2xl font-bold text-(--theme-foreground) sm:text-3xl"
          >
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((t, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.1 * i}`}
              className="rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Stars count={t.rating} />
              <p className="mb-5 text-sm leading-relaxed text-(--theme-foreground)/75">
                &quot;{t.content}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--theme-primary-subtle) text-xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-(--theme-foreground)">{t.name}</p>
                  <p className="text-xs font-medium text-(--theme-primary)">{t.revenue}/mo</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
