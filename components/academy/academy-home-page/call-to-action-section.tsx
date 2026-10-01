import Link from '@/components/ui/link';
import { Badge } from '@/components/ui/badge';
import { ResolvedAcademy } from '@/lib/store-context';

export function CallToActionSection({
  buildPath,
  storeContext,
  storeDisplayName,
  translate,
}: {
  buildPath: (path: string) => string;
  storeContext: ResolvedAcademy;
  storeDisplayName: string;
  translate: (key: string) => string;
}) {
  return (
    <section
      data-gsap="scale-in"
      className="relative w-full overflow-hidden py-32 text-center"
      style={{
        background: `linear-gradient(135deg,
      var(--theme-primary) 0%,
      color-mix(in srgb, var(--theme-primary) 60%, var(--theme-secondary)) 40%,
      var(--theme-secondary) 70%,
      color-mix(in srgb, var(--theme-secondary) 70%, var(--theme-accent)) 100%)`,
        color: 'var(--theme-on-primary)',
      }}
    >
      {/* Decorative blobs inside CTA */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-25 blur-3xl"
        style={{ backgroundColor: 'var(--theme-accent)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: 'var(--theme-on-primary)' }}
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <Badge
          variant="soft"
          className="mb-8 inline-flex bg-white/15 text-[var(--theme-on-primary)]"
        >
          {translate('home.readyToBegin')}
        </Badge>

        <h2
          className="mb-5 text-4xl font-black tracking-tight sm:text-5xl"
          style={{ letterSpacing: '-0.03em' }}
        >
          {translate('home.createLearningAccount')}
        </h2>
        <p className="mb-12 text-lg leading-relaxed opacity-85">
          {translate('home.createLearningAccountDescription')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link
            href={buildPath('/auth/login')}
            className="inline-flex h-14 items-center justify-center rounded-full px-10 text-base font-black shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            style={{
              backgroundColor: 'var(--theme-on-primary)',
              color: 'var(--theme-primary)',
            }}
          >
            {translate('home.joinStore').replace('{store}', storeDisplayName)}
          </Link>
          {!storeContext.slug ? (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-sm font-bold opacity-90 transition-all duration-200 hover:translate-x-1 hover:opacity-100"
            >
              {translate('home.viewPricing')} →
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
