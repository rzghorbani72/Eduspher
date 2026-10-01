export function HighlightsSection({ translate }: { translate: (key: string) => string }) {
  return (
    <section
      className="w-full py-24"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, var(--theme-background))',
        borderTop: '1px solid color-mix(in srgb, var(--theme-foreground) 6%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--theme-foreground) 6%, transparent)',
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-gsap="fade-up" className="mb-14 text-center">
          <p
            className="mb-2 text-xs font-bold tracking-[0.18em] uppercase"
            style={{ color: 'var(--theme-primary)' }}
          >
            {translate('home.personalisedLearningPaths')}
          </p>
          <h2
            className="text-3xl font-black tracking-tight sm:text-4xl"
            style={{
              color: 'var(--theme-foreground)',
              letterSpacing: '-0.025em',
            }}
          >
            {translate('home.adaptiveRecommendations')}
          </h2>
        </div>
        <div data-gsap="stagger" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: '🎯',
              title: translate('home.guidedProjects'),
              body: translate('home.guidedProjectsDescription'),
            },
            {
              icon: '👥',
              title: translate('home.mentorCheckIns'),
              body: translate('home.mentorCheckInsDescription'),
            },
            {
              icon: '📈',
              title: translate('home.personalisedLearningPaths'),
              body: translate('home.adaptiveRecommendations'),
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-border-color)',
              }}
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 6%, transparent), transparent)',
                }}
              />
              <span className="mb-5 block text-4xl">{item.icon}</span>
              <h3 className="mb-3 text-xl font-bold" style={{ color: 'var(--theme-foreground)' }}>
                {item.title}
              </h3>
              <p
                className="text-sm leading-relaxed opacity-60"
                style={{ color: 'var(--theme-foreground)' }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
