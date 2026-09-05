import { HeroVideoSlot } from '../_shared/hero-video-slot';
import { RemovableSlot } from '../_shared/removable-slot';
import { text, type TemplateSectionProps } from '../_shared/types';
import { PARTOW_DEFAULTS } from './defaults';
import { Wrap, SectionHead, MediaBar } from './layout';
import styles from './partow.module.css';

/**
 * The instructor introduction.
 *
 * This is a personal-brand template: there is one teacher, not a faculty grid,
 * so the "teachers" slot is a short first-person paragraph and a second reel.
 * Managers who do run a team can still add the shared teachers block.
 */
export function PartowTeachers({ id, config, storeContext }: TemplateSectionProps) {
  const d = PARTOW_DEFAULTS.teachers;
  const editMode = storeContext?.editMode ?? false;

  return (
    <section
      id={id || 'teachers'}
      className="border-y border-(--theme-border-color) bg-(--theme-surface-alt) text-(--theme-foreground)"
    >
      <div className="py-(--theme-section-padding-y)">
        <Wrap>
          <SectionHead
            eyebrow={text(config, 'eyebrow', d.eyebrow)}
            title={text(config, 'title', d.title)}
            subtitle={text(config, 'subtitle', d.subtitle)}
          />

          <RemovableSlot config={config} flagKey="showTeacherVideo" editMode={editMode}>
            <figure className={`${styles.media} mx-auto mt-11 max-w-[820px] text-start`}>
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
                <figcaption className={styles.frameCap}>
                  <span>
                    <b data-editable="videoCaption" className="block text-[15px] font-medium">
                      {text(config, 'videoCaption', d.videoCaption)}
                    </b>
                    <small data-editable="videoCaptionSub" className="text-[12.5px] opacity-70">
                      {text(config, 'videoCaptionSub', d.videoCaptionSub)}
                    </small>
                  </span>
                </figcaption>
              </HeroVideoSlot>
            </figure>
          </RemovableSlot>
        </Wrap>
      </div>
    </section>
  );
}
