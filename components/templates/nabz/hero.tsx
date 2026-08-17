import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroSlideshowSlot } from '../_shared/hero-slideshow-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { NABZ_DEFAULTS } from './defaults';
import styles from './nabz.module.css';

interface HeroStat {
  value: string;
  unit: string;
  label: string;
  note: string;
}

// Up to four photos — the manager can upload more than one so the visual
// slot cycles through a small run of project shots.
const SLIDE_KEYS = ['bgImage', 'bgImage2', 'bgImage3', 'bgImage4'] as const;

export function NabzHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = NABZ_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className={`relative overflow-hidden ${styles.stage}`}>
      <div className={styles.signal} aria-hidden="true" />

      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-current/20 px-4 py-1.5 text-[13px] font-bold text-current/85">
              <span aria-hidden="true" className="size-2 rounded-full bg-(--theme-accent)" />
              <span data-editable="kicker">{text(config, 'kicker', d.kicker)}</span>
            </span>

            <h1 className="mt-6 text-[clamp(34px,5.4vw,62px)] font-bold leading-[1.12] tracking-[-0.03em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-6 max-w-[56ch] text-[17px] leading-[1.9] text-current/72">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
                <Button tone="accent" size="lg" editableKey="ctaText" href="#courses" className="!rounded-full">
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
          </div>

          <RemovableSlot config={config} flagKey="showSideVisual" editMode={editMode} mediaKey="bgImage">
            <div className="relative">
              <span className={styles.ring} aria-hidden="true" />
              <span className={styles.ring2} aria-hidden="true" />
              <HeroSlideshowSlot
                config={config}
                mediaKeys={SLIDE_KEYS}
                editMode={editMode}
                className="relative min-h-[300px] rounded-(--theme-border-radius) border border-current/20"
              >
                <div className="flex min-h-[300px] items-center justify-center p-10 text-center">
                  <span data-editable="photoCaption" className="text-[14px] font-medium text-current/60">
                    {text(config, 'photoCaption', d.photoCaption)}
                  </span>
                </div>
              </HeroSlideshowSlot>
            </div>
          </RemovableSlot>
        </div>

        <RemovableSlot
          config={config}
          flagKey="showStats"
          editMode={editMode}
          className="mt-16 grid gap-px overflow-hidden rounded-(--theme-border-radius) border border-current/14 bg-current/14 sm:grid-cols-2 lg:grid-cols-4"
        >
          <dl className="contents">
            {stats.map((stat) => (
              <div key={stat.label} className={`p-6 ${styles.stage}`}>
                <dt className="text-[12px] font-medium tracking-[0.1em] text-current/60">{stat.label}</dt>
                <dd>
                  <span className="mt-2 block text-[30px] font-bold leading-none tracking-[-0.04em]">
                    {stat.value}
                    {stat.unit ? <small className="ms-1.5 text-[13px] font-medium text-current/60">{stat.unit}</small> : null}
                  </span>
                  <span className="mt-2 block text-[12.5px] text-current/55">{stat.note}</span>
                </dd>
              </div>
            ))}
          </dl>
        </RemovableSlot>
      </Container>
    </section>
  );
}
