import { LanguageCode } from '@/lib/i18n';
import { formatNumber, toPersianDigits } from '@/lib/utils';

export function StatsBand({
  language,
  stats,
  translate,
}: {
  language: LanguageCode;
  stats: {
    students: number | null;
    mentors: number | null;
    courses: number | null;
    rating: number | null;
  };
  translate: (key: string) => string;
}) {
  return (
    <section
      id="stats-band"
      className="w-full py-12"
      style={{
        opacity: 0,
        backgroundColor: 'color-mix(in srgb, var(--theme-primary) 7%, var(--theme-background))',
        borderTop: '1px solid color-mix(in srgb, var(--theme-primary) 18%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--theme-primary) 18%, transparent)',
      }}
    >
      <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-y-8 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
        {[
          {
            label: translate('home.learners'),
            value: stats.students ? formatNumber(stats.students, language) : '—',
          },
          {
            label: translate('home.mentors'),
            value: stats.mentors ? formatNumber(stats.mentors, language) : '—',
          },
          {
            label: translate('home.courses'),
            value: stats.courses ? formatNumber(stats.courses, language) : '—',
          },
          {
            label: translate('home.avgRating'),
            value: stats.rating ? toPersianDigits(`${stats.rating.toFixed(1)} / 5`, language) : '—',
          },
        ].map((stat) => (
          <div key={stat.label} data-stat className="flex flex-col items-center gap-1 text-center">
            <p
              className="text-4xl font-black tabular-nums sm:text-5xl"
              style={{
                color: 'var(--theme-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              {stat.value}
            </p>
            <p
              className="text-xs font-semibold tracking-widest uppercase opacity-55"
              style={{ color: 'var(--theme-foreground)' }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
