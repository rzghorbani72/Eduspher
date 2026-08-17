import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { NABZ_DEFAULTS } from './defaults';

interface TrackItem {
  count: string;
  title: string;
  body: string;
  wide: boolean;
}

/** Asymmetric tile grid of learning tracks, each a plain card in the brand tones. */
export function NabzCategories({ id, config }: TemplateSectionProps) {
  const d = NABZ_DEFAULTS.categories;
  const items = list<TrackItem>(config, 'items', d.items);

  return (
    <section id={id || 'categories'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <a
              key={item.title}
              href="#courses"
              className={`group flex flex-col gap-3 rounded-(--theme-border-radius) border border-(--theme-border-color) bg-(--theme-surface) shadow-(--theme-shadow) p-6 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-(--theme-primary) ${
                item.wide ? 'md:col-span-3 lg:col-span-3' : ''
              }`}
            >
              <span className="text-[13px] font-bold tracking-[0.14em] text-(--theme-primary)">{item.count} دوره</span>
              <h3 className="text-[21px] font-bold leading-[1.35]">{item.title}</h3>
              <p className="text-[14.5px] leading-[1.8] text-(--theme-muted)">{item.body}</p>
              <span className="mt-auto pt-2 text-[13.5px] font-bold text-(--theme-primary) transition-transform duration-200 group-hover:-translate-x-1">
                مشاهدهٔ دوره‌ها ←
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
