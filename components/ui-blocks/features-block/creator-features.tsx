import { DEFAULT_FEATURES, FeaturesBlockProps } from './shared';

// ── Creator (Stan.store-inspired violet) ─────────────────────────────────────

export function CreatorFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || 'Built for creators who mean business';
  const subtitle = config?.subtitle || 'No middlemen. No platform tax. Just you and your audience.';
  const items = DEFAULT_FEATURES.slice(0, 6);

  return (
    <section id={id || 'features'} className="bg-(--theme-surface-alt) py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="text-3xl font-bold tracking-tight text-(--theme-foreground) sm:text-4xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.15"
              className="mt-3 text-base text-(--theme-foreground)/70"
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.07 * i}`}
              className="group relative overflow-hidden rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-(--theme-primary)/40 hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-(--theme-primary-subtle) opacity-60 transition-transform group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--theme-primary-subtle) text-2xl">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-(--theme-foreground)">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-(--theme-foreground)/60">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
