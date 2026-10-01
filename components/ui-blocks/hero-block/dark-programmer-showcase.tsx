import Link from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { buildAcademyPath } from '@/lib/utils';
import { HeroBlockProps } from './shared';

export function DarkProgrammerShowcase({
  storeContext,
}: {
  storeContext?: HeroBlockProps['storeContext'];
}) {
  return (
    <div data-scroll-animate="slideRight" className="relative mx-auto w-full max-w-md">
      {/* Live learners badge */}
      <div className="absolute -top-4 right-6 z-20 inline-flex items-center gap-2 rounded-full border border-(--theme-accent)/50 bg-(--theme-accent-subtle) px-3 py-1.5 text-xs font-medium text-(--theme-accent) shadow-lg">
        <span className="h-2 w-2 animate-pulse rounded-full bg-(--theme-accent)" />
        همین الان ۲۳۴ نفر در حال یادگیری
      </div>

      {/* Code editor card */}
      <div className="overflow-hidden rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) shadow-2xl">
        <div className="flex items-center gap-2 border-b border-(--theme-border-color) px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-(--theme-foreground)/30" />
          <span className="h-3 w-3 rounded-full bg-(--theme-foreground)/30" />
          <span className="h-3 w-3 rounded-full bg-(--theme-foreground)/30" />
          <span className="ms-auto text-xs text-(--theme-foreground)/50">JavaScript</span>
        </div>
        <pre dir="ltr" className="px-5 py-4 text-left font-mono text-sm leading-6">
          <code>
            <span className="text-(--theme-primary)">function</span>{' '}
            <span className="text-(--theme-secondary)">calcAverage</span>
            <span className="text-(--theme-foreground)/60">(datasets) {'{'}</span>
            {'\n'}
            {'  '}
            <span className="text-(--theme-primary)">let</span>{' '}
            <span className="text-(--theme-foreground)">subjectAverage</span>{' '}
            <span className="text-(--theme-foreground)/60">=</span>{' '}
            <span className="text-(--theme-accent)">0</span>
            <span className="text-(--theme-foreground)/60">;</span>
            {'\n'}
            {'  '}
            <span className="text-(--theme-foreground)">datasets</span>
            <span className="text-(--theme-foreground)/60">.</span>
            <span className="text-(--theme-secondary)">forEach</span>
            <span className="text-(--theme-foreground)/60">((dataset) {'=> {'}</span>
            {'\n'}
            {'    '}
            <span className="text-(--theme-foreground)">subjectAverage</span>{' '}
            <span className="text-(--theme-foreground)/60">+=</span>{' '}
            <span className="text-(--theme-secondary)">parseFloat</span>
            <span className="text-(--theme-foreground)/60">(dataset);</span>
            {'\n'}
            {'  '}
            <span className="text-(--theme-foreground)/60">{'});'}</span>
            {'\n'}
            <span className="text-(--theme-foreground)/60">{'}'}</span>
          </code>
        </pre>
      </div>

      {/* Achievement badge */}
      <div className="absolute -bottom-3 -left-3 z-20 inline-flex items-center gap-2 rounded-xl border border-(--theme-border-color) bg-(--theme-card-bg) px-3 py-2 text-xs font-medium text-(--theme-foreground)/80 shadow-lg">
        🏆 React Advanced Patterns
      </div>

      {/* Sample course card */}
      <div className="mt-5 rounded-2xl border border-(--theme-border-color) bg-(--theme-card-bg) p-4 shadow-xl">
        <div className="mb-3 h-2 w-16 rounded-full bg-(--theme-primary)" />
        <p className="text-sm font-semibold text-(--theme-foreground)">
          JavaScript: از صفر تا مسلط — دوره جامع ۲۰۲۴
        </p>
        <div className="mt-1 flex items-center gap-1">
          {'★★★★★'.split('').map((s, i) => (
            <span key={i} className="text-xs text-(--theme-accent)">
              {s}
            </span>
          ))}
          <span className="ms-1 text-xs text-(--theme-foreground)/50">(۲٬۳۹۱)</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-(--theme-foreground)">۱,۳۰۰,۰۰۰ تومان</span>
          <Button
            size="sm"
            asChild
            className="rounded-full bg-(--theme-primary) text-(--theme-on-primary) hover:opacity-90"
          >
            <Link
              href={buildAcademyPath(
                storeContext?.isSubdomain ? null : (storeContext?.slug ?? null),
                '/courses',
              )}
            >
              ثبت‌نام
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
