import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroSlideshowSlot } from '../_shared/hero-slideshow-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { text, type TemplateSectionProps } from '../_shared/types';
import { SEPID_DEFAULTS } from './defaults';
import { templateHref } from '../_shared/routes';

// Up to four photos — the manager can upload more than one to turn the static
// screenshot into an auto-rotating slideshow.
const SLIDE_KEYS = ['bgImage', 'bgImage2', 'bgImage3', 'bgImage4'] as const;

/**
 * Sepid — ultra-minimal, centered hero. No decoration: the headline, a short
 * subhead and two buttons carry the page, with an optional plain visual below.
 */
export function SepidHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = SEPID_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;

  return (
    <section id={id || 'hero'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y) text-center">
        <h1 className="mx-auto max-w-[20ch] text-[clamp(34px,5.6vw,64px)] font-bold leading-[1.1] tracking-[-0.03em]">
          <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
          <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
          <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
        </h1>

        <p
          data-editable="subtitle"
          className="mx-auto mt-5 max-w-[46ch] text-[17px] leading-[1.85] text-(--theme-muted)"
        >
          {text(config, 'subtitle', d.subtitle)}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
            <Button tone="primary" size="md" editableKey="ctaText" href={templateHref(storeContext, 'courses')}>
              {text(config, 'ctaText', d.ctaText)}
            </Button>
          </RemovableSlot>
          <RemovableSlot config={config} flagKey="showHeroCtaSecondary" editMode={editMode} className="inline-flex">
            <Button tone="outline" size="md" editableKey="ctaSecondary" href={templateHref(storeContext, 'courses')}>
              {text(config, 'ctaSecondary', d.ctaSecondary)}
            </Button>
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
            className="min-h-[260px] rounded-(--theme-border-radius) border border-(--theme-border-color)"
          >
            <div className="flex min-h-[260px] items-center justify-center bg-(--theme-surface-alt) p-10">
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
