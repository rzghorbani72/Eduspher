import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { SOHAIL_DEFAULTS } from './defaults';
import styles from './sohail.module.css';

interface HeroStat {
  value: string;
  unit: string;
  label: string;
  note: string;
}

export function SohailHero({ id, config }: TemplateSectionProps) {
  const d = SOHAIL_DEFAULTS.hero;
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className={`relative overflow-hidden ${styles.void}`}>
      <div className={`${styles.stars} ${styles.dense}`} aria-hidden="true" />
      <div className={styles.gridlines} aria-hidden="true" />

      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-(--theme-accent)" aria-hidden="true" />
              <span className="text-[13px] font-medium tracking-[0.08em] text-current/70">
                {text(config, 'kicker', d.kicker)}
              </span>
            </div>

            <h1 className="text-[clamp(34px,5.4vw,62px)] font-bold leading-[1.12] tracking-[-0.03em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <em className="not-italic text-(--theme-primary)" data-editable="titleEm">
                {text(config, 'titleEm', d.titleEm)}
              </em>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p
              data-editable="subtitle"
              className="mt-6 max-w-[56ch] text-[17px] leading-[1.9] text-current/72"
            >
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              <Button tone="primary" size="lg" editableKey="ctaText" href="#courses">
                {text(config, 'ctaText', d.ctaText)}
              </Button>
              <Button tone="ghost-on-deep" size="lg" href="#missions">
                {text(config, 'ctaSecondary', d.ctaSecondary)}
              </Button>
            </div>

            <p className="mt-9 flex flex-wrap items-center gap-3 text-[14px] text-current/70">
              <span className="rounded-(--theme-border-radius) bg-(--theme-accent) px-3 py-1 text-[12px] font-bold text-(--theme-on-accent)">
                {text(config, 'noteTag', d.noteTag)}
              </span>
              <span>{text(config, 'note', d.note)}</span>
            </p>
          </div>

          <div className={styles.orbit} aria-hidden="true">
            <span className={styles.ring} />
            <span className={`${styles.ring} ${styles.ring2}`} />
            <span className={`${styles.ring} ${styles.ring3}`} />
            <span className={`${styles.ring} ${styles.ring4}`} />
            <span className={styles.sweep} />
            <span className={styles.planet} />
            <span className={styles.moon} />
            <span className={`${styles.moon} ${styles.moon2}`} />
          </div>
        </div>

        <dl className="mt-16 grid gap-px overflow-hidden rounded-(--theme-border-radius) border border-current/15 bg-current/15 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className={`p-6 ${styles.void}`}>
              <dt className="text-[12px] font-medium tracking-[0.1em] text-current/55">{stat.label}</dt>
              <dd>
                <span className="mt-2 block text-[34px] font-bold leading-none tracking-[-0.04em]">
                  {stat.value}
                  {stat.unit ? <small className="ms-1.5 text-[13px] font-medium text-current/60">{stat.unit}</small> : null}
                </span>
                <span className="mt-2 block text-[12.5px] text-current/55">{stat.note}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
