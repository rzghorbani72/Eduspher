import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { SHAPARAK_DEFAULTS } from './defaults';
import styles from './shaparak.module.css';
import { editableList, editableItem } from '../_shared/editable-list';

interface ReasonItem {
  icon: string;
  title: string;
  body: string;
}

/** Four reason stickers, written for the parent rather than the child. */
export function ShaparakFeatures({ id, config }: TemplateSectionProps) {
  const d = SHAPARAK_DEFAULTS.features;
  const items = list<ReasonItem>(config, 'items', d.items);

  return (
    <section id={id || 'features'} className="bg-(--theme-surface-alt) text-(--theme-foreground)">
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', d.eyebrow)}
          title={text(config, 'title', d.title)}
          subtitle={text(config, 'subtitle', d.subtitle)}
        />

        <div className="grid gap-6 md:grid-cols-2" {...editableList('items', items)}>
          {items.map((item, index) => (
            <article key={item.title} className={`${styles.sticker} flex gap-5 p-7`}>
              <span {...editableItem('items', index, 'icon')} className={styles.iconTile} aria-hidden="true">
                {item.icon}
              </span>
              <div className="min-w-0">
                <h3 {...editableItem('items', index, 'title')} className="text-[20px] font-bold leading-[1.35]">
                  {item.title}
                </h3>
                <p
                  {...editableItem('items', index, 'body')}
                  className="mt-2.5 text-[15px] leading-[1.9] text-(--theme-muted)"
                >
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
