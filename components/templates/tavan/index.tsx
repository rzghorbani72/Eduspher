import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import type { CourseCardSpec } from '../_shared/course-card';
import { TAVAN_DEFAULTS } from './defaults';
import { TavanHero } from './hero';
import { TavanFeatures } from './features';
import { TavanCategories } from './categories';
import { TavanLadder } from './ladder';
import styles from './tavan.module.css';

const TAVAN_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Tavan — performance lab: hazard stripes, ghost numerals, load bars. */
const TAVAN_HEADER = headerDefaults({
  tagline: 'آزمایشگاه قدرت و اجرا',
  ctaText: 'شروع هفتهٔ صفر',
  nav: FULL_NAV,
});

export const TAVAN_COURSE_CARD: CourseCardSpec = {
  thumbTones: TAVAN_THUMBS,
  thumbClassName: styles.thumb,
  footer: 'action',
};

export const TAVAN_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={TAVAN_HEADER}
      spec={{
        tone: 'deep',
        height: 80,
        navStyle: 'plain',
        markClassName: styles.logoMark,
        accentBar: true,
      }}
    />
  ),
  hero: TavanHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={TAVAN_DEFAULTS.marquee.items}
      tone="accent"
      separator="slash"
    />
  ),
  features: TavanFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={TAVAN_DEFAULTS.courses}
      card={TAVAN_COURSE_CARD}
      tone="surface"
    />
  ),
  categories: TavanCategories,
  showcase: TavanLadder,
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={TAVAN_DEFAULTS.teachers} tone="surface" />
  ),
  cta: ({ id, config, storeContext }) => (
    <TemplateCta
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={TAVAN_DEFAULTS.cta}
      tone="deep"
    />
  ),
  footer: ({ id, config, storeContext }) => (
    <TemplateSiteFooter
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={TAVAN_DEFAULTS.footer}
    />
  ),
};
