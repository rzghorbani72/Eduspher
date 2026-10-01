import { TestimonialsBlockProps, testimonials } from './shared';
import { Stars } from './stars';

// ── Social Proof screenshots (Creator / Stan.store-inspired) ──────────────────

export function SocialProofTestimonials({ id, config }: TestimonialsBlockProps) {
  const title = config?.title || 'See What People Are Saying';

  const proofItems = testimonials.slice(0, 4).map((t) => ({
    name: t.name,
    revenue: t.revenue,
    content: t.content.slice(0, 80) + '…',
    avatar: t.avatar,
    rating: t.rating,
  }));

  return (
    <section id={id || 'testimonials'} className="bg-(--theme-background) py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="mb-3 text-center text-2xl font-bold text-(--theme-foreground) sm:text-3xl"
          >
            {title} <span className="text-(--theme-primary)">👉</span>
          </h2>
        )}
        <p
          data-scroll-animate="fadeIn"
          data-scroll-delay="0.12"
          className="mb-10 text-center text-sm text-(--theme-foreground)/55"
        >
          Real screenshots. Real results.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proofItems.map((p, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.08 * i}`}
              className="rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-4 shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--theme-primary-subtle) text-lg">
                  {p.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-(--theme-foreground)">{p.name}</p>
                  <p className="text-xs font-bold text-(--theme-primary)">{p.revenue}</p>
                </div>
              </div>
              <Stars count={p.rating} />
              <p className="text-xs leading-relaxed text-(--theme-foreground)/70">
                &quot;{p.content}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
