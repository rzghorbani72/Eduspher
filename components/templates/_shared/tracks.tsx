import { Container, SectionHead } from './section';
import { list, text, type SectionConfig } from './types';

export interface TrackItem {
  index: string;
  title: string;
  body: string;
  meta: string;
}

export interface TracksDefaults {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: readonly TrackItem[];
}

interface TemplateTracksProps {
  id?: string;
  config?: SectionConfig;
  defaults: TracksDefaults;
  tone?: 'page' | 'surface';
  columns?: 3 | 4;
}

const COLUMNS = {
  3: 'md:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const;

/** Learning-track cards: a numeral, a name, a sentence, and a count. */
export function TemplateTracks({
  id,
  config,
  defaults,
  tone = 'page',
  columns = 3,
}: TemplateTracksProps) {
  const items = list<TrackItem>(config, 'items', defaults.items);

  return (
    <section
      id={id || 'categories'}
      className={`${tone === 'surface' ? 'bg-(--theme-surface-alt)' : 'bg-(--theme-background)'} text-(--theme-foreground)`}
    >
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', defaults.eyebrow)}
          title={text(config, 'title', defaults.title)}
          subtitle={text(config, 'subtitle', defaults.subtitle)}
        />

        <div className={`grid gap-5 ${COLUMNS[columns]}`}>
          {items.map((item) => (
            <article
              key={item.title}
              className="flex flex-col gap-3 rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) p-7 shadow-(--theme-shadow)"
            >
              <span className="text-[38px] font-bold leading-none tracking-[-0.05em] text-(--theme-primary) tabular-nums">
                {item.index}
              </span>
              <h3 className="mt-2 text-[22px] font-bold">{item.title}</h3>
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
