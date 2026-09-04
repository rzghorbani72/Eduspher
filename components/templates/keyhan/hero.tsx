import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVisualSlot } from '../_shared/hero-media';
import { RemovableSlot } from '../_shared/removable-slot';
import { Backdrop } from '../_shared/backdrop';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { KEYHAN_DEFAULTS } from './defaults';
import styles from './keyhan.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface HeroStat {
  value: string;
  unit: string;
  label: string;
  note: string;
}

export function KeyhanHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = KEYHAN_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className={`relative overflow-hidden ${styles.void}`}>
      <Backdrop variant="aurora" tone="deep" motion="drift" className="opacity-70" />
      <div className={`${styles.stars} ${styles.dense}`} aria-hidden="true" data-motion="wash" />
      <div className={styles.gridlines} aria-hidden="true" data-motion="wash" />

      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 flex items-center gap-2.5">
              <span data-motion="live" className="size-2 rounded-full bg-(--theme-accent)" aria-hidden="true" />
              <span data-editable="kicker" className="text-[13px] font-medium tracking-[0.08em] text-current/70">
                {text(config, 'kicker', d.kicker)}
              </span>
            </div>

            <h1 className="text-[clamp(34px,5.4vw,62px)] font-bold leading-[1.12] tracking-[-0.03em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-6 max-w-[56ch] text-[17px] leading-[1.9] text-current/72">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
                <Button tone="primary" size="lg" editableKey="ctaText" href={templateHref(storeContext, 'courses')}>
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot config={config} flagKey="showHeroCtaSecondary" editMode={editMode} className="inline-flex">
                <Button
                  tone="ghost-on-deep"
                  size="lg"
                  editableKey="ctaSecondary"
                  href={templateHref(storeContext, 'register')}
                >
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </Button>
              </RemovableSlot>
            </div>

            <p className="mt-9 flex flex-wrap items-center gap-3 text-[14px] text-current/70">
              <span
                data-editable="noteTag"
                data-motion="signal"
                className="rounded-(--theme-border-radius) bg-(--theme-accent) px-3 py-1 text-[12px] font-bold text-(--theme-on-accent)"
              >
                {text(config, 'noteTag', d.noteTag)}
              </span>
              <span data-editable="note">{text(config, 'note', d.note)}</span>
            </p>
          </div>

          <RemovableSlot config={config} flagKey="showSideVisual" editMode={editMode} mediaKey="bgImage">
            <HeroVisualSlot
              config={config}
              mode="fill"
              className={`${styles.orbit} min-h-[280px] overflow-hidden rounded-(--theme-border-radius)`}
            >
              <div className={styles.orbit} aria-hidden="true" data-motion="drift">
                <span className={styles.ring} />
                <span className={`${styles.ring} ${styles.ring2}`} />
                <span className={`${styles.ring} ${styles.ring3}`} />
                <span className={`${styles.ring} ${styles.ring4}`} />
                <span className={styles.sweep} />
                <span className={styles.planet} />
                <span className={styles.moon} />
                <span className={`${styles.moon} ${styles.moon2}`} />
              </div>
            </HeroVisualSlot>
          </RemovableSlot>
        </div>

        <RemovableSlot
          config={config}
          flagKey="showStats"
          editMode={editMode}
          className="mt-16 grid gap-px overflow-hidden rounded-(--theme-border-radius) border border-current/15 bg-current/15 sm:grid-cols-2 lg:grid-cols-4"
        >
          <dl className="contents" {...editableList('stats', stats)}>
            {stats.map((stat, index) => (
              <div key={stat.label} className={`p-6 ${styles.void}`}>
                <dt
                  {...editableItem('stats', index, 'label')}
                  className="text-[12px] font-medium tracking-[0.1em] text-current/55"
                >
                  {stat.label}
                </dt>
                <dd>
                  <span className="mt-2 block text-[34px] font-bold leading-none tracking-[-0.04em]">
                    <span {...editableItem('stats', index, 'value')}>{stat.value}</span>
                    {stat.unit ? (
                      <small
                        {...editableItem('stats', index, 'unit')}
                        className="ms-1.5 text-[13px] font-medium text-current/60"
                      >
                        {stat.unit}
                      </small>
                    ) : null}
                  </span>
                  <span {...editableItem('stats', index, 'note')} className="mt-2 block text-[12.5px] text-current/55">
                    {stat.note}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </RemovableSlot>
      </Container>
    </section>
  );
}
