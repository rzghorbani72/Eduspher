import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import type { CourseCardSpec } from '../_shared/course-card';
import { TemplateDataTable } from '../_shared/data-table';
import { PELEH_DEFAULTS } from './defaults';
import { PelehHero } from './hero';
import { PelehFeatures } from './features';
import { PelehCategories } from './categories';
import styles from './peleh.module.css';

/** Peleh — konkur & highschool teacher: stair motif, rank proof, countdown. */
const PELEH_HEADER = headerDefaults({
  tagline: 'کلاس‌های کنکور و دبیرستان',
  ctaText: 'شروع دورهٔ جامع',
  nav: FULL_NAV,
});

export const PELEH_COURSE_CARD: CourseCardSpec = {
  thumbTones: [styles.tA, styles.tB, styles.tC, styles.tD],
  thumbClassName: 'relative aspect-[4/3] overflow-hidden',
  footer: 'action',
};

export const PELEH_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={PELEH_HEADER}
      spec={{ tone: 'page', height: 72, navStyle: 'pill', accentBar: true }}
    />
  ),
  hero: PelehHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={PELEH_DEFAULTS.marquee.items}
      tone="brand"
    />
  ),
  features: PelehFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={PELEH_DEFAULTS.courses}
      card={PELEH_COURSE_CARD}
      tone="surface"
    />
  ),
  categories: PelehCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={PELEH_DEFAULTS.showcase} tone="surface" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers
      id={id}
      config={config}
      defaults={PELEH_DEFAULTS.teachers}
      tone="page"
      avatarShape="round"
    />
  ),
  cta: ({ id, config, storeContext }) => (
    <TemplateCta
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={PELEH_DEFAULTS.cta}
      tone="brand"
      boxed
    />
  ),
  footer: ({ id, config, storeContext }) => (
    <TemplateSiteFooter
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={PELEH_DEFAULTS.footer}
    />
  ),
};
