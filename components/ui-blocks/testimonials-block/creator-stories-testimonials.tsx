import { TestimonialsBlockProps, testimonials } from './shared';
import { Stars } from './stars';

// ── Creator Stories (Studio / Podia-inspired) ─────────────────────────────────

export function CreatorStoriesTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || 'Their businesses finally found a home';
  const subtitle =
    config?.subtitle || 'Creators, coaches, and consultants grow their business here.';
  const creators = testimonials.slice(0, 2);

  return (
    <section id={id || 'testimonials'} className="bg-(--theme-background) py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.05"
              className="text-2xl font-bold text-(--theme-foreground) sm:text-3xl"
            >
              {title}
            </h2>
            {subtitle && (
              <p
                data-scroll-animate="fadeIn"
                data-scroll-delay="0.15"
                className="mt-2 text-base text-(--theme-foreground)/60"
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {creators.map((c, i) => (
            <div
              key={i}
              data-scroll-animate={i === 0 ? 'slideLeft' : 'slideRight'}
              data-scroll-delay="0.1"
              className="rounded-2xl border border-(--theme-border-color) bg-(--theme-surface-alt) p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--theme-primary-subtle) text-3xl">
                  {c.avatar}
                </div>
                <div>
                  <p className="font-bold text-(--theme-foreground)">{c.name}</p>
                  <p className="text-sm text-(--theme-foreground)/60">{c.role}</p>
                  <p className="text-sm font-semibold text-(--theme-primary)">{c.revenue}/month</p>
                </div>
              </div>
              <Stars count={c.rating} />
              <p className="leading-relaxed text-(--theme-foreground)/70">
                &quot;{c.content}&quot;
              </p>
            </div>
          ))}
        </div>

        {/* Mini proof strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {testimonials.slice(2, 6).map((t, i) => (
            <div
              key={i}
              data-scroll-animate="scaleUp"
              data-scroll-delay={`${0.05 * i}`}
              className="rounded-xl border border-(--theme-border-color) bg-(--theme-card-bg) p-3 text-center shadow-sm"
            >
              <p className="text-lg font-bold text-(--theme-primary)">{t.revenue}</p>
              <p className="text-xs text-(--theme-foreground)/60">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
