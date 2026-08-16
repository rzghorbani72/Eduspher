import { Container } from '../_shared/section';
import { Button } from '../_shared/primitives';
import { EditableAccent } from '../_shared/editable-accent';
import { HeroVisualSlot } from '../_shared/hero-media';
import { RemovableSlot } from '../_shared/removable-slot';
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

export function HavanHero({ id, config, storeContext }: TemplateSectionProps) {
  const d = HAVAN_DEFAULTS.hero;
  const editMode = storeContext?.editMode ?? false;
  const boardItems = list<BoardItem>(config, 'boardItems', d.boardItems);
  const stats = list<HeroStat>(config, 'stats', d.stats);

  return (
    <section id={id || 'hero'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <div className="grid items-start gap-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="mb-5 flex items-center gap-3 text-[13px] font-medium tracking-[0.16em] text-(--theme-primary)">
              <span data-editable="eyebrow">{text(config, 'eyebrow', d.eyebrow)}</span>
              <span aria-hidden="true" className="h-px flex-1 bg-(--theme-border-color)" />
            </p>

            <h1 className="text-[clamp(34px,5.2vw,64px)] font-bold leading-[1.15] tracking-[-0.02em]">
              <span data-editable="title">{text(config, 'title', d.title)}</span>{' '}
              <EditableAccent
                config={config}
                className="[background:linear-gradient(var(--theme-accent-subtle),var(--theme-accent-subtle))_0_88%/100%_9px_no-repeat]"
              >
                {text(config, 'titleEm', d.titleEm)}
              </EditableAccent>{' '}
              <span data-editable="titleEnd">{text(config, 'titleEnd', d.titleEnd)}</span>
            </h1>

            <p data-editable="subtitle" className="mt-6 max-w-[52ch] text-[18px] leading-[1.85] text-(--theme-muted)">
              {text(config, 'subtitle', d.subtitle)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <RemovableSlot
                config={config}
                flagKey="showHeroCta"
                editMode={editMode}
                className="inline-flex"
              >
                <Button tone="primary" editableKey="ctaText" href="#courses">
                  {text(config, 'ctaText', d.ctaText)}
                </Button>
              </RemovableSlot>
              <RemovableSlot
                config={config}
                flagKey="showHeroCtaSecondary"
                editMode={editMode}
                className="inline-flex"
              >
                <Button tone="outline" editableKey="ctaSecondary" href="#showcase">
                  {text(config, 'ctaSecondary', d.ctaSecondary)}
                </Button>
              </RemovableSlot>
            </div>

            <RemovableSlot
              config={config}
              flagKey="showStats"
              editMode={editMode}
              className="mt-10 flex flex-wrap gap-x-9 gap-y-5 border-t border-(--theme-border-color) pt-5"
            >
              <dl className="contents">
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
            </RemovableSlot>
          </div>

          <RemovableSlot config={config} flagKey="showSideVisual" editMode={editMode}>
            <div className="relative">
              <HeroVisualSlot
                config={config}
                className={`${styles.board} min-h-[320px] overflow-hidden`}
              >
                <div className={styles.board}>
                  <div className={`${styles.boardInner} p-7`}>
                    <h2
                      data-editable="boardTitle"
                      className="text-[15px] font-medium tracking-[0.16em] text-(--theme-accent)"
                    >
                      {text(config, 'boardTitle', d.boardTitle)}
                    </h2>
                    <p data-editable="boardDate" className="mt-1 text-[12px] text-current/55">
                      {text(config, 'boardDate', d.boardDate)}
                    </p>

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
                          <b className="flex-none text-[13px] font-medium text-current/70">
                            {item.time}
                          </b>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </HeroVisualSlot>

              <RemovableSlot config={config} flagKey="showStamp" editMode={editMode}>
                <div className={styles.stamp}>
                  <b data-editable="stampValue" className="block text-[22px] font-bold leading-[1.1]">
                    {text(config, 'stampValue', d.stampValue)}
                  </b>
                  <span data-editable="stampLabel" className="text-[11px] tracking-[0.1em]">
                    {text(config, 'stampLabel', d.stampLabel)}
                  </span>
                </div>
              </RemovableSlot>
            </div>
          </RemovableSlot>
        </div>
      </Container>
    </section>
  );
}
