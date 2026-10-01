import { TestimonialsBlockProps, testimonials } from './shared';
import { Stars } from './stars';

// ── Dark Quote (Expert Academy / Kajabi + Community / Circle) ─────────────────

export function DarkQuoteTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || 'Why experts choose us';
  const items = testimonials.slice(0, 3);

  return (
    <section
      id={id || 'testimonials'}
      className="bg-(--theme-background) py-16 text-(--theme-foreground) sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="mb-12 text-center text-2xl font-bold text-(--theme-foreground) sm:text-3xl"
          >
            {title}
          </h2>
        )}

        {/* Featured large quote */}
        <div
          data-scroll-animate="scaleUp"
          data-scroll-delay="0.1"
          className="mx-auto mb-8 max-w-3xl rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-10 text-center shadow-2xl"
        >
          <p className="mb-1 text-4xl font-bold text-(--theme-foreground)">
            {testimonials[4].revenue}
          </p>
          <p className="mb-6 text-sm tracking-wide text-(--theme-foreground)/55 uppercase">
            earned on this platform
          </p>
          <blockquote className="mb-6 text-lg leading-relaxed text-(--theme-foreground)/75 italic">
            &quot;{testimonials[4].content}&quot;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--theme-secondary-subtle) text-2xl">
              {testimonials[4].avatar}
            </div>
            <div className="text-left">
              <p className="font-semibold text-(--theme-foreground)">{testimonials[4].name}</p>
              <p className="text-sm text-(--theme-foreground)/55">
                {testimonials[4].role}, {testimonials[4].company}
              </p>
            </div>
          </div>
        </div>

        {/* Secondary quotes row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((t, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.15 + 0.08 * i}`}
              className="rounded-xl border border-(--theme-border-color) bg-(--theme-surface-alt) p-5"
            >
              <Stars count={t.rating} />
              <p className="mb-4 text-sm leading-relaxed text-(--theme-foreground)/75">
                &quot;{t.content}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--theme-secondary-subtle) text-lg">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-(--theme-foreground)">{t.name}</p>
                  <p className="text-xs text-(--theme-foreground)/55">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
