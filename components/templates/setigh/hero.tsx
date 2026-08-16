import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVisualSlot } from '../_shared/hero-media';
import { featureVisible, list, text, type TemplateSectionProps } from '../_shared/types';
import { SETIGH_DEFAULTS } from './defaults';
import styles from './setigh.module.css';

interface HeroStat {
  value: string;
  label: string;
}

export function SetighHero({ id, config }: TemplateSectionProps) {
  const d = SETIGH_DEFAULTS.hero;
  const stats = list<HeroStat>(config, 'stats', d.stats);
  const percent = typeof config?.cyclePercent === 'number' ? config.cyclePercent : d.cyclePercent;

  return (
    <section id={id || 'hero'} className="relative overflow-hidden bg-(--theme-deep) text-(--theme-on-deep)">
      <Container className="py-(--theme-section-padding-y)">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span
              data-editable="kicker"
              className="inline-block rounded-(--theme-border-radius) bg-(--theme-primary) px-3.5 py-1.5 text-[13px] font-bold text-(--theme-on-primary)"
            >
              {text(config, 'kicker', d.kicker)}
            </span>

            <h1 className="mt-6 text-[clamp(36px,5.6vw,64px)] font-bold leading-[1.08] tracking-[-0.035em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-6 max-w-[56ch] text-[17px] leading-[1.9] text-current/70">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              <Button tone="primary" size="lg" editableKey="ctaText" href="#pricing">
                {text(config, 'ctaText', d.ctaText)}
              </Button>
              <Button tone="ghost-on-deep" size="lg" editableKey="ctaSecondary" href="#courses">
                {text(config, 'ctaSecondary', d.ctaSecondary)}
              </Button>
            </div>

            {featureVisible(config, 'showStats') && (
              <dl
                data-removable="showStats"
                className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-current/18 pt-7"
              >
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <b className="block text-[30px] font-bold leading-none tracking-[-0.04em] tabular-nums">
                        {stat.value}
                      </b>
                      <span className="mt-1.5 block text-[13px] text-current/60">{stat.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {featureVisible(config, 'showSideVisual') && (
            <div data-removable="showSideVisual" className="grid gap-5">
              <HeroVisualSlot
                config={config}
                className={`${styles.slab} min-h-[260px] overflow-hidden rounded-(--theme-border-radius)`}
              >
                <div className={`${styles.slabInner} flex h-full min-h-[260px] flex-col justify-end p-7`}>
                  <b
                    data-editable="recordValue"
                    className="text-[60px] font-bold leading-none tracking-[-0.05em] tabular-nums"
                  >
                    {text(config, 'recordValue', d.recordValue)}
                  </b>
                  <span data-editable="recordLabel" className="mt-2 text-[13.5px] text-current/70">
                    {text(config, 'recordLabel', d.recordLabel)}
                  </span>
                </div>
              </HeroVisualSlot>

              <div className="rounded-(--theme-border-radius) border border-current/18 p-5">
                <div className="mb-2.5 flex items-baseline justify-between text-[13px] text-current/70">
                  <span data-editable="cycleLabel">{text(config, 'cycleLabel', d.cycleLabel)}</span>
                  <span className="font-bold tabular-nums">{percent}٪</span>
                </div>
                <div className={styles.track}>
                  <span className={styles.trackFill} style={{ width: `${percent}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
