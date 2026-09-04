import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroSlideshowSlot } from '../_shared/hero-slideshow-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { PELEH_DEFAULTS } from './defaults';
import styles from './peleh.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface RankItem {
  rank: string;
  name: string;
  note: string;
}

// Up to three photos — class shots or the teacher at the board.
const SLIDE_KEYS = ['bgImage', 'bgImage2', 'bgImage3'] as const;

/**
 * Results-first hero: the exam countdown creates the urgency, the rank cards
 * supply the proof, and the media frame carries the intro video once one is
 * picked. A stair motif climbs behind it all.
 */
export function PelehHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = PELEH_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const ranks = list<RankItem>(config, 'ranks', d.ranks);

  return (
    <section id={id || 'hero'} className={`relative overflow-hidden ${styles.stage}`}>
      <div className={styles.stairs} aria-hidden="true" />

      <Container className="relative z-[1] py-(--theme-section-padding-y)">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span data-editable="kicker" className="text-[13px] font-bold text-(--theme-primary)">
              {text(config, 'kicker', d.kicker)}
            </span>

            <h1 className="mt-5 text-[clamp(36px,5.6vw,66px)] font-extrabold leading-[1.1] tracking-[-0.03em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-5 max-w-[50ch] text-[16.5px] leading-[1.9] text-(--theme-muted)">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
                <Button tone="primary" size="lg" editableKey="ctaText" href={templateHref(storeContext, 'courses')}>
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot config={config} flagKey="showHeroCtaSecondary" editMode={editMode} className="inline-flex">
                <Button tone="outline" size="lg" editableKey="ctaSecondary" href={templateHref(storeContext, 'register')}>
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </Button>
              </RemovableSlot>
            </div>

            <RemovableSlot config={config} flagKey="showCountdown" editMode={editMode} className="mt-9">
              <div className={`${styles.countdown} inline-flex items-baseline gap-3 px-6 py-4`}>
                <span data-editable="countdownLabel" className="text-[14px] font-bold">
                  {text(config, 'countdownLabel', d.countdownLabel)}
                </span>
                <b
                  data-editable="countdownValue"
                  className={`${styles.countdownValue} text-[34px] font-extrabold tracking-[-0.03em]`}
                >
                  {text(config, 'countdownValue', d.countdownValue)}
                </b>
                <span data-editable="countdownUnit" className="text-[14px] font-bold text-(--theme-muted)">
                  {text(config, 'countdownUnit', d.countdownUnit)}
                </span>
              </div>
            </RemovableSlot>
          </div>

          <div>
            <RemovableSlot config={config} flagKey="showSideVisual" editMode={editMode} mediaKey="bgImage">
              <HeroSlideshowSlot
                config={config}
                mediaKeys={SLIDE_KEYS}
                editMode={editMode}
                className="rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) aspect-[4/3] min-h-[260px] shadow-(--theme-shadow)"
              >
                <span data-editable="photoCaption" className="px-8 text-center text-[13.5px] text-(--theme-muted)">
                  {text(config, 'photoCaption', d.photoCaption)}
                </span>
              </HeroSlideshowSlot>
            </RemovableSlot>

            <RemovableSlot config={config} flagKey="showRanks" editMode={editMode} className="mt-6">
              <span
                data-editable="ranksTitle"
                className="block text-[13px] font-bold text-(--theme-muted)"
              >
                {text(config, 'ranksTitle', d.ranksTitle)}
              </span>
              <ul className="mt-3 grid gap-3 sm:grid-cols-3" {...editableList('ranks', ranks)}>
                {ranks.map((item, index) => (
                  <li key={item.name} className={`${styles.rank} p-4`}>
                    <b
                      {...editableItem('ranks', index, 'rank')}
                      className={`${styles.rankNo} block text-[32px] font-extrabold tracking-[-0.04em]`}
                    >
                      {item.rank}
                    </b>
                    <span {...editableItem('ranks', index, 'name')} className="mt-2 block text-[14px] font-bold">
                      {item.name}
                    </span>
                    <span
                      {...editableItem('ranks', index, 'note')}
                      className="mt-1 block text-[12px] text-(--theme-muted)"
                    >
                      {item.note}
                    </span>
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
