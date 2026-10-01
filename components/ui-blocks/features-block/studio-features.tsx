import { DEFAULT_FEATURES, FeaturesBlockProps } from './shared';

// ── Studio (Podia-inspired amber/teal split) ──────────────────────────────────

export function StudioFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || 'One place. Everything you need.';
  const subtitle = config?.subtitle || 'Your website, your store, your audience — all connected.';
  const items = DEFAULT_FEATURES.slice(0, 3);

  return (
    <section id={id || 'features'} className="bg-(--theme-surface-alt) py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.05"
              className="text-3xl font-bold tracking-tight text-(--theme-foreground) sm:text-4xl"
            >
              {title}
            </h2>
            <p
              data-scroll-animate="slideLeft"
              data-scroll-delay="0.15"
              className="mt-4 text-base leading-relaxed text-(--theme-foreground)/70"
            >
              {subtitle}
            </p>
            <ul className="mt-8 space-y-4">
              {items.map((f, i) => (
                <li
                  key={i}
                  data-scroll-animate="slideLeft"
                  data-scroll-delay={`${0.2 + 0.08 * i}`}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--theme-primary) text-sm font-bold text-(--theme-on-primary)">
                    {f.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-(--theme-foreground)">{f.title}</p>
                    <p className="text-sm text-(--theme-foreground)/60">{f.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div
            data-scroll-animate="slideRight"
            data-scroll-delay="0.1"
            className="grid grid-cols-2 gap-4"
          >
            {DEFAULT_FEATURES.slice(3).map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="text-sm font-semibold text-(--theme-foreground)">{f.title}</h3>
                <p className="mt-1 text-xs text-(--theme-foreground)/60">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
