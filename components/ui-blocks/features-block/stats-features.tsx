import { cn } from '@/lib/utils';
import { FeaturesBlockProps, Stat, gridColCls } from './shared';

export const DEFAULT_STATS: Stat[] = [
  { value: '100K+', label: 'Active students' },
  { value: '$10B+', label: 'Earned by creators' },
  { value: '75M+', label: 'Customers served' },
];

// ── Stats strip (Expert Academy / Kajabi-inspired) ────────────────────────────

export function StatsFeatures({ id, config }: FeaturesBlockProps) {
  const title = config?.title;
  const stats = config?.stats ?? DEFAULT_STATS;

  return (
    <section
      id={id || 'features'}
      className="bg-(--theme-primary) py-12 text-(--theme-on-primary) sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {title && (
          <p
            data-scroll-animate="fadeIn"
            data-scroll-delay="0.05"
            className="mb-8 text-center text-sm font-semibold tracking-widest text-(--theme-on-primary)/80 uppercase"
          >
            {title}
          </p>
        )}
        <div className={cn('grid gap-8', gridColCls[stats.length] ?? 'grid-cols-3')}>
          {stats.map((s, i) => (
            <div
              key={i}
              data-scroll-animate="scaleUp"
              data-scroll-delay={`${0.1 * i}`}
              className="flex flex-col items-center text-center"
            >
              <p className="text-4xl font-bold tabular-nums sm:text-5xl">{s.value}</p>
              <p className="mt-1 text-sm text-(--theme-on-primary)/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
