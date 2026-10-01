import { TestimonialsBlockProps, testimonials } from './shared';
import { Stars } from './stars';

// ── Creator testimonials (violet social-media style) ─────────────────────────

export function CreatorTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || 'Join thousands of creators';
  const items = testimonials.slice(0, 4);

  return (
    <section
      id={id || 'testimonials'}
      className="overflow-hidden bg-(--theme-background) py-16 sm:py-20"
    >
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
        {/* Masonry-style 2-col stagger */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((t, i) => (
            <div
              key={i}
              data-scroll-animate={i % 2 === 0 ? 'slideLeft' : 'slideRight'}
              data-scroll-delay={`${0.08 * i}`}
              className="rounded-2xl border border-(--theme-border-color) bg-(--theme-surface-alt) p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--theme-primary-subtle) text-xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-(--theme-foreground)">{t.name}</p>
                  <p className="text-xs font-bold text-(--theme-primary)">{t.revenue}/mo</p>
                </div>
              </div>
              <Stars count={t.rating} />
              <p className="text-sm leading-relaxed text-(--theme-foreground)/70">
                &quot;{t.content}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
