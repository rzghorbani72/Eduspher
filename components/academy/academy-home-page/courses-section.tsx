import Link from '@/components/ui/link';
import { CategorySummary } from '@/lib/api/types';
import { truncate } from '@/lib/utils';

export function CoursesSection({
  buildPath,
  categories,
  translate,
}: {
  buildPath: (path: string) => string;
  categories: CategorySummary[] | never[];
  translate: (key: string) => string;
}) {
  return (
    <section className="py-28" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          data-gsap="fade-up"
          className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p
              className="mb-2 text-xs font-bold tracking-[0.18em] uppercase"
              style={{ color: 'var(--theme-primary)' }}
            >
              {translate('home.topCategories')}
            </p>
            <h2
              className="text-3xl font-black tracking-tight sm:text-4xl"
              style={{
                color: 'var(--theme-foreground)',
                letterSpacing: '-0.025em',
              }}
            >
              {translate('home.browseByInterest')}
            </h2>
          </div>
          <Link
            href={buildPath('/courses?view=categories')}
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-bold transition-all duration-200"
            style={{ color: 'var(--theme-primary)' }}
          >
            {translate('home.browseByInterest')}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div data-gsap="stagger" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              href={buildPath(`/courses?category=${category.id}`)}
              className="group relative overflow-hidden rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-border-color)',
                color: 'var(--theme-foreground)',
              }}
            >
              {/* Hover shine */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 9%, transparent), transparent)',
                }}
              />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-bold tracking-[0.15em] uppercase opacity-45">
                    {translate('home.categoryLabel')}
                  </p>
                  <p className="truncate text-lg font-bold">{category.name}</p>
                  {category.description ? (
                    <p className="mt-1 text-sm leading-5 opacity-50">
                      {truncate(category.description, 72)}
                    </p>
                  ) : null}
                </div>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110"
                  style={{
                    backgroundColor:
                      'color-mix(in srgb, var(--theme-primary) 14%, var(--theme-background))',
                    color: 'var(--theme-primary)',
                  }}
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
