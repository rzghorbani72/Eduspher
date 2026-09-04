import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroSlideshowSlot } from '../_shared/hero-slideshow-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { DANESHVAR_DEFAULTS } from './defaults';
import styles from './daneshvar.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface HeroStat {
  value: string;
  label: string;
}

// Up to three plates — a portrait plus lab or lecture photographs.
const SLIDE_KEYS = ['bgImage', 'bgImage2', 'bgImage3'] as const;

/**
 * Split hero: name and standing on one side, a matted plate on the other. The
 * plate takes a portrait by default and swaps to the intro video the moment
 * one is picked, so the academic framing survives either choice.
 */
export function DaneshvarHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = DANESHVAR_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const affiliations = list<string>(config, 'affiliations', d.affiliations);
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className={`relative overflow-hidden ${styles.paper}`}>
      <div className={styles.rules} aria-hidden="true" />

      <Container className="relative z-[1] py-(--theme-section-padding-y)">
        <div className="grid items-start gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span data-editable="kicker" className="text-[13px] font-bold tracking-[0.08em] text-(--theme-primary)">
              {text(config, 'kicker', d.kicker)}
            </span>

            <h1 className={`${styles.keyline} mt-6 text-[clamp(34px,4.8vw,58px)] font-bold leading-[1.15] tracking-[-0.02em]`}>
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-5 max-w-[54ch] text-[16.5px] leading-[1.95] text-(--theme-muted)">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
                <Button tone="primary" editableKey="ctaText" href={templateHref(storeContext, 'courses')}>
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot config={config} flagKey="showHeroCtaSecondary" editMode={editMode} className="inline-flex">
                <Button tone="outline" editableKey="ctaSecondary" href={templateHref(storeContext, 'register')}>
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </Button>
              </RemovableSlot>
            </div>

            <RemovableSlot config={config} flagKey="showStats" editMode={editMode} className="mt-10">
              <dl className="flex flex-wrap gap-x-12 gap-y-6" {...editableList('stats', stats)}>
                {stats.map((stat, index) => (
                  <div key={stat.label}>
                    <dd
                      {...editableItem('stats', index, 'value')}
                      className="block text-[30px] font-bold leading-none tracking-[-0.03em]"
                    >
                      {stat.value}
                    </dd>
                    <dt {...editableItem('stats', index, 'label')} className="mt-2 text-[13px] text-(--theme-muted)">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </RemovableSlot>
          </div>

          <div>
            <RemovableSlot config={config} flagKey="showSideVisual" editMode={editMode} mediaKey="bgImage">
              <div className={styles.plate}>
                <HeroSlideshowSlot
                  config={config}
                  mediaKeys={SLIDE_KEYS}
                  editMode={editMode}
                  className={`${styles.plateInner} aspect-[4/5]`}
                >
                  <span data-editable="photoCaption" className="px-8 text-center text-[13.5px] text-(--theme-muted)">
                    {text(config, 'photoCaption', d.photoCaption)}
                  </span>
                </HeroSlideshowSlot>
              </div>
            </RemovableSlot>

            <RemovableSlot config={config} flagKey="showAffiliations" editMode={editMode} className="mt-8">
              <span
                data-editable="affiliationsTitle"
                className="block text-[12.5px] font-bold text-(--theme-muted)"
              >
                {text(config, 'affiliationsTitle', d.affiliationsTitle)}
              </span>
              <ul className="mt-3" {...editableList('affiliations', affiliations)}>
                {affiliations.map((item, index) => (
                  <li
                    key={item}
                    {...editableItem('affiliations', index)}
                    className={`${styles.affiliation} py-3 text-[14.5px] leading-[1.7]`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </RemovableSlot>
          </div>
        </div>
      </Container>
    </section>
  );
}
