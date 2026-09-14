import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVisualSlot } from '../_shared/hero-media';
import { RemovableSlot } from '../_shared/removable-slot';
import { Backdrop } from '../_shared/backdrop';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { TAVAN_DEFAULTS } from './defaults';
import styles from './tavan.module.css';
import { formatPercent } from '@/lib/utils';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface HeroStat {
  value: string;
  label: string;
}

export function TavanHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = TAVAN_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const stats = list<HeroStat>(config, 'stats', d.stats);
  const percent = typeof config?.cyclePercent === 'number' ? config.cyclePercent : d.cyclePercent;

  return (
    <section
      id={id || 'hero'}
      className="relative overflow-hidden bg-(--theme-deep) text-(--theme-on-deep)"
    >
      <Backdrop variant="aurora" tone="deep" motion="drift" />
      <Backdrop variant="grid" tone="deep" />
      <Container className="relative z-[1] py-(--theme-section-padding-y)">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span
              data-editable="kicker"
              className="inline-block rounded-(--theme-border-radius) bg-(--theme-primary) px-3.5 py-1.5 text-[13px] font-bold text-(--theme-on-primary)"
            >
              {text(config, 'kicker', d.kicker)}
            </span>

            <h1 className="mt-6 text-[clamp(36px,5.6vw,64px)] leading-[1.08] font-bold tracking-[-0.035em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p
              data-editable="subtitle"
              className="mt-6 max-w-[56ch] text-[17px] leading-[1.9] text-current/70"
            >
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              <RemovableSlot
                config={config}
                flagKey="showHeroCta"
                editMode={editMode}
                className="inline-flex"
              >
                <Button
                  tone="primary"
                  size="lg"
                  editableKey="ctaText"
                  href={templateHref(storeContext, 'courses')}
                >
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot
                config={config}
                flagKey="showHeroCtaSecondary"
                editMode={editMode}
                className="inline-flex"
              >
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

            <RemovableSlot
              config={config}
              flagKey="showStats"
              editMode={editMode}
              className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-current/18 pt-7"
            >
              <dl className="contents" {...editableList('stats', stats)}>
                {stats.map((stat, index) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <b
                        {...editableItem('stats', index, 'value')}
                        className="block text-[30px] leading-none font-bold tracking-[-0.04em] tabular-nums"
                      >
                        {stat.value}
                      </b>
                      <span
                        {...editableItem('stats', index, 'label')}
                        className="mt-1.5 block text-[13px] text-current/60"
                      >
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </RemovableSlot>
          </div>

          <RemovableSlot
            config={config}
            flagKey="showSideVisual"
            editMode={editMode}
            className="grid gap-5"
            mediaKey="bgImage"
          >
            <HeroVisualSlot
              config={config}
              mode="fill"
              className={`${styles.slab} min-h-[260px] overflow-hidden rounded-(--theme-border-radius)`}
            >
              <div
                className={`${styles.slabInner} flex h-full min-h-[260px] flex-col justify-end p-7`}
              >
                <b
                  data-editable="recordValue"
                  className="text-[60px] leading-none font-bold tracking-[-0.05em] tabular-nums"
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
                <span className="font-bold tabular-nums">{formatPercent(percent, 'fa')}</span>
              </div>
              <div className={styles.track}>
                <span
                  className={styles.trackFill}
                  data-motion="wash"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </RemovableSlot>
        </div>
      </Container>
    </section>
  );
}
