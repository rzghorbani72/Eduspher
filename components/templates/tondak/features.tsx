import { Container, SectionHead } from '../_shared/section';
import { text, type TemplateSectionProps } from '../_shared/types';
import { TONDAK_DEFAULTS } from './defaults';
import styles from './tondak.module.css';

const ABACUS_RODS = [
  [true, true, false, false],
  [true, false, false, true],
  [false, true, true, false],
] as const;

/** Six-column bento: 4+2 on top, 2+4 below — deliberately asymmetric. */
export function TondakFeatures({ id, config }: TemplateSectionProps) {
  const d = TONDAK_DEFAULTS.features;

  return (
    <section id={id || 'features'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 lg:grid-cols-6">
          <article className={`relative overflow-hidden rounded-[34px] bg-(--theme-surface) p-8 lg:col-span-4 ${styles.outline}`}>
            <span aria-hidden="true" className={`absolute -bottom-10 -start-10 size-44 rounded-[60px] bg-(--theme-primary-subtle)`} />
            <div className="relative z-[2] max-w-[74%]">
              <h3 className="text-[25px] font-bold">{d.lead.title}</h3>
              <p className="mt-3 text-[15.5px] leading-[1.8] text-(--theme-muted)">{d.lead.body}</p>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {d.lead.chips.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full bg-(--theme-accent-subtle) px-4 py-1.5 text-[13px] font-bold text-(--theme-accent)"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className={`rounded-[34px] bg-(--theme-accent) p-8 text-(--theme-on-accent) lg:col-span-2 ${styles.outline}`}>
            <span className="block text-[76px] font-bold leading-none tracking-[-0.06em] tabular-nums">
              {d.stat.value}
            </span>
            <h3 className="mt-2 text-[24px] font-bold">{d.stat.title}</h3>
            <p className="mt-2 text-[15.5px] leading-[1.8] opacity-85">{d.stat.body}</p>
          </article>

          <article className={`rounded-[34px] bg-(--theme-primary) p-8 text-(--theme-on-primary) lg:col-span-2 ${styles.outline}`}>
            <h3 className="text-[24px] font-bold">{d.note.title}</h3>
            <p className="mt-3 text-[15.5px] leading-[1.8] opacity-90">{d.note.body}</p>
          </article>

          <article
            className={`grid items-center gap-7 rounded-[34px] bg-(--theme-surface) p-8 md:grid-cols-[1fr_auto] lg:col-span-4 ${styles.outline}`}
          >
            <div>
              <h3 className="text-[24px] font-bold">{d.wide.title}</h3>
              <p className="mt-3 text-[15.5px] leading-[1.8] text-(--theme-muted)">{d.wide.body}</p>
            </div>
            <div className="grid gap-2.5" aria-hidden="true">
              {ABACUS_RODS.map((rod, rodIndex) => (
                <div key={rodIndex} className="flex items-center gap-2">
                  {rod.map((on, beadIndex) => (
                    <span
                      key={beadIndex}
                      className={`${styles.bead} ${on ? '' : styles.beadOff}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}
