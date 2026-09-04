import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroSlideshowSlot } from '../_shared/hero-slideshow-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { SHAPARAK_DEFAULTS } from './defaults';
import styles from './shaparak.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface CommandBlock {
  label: string;
  tone: string;
}

// Up to four photos — class shots and the things the children built.
const SLIDE_KEYS = ['bgImage', 'bgImage2', 'bgImage3', 'bgImage4'] as const;

const BLOCK_TONE: Record<string, string> = {
  a: styles.blockA,
  b: styles.blockB,
  c: styles.blockC,
  d: styles.blockD,
};

/**
 * Playground hero. The stack of command blocks shows a parent exactly what
 * their child will be doing in the first session — far more convincing than a
 * paragraph about "computational thinking". The media frame carries a class
 * photo, or the intro video once one is picked.
 */
export function ShaparakHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = SHAPARAK_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const blocks = list<CommandBlock>(config, 'blocks', d.blocks);
  const badges = list<string>(config, 'badges', d.badges);

  return (
    <section id={id || 'hero'} className={`relative overflow-hidden ${styles.stage}`}>
      <Container className="relative z-[1] py-(--theme-section-padding-y)">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span
              data-editable="kicker"
              className={`${styles.badge} inline-block px-4 py-1.5 text-[13px] font-bold text-(--theme-primary)`}
            >
              {text(config, 'kicker', d.kicker)}
            </span>

            <h1 className="mt-6 text-[clamp(36px,5.6vw,64px)] font-extrabold leading-[1.12] tracking-[-0.03em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-5 max-w-[50ch] text-[16.5px] leading-[1.9] text-(--theme-muted)">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
                <Button
                  tone="primary"
                  size="lg"
                  editableKey="ctaText"
                  href={templateHref(storeContext, 'register')}
                  className="!rounded-full"
                >
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot config={config} flagKey="showHeroCtaSecondary" editMode={editMode} className="inline-flex">
                <Button
                  tone="outline"
                  size="lg"
                  editableKey="ctaSecondary"
                  href={templateHref(storeContext, 'courses')}
                  className="!rounded-full"
                >
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </Button>
              </RemovableSlot>
            </div>

            <RemovableSlot config={config} flagKey="showBadges" editMode={editMode} className="mt-8">
              <ul className="flex flex-wrap gap-2.5" {...editableList('badges', badges)}>
                {badges.map((badge, index) => (
                  <li
                    key={badge}
                    {...editableItem('badges', index)}
                    className={`${styles.badge} px-3.5 py-1.5 text-[12.5px] font-bold text-(--theme-muted)`}
                  >
                    {badge}
                  </li>
                ))}
              </ul>
            </RemovableSlot>
          </div>

          <div className="relative">
            <span className={`${styles.blob} ${styles.blobA}`} aria-hidden="true" data-motion="drift" />
            <span className={`${styles.blob} ${styles.blobB}`} aria-hidden="true" data-motion="drift" />

            <RemovableSlot config={config} flagKey="showSideVisual" editMode={editMode} mediaKey="bgImage">
              <HeroSlideshowSlot
                config={config}
                mediaKeys={SLIDE_KEYS}
                editMode={editMode}
                className={`${styles.sticker} relative z-[1] aspect-[4/3] min-h-[260px]`}
              >
                <span data-editable="photoCaption" className="px-8 text-center text-[13.5px] text-(--theme-muted)">
                  {text(config, 'photoCaption', d.photoCaption)}
                </span>
              </HeroSlideshowSlot>
            </RemovableSlot>

            <RemovableSlot config={config} flagKey="showBlocks" editMode={editMode} className="relative z-[1] mt-7">
              <span
                data-editable="blocksTitle"
                className="block text-[13px] font-bold text-(--theme-muted)"
              >
                {text(config, 'blocksTitle', d.blocksTitle)}
              </span>
              <ul className="mt-3 grid gap-2.5" {...editableList('blocks', blocks)}>
                {blocks.map((item, index) => (
                  <li
                    key={item.label}
                    {...editableItem('blocks', index, 'label')}
                    className={`${styles.block} ${BLOCK_TONE[item.tone] ?? styles.blockA} text-[14px]`}
                    style={{ marginInlineStart: `${index * 14}px` }}
                  >
                    {item.label}
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
