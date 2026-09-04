import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVisualSlot } from '../_shared/hero-media';
import { RemovableSlot } from '../_shared/removable-slot';
import { Backdrop } from '../_shared/backdrop';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { ZABANEH_DEFAULTS } from './defaults';
import styles from './zabaneh.module.css';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';

interface TranscriptLine {
  who: string;
  teacher: boolean;
  line: string;
}

interface HeroStat {
  value: string;
  label: string;
}

/**
 * Static hero. The proof is a real lesson transcript, not a rotating banner —
 * it shows what a class actually looks like in one glance.
 */
export function ZabanehHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = ZABANEH_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const transcript = list<TranscriptLine>(config, 'transcript', d.transcript);
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className="relative overflow-hidden bg-(--theme-background) text-(--theme-foreground)">
      <Backdrop variant="aurora" motion="wash" className="opacity-55" />
      <Container className="relative z-[1] py-(--theme-section-padding-y)">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className={styles.entry}>
              <b data-editable="entryWord" className="text-[19px] font-bold" dir="ltr">
                {text(config, 'entryWord', d.entryWord)}
              </b>
              <span data-editable="entryPhonetic" className="mt-1 block text-[13.5px] text-(--theme-muted)" dir="ltr">
                {text(config, 'entryPhonetic', d.entryPhonetic)}
              </span>
              <span data-editable="entryGloss" className="mt-1 block text-[13.5px] text-(--theme-muted)">
                {text(config, 'entryGloss', d.entryGloss)}
              </span>
            </div>

            <h1 className="mt-7 text-[clamp(34px,5.2vw,60px)] font-bold leading-[1.14] tracking-[-0.03em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config} className={styles.highlight}>
                {text(config, 'titleEm', d.titleEm)}
              </EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-6 max-w-[54ch] text-[17.5px] leading-[1.9] text-(--theme-ink-2)">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
                <Button tone="primary" size="lg" editableKey="ctaText" href={templateHref(storeContext, 'register')}>
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot config={config} flagKey="showHeroCtaSecondary" editMode={editMode} className="inline-flex">
                <Button
                  tone="outline"
                  size="lg"
                  editableKey="ctaSecondary"
                  href={templateHref(storeContext, 'register')}
                >
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </Button>
              </RemovableSlot>
            </div>

            <p data-editable="micro" className="mt-6 text-[13px] text-(--theme-muted)">
              {text(config, 'micro', d.micro)}
            </p>
          </div>

          <RemovableSlot
            config={config}
            flagKey="showSideVisual"
            editMode={editMode}
            className="relative grid gap-5"
            mediaKey="bgImage"
          >
            <RemovableSlot config={config} flagKey="showStamp" editMode={editMode} className="inline-flex">
              <span className={styles.stamp} data-editable="stamp">
                {text(config, 'stamp', d.stamp)}
              </span>
            </RemovableSlot>

            <div className={`${styles.card3d} ${styles.cardA} p-4`} data-motion="drift">
              <HeroVisualSlot
                config={config}
                mode="fill"
                className="aspect-video overflow-hidden rounded-[calc(var(--theme-border-radius)/1.5)]"
              >
                <div className={styles.photoSlot}>
                  <span data-editable="photoCaption" className="text-[15px] font-bold">
                    {text(config, 'photoCaption', d.photoCaption)}
                  </span>
                </div>
              </HeroVisualSlot>
            </div>

            <RemovableSlot config={config} flagKey="showTranscript" editMode={editMode}>
              <div className={`${styles.card3d} ${styles.cardB} p-6`} data-motion="drift">
                <span
                  data-editable="transcriptLabel"
                  className="inline-block rounded-full bg-(--theme-primary-subtle) px-3 py-1 text-[12.5px] font-bold text-(--theme-primary)"
                >
                  {text(config, 'transcriptLabel', d.transcriptLabel)}
                </span>

                <div className="mt-4 grid gap-3.5" {...editableList('transcript', transcript)}>
                  {transcript.map((row, index) => (
                    <p key={row.line} className="flex gap-3 text-[14.5px] leading-[1.8]">
                      <span
                        {...editableItem('transcript', index, 'who')}
                        className={`grid size-8 flex-none place-items-center rounded-full text-[11px] font-bold ${
                          row.teacher
                            ? 'bg-(--theme-primary) text-(--theme-on-primary)'
                            : 'bg-(--theme-surface-alt) text-(--theme-foreground)'
                        }`}
                      >
                        {row.who}
                      </span>
                      <span {...editableItem('transcript', index, 'line')} className="text-(--theme-ink-2)">
                        {row.line}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </RemovableSlot>
          </RemovableSlot>
        </div>

        <RemovableSlot
          config={config}
          flagKey="showStats"
          editMode={editMode}
          className="mt-14 grid gap-px overflow-hidden rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-border-color) sm:grid-cols-2 lg:grid-cols-4"
        >
          <dl className="contents" {...editableList('stats', stats)}>
            {stats.map((stat, index) => (
              <div key={stat.label} className="bg-(--theme-surface) p-6">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <b
                    {...editableItem('stats', index, 'value')}
                    className="block text-[30px] font-bold leading-none tracking-[-0.04em] tabular-nums"
                  >
                    {stat.value}
                  </b>
                  <span
                    {...editableItem('stats', index, 'label')}
                    className="mt-2 block text-[13px] leading-[1.6] text-(--theme-muted)"
                  >
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </RemovableSlot>
      </Container>
    </section>
  );
}
