import { Container } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { SETIGH_DEFAULTS } from './defaults';
import styles from './setigh.module.css';

interface LadderStep {
  range: string;
  percent: string;
  fill: number;
  title: string;
  body: string;
}

interface LadderNote {
  label: string;
  value: string;
}

/**
 * Setigh's signature section: a training block laid out as a rising ladder, each
 * rung carrying its own load bar. Tall and vertical so it reads while scrolling.
 */
export function SetighLadder({ id, config }: TemplateSectionProps) {
  const d = SETIGH_DEFAULTS.ladder;
  const steps = list<LadderStep>(config, 'steps', d.steps);
  const notes = list<LadderNote>(config, 'notes', d.notes);

  return (
    <section id={id || 'showcase'} className="relative overflow-hidden bg-(--theme-deep) text-(--theme-on-deep)">
      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <div className="mb-12">
          <span className="block text-[13px] font-bold tracking-[0.16em] text-(--theme-primary)">
            {text(config, 'eyebrow', d.eyebrow)}
          </span>
          <h2
            data-editable="title"
            className="mt-3 max-w-[24ch] text-[clamp(28px,4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]"
          >
            {text(config, 'title', d.title)}
          </h2>
          <p data-editable="subtitle" className="mt-4 max-w-[56ch] text-[16px] leading-[1.85] text-current/65">
            {text(config, 'subtitle', d.subtitle)}
          </p>
        </div>

        <ol className="grid gap-4">
          {steps.map((step, index) => (
            <li
              key={step.range}
              className={`${styles.rung} rounded-(--theme-border-radius) border border-current/16 bg-current/5 p-6 ps-8`}
              style={{ marginInlineStart: `${index * 24}px` }}
            >
              <div className="grid gap-5 md:grid-cols-[150px_1fr_200px] md:items-center">
                <div>
                  <span className="block text-[13px] text-current/60">{step.range}</span>
                  <b className="mt-1 block text-[26px] font-bold leading-none tracking-[-0.04em] text-(--theme-primary) tabular-nums">
                    {step.percent}
                  </b>
                </div>
                <div>
                  <h3 className="text-[21px] font-bold">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.8] text-current/68">{step.body}</p>
                </div>
                <div className={styles.track}>
                  <span className={styles.trackFill} style={{ width: `${step.fill}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ol>

        <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-current/16 pt-7 text-[14px]">
          {notes.map((note) => (
            <div key={note.label} className="flex items-baseline gap-2">
              <dt className="text-current/60">{note.label}:</dt>
              <dd className="font-bold text-(--theme-primary)">{note.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
