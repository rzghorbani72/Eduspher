import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { HAVAN_DEFAULTS } from './defaults';
import styles from './havan.module.css';

interface BoardItem {
  index: string;
  label: string;
  time: string;
}

interface HeroStat {
  value: string;
  label: string;
}

/**
 * Editorial hero: the message on the left, today's service board on the right.
 * The board is the "no photo uploaded" default state, not a placeholder — it is
 * real, editable content an academy would want on its homepage anyway.
 */
export function HavanHero({ id, config }: TemplateSectionProps) {
  const d = HAVAN_DEFAULTS.hero;
  const boardItems = list<BoardItem>(config, 'boardItems', d.boardItems);
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <div className="grid items-start gap-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-5 flex items-center gap-3 text-[13px] font-medium tracking-[0.16em] text-(--theme-primary)">
              {text(config, 'eyebrow', d.eyebrow)}
              <span aria-hidden="true" className="h-px flex-1 bg-(--theme-border-color)" />
            </p>

            <h1 className="text-[clamp(34px,5.2vw,64px)] font-bold leading-[1.15] tracking-[-0.02em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <em
                className="not-italic text-(--theme-primary) [background:linear-gradient(var(--theme-accent-subtle),var(--theme-accent-subtle))_0_88%/100%_9px_no-repeat]"
                data-editable="titleEm"
              >
                {text(config, 'titleEm', d.titleEm)}
              </em>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-6 max-w-[52ch] text-[18px] leading-[1.85] text-(--theme-muted)">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <Button tone="primary" editableKey="ctaText" href="#courses">
                {text(config, 'ctaText', d.ctaText)}
              </Button>
              <Button tone="outline" href="#showcase">
                {text(config, 'ctaSecondary', d.ctaSecondary)}
              </Button>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-9 gap-y-5 border-t border-(--theme-border-color) pt-5">
              {stats.map((stat) => (
                <div key={stat.label} className="border-e border-(--theme-border-color) pe-9 last:border-0 last:pe-0">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <b className="block text-[27px] font-bold leading-[1.2] tabular-nums">{stat.value}</b>
                    <span className="text-[13px] text-(--theme-muted)">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className={styles.board}>
              <div className={`${styles.boardInner} p-7`}>
                <h2 className="text-[15px] font-medium tracking-[0.16em] text-(--theme-accent)">
                  {text(config, 'boardTitle', d.boardTitle)}
                </h2>
                <p className="mt-1 text-[12px] text-current/55">{text(config, 'boardDate', d.boardDate)}</p>

                <ol className="mt-5">
                  {boardItems.map((item) => (
                    <li
                      key={item.index}
                      className="flex items-baseline gap-3 border-b border-dashed border-current/18 py-3 text-[15px] last:border-0"
                    >
                      <i className="w-6 flex-none not-italic text-[13px] font-bold text-(--theme-accent)">
                        {item.index}
                      </i>
                      <span className="flex-1">{item.label}</span>
                      <span aria-hidden="true" className={styles.leader} />
                      <b className="flex-none text-[13px] font-medium text-current/70">{item.time}</b>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className={styles.stamp}>
              <b className="block text-[22px] font-bold leading-[1.1]">{text(config, 'stampValue', d.stampValue)}</b>
              <span className="text-[11px] tracking-[0.1em]">{text(config, 'stampLabel', d.stampLabel)}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
