import { cn } from '@/lib/utils';
import { DEFAULT_FEATURES, FeaturesBlockProps, gridColCls } from './shared';

// ── Dark cards (Community / Circle.so-inspired) ───────────────────────────────

export function DarkFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title || 'Everything your community needs';
  const subtitle = config?.subtitle || '';
  const gridColumns = config?.gridColumns || 3;
  const cols = gridColCls[gridColumns] ?? gridColCls[3];
  const items = DEFAULT_FEATURES.slice(0, gridColumns * 2);

  return (
    <section
      id={id || 'features'}
      className="bg-(--theme-background) py-16 text-(--theme-foreground) sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mx-auto mb-12 max-w-2xl text-center">
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
                className="mt-2 text-base text-(--theme-foreground)/60"
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={cn('grid gap-5', cols)}>
          {items.map((f, i) => (
            <div
              key={i}
              data-scroll-animate="fadeInUp"
              data-scroll-delay={`${0.07 * i}`}
              className="group flex flex-col gap-3 rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-6 transition-all hover:border-(--theme-primary)/50 hover:bg-(--theme-surface-alt)"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--theme-primary)/20 bg-(--theme-primary-subtle) text-2xl">
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-(--theme-foreground)">{f.title}</h3>
              <p className="text-sm leading-6 text-(--theme-foreground)/60">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
