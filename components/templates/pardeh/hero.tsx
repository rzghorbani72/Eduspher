import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { HeroVideoBanner, HeroVideoOverlay } from '../_shared/hero-video-banner';
import { RemovableSlot } from '../_shared/removable-slot';
import { featureVisible, list, text, type TemplateSectionProps } from '../_shared/types';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';
import { PARDEH_DEFAULTS } from './defaults';
import styles from '../shafagh/shafagh.module.css';
import { heroAlign } from '../_shared/hero-align';

interface HeroStat {
  value: string;
  unit: string;
  label: string;
  note: string;
}

/**
 * Cinema screen: a full-width looping video fills the hero and the Shafagh
 * headline sits centred on top. Stats hang on the bottom edge of the frame.
 */
export function PardehHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = PARDEH_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const a = heroAlign(config);
  const stats = list<HeroStat>(config, 'stats', d.stats);
  // The wash only exists to keep copy readable, so bare footage gets none.
  const hasCopy = ['showKicker', 'showTitle', 'showSubtitle', 'showHeroCta', 'showHeroCtaSecondary'].some((key) =>
    featureVisible(config, key)
  );

  return (
    <section id={id || 'hero'} className="relative py-0! text-white">
      <HeroVideoBanner
        config={config}
        overlay={hasCopy ? <HeroVideoOverlay /> : null}
        placeholder={
          <div className={`${styles.emptySlot} flex h-full w-full items-center justify-center p-10 text-center`}>
            <span className={styles.grain} aria-hidden="true" />
            <span data-editable="videoCaption" className="relative z-[1] text-[15px] text-(--theme-muted)">
              {text(config, 'videoCaption', d.videoCaption)}
            </span>
          </div>
        }
      >
        <Container className={`flex flex-1 flex-col ${a.items} justify-center py-(--theme-section-padding-y) ${a.text}`}>
          <RemovableSlot config={config} flagKey="showKicker" editMode={editMode} ghost>
            <div className="flex items-center gap-3">
              <span
                data-motion="live"
                className="size-2 flex-none rounded-full bg-(--theme-accent)"
                aria-hidden="true"
              />
              <span data-editable="kicker" className="text-[13px] font-bold text-white/85">
                {text(config, 'kicker', d.kicker)}
              </span>
            </div>
          </RemovableSlot>

          <RemovableSlot config={config} flagKey="showTitle" editMode={editMode} ghost className="mt-7">
            <h1 className="text-[clamp(40px,6.4vw,80px)] leading-[1.02] tracking-[-0.035em]">
              <span data-editable="title" className="font-extrabold">
                {text(config, 'title', d.title)}
              </span>{' '}
              <span data-editable="titleEm" className="font-light text-(--theme-accent)">
                {text(config, 'titleEm', d.titleEm)}
              </span>{' '}
              <span data-editable="titleEnd" className="font-extrabold">
                {text(config, 'titleEnd', d.titleEnd)}
              </span>
            </h1>
          </RemovableSlot>

          <RemovableSlot config={config} flagKey="showSubtitle" editMode={editMode} ghost className="mt-7">
            <p data-editable="subtitle" className="max-w-[52ch] text-[17px] leading-[1.9] text-white/80">
              {text(config, 'subtitle', d.subtitle)}
            </p>
          </RemovableSlot>

          <div className={`mt-9 flex flex-wrap items-center ${a.justify} gap-3.5`}>
            <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} ghost className="inline-flex">
              <Button tone="primary" size="lg" editableKey="ctaText" href={templateHref(storeContext, 'courses')}>
                {text(config, 'ctaText', d.ctaText)}
              </Button>
            </RemovableSlot>
            <RemovableSlot
              config={config}
              flagKey="showHeroCtaSecondary"
              editMode={editMode}
              ghost
              className="inline-flex"
            >
              <span data-editable="ctaSecondary" className="border-b-2 border-white/70 pb-1 text-[15px] font-bold">
                {text(config, 'ctaSecondary', d.ctaSecondary)}
              </span>
            </RemovableSlot>
          </div>
        </Container>

        <RemovableSlot config={config} flagKey="showStats" editMode={editMode} ghost>
          <Container className="pb-10">
            <dl
              className="grid gap-x-10 gap-y-6 border-t border-white/25 pt-7 sm:grid-cols-2 lg:grid-cols-4"
              {...editableList('stats', stats)}
            >
              {stats.map((stat, index) => (
                <div key={stat.label}>
                  <dd className="text-[30px] font-extrabold leading-none tracking-[-0.04em]">
                    <span {...editableItem('stats', index, 'value')}>{stat.value}</span>
                    {stat.unit ? (
                      <small
                        {...editableItem('stats', index, 'unit')}
                        className="text-[15px] font-bold text-(--theme-accent)"
                      >
                        {stat.unit}
                      </small>
                    ) : null}
                  </dd>
                  <dt {...editableItem('stats', index, 'label')} className="mt-2 text-[14px] font-bold">
                    {stat.label}
                  </dt>
                  <p
                    {...editableItem('stats', index, 'note')}
                    className="mt-1 text-[12.5px] leading-[1.7] text-white/70"
                  >
                    {stat.note}
                  </p>
                </div>
              ))}
            </dl>
          </Container>
        </RemovableSlot>
      </HeroVideoBanner>
    </section>
  );
}
