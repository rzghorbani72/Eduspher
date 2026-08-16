import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { SETIGH_DEFAULTS } from './defaults';
import styles from './setigh.module.css';

interface TrackItem {
  index: string;
  title: string;
  body: string;
  meta: string;
}

export function SetighCategories({ id, config }: TemplateSectionProps) {
  const d = SETIGH_DEFAULTS.categories;
  const items = list<TrackItem>(config, 'items', d.items);

  return (
    <section id={id || 'categories'} className="relative overflow-hidden bg-(--theme-background) text-(--theme-foreground)">
      <span className={styles.ghostNum} aria-hidden="true">
        {text(config, 'eyebrow', d.eyebrow)}
      </span>

      <Container className="relative z-[2] py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="flex flex-col gap-3 rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) shadow-(--theme-shadow) p-7"
            >
              <span className="text-[42px] font-bold leading-none tracking-[-0.05em] text-(--theme-primary) tabular-nums">
                {item.index}
              </span>
              <h3 className="mt-2 text-[23px] font-bold">{item.title}</h3>
              <p className="text-[15px] leading-[1.85] text-(--theme-muted)">{item.body}</p>
              <a
                href="#courses"
                className="mt-auto pt-3 text-[13.5px] font-bold text-(--theme-primary) hover:underline"
              >
                {item.meta} ←
              </a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
