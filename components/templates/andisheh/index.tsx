import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import type { CourseCardSpec } from '../_shared/course-card';
import { TemplateDataTable } from '../_shared/data-table';
import { ANDISHEH_DEFAULTS } from './defaults';
import { AndishehHero } from './hero';
import { AndishehFeatures } from './features';
import { AndishehCategories } from './categories';
import styles from './andisheh.module.css';

/** Andisheh — AI & DevOps mentor: dark terminal stage, pipeline rail, video hero. */
const ANDISHEH_HEADER = headerDefaults({
  tagline: 'هوش مصنوعی، ام‌ال‌اپس و زیرساخت',
  ctaText: 'رزرو جلسهٔ منتورینگ',
  nav: FULL_NAV,
});

export const ANDISHEH_COURSE_CARD: CourseCardSpec = {
  thumbTones: [styles.tA, styles.tB, styles.tC, styles.tD],
  thumbClassName: 'relative aspect-video overflow-hidden',
};

export const ANDISHEH_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={ANDISHEH_HEADER}
      spec={{ tone: 'deep', height: 70, navStyle: 'plain' }}
    />
  ),
  hero: AndishehHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={ANDISHEH_DEFAULTS.marquee.items}
      tone="accent"
      separator="slash"
    />
  ),
  features: AndishehFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={ANDISHEH_DEFAULTS.courses}
      card={ANDISHEH_COURSE_CARD}
      tone="page"
    />
  ),
  categories: AndishehCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={ANDISHEH_DEFAULTS.showcase} tone="page" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={ANDISHEH_DEFAULTS.teachers} tone="surface" />
  ),
  cta: ({ id, config, storeContext }) => (
    <TemplateCta id={id} config={config} storeContext={storeContext} defaults={ANDISHEH_DEFAULTS.cta} tone="deep" boxed />
  ),
  footer: ({ id, config, storeContext }) => (
    <TemplateSiteFooter id={id} config={config} storeContext={storeContext} defaults={ANDISHEH_DEFAULTS.footer} />
  ),
};
