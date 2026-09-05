import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVideoSlot } from '../_shared/hero-video-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';
import { ROUZAN_DEFAULTS } from './defaults';
import { Wrap, LeadLabel } from './layout';
import styles from './rouzan.module.css';

interface HeroStat {
  value: string;
  label: string;
}

/**
 * Video-first hero: everything above the fold exists to get the visitor to
 * press play. The reel sits in an editor window that bleeds past the container
 * on wide screens, so the page reads as a look into the teacher's own desk
 * rather than a marketing banner.
 */
export function RouzanHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = ROUZAN_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section
      id={id || 'hero'}
      className="relative overflow-hidden bg-(--theme-background) pt-[74px] text-(--theme-foreground) max-sm:pt-11"
    >
      <span className={styles.heroWash} aria-hidden="true" />

      <Wrap className="relative">
        <div className="grid items-start gap-11 lg:grid-cols-[1.02fr_.98fr]">
          <div>
            <LeadLabel editableKey="kicker">{text(config, 'kicker', d.kicker)}</LeadLabel>

            <h1 className="mt-3 max-w-[15ch] text-[clamp(42px,5.2vw,78px)] font-bold leading-[1.06]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
              <span className={styles.caret} aria-hidden="true" />
            </h1>

            <p
              data-editable="subtitle"
              className="mt-6 max-w-[44ch] text-[18.5px] leading-[1.9] text-(--theme-muted)"
            >
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
                <Button
                  tone="primary"
                  editableKey="ctaText"
                  href={templateHref(storeContext, 'courses')}
                  className="!rounded-[10px]"
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
                  tone="outline"
                  editableKey="ctaSecondary"
                  href={templateHref(storeContext, 'courses')}
                  className="!rounded-[10px]"
                >
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </Button>
              </RemovableSlot>
            </div>

            <p data-editable="note" className="mt-4 text-[13.5px] text-(--theme-muted)">
              {text(config, 'note', d.note)}
            </p>

            <RemovableSlot config={config} flagKey="showStats" editMode={editMode}>
              <dl
                className="mt-11 flex flex-wrap border-t border-(--theme-border-color) pt-5 max-sm:gap-y-4"
                {...editableList('stats', stats)}
              >
                {stats.map((stat, index) => (
                  <div key={stat.label} className={`${styles.fact} max-sm:basis-1/2`}>
                    <dd
                      {...editableItem('stats', index, 'value')}
                      className="block text-[30px] font-bold leading-[1.2]"
                    >
                      {stat.value}
                    </dd>
                    <dt
                      {...editableItem('stats', index, 'label')}
                      className="text-[12.5px] text-(--theme-muted)"
                    >
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </RemovableSlot>
          </div>

          <RemovableSlot config={config} flagKey="showHeroVideo" editMode={editMode}>
            <figure className={`${styles.win} m-0 mt-1.5`}>
              <div className={styles.winBar}>
                <span className={styles.dots} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className={styles.winTab}>
                  <span className={styles.tok} data-editable="videoTab">
                    {text(config, 'videoTab', d.videoTab)}
                  </span>
                </span>
                <span
                  data-editable="videoDuration"
                  className="ms-auto text-[12px] text-(--theme-muted)"
                >
                  {text(config, 'videoDuration', d.videoDuration)}
                </span>
              </div>

              <HeroVideoSlot config={config} className={`${styles.frame} grid aspect-video place-items-center`}>
                <span className={styles.play} aria-hidden="true" />
                <span className={styles.progress} aria-hidden="true">
                  <i />
                </span>
                <figcaption className={styles.frameCap}>
                  <b data-editable="videoCaption" className="text-[14px] font-medium">
                    {text(config, 'videoCaption', d.videoCaption)}
                  </b>
                  <span data-editable="videoCaptionSub" className="ms-auto text-[12.5px] opacity-70">
                    {text(config, 'videoCaptionSub', d.videoCaptionSub)}
                  </span>
                </figcaption>
              </HeroVideoSlot>

              <div className={styles.winFoot}>
                <span className={styles.live}>
                  <i aria-hidden="true" />
                  <span data-editable="liveNote">{text(config, 'liveNote', d.liveNote)}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span data-editable="onlineNote">{text(config, 'onlineNote', d.onlineNote)}</span>
              </div>
            </figure>
          </RemovableSlot>
        </div>
      </Wrap>
    </section>
  );
}
