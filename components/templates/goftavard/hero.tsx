import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { GOFTAVARD_DEFAULTS } from './defaults';
import styles from './goftavard.module.css';

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
export function GoftavardHero({ id, config }: TemplateSectionProps) {
  const d = GOFTAVARD_DEFAULTS.hero;
  const transcript = list<TranscriptLine>(config, 'transcript', d.transcript);
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className={styles.entry}>
              <b className="text-[19px] font-bold" dir="ltr">
                {text(config, 'entryWord', d.entryWord)}
              </b>
              <span className="mt-1 block text-[13.5px] text-(--theme-muted)" dir="ltr">
                {text(config, 'entryPhonetic', d.entryPhonetic)}
              </span>
              <span className="mt-1 block text-[13.5px] text-(--theme-muted)">
                {text(config, 'entryGloss', d.entryGloss)}
              </span>
            </div>

            <h1 className="mt-7 text-[clamp(34px,5.2vw,60px)] font-bold leading-[1.14] tracking-[-0.03em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <em className={`not-italic ${styles.highlight}`} data-editable="titleEm">
                {text(config, 'titleEm', d.titleEm)}
              </em>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-6 max-w-[54ch] text-[17.5px] leading-[1.9] text-(--theme-ink-2)">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <Button tone="primary" size="lg" editableKey="ctaText">
                {text(config, 'ctaText', d.ctaText)}
              </Button>
              <Button tone="outline" size="lg" href="#courses">
                {text(config, 'ctaSecondary', d.ctaSecondary)}
              </Button>
            </div>

            <p className="mt-6 text-[13px] text-(--theme-muted)">{text(config, 'micro', d.micro)}</p>
          </div>

          <div className="relative grid gap-5">
            <span className={styles.stamp}>{text(config, 'stamp', d.stamp)}</span>

            <div className={`${styles.card3d} ${styles.cardA} p-4`}>
              <div className={styles.photoSlot}>
                <span className="text-[15px] font-bold">{text(config, 'photoCaption', d.photoCaption)}</span>
              </div>
            </div>

            <div className={`${styles.card3d} ${styles.cardB} p-6`}>
              <span className="inline-block rounded-full bg-(--theme-primary-subtle) px-3 py-1 text-[12.5px] font-bold text-(--theme-primary)">
                {text(config, 'transcriptLabel', d.transcriptLabel)}
              </span>

              <div className="mt-4 grid gap-3.5">
                {transcript.map((row) => (
                  <p key={row.line} className="flex gap-3 text-[14.5px] leading-[1.8]">
                    <span
                      className={`grid size-8 flex-none place-items-center rounded-full text-[11px] font-bold ${
                        row.teacher
                          ? 'bg-(--theme-primary) text-(--theme-on-primary)'
                          : 'bg-(--theme-surface-alt) text-(--theme-foreground)'
                      }`}
                    >
                      {row.who}
                    </span>
                    <span className="text-(--theme-ink-2)">{row.line}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <dl className="mt-14 grid gap-px overflow-hidden rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-border-color) sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-(--theme-surface) p-6">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <b className="block text-[30px] font-bold leading-none tracking-[-0.04em] tabular-nums">
                  {stat.value}
                </b>
                <span className="mt-2 block text-[13px] leading-[1.6] text-(--theme-muted)">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
