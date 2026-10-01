import { cn } from '@/lib/utils';
import { DEFAULT_FEATURES, FeaturesBlockProps, gridColCls } from './shared';

// ── Benefits checklist (Studio/Podia + Creator/Stan) ─────────────────────────

export function BenefitsFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || 'Everything you need, right out of the box';
  const subtitle = config?.subtitle || '';
  const gridColumns = config?.gridColumns || 2;
  const cols = gridColCls[gridColumns] ?? gridColCls[2];
  const zeroCostBadge = config?.zeroCostBadge === true;
  const items = DEFAULT_FEATURES.slice(0, 6);

  return (
    <section
      id={id || 'features'}
      className="bg-(--theme-background) py-16 text-(--theme-foreground) sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          {zeroCostBadge && (
            <span
              data-scroll-animate="scaleUp"
              data-scroll-delay="0"
              className="mb-4 inline-flex items-center rounded-full bg-(--theme-primary-subtle) px-3 py-1 text-xs font-semibold text-(--theme-primary)"
            >
              0% Transaction Fees — Always Free
            </span>
          )}
          {title && (
            <h2
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.05"
              className="text-2xl font-bold tracking-tight text-(--theme-foreground) sm:text-4xl"
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              data-scroll-animate="fadeIn"
              data-scroll-delay="0.15"
              className="mt-3 text-base text-(--theme-foreground)/60"
            >
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn('grid gap-4', cols)}>
          {items.map((f, i) => (
            <div
              key={i}
              data-scroll-animate="slideLeft"
              data-scroll-delay={`${0.07 * i}`}
              className="group flex items-start gap-4 rounded-2xl border border-(--theme-border-color) bg-(--theme-surface-alt) p-5 transition-all hover:border-(--theme-primary)/40 hover:bg-(--theme-primary-subtle)"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--theme-primary-subtle) text-(--theme-primary)">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-(--theme-foreground)">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-(--theme-foreground)/60">
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
