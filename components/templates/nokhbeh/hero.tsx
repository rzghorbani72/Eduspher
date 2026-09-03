import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVisualSlot } from '../_shared/hero-media';
import { RemovableSlot } from '../_shared/removable-slot';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { NOKHBEH_DEFAULTS } from './defaults';
import styles from './nokhbeh.module.css';

interface BoardStep {
  text: string;
  highlight: boolean;
}

interface HeroStat {
  value: string;
  label: string;
}

/** Static hero: the claim on one side, a worked example on the other. */
export function NokhbehHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = NOKHBEH_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const steps = list<BoardStep>(config, 'boardSteps', d.boardSteps);
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className="relative overflow-hidden bg-(--theme-background) text-(--theme-foreground)">
      <div className={styles.paperGrid} aria-hidden="true" />

      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <div className="grid items-start gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2.5 text-[13px] font-bold tracking-[0.1em] text-(--theme-primary)">
              <span aria-hidden="true" data-motion="live" className="size-2 rounded-full bg-(--theme-accent)" />
              <span data-editable="eyebrow">{text(config, 'eyebrow', d.eyebrow)}</span>
            </span>

            <h1 className="mt-5 text-[clamp(34px,5.2vw,62px)] font-bold leading-[1.1] tracking-[-0.03em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent config={config} className={styles.penMark}>
                {text(config, 'titleEm', d.titleEm)}
              </EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-6 max-w-[56ch] text-[17.5px] leading-[1.9] text-(--theme-ink-2)">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
                <Button tone="primary" size="lg" editableKey="ctaText" href="#courses">
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot config={config} flagKey="showHeroCtaSecondary" editMode={editMode} className="inline-flex">
                <Button tone="outline" size="lg" editableKey="ctaSecondary">
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </Button>
              </RemovableSlot>
            </div>

            <p data-editable="note" className="mt-6 text-[13.5px] text-(--theme-muted)">
              {text(config, 'note', d.note)}
            </p>

            <RemovableSlot
              config={config}
              flagKey="showStats"
              editMode={editMode}
              className="mt-9 grid gap-6 border-t border-(--theme-border-color) pt-7 sm:grid-cols-2 lg:grid-cols-4"
            >
              <dl className="contents">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <b className={`block text-[28px] font-bold leading-none ${styles.mono}`}>{stat.value}</b>
                      <span className="mt-2 block text-[13px] leading-[1.6] text-(--theme-muted)">{stat.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </RemovableSlot>
          </div>

          <RemovableSlot config={config} flagKey="showBoard" editMode={editMode} mediaKey="bgImage">
            <HeroVisualSlot
              config={config}
              mode="fill"
              className={`${styles.board} min-h-[320px] overflow-hidden`}
            >
              <div className={styles.board}>
                <div className={styles.paperGrid} aria-hidden="true" />
                <div className={`${styles.boardInner} p-7`}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-(--theme-border-color) pb-4">
                    <h2 data-editable="boardTitle" className="text-[17px] font-bold">
                      {text(config, 'boardTitle', d.boardTitle)}
                    </h2>
                    <span data-editable="boardCode" className={`text-[13px] text-(--theme-muted) ${styles.mono}`}>
                      {text(config, 'boardCode', d.boardCode)}
                    </span>
                  </div>

                  <div className={`py-6 text-[16px] ${styles.mono}`} dir="ltr">
                    {steps.map((step) => (
                      <span
                        key={step.text}
                        className={`${styles.step} ${step.highlight ? styles.stepHi : 'text-(--theme-ink-2)'}`}
                      >
                        {step.text}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--theme-border-color) pt-4 text-[13.5px]">
                    <span className="text-(--theme-muted)">
                      الگوی حل:{' '}
                      <b data-editable="boardPattern" className="font-bold text-(--theme-foreground)">
                        {text(config, 'boardPattern', d.boardPattern)}
                      </b>
                    </span>
                    <span data-editable="boardTime" className={`text-(--theme-muted) ${styles.mono}`}>
                      {text(config, 'boardTime', d.boardTime)}
                    </span>
                  </div>
                </div>
              </div>
            </HeroVisualSlot>
          </RemovableSlot>
        </div>
      </Container>
    </section>
  );
}
