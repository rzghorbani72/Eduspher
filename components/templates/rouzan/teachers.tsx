import { Button } from '../_shared/primitives';
import { list, text, type TemplateSectionProps } from '../_shared/types';
import { templateHref } from '../_shared/routes';
import { editableList, editableItem } from '../_shared/editable-list';
import { ROUZAN_DEFAULTS } from './defaults';
import { Wrap, SectionHead } from './layout';
import styles from './rouzan.module.css';

type MonoTone = 'base' | 'a' | 'b';

interface MentorItem {
  initials: string;
  name: string;
  role: string;
  bio: string;
  tone: MonoTone;
}

const MONO_TONE: Record<MonoTone, string> = {
  base: '',
  a: styles.monoA,
  b: styles.monoB,
};

/**
 * The people who read your homework. Monograms rather than photos: every preset
 * ships images as null, and a wall of grey avatar placeholders would undercut
 * the page more than initials do.
 */
export function RouzanTeachers({ id, config, storeContext }: TemplateSectionProps) {
  const d = ROUZAN_DEFAULTS.teachers;
  const items = list<MentorItem>(config, 'items', d.items);

  return (
    <section id={id || 'teachers'} className="bg-(--theme-background) text-(--theme-foreground)">
      <div className="py-(--theme-section-padding-y)">
        <Wrap>
          <SectionHead
            eyebrow={text(config, 'eyebrow', d.eyebrow)}
            title={text(config, 'title', d.title)}
            aside={
              <Button
                tone="outline"
                size="sm"
                editableKey="ctaText"
                href={templateHref(storeContext, 'register')}
                className="!rounded-lg"
              >
                {text(config, 'ctaText', d.ctaText)}
              </Button>
            }
          />

          <div
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            {...editableList('items', items)}
          >
            {items.map((item, index) => (
              <article key={item.name} className={styles.mentor}>
                <div className={`${styles.mono} ${MONO_TONE[item.tone]}`} role="img" aria-label={item.name}>
                  {item.initials}
                </div>
                <div className="px-5 pb-5.5 pt-4.5">
                  <h3 {...editableItem('items', index, 'name')} className="text-[17.5px] font-bold">
                    {item.name}
                  </h3>
                  <p
                    {...editableItem('items', index, 'role')}
                    className={`${styles.role} mt-1 text-[13px] font-medium`}
                  >
                    {item.role}
                  </p>
                  <p
                    {...editableItem('items', index, 'bio')}
                    className="mt-2.5 text-[13.5px] leading-[1.8] text-(--theme-muted)"
                  >
                    {item.bio}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Wrap>
      </div>
    </section>
  );
}
