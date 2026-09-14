import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVideoSlot } from '../_shared/hero-video-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { Backdrop } from '../_shared/backdrop';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { ANDISHEH_DEFAULTS } from './defaults';
import styles from './andisheh.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface PipelineStage {
  step: string;
  note: string;
}

/**
 * Video-first terminal stage. The demo reel is the argument this page makes —
 * "the model actually ships" — so it gets a terminal window of its own rather
 * than sharing the frame with a photo. The pipeline rail below it states the
 * curriculum in one line.
 */
export function AndishehHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = ANDISHEH_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const chips = list<string>(config, 'chips', d.chips);
  const pipeline = list<PipelineStage>(config, 'pipeline', d.pipeline);

  return (
    <section id={id || 'hero'} className={`relative overflow-hidden ${styles.stage}`}>
      <Backdrop variant="aurora" tone="deep" motion="drift" />
      <div className={styles.scan} aria-hidden="true" />

      <Container className="relative z-[1] py-(--theme-section-padding-y)">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <span
              className={`${styles.chip} inline-flex items-center gap-2.5 px-4 py-1.5 text-[13px] font-bold`}
            >
              <span
                aria-hidden="true"
                data-motion="live"
                className="size-2 rounded-full bg-(--theme-primary)"
              />
              <span data-editable="kicker">{text(config, 'kicker', d.kicker)}</span>
            </span>

            <h1 className="mt-7 text-[clamp(36px,5.4vw,64px)] leading-[1.08] font-extrabold tracking-[-0.035em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p
              data-editable="subtitle"
              className="mt-6 max-w-[52ch] text-[16.5px] leading-[1.9] text-current/70"
            >
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <RemovableSlot
                config={config}
                flagKey="showHeroCta"
                editMode={editMode}
                className="inline-flex"
              >
                <Button
                  tone="primary"
                  size="lg"
                  editableKey="ctaText"
                  href={templateHref(storeContext, 'courses')}
                >
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot
                config={config}
                flagKey="showHeroCtaSecondary"
                editMode={editMode}
                className="inline-flex"
              >
                <Button
                  tone="ghost-on-deep"
                  size="lg"
                  editableKey="ctaSecondary"
                  href={templateHref(storeContext, 'register')}
                >
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </Button>
              </RemovableSlot>
            </div>

            <RemovableSlot config={config} flagKey="showChips" editMode={editMode} className="mt-8">
              <ul className="flex flex-wrap gap-2" {...editableList('chips', chips)}>
                {chips.map((chip, index) => (
                  <li
                    key={chip}
                    {...editableItem('chips', index)}
                    className={`${styles.chip} px-3.5 py-1.5 text-[12.5px] text-current/75`}
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </RemovableSlot>
          </div>

          <RemovableSlot config={config} flagKey="showHeroVideo" editMode={editMode}>
            <div className={styles.term}>
              <div className={styles.termBar}>
                <span className={`${styles.dot} ${styles.dotLive}`} aria-hidden="true" />
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.dot} aria-hidden="true" />
                <span
                  className={`${styles.mono} text-[12px] text-current/55`}
                  data-editable="videoTab"
                >
                  {text(config, 'videoTab', d.videoTab)}
                </span>
              </div>
              <HeroVideoSlot config={config}>
                <div className="flex flex-col items-center gap-5 px-8 text-center">
                  <span className={styles.playMark} aria-hidden="true" />
                  <span data-editable="videoCaption" className="text-[14px] text-current/60">
                    {text(config, 'videoCaption', d.videoCaption)}
                  </span>
                </div>
              </HeroVideoSlot>
            </div>
          </RemovableSlot>
        </div>

        <RemovableSlot config={config} flagKey="showPipeline" editMode={editMode} className="mt-16">
          <ol className={styles.rail} {...editableList('pipeline', pipeline)}>
            {pipeline.map((item, index) => (
              <li key={item.step} className={styles.stageNode}>
                <span
                  {...editableItem('pipeline', index, 'step')}
                  className="block text-[15px] font-bold"
                >
                  {item.step}
                </span>
                <span
                  {...editableItem('pipeline', index, 'note')}
                  className="mt-1.5 block text-[12.5px] leading-[1.7] text-current/55"
                >
                  {item.note}
                </span>
              </li>
            ))}
          </ol>
        </RemovableSlot>
      </Container>
    </section>
  );
}
