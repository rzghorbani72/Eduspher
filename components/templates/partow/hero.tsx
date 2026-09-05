import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVideoSlot } from '../_shared/hero-video-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';
import { PARTOW_DEFAULTS } from './defaults';
import { Wrap, MediaBar } from './layout';
import styles from './partow.module.css';

interface HeroStat {
  value: string;
  label: string;
}

/**
 * Centred claim, then the reel.
 *
 * Rouzan puts the video beside the headline; Partow stacks them, so the first
 * screen is one sentence, one pair of buttons and one proof line before the
 * page asks for anything. The facts row under the reel is the only left-aligned
 * block in the band — a centred four-column table is unreadable.
 */
export function PartowHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = PARTOW_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section
      id={id || 'hero'}
      className="bg-(--theme-background) pt-24 text-(--theme-foreground) max-md:pt-14"
    >
      <Wrap className="text-center">
        <h1 className="mx-auto max-w-[24ch] text-[clamp(36px,5.2vw,68px)] font-bold leading-[1.2]">
          <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
          <EditableAccent config={config}>{text(config, 'titleEm', d.titleEm)}</EditableAccent>{' '}
          <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
          <span className={styles.caret} aria-hidden="true" />
        </h1>

        <p
          data-editable="subtitle"
          className="mx-auto mt-5.5 max-w-[52ch] text-[18px] leading-[1.85] text-(--theme-muted)"
        >
          {text(config, 'subtitle', d.subtitle)}
        </p>

        <div className="mt-8.5 flex flex-wrap justify-center gap-3">
          <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
            <Button
              tone="primary"
              size="lg"
              editableKey="ctaText"
              href={templateHref(storeContext, 'courses')}
              className="!rounded-full"
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
              size="lg"
              editableKey="ctaSecondary"
              href={templateHref(storeContext, 'courses')}
              className="!rounded-full"
            >
              {text(config, 'ctaSecondary', d.ctaSecondary)}
            </Button>
          </RemovableSlot>
        </div>

        <div className="mt-6.5 flex flex-wrap items-center justify-center gap-x-4.5 gap-y-2.5 text-[13.5px] text-(--theme-muted)">
          <span>
            <span className={styles.stars} aria-hidden="true">
              ★★★★★
            </span>{' '}
            <b data-editable="ratingValue" className="font-medium text-(--theme-foreground)">
              {text(config, 'ratingValue', d.ratingValue)}
            </b>{' '}
            <span data-editable="ratingNote">{text(config, 'ratingNote', d.ratingNote)}</span>
          </span>
          <span className={styles.trustSep} aria-hidden="true" />
          <span data-editable="trustStudents">{text(config, 'trustStudents', d.trustStudents)}</span>
          <span className={styles.trustSep} aria-hidden="true" />
          <span data-editable="trustRefund">{text(config, 'trustRefund', d.trustRefund)}</span>
        </div>

        <RemovableSlot config={config} flagKey="showHeroVideo" editMode={editMode}>
          <figure className={`${styles.media} mx-auto mt-13 max-w-[960px] text-start`}>
            <MediaBar
              token={text(config, 'videoTab', d.videoTab)}
              note={text(config, 'videoNote', d.videoNote)}
              tokenKey="videoTab"
              noteKey="videoNote"
            />
            <HeroVideoSlot
              config={config}
              className={`${styles.frame} grid aspect-video place-items-center`}
            >
              <span className={styles.play} aria-hidden="true" />
              <span className={styles.timeline} aria-hidden="true">
                <i />
              </span>
              <figcaption className={styles.frameCap}>
                <span>
                  <b data-editable="videoCaption" className="block text-[15px] font-medium">
                    {text(config, 'videoCaption', d.videoCaption)}
                  </b>
                  <small data-editable="videoCaptionSub" className="text-[12.5px] opacity-70">
                    {text(config, 'videoCaptionSub', d.videoCaptionSub)}
                  </small>
                </span>
                <span
                  data-editable="videoDuration"
                  className="ms-auto text-[12.5px] whitespace-nowrap opacity-70"
                >
                  {text(config, 'videoDuration', d.videoDuration)}
                </span>
              </figcaption>
            </HeroVideoSlot>
          </figure>
        </RemovableSlot>

        <RemovableSlot config={config} flagKey="showStats" editMode={editMode}>
          <dl
            className="mt-18 grid gap-y-6 border-t border-(--theme-border-color) pt-6 text-start sm:grid-cols-2 lg:grid-cols-4"
            {...editableList('stats', stats)}
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className={styles.fact}>
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
      </Wrap>
    </section>
  );
}
