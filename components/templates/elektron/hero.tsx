import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroSlideshowSlot } from '../_shared/hero-slideshow-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { ELEKTRON_DEFAULTS } from './defaults';
import styles from './elektron.module.css';

interface HeroStat {
  value: string;
  unit: string;
  label: string;
  note: string;
}

// Up to four photos — uploading more than one turns the glass panel into a
// slow slideshow of project shots.
const SLIDE_KEYS = ['bgImage', 'bgImage2', 'bgImage3', 'bgImage4'] as const;

/**
 * Studio stage: a mesh field, one gradient-clipped word in the headline, and a
 * single glass panel floating over soft colour orbs. The capability chips read
 * as a spec strip rather than another row of cards.
 */
export function ElektronHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = ELEKTRON_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const stats = list<HeroStat>(config, 'stats', d.stats);
  const chips = list<string>(config, 'chips', d.chips);

  return (
    <section id={id || 'hero'} className={`relative overflow-hidden ${styles.stage}`}>
      <div className={styles.mesh} aria-hidden="true" />

      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className={`${styles.chip} inline-flex items-center gap-2.5 px-4 py-1.5 text-[13px] font-bold`}>
              <span aria-hidden="true" className="size-2 rounded-full bg-(--theme-accent)" />
              <span data-editable="kicker">{text(config, 'kicker', d.kicker)}</span>
            </span>

            <h1 className="mt-7 text-[clamp(38px,6vw,72px)] font-extrabold leading-[1.06] tracking-[-0.035em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config} className={styles.gradWord}>
                {text(config, 'titleEm', d.titleEm)}
              </EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-6 max-w-[52ch] text-[17px] leading-[1.9] text-current/70">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
                <Button tone="primary" size="lg" editableKey="ctaText" href="#courses" className="!rounded-full">
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot config={config} flagKey="showHeroCtaSecondary" editMode={editMode} className="inline-flex">
                <Button
                  tone="ghost-on-deep"
                  size="lg"
                  editableKey="ctaSecondary"
                  href="#categories"
                  className="!rounded-full"
                >
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </Button>
              </RemovableSlot>
            </div>

            <RemovableSlot config={config} flagKey="showChips" editMode={editMode} className="mt-9">
              <ul className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <li key={chip} className={`${styles.chip} px-3.5 py-1.5 text-[12.5px] text-current/75`}>
                    {chip}
                  </li>
                ))}
              </ul>
            </RemovableSlot>
          </div>

          <RemovableSlot config={config} flagKey="showSideVisual" editMode={editMode} mediaKey="bgImage">
            <div className="relative">
              <span className={`${styles.orb} ${styles.orbA}`} aria-hidden="true" />
              <span className={`${styles.orb} ${styles.orbB}`} aria-hidden="true" />
              <HeroSlideshowSlot
                config={config}
                mediaKeys={SLIDE_KEYS}
                editMode={editMode}
                className={`${styles.glass} aspect-[5/4] min-h-[300px]`}
              >
                <div className="flex h-full w-full items-center justify-center p-10 text-center">
                  <span data-editable="photoCaption" className="text-[14px] text-current/60">
                    {text(config, 'photoCaption', d.photoCaption)}
                  </span>
                </div>
              </HeroSlideshowSlot>
            </div>
          </RemovableSlot>
        </div>

        <RemovableSlot config={config} flagKey="showStats" editMode={editMode} className="mt-16">
          <dl className="grid gap-x-10 gap-y-8 border-t border-current/14 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd>
                  <span className="block text-[34px] font-extrabold leading-none tracking-[-0.04em]">
                    {stat.value}
                    {stat.unit ? <small className="text-[15px] font-bold text-(--theme-accent)">{stat.unit}</small> : null}
                  </span>
                </dd>
                <dt className="mt-3 text-[14px] font-bold">{stat.label}</dt>
                <p className="mt-1 text-[12.5px] leading-[1.7] text-current/55">{stat.note}</p>
              </div>
            ))}
          </dl>
        </RemovableSlot>
      </Container>
    </section>
  );
}
