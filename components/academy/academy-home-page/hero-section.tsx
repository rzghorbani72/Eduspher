import Link from '@/components/ui/link';
import { Badge } from '@/components/ui/badge';

export function HeroSection({
  buildPath,
  storeDisplayName,
  translate,
}: {
  buildPath: (path: string) => string;
  storeDisplayName: string;
  translate: (key: string) => string;
}) {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden">
      {/* Layered radial-gradient backdrop */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(ellipse 90% 65% at 50% -5%, color-mix(in srgb, var(--theme-primary) 28%, transparent), transparent)',
            'radial-gradient(ellipse 55% 45% at 95% 115%, color-mix(in srgb, var(--theme-secondary) 18%, transparent), transparent)',
            'radial-gradient(ellipse 50% 40% at 5% 105%, color-mix(in srgb, var(--theme-accent) 12%, transparent), transparent)',
            'var(--theme-background)',
          ].join(', '),
        }}
      />

      {/* Subtle dot-grid overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage: [
            'radial-gradient(circle, var(--theme-foreground) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating blobs */}
      <div
        className="pointer-events-none absolute top-0 -right-40 h-[600px] w-[600px] rounded-full opacity-[0.18] blur-3xl"
        style={{ background: 'var(--theme-primary)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full opacity-[0.13] blur-3xl"
        style={{ background: 'var(--theme-secondary)' }}
      />
      <div
        className="pointer-events-none absolute right-1/4 bottom-10 h-[300px] w-[300px] rounded-full opacity-[0.10] blur-2xl"
        style={{ background: 'var(--theme-accent)' }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div id="hero-badge" style={{ opacity: 0 }}>
          <Badge
            variant="soft"
            className="mb-8 inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold"
          >
            <span
              className="flex h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            />
            {translate('home.newBadge')}
          </Badge>
        </div>

        <h1
          id="hero-title"
          className="mb-7 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
          style={{
            opacity: 0,
            color: 'var(--theme-foreground)',
            lineHeight: '1.05',
            letterSpacing: '-0.03em',
          }}
        >
          {translate('home.heroTitle').replace('{store}', storeDisplayName)}
        </h1>

        <p
          id="hero-description"
          className="mx-auto mb-11 max-w-2xl text-lg leading-relaxed sm:text-xl"
          style={{ opacity: 0, color: 'var(--theme-muted)' }}
        >
          {translate('home.heroDescription')}
        </p>

        <div
          id="hero-ctas"
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ opacity: 0 }}
        >
          <Link
            href={buildPath('/courses')}
            className="group inline-flex h-14 items-center justify-center rounded-full px-9 text-base font-bold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_48px_color-mix(in_srgb,var(--theme-primary)_50%,transparent)]"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-on-primary)',
              boxShadow: '0 8px 32px color-mix(in srgb, var(--theme-primary) 38%, transparent)',
            }}
          >
            {translate('home.browseCourses')}
            <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </Link>
          <Link
            href={buildPath('/auth/login')}
            className="inline-flex h-14 items-center justify-center rounded-full border-2 px-9 text-base font-bold backdrop-blur-md transition-all duration-300 hover:scale-105"
            style={{
              borderColor: 'var(--theme-border-strong)',
              color: 'var(--theme-foreground)',
              backgroundColor: 'color-mix(in srgb, var(--theme-background) 65%, transparent)',
            }}
          >
            {translate('home.startForFree')}
          </Link>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        id="hero-scroll-hint"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        style={{ opacity: 0 }}
      >
        <span
          className="text-[10px] font-semibold tracking-[0.2em] uppercase"
          style={{ color: 'var(--theme-foreground)' }}
        >
          scroll
        </span>
        <div
          className="relative h-10 w-px overflow-hidden rounded-full"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--theme-foreground) 15%, transparent)',
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-5 animate-bounce rounded-full"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          />
        </div>
      </div>
    </section>
  );
}
