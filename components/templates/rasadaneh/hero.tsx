import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVisualSlot } from '../_shared/hero-media';
import { featureVisible, list, text, type TemplateSectionProps } from '../_shared/types';
import { RASADANEH_DEFAULTS } from './defaults';
import styles from './rasadaneh.module.css';

interface HeroStat {
  value: string;
  label: string;
}

/** Star positions for the chart motif — fixed, so the drawing is stable. */
const STARS = [
  { x: 41, y: 29, size: 9, bright: true },
  { x: 54, y: 38, size: 7, bright: true },
  { x: 62, y: 52, size: 5, bright: false },
  { x: 47, y: 62, size: 8, bright: true },
  { x: 33, y: 47, size: 4, bright: false },
  { x: 70, y: 31, size: 4, bright: false },
  { x: 26, y: 68, size: 3, bright: false },
  { x: 58, y: 74, size: 3, bright: false },
] as const;

const CONST_LINES = [
  { x: 41, y: 29, width: 15, angle: 151 },
  { x: 54, y: 38, width: 15, angle: 148 },
  { x: 62, y: 52, width: 17, angle: 214 },
  { x: 47, y: 62, width: 15, angle: 297 },
] as const;

/** Static hero with a printed star chart — pure CSS, no image request. */
export function RasadanehHero({ id, config }: TemplateSectionProps) {
  const d = RASADANEH_DEFAULTS.hero;
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span
              data-editable="eyebrow"
              className="inline-block rounded-(--theme-border-radius) bg-(--theme-primary-subtle) px-3.5 py-1.5 text-[13px] font-bold text-(--theme-primary)"
            >
              {text(config, 'eyebrow', d.eyebrow)}
            </span>

            <h1 className="mt-6 text-[clamp(34px,5.2vw,60px)] font-bold leading-[1.14] tracking-[-0.025em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-6 max-w-[56ch] text-[17px] leading-[1.9] text-(--theme-ink-2)">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <Button tone="primary" size="lg" editableKey="ctaText" href="#courses">
                {text(config, 'ctaText', d.ctaText)}
              </Button>
              <Button tone="outline" size="lg" editableKey="ctaSecondary" href="#showcase">
                {text(config, 'ctaSecondary', d.ctaSecondary)}
              </Button>
            </div>

            {featureVisible(config, 'showStats') && (
              <dl
                data-removable="showStats"
                className="mt-10 grid gap-6 border-t border-(--theme-border-color) pt-7 sm:grid-cols-2 lg:grid-cols-4"
              >
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <b className="block text-[26px] font-bold leading-none tracking-[-0.03em]">{stat.value}</b>
                      <span className="mt-2 block text-[13px] leading-[1.6] text-(--theme-muted)">{stat.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {featureVisible(config, 'showSideVisual') && (
            <div data-removable="showSideVisual">
              <HeroVisualSlot config={config} className={`${styles.chart} overflow-hidden`}>
                <div className={styles.chart}>
                  <span className={styles.chartDisc} aria-hidden="true" />

                  {CONST_LINES.map((line) => (
                    <span
                      key={`${line.x}-${line.y}`}
                      aria-hidden="true"
                      className={styles.constLine}
                      style={{
                        insetInlineStart: `${line.x}%`,
                        top: `${line.y}%`,
                        width: `${line.width}%`,
                        transform: `rotate(${line.angle}deg)`,
                      }}
                    />
                  ))}

                  {STARS.map((star) => (
                    <span
                      key={`${star.x}-${star.y}`}
                      aria-hidden="true"
                      className={`${styles.star} ${star.bright ? styles.starBright : ''}`}
                      style={{
                        insetInlineStart: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                      }}
                    />
                  ))}

                  <span className={styles.chartLabel} style={{ insetInlineStart: '50%', top: '20%' }}>
                    <span data-editable="chartLabelConstellation">
                      {text(config, 'chartLabelConstellation', d.chartLabels.constellation)}
                    </span>
                  </span>
                  <span className={styles.chartLabel} style={{ insetInlineStart: '14%', top: '83%' }}>
                    <span data-editable="chartLabelHorizon">
                      {text(config, 'chartLabelHorizon', d.chartLabels.horizon)}
                    </span>
                  </span>
                  <span className={styles.chartLabel} style={{ insetInlineEnd: '8%', top: '50%' }}>
                    <span data-editable="chartLabelMagnitude">
                      {text(config, 'chartLabelMagnitude', d.chartLabels.magnitude)}
                    </span>
                  </span>

                  <div className={styles.chartTag}>
                    <b data-editable="chartTagTitle" className="block text-[14px] font-bold">
                      {text(config, 'chartTagTitle', d.chartTagTitle)}
                    </b>
                    <span data-editable="chartTagNote" className="mt-1 block text-[12.5px] text-(--theme-muted)">
                      {text(config, 'chartTagNote', d.chartTagNote)}
                    </span>
                  </div>
                </div>
              </HeroVisualSlot>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
