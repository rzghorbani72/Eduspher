import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVideoSlot } from '../_shared/hero-video-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { Backdrop } from '../_shared/backdrop';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { ROUZAN_DEFAULTS } from './defaults';
import styles from './rouzan.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface HeroStat {
  value: string;
  label: string;
}

/**
 * Video-first hero: everything above the fold exists to get the visitor to
 * press play. The intro reel is the design, not an alternative to a photo, so
 * the video slot is called directly and keeps its editor-window frame even
 * before the owner has picked a video.
 */
export function RouzanHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = ROUZAN_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const chips = list<string>(config, 'chips', d.chips);
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className={`relative overflow-hidden ${styles.page}`}>
      <span className={styles.halo} aria-hidden="true" data-motion="wash" />
      <Backdrop variant="grain" className="opacity-35" />

      <Container className="relative z-[1] py-(--theme-section-padding-y)">
        <div className="mx-auto max-w-[54rem] text-center">
          <span
            className={`${styles.chip} inline-flex items-center gap-2.5 px-4 py-1.5 text-[13px] font-bold text-(--theme-muted)`}
          >
            <span aria-hidden="true" data-motion="live" className="size-2 rounded-full bg-(--theme-primary)" />
            <span data-editable="kicker">{text(config, 'kicker', d.kicker)}</span>
          </span>

          <h1 className="mt-7 text-[clamp(40px,6.4vw,76px)] font-extrabold leading-[1.05] tracking-[-0.04em]">
            <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
            <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
            <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
          </h1>

          <p
            data-editable="subtitle"
            className="mx-auto mt-6 max-w-[54ch] text-[17px] leading-[1.9] text-(--theme-muted)"
          >
            {text(config, 'subtitle', d.subtitle)}
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
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
        </div>

        <RemovableSlot config={config} flagKey="showHeroVideo" editMode={editMode} className="mt-14">
          <div className={`mx-auto max-w-[62rem] ${styles.window}`}>
            <div className={styles.windowBar}>
              <span className={`${styles.dot} ${styles.dotLive}`} aria-hidden="true" />
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.tab} data-editable="videoTab">
                {text(config, 'videoTab', d.videoTab)}
              </span>
            </div>
            <HeroVideoSlot config={config} className="bg-(--theme-surface-alt)">
              <div className="flex flex-col items-center gap-5 px-8 text-center">
                <span className={styles.playMark} aria-hidden="true" />
                <span data-editable="videoCaption" className="text-[14px] text-(--theme-muted)">
                  {text(config, 'videoCaption', d.videoCaption)}
                </span>
              </div>
            </HeroVideoSlot>
          </div>
        </RemovableSlot>

        <RemovableSlot config={config} flagKey="showChips" editMode={editMode} className="mt-10">
          <ul className="flex flex-wrap justify-center gap-2" {...editableList('chips', chips)}>
            {chips.map((chip, index) => (
              <li
                key={chip}
                {...editableItem('chips', index)}
                className={`${styles.chip} px-3.5 py-1.5 text-[12.5px] text-(--theme-muted)`}
              >
                {chip}
              </li>
            ))}
          </ul>
        </RemovableSlot>

        <RemovableSlot config={config} flagKey="showStats" editMode={editMode} className="mt-12">
          <dl
            className="mx-auto grid max-w-[46rem] gap-8 border-t border-(--theme-border-color) pt-8 sm:grid-cols-3"
            {...editableList('stats', stats)}
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <dd
                  {...editableItem('stats', index, 'value')}
                  className="block text-[34px] font-extrabold leading-none tracking-[-0.04em]"
                >
                  {stat.value}
                </dd>
                <dt {...editableItem('stats', index, 'label')} className="mt-2.5 text-[13.5px] text-(--theme-muted)">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </RemovableSlot>
      </Container>
    </section>
  );
}
