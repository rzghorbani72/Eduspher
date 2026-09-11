import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { HeroSlideshowSlot } from '../_shared/hero-slideshow-slot';
import { Backdrop } from '../_shared/backdrop';
import { RemovableSlot } from '../_shared/removable-slot';
import { text, type TemplateSectionProps } from '../_shared/types';
import { HAMRANG_DEFAULTS } from './defaults';
import styles from './hamrang.module.css';
import { templateHref } from '../_shared/routes';
import { heroAlign } from '../_shared/hero-align';

// Up to four photos — the manager can upload more than one to turn the static
// screenshot into an auto-rotating slideshow.
const SLIDE_KEYS = ['bgImage', 'bgImage2', 'bgImage3', 'bgImage4'] as const;

/**
 * Hamrang — bold, colourful and centered. The headline's key word sits on a
 * tilted colour tag, one plain framed screenshot anchors the page below.
 */
export function HamrangHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = HAMRANG_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const a = heroAlign(config);

  return (
    <section id={id || 'hero'} className="relative overflow-hidden bg-(--theme-background) text-(--theme-foreground)">
      <Backdrop variant="aurora" motion="drift" />
      <Backdrop variant="grain" />
      <Container className={`relative z-[1] py-(--theme-section-padding-y) ${a.text}`}>
        <RemovableSlot config={config} flagKey="showTag" editMode={editMode} className="inline-flex">
          <span
            data-editable="tag"
            className="inline-block rounded-full border border-(--theme-border-strong) px-4 py-1.5 text-[13px] font-bold"
          >
            {text(config, 'tag', d.tag)}
          </span>
        </RemovableSlot>

        <h1 className={`${a.block} mt-6 max-w-[16ch] text-[clamp(38px,6.6vw,76px)] font-extrabold leading-[1.05] tracking-[-0.03em]`}>
          <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
          <span data-editable="titleEm" className={styles.tag}>
            {text(config, 'titleEm', d.titleEm)}
          </span>
          <br />
          <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
        </h1>

        <p
          data-editable="subtitle"
          className={`${a.block} mt-6 max-w-[48ch] text-[18px] leading-[1.85] text-(--theme-muted)`}
        >
          {text(config, 'subtitle', d.subtitle)}
        </p>

        <div className={`mt-9 flex flex-wrap items-center ${a.justify} gap-3.5`}>
          <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
            <Button tone="deep" size="lg" editableKey="ctaText" href={templateHref(storeContext, 'courses')} className="!rounded-full">
              {text(config, 'ctaText', d.ctaText)}
            </Button>
          </RemovableSlot>
          <RemovableSlot config={config} flagKey="showHeroCtaSecondary" editMode={editMode} className="inline-flex">
            <Button tone="outline" size="lg" editableKey="ctaSecondary" className="!rounded-full" href={templateHref(storeContext, 'courses')}>
              {text(config, 'ctaSecondary', d.ctaSecondary)}
            </Button>
          </RemovableSlot>
        </div>

        <RemovableSlot
          config={config}
          flagKey="showSideVisual"
          editMode={editMode}
          className="mx-auto mt-14 max-w-3xl"
          mediaKey="bgImage"
        >
          <HeroSlideshowSlot
            config={config}
            mediaKeys={SLIDE_KEYS}
            editMode={editMode}
            className={`${styles.frame} min-h-[260px]`}
          >
            <div className="flex min-h-[260px] items-center justify-center bg-(--theme-surface-alt) p-10">
              <span data-editable="photoCaption" className="text-[14px] font-bold text-(--theme-muted)">
                {text(config, 'photoCaption', d.photoCaption)}
              </span>
            </div>
          </HeroSlideshowSlot>
        </RemovableSlot>
      </Container>
    </section>
  );
}
