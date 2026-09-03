import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroSlideshowSlot } from '../_shared/hero-slideshow-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { text, type TemplateSectionProps } from '../_shared/types';
import { BARAN_DEFAULTS } from './defaults';
import styles from './baran.module.css';
import { templateHref } from '../_shared/routes';

// Up to four photos — the manager can upload more than one to turn the static
// screenshot into an auto-rotating slideshow.
const SLIDE_KEYS = ['bgImage', 'bgImage2', 'bgImage3', 'bgImage4'] as const;

/**
 * Baran — soft pastel gradient, centered headline, a single CTA. Calm and
 * quiet by design: one button, one line of trust copy, one optional photo.
 */
export function BaranHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = BARAN_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;

  return (
    <section id={id || 'hero'} className={`relative overflow-hidden text-(--theme-foreground) ${styles.wash}`}>
      <Container className="relative z-[1] py-(--theme-section-padding-y) text-center">
        <RemovableSlot config={config} flagKey="showTag" editMode={editMode} className="inline-flex">
          <span
            data-editable="tag"
            className="inline-block rounded-full bg-(--theme-surface) px-4 py-1.5 text-[13px] font-bold text-(--theme-primary) shadow-(--theme-shadow)"
          >
            {text(config, 'tag', d.tag)}
          </span>
        </RemovableSlot>

        <h1 className="mx-auto mt-6 max-w-[18ch] text-[clamp(34px,5.6vw,64px)] font-bold leading-[1.12] tracking-[-0.03em]">
          <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
          <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
          <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
        </h1>

        <p
          data-editable="subtitle"
          className="mx-auto mt-5 max-w-[48ch] text-[17px] leading-[1.85] text-(--theme-muted)"
        >
          {text(config, 'subtitle', d.subtitle)}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
            <Button tone="primary" size="lg" editableKey="ctaText" href={templateHref(storeContext, 'courses')}>
              {text(config, 'ctaText', d.ctaText)}
            </Button>
          </RemovableSlot>
          <RemovableSlot config={config} flagKey="showNote" editMode={editMode}>
            <span data-editable="note" className="text-[13px] text-(--theme-muted)">
              {text(config, 'note', d.note)}
            </span>
          </RemovableSlot>
        </div>

        <RemovableSlot
          config={config}
          flagKey="showSideVisual"
          editMode={editMode}
          className="mx-auto mt-14 max-w-4xl"
          mediaKey="bgImage"
        >
          <HeroSlideshowSlot
            config={config}
            mediaKeys={SLIDE_KEYS}
            editMode={editMode}
            className="min-h-[260px] rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) shadow-(--theme-shadow)"
          >
            <div className="flex min-h-[260px] items-center justify-center p-10">
              <span data-editable="photoCaption" className="text-[14px] font-medium text-(--theme-muted)">
                {text(config, 'photoCaption', d.photoCaption)}
              </span>
            </div>
          </HeroSlideshowSlot>
        </RemovableSlot>
      </Container>
    </section>
  );
}
