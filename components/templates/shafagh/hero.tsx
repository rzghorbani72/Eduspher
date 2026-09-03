import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroSlideshowSlot } from '../_shared/hero-slideshow-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { SHAFAGH_DEFAULTS } from './defaults';
import styles from './shafagh.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface HeroStat {
  value: string;
  unit: string;
  label: string;
  note: string;
}

// Up to four photos — uploading more than one turns the plate into a slow
// slideshow of student work.
const SLIDE_KEYS = ['bgImage', 'bgImage2', 'bgImage3', 'bgImage4'] as const;

/**
 * Editorial cover: the headline breaks across two lines with a heavy/light
 * weight contrast, and the photo sits on an offset colour plate pushed toward
 * the page edge — a gallery spread, not a hero card.
 */
export function ShafaghHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = SHAFAGH_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className={`relative overflow-hidden text-(--theme-foreground) ${styles.wash}`}>
      <Container className="relative z-[1] py-(--theme-section-padding-y)">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex items-center gap-4">
              <span
                data-motion="live"
                className="size-2 flex-none rounded-full bg-(--theme-accent)"
                aria-hidden="true"
              />
              <span data-editable="kicker" className="text-[13px] font-bold text-(--theme-primary)">
                {text(config, 'kicker', d.kicker)}
              </span>
              <span className={`${styles.hair} hidden flex-1 sm:block`} aria-hidden="true" />
            </div>

            <h1 className="mt-7 text-[clamp(40px,6.4vw,76px)] leading-[1.02] tracking-[-0.035em]">
              <span data-editable="title" className="block font-extrabold">
                {text(config, 'title', d.title)}
              </span>
              <span className="mt-1 block">
                <EditableAccent config={config} className={styles.display}>
                  {text(config, 'titleEm', d.titleEm)}
                </EditableAccent>{' '}
                <span data-editable="titleEnd" className="font-extrabold">
                  {text(config, 'titleEnd', d.titleEnd)}
                </span>
              </span>
            </h1>

            <p data-editable="subtitle" className="mt-7 max-w-[48ch] text-[17px] leading-[1.9] text-(--theme-muted)">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
                <Button tone="deep" size="lg" editableKey="ctaText" href={templateHref(storeContext, 'courses')}>
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot config={config} flagKey="showHeroCtaSecondary" editMode={editMode} className="inline-flex">
                <span
                  data-editable="ctaSecondary"
                  className="border-b-2 border-(--theme-primary) pb-1 text-[15px] font-bold text-(--theme-primary)"
                >
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </span>
              </RemovableSlot>
            </div>
          </div>

          <RemovableSlot config={config} flagKey="showSideVisual" editMode={editMode} mediaKey="bgImage">
            <div className="relative">
              <span className={styles.plate} aria-hidden="true" data-motion="drift" />
              <HeroSlideshowSlot
                config={config}
                mediaKeys={SLIDE_KEYS}
                editMode={editMode}
                className={`${styles.frame} aspect-[4/5] min-h-[300px] w-[82%]`}
              >
                <div
                  className={`${styles.emptySlot} relative flex h-full w-full items-center justify-center p-10 text-center`}
                >
                  <span className={styles.grain} aria-hidden="true" />
                  <span data-editable="photoCaption" className="relative z-[1] text-[14px] text-(--theme-muted)">
                    {text(config, 'photoCaption', d.photoCaption)}
                  </span>
                </div>
              </HeroSlideshowSlot>
            </div>
          </RemovableSlot>
        </div>

        <RemovableSlot config={config} flagKey="showStats" editMode={editMode} className="mt-16">
          <span className={styles.hair} aria-hidden="true" />
          <dl className="grid gap-x-10 gap-y-8 pt-8 sm:grid-cols-2 lg:grid-cols-4" {...editableList('stats', stats)}>
            {stats.map((stat, index) => (
              <div key={stat.label}>
                <dd>
                  <span className="block text-[34px] font-extrabold leading-none tracking-[-0.04em]">
                    <span {...editableItem('stats', index, 'value')}>{stat.value}</span>
                    {stat.unit ? (
                      <small
                        {...editableItem('stats', index, 'unit')}
                        className="text-[15px] font-bold text-(--theme-primary)"
                      >
                        {stat.unit}
                      </small>
                    ) : null}
                  </span>
                </dd>
                <dt {...editableItem('stats', index, 'label')} className="mt-3 text-[14px] font-bold">
                  {stat.label}
                </dt>
                <p
                  {...editableItem('stats', index, 'note')}
                  className="mt-1 text-[12.5px] leading-[1.7] text-(--theme-muted)"
                >
                  {stat.note}
                </p>
              </div>
            ))}
          </dl>
        </RemovableSlot>
      </Container>
    </section>
  );
}
