import { Container } from '../_shared/section';
import { Button, Pill } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVisualSlot } from '../_shared/hero-media';
import { RemovableSlot } from '../_shared/removable-slot';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { PARASTOO_DEFAULTS } from './defaults';
import styles from './parastoo.module.css';
import { templateHref } from '../_shared/routes';

interface Drill {
  question: string;
  answer: string;
}

interface HeroStat {
  value: string;
  label: string;
}

/** Static hero with a tilted flashcard stack — CSS only, no image requests. */
export function ParastooHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = PARASTOO_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const drills = list<Drill>(config, 'drills', d.drills);
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className="relative overflow-hidden bg-(--theme-background) text-(--theme-foreground)">
      <span className={styles.blobA} aria-hidden="true" data-motion="drift" />
      <span className={styles.blobB} aria-hidden="true" data-motion="drift" />

      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <div className="grid items-center gap-14 lg:grid-cols-[1.03fr_0.97fr]">
          <div>
            <Pill>
              <span aria-hidden="true" data-motion="live" className="size-2 rounded-[3px] bg-current" />
              <span data-editable="pill">{text(config, 'pill', d.pill)}</span>
            </Pill>

            <h1 className="mt-5 text-[clamp(36px,5.6vw,66px)] font-bold leading-[1.08] tracking-[-0.035em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent
                config={config}
                className="relative [background:linear-gradient(var(--theme-accent),var(--theme-accent))_0_88%/100%_14px_no-repeat]"
              >
                {text(config, 'titleEm', d.titleEm)}
              </EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-6 max-w-[54ch] text-[18px] leading-[1.85] text-(--theme-ink-2)">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <RemovableSlot config={config} flagKey="showHeroCta" editMode={editMode} className="inline-flex">
                <Button tone="primary" size="lg" editableKey="ctaText" href={templateHref(storeContext, 'register')}>
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot config={config} flagKey="showHeroCtaSecondary" editMode={editMode} className="inline-flex">
                <Button tone="outline" size="lg" editableKey="ctaSecondary" href={templateHref(storeContext, 'register')}>
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </Button>
              </RemovableSlot>
            </div>

            <RemovableSlot
              config={config}
              flagKey="showStats"
              editMode={editMode}
              className="mt-9 flex flex-wrap gap-x-9 gap-y-5 border-t-2 border-dashed border-(--theme-border-strong) pt-7"
            >
              <dl className="contents">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <b className="block text-[30px] font-bold leading-[1.15] tracking-[-0.04em] tabular-nums">
                        {stat.value}
                      </b>
                      <span className="text-[13.5px] font-medium text-(--theme-muted)">{stat.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </RemovableSlot>
          </div>

          <RemovableSlot config={config} flagKey="showSideVisual" editMode={editMode} mediaKey="bgImage">
            <HeroVisualSlot
              config={config}
              mode="fill"
              className={`${styles.stack} min-h-[320px] overflow-hidden rounded-(--theme-border-radius)`}
            >
              <div className={styles.stack} aria-hidden="true">
                <div className={`${styles.card3d} ${styles.c1}`}>
                  <span
                    data-editable="flashLabel"
                    className="absolute top-4 start-5 text-[14px] font-bold opacity-85"
                  >
                    {text(config, 'flashLabel', d.flashLabel)}
                  </span>
                  <span
                    data-editable="flashValue"
                    className="text-[clamp(90px,14vw,170px)] font-bold leading-none tracking-[-0.06em]"
                  >
                    {text(config, 'flashValue', d.flashValue)}
                  </span>
                </div>

                <div className={`${styles.card3d} ${styles.c2}`}>
                  {drills.map((drill, index) => (
                    <div
                      key={drill.question}
                      className={`flex items-baseline justify-between border-b border-dashed border-(--theme-border-strong) py-2 text-[15px] font-bold last:border-0 ${
                        index === drills.length - 1 ? 'text-(--theme-accent)' : 'text-(--theme-ink-2)'
                      }`}
                    >
                      <span>{drill.question}</span>
                      <span>{drill.answer}</span>
                    </div>
                  ))}
                </div>

                <div className={`${styles.card3d} ${styles.c3} flex flex-col justify-between`}>
                  <b data-editable="timerValue" className="text-[38px] font-bold tracking-[-0.04em]">
                    {text(config, 'timerValue', d.timerValue)}
                  </b>
                  <span data-editable="timerLabel" className="text-[13px] opacity-80">
                    {text(config, 'timerLabel', d.timerLabel)}
                  </span>
                </div>

                <div className={styles.badge}>
                  <span>
                    <b data-editable="badgeValue" className="block text-[27px] font-bold leading-none tracking-[-0.03em]">
                      {text(config, 'badgeValue', d.badgeValue)}
                    </b>
                    <span data-editable="badgeLabel" className="text-[11.5px] font-bold">
                      {text(config, 'badgeLabel', d.badgeLabel)}
                    </span>
                  </span>
                </div>
              </div>
            </HeroVisualSlot>
          </RemovableSlot>
        </div>
      </Container>
    </section>
  );
}
