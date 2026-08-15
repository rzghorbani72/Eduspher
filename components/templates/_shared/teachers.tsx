import { Container, SectionHead } from './section';
import { list, text, type SectionConfig } from './types';

export interface TemplateTeacher {
  initials: string;
  name: string;
  role: string;
  bio: string;
  stats?: readonly string[];
}

export interface TeachersDefaults {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: readonly TemplateTeacher[];
}

interface TemplateTeachersProps {
  id?: string;
  config?: SectionConfig;
  defaults: TeachersDefaults;
  tone?: 'page' | 'surface' | 'deep';
  /** Square initials tile vs. the round portrait slot some designs use. */
  avatarShape?: 'tile' | 'round';
}

const TONE_CLASS = {
  page: 'bg-(--theme-background) text-(--theme-foreground)',
  surface: 'bg-(--theme-surface-alt) text-(--theme-foreground)',
  deep: 'bg-(--theme-deep) text-(--theme-on-deep)',
} as const;

/**
 * Teacher grid. Presets ship no photos by design — the initials tile is the
 * intended default state, so a new academy's page never shows a broken image.
 */
export function TemplateTeachers({
  id,
  config,
  defaults,
  tone = 'page',
  avatarShape = 'tile',
}: TemplateTeachersProps) {
  const items = list<TemplateTeacher>(config, 'items', defaults.items);
  const onDeep = tone === 'deep';

  return (
    <section id={id || 'teachers'} className={TONE_CLASS[tone]}>
      <Container className="py-(--theme-section-padding-y)">
        <SectionHead
          eyebrow={text(config, 'eyebrow', defaults.eyebrow)}
          title={text(config, 'title', defaults.title)}
          subtitle={text(config, 'subtitle', defaults.subtitle)}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((teacher) => (
            <article
              key={teacher.name}
              className={`rounded-(--theme-border-radius) border p-6 ${
                onDeep ? 'border-current/16 bg-current/5' : 'border-(--theme-border-color) bg-(--theme-surface)'
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid size-16 place-items-center bg-(--theme-primary-subtle) text-[22px] font-bold text-(--theme-primary) ${
                  avatarShape === 'round' ? 'rounded-full' : 'rounded-(--theme-border-radius)'
                }`}
              >
                {teacher.initials}
              </span>

              <h3 className="mt-5 text-[19px] font-bold">{teacher.name}</h3>
              <p className="mt-1 text-[13.5px] font-bold text-(--theme-primary)">{teacher.role}</p>
              <p className={`mt-3 text-[14px] leading-[1.8] ${onDeep ? 'text-current/62' : 'text-(--theme-muted)'}`}>
                {teacher.bio}
              </p>

              {teacher.stats && teacher.stats.length > 0 ? (
                <ul
                  className={`mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t pt-4 text-[12.5px] ${
                    onDeep ? 'border-current/16 text-current/60' : 'border-(--theme-border-color) text-(--theme-muted)'
                  }`}
                >
                  {teacher.stats.map((stat) => (
                    <li key={stat}>{stat}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
