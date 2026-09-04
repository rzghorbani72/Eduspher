import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import type { CourseCardSpec } from '../_shared/course-card';
import { TemplateDataTable } from '../_shared/data-table';
import { ROUZAN_DEFAULTS } from './defaults';
import { RouzanHero } from './hero';
import { RouzanFeatures } from './features';
import { RouzanCategories } from './categories';
import styles from './rouzan.module.css';

/** Rouzan — fullstack programming teacher: bright page, huge type, video hero. */
const ROUZAN_HEADER = headerDefaults({
  tagline: 'دوره‌های برنامه‌نویسی فول‌استک',
  ctaText: 'شروع رایگان',
  nav: FULL_NAV,
});

export const ROUZAN_COURSE_CARD: CourseCardSpec = {
  thumbTones: [styles.tA, styles.tB, styles.tC, styles.tD],
  thumbClassName: 'relative aspect-video overflow-hidden',
  footer: 'rating',
};

export const ROUZAN_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={ROUZAN_HEADER}
      spec={{ tone: 'page', height: 68, navStyle: 'plain', translucent: true }}
    />
  ),
  hero: RouzanHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee id={id} config={config} fallbackItems={ROUZAN_DEFAULTS.marquee.items} tone="deep" separator="slash" />
  ),
  features: RouzanFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={ROUZAN_DEFAULTS.courses}
      card={ROUZAN_COURSE_CARD}
      tone="page"
    />
  ),
  categories: RouzanCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={ROUZAN_DEFAULTS.showcase} tone="page" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={ROUZAN_DEFAULTS.teachers} tone="surface" avatarShape="round" />
  ),
  cta: ({ id, config, storeContext }) => (
    <TemplateCta id={id} config={config} storeContext={storeContext} defaults={ROUZAN_DEFAULTS.cta} tone="deep" boxed />
  ),
  footer: ({ id, config, storeContext }) => (
    <TemplateSiteFooter id={id} config={config} storeContext={storeContext} defaults={ROUZAN_DEFAULTS.footer} />
  ),
};
