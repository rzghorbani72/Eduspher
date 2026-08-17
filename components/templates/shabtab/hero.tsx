import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroSlideshowSlot } from '../_shared/hero-slideshow-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { text, type TemplateSectionProps } from '../_shared/types';
import { SHABTAB_DEFAULTS } from './defaults';
import styles from './shabtab.module.css';

// Up to four photos — the manager can upload more than one to turn the static
// screenshot into an auto-rotating slideshow.
const SLIDE_KEYS = ['bgImage', 'bgImage2', 'bgImage3', 'bgImage4'] as const;

/**
 * Shabtab — dark gradient stage, oversized white headline, one floating glass
 * panel holding the manager's own screenshot.
 */
export function ShabtabHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = SHABTAB_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;

  return (
    <section id={id || 'hero'} className={`relative overflow-hidden ${styles.stage}`}>
      <Container className="relative z-[1] py-(--theme-section-padding-y) text-center">
        <span
          data-editable="tag"
          className="inline-block rounded-full border border-current/25 px-4 py-1.5 text-[13px] font-medium text-current/80"
        >
          {text(config, 'tag', d.tag)}
        </span>

        <h1 className="mx-auto mt-7 max-w-[18ch] text-[clamp(38px,6.4vw,74px)] font-bold leading-[1.06] tracking-[-0.035em]">
          <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
          <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
          <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
        </h1>

        <p
          data-editable="subtitle"
          className="mx-auto mt-6 max-w-[54ch] text-[18px] leading-[1.85] text-current/75"
        >
          {text(config, 'subtitle', d.subtitle)}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
            <Button tone="primary" size="lg" editableKey="ctaText" href="#courses">
              {text(config, 'ctaText', d.ctaText)}
            </Button>
          </RemovableSlot>
          <RemovableSlot config={config} flagKey="showNote" editMode={editMode} className="inline-flex">
            <span data-editable="note" className="text-[13.5px] text-current/60">
              {text(config, 'note', d.note)}
            </span>
          </RemovableSlot>
        </div>

        <RemovableSlot
          config={config}
          flagKey="showSideVisual"
          editMode={editMode}
          className="mx-auto mt-16 max-w-3xl"
          mediaKey="bgImage"
        >
          <HeroSlideshowSlot
            config={config}
            mediaKeys={SLIDE_KEYS}
            editMode={editMode}
            className={`${styles.glass} min-h-[300px]`}
          >
            <div className="flex min-h-[300px] items-center justify-center p-10">
              <span data-editable="photoCaption" className="text-[14px] font-medium text-current/60">
                {text(config, 'photoCaption', d.photoCaption)}
              </span>
            </div>
          </HeroSlideshowSlot>
        </RemovableSlot>
      </Container>
    </section>
  );
}
