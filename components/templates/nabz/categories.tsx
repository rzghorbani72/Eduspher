import { Container, SectionHead } from '../_shared/section';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { NABZ_DEFAULTS } from './defaults';
import styles from './nabz.module.css';

interface TrackItem {
  count: string;
  title: string;
  body: string;
}

/**
 * Track index — full-width rows rather than a card wall. Hovering floods the
 * row with the brand colour and insets it slightly, so the whole list behaves
 * like one control surface instead of six competing tiles.
 */
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

        <div>
          {items.map((item, index) => (
            <a key={item.title} href="#courses" className={`${styles.track} flex items-center gap-6 py-7`}>
              <span aria-hidden="true" className={`${styles.trackNo} flex-none text-[15px] font-bold`}>
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1 md:flex md:items-center md:gap-10">
                <h3 className={`${styles.trackTitle} text-[21px] font-bold leading-[1.3] md:w-[34%] md:flex-none`}>
                  {item.title}
                </h3>
                <p className={`${styles.trackMuted} mt-2 text-[14.5px] leading-[1.8] text-(--theme-muted) md:mt-0`}>
                  {item.body}
                </p>
              </div>

              <span className={`${styles.trackMuted} flex-none text-[13px] font-bold text-(--theme-muted)`}>
                {item.count} دوره
              </span>
              <span aria-hidden="true" className="flex-none text-[18px]">
                ←
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
