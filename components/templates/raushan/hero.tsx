import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVisualSlot } from '../_shared/hero-media';
import { RemovableSlot } from '../_shared/removable-slot';
import { text, type TemplateSectionProps } from '../_shared/types';
import { RAUSHAN_DEFAULTS } from './defaults';

/**
 * Raushan — light, oversized headline on the left, a plain framed screenshot
 * on the right. No decorative background art: the whitespace is the design.
 */
export function RaushanHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = RAUSHAN_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;

  return (
    <section id={id || 'hero'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <div className="grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <span
              data-editable="tag"
              className="inline-block rounded-(--theme-border-radius) bg-(--theme-primary-subtle) px-3.5 py-1.5 text-[13px] font-bold text-(--theme-primary)"
            >
              {text(config, 'tag', d.tag)}
            </span>

            <h1 className="mt-6 text-[clamp(38px,6vw,72px)] font-bold leading-[1.05] tracking-[-0.035em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-6 max-w-[52ch] text-[18px] leading-[1.85] text-(--theme-muted)">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
                <Button tone="accent" size="lg" editableKey="ctaText" href="#courses">
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot config={config} flagKey="showHeroCtaSecondary" editMode={editMode} className="inline-flex">
                <Button tone="outline" size="lg" editableKey="ctaSecondary">
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </Button>
              </RemovableSlot>
            </div>

            <RemovableSlot config={config} flagKey="showNote" editMode={editMode} className="mt-9">
              <p data-editable="note" className="text-[13.5px] text-(--theme-muted)">
                {text(config, 'note', d.note)}
              </p>
            </RemovableSlot>
          </div>

          <RemovableSlot config={config} flagKey="showSideVisual" editMode={editMode} mediaKey="bgImage">
            <HeroVisualSlot
              config={config}
              mode="fill"
              className="min-h-[280px] overflow-hidden rounded-(--theme-border-radius) border border-(--theme-border-color) shadow-(--theme-shadow)"
            >
              <div className="flex min-h-[280px] items-center justify-center bg-(--theme-surface-alt) p-10 text-center">
                <span data-editable="photoCaption" className="text-[14px] font-medium text-(--theme-muted)">
                  {text(config, 'photoCaption', d.photoCaption)}
                </span>
              </div>
            </HeroVisualSlot>
          </RemovableSlot>
        </div>
      </Container>
    </section>
  );
}
