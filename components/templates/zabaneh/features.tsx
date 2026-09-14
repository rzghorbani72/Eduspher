import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { ZABANEH_DEFAULTS } from './defaults';
import { editableList, editableItem } from '../_shared/editable-list';

interface FeatureItem {
  index: string;
  title: string;
  body: string;
}

/** Four operating rules, each on its own hairline-ruled card. */
export function ZabanehFeatures({ id, config }: TemplateSectionProps) {
  const d = ZABANEH_DEFAULTS.features;
  const items = list<FeatureItem>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="bg-(--theme-background) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2" {...editableList('items', items)}>
          {items.map((item, index) => (
            <article key={item.index} className="border-t-2 border-(--theme-foreground) pt-6">
              <b
                {...editableItem('items', index, 'index')}
                className="block text-[13px] font-bold tracking-[0.14em] text-(--theme-primary)"
              >
                {item.index}
              </b>
              <h3
                {...editableItem('items', index, 'title')}
                className="mt-3 text-[23px] leading-[1.35] font-bold"
              >
                {item.title}
              </h3>
              <p
                {...editableItem('items', index, 'body')}
                className="mt-3 max-w-[58ch] text-[15.5px] leading-[1.85] text-(--theme-muted)"
              >
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
