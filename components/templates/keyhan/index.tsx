import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import type { CourseCardSpec } from '../_shared/course-card';
import { KEYHAN_DEFAULTS } from './defaults';
import { KeyhanHero } from './hero';
import { KeyhanFeatures } from './features';
import { KeyhanCategories } from './categories';
import { TemplateDataTable } from '../_shared/data-table';
import styles from './keyhan.module.css';

const KEYHAN_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Keyhan — observatory instrument: deep void bands, teal signal, plotter grid. */
const KEYHAN_HEADER = headerDefaults({
  tagline: 'آکادمی نجوم و فضا',
  ctaText: 'ثبت‌نام در دوره',
  nav: FULL_NAV,
});

export const KEYHAN_COURSE_CARD: CourseCardSpec = {
  thumbTones: KEYHAN_THUMBS,
  thumbClassName: styles.thumb,
};

export const KEYHAN_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={KEYHAN_HEADER}
      spec={{
        tone: 'page',
        height: 72,
        navStyle: 'plain',
        markClassName: styles.logoMark,
        translucent: true,
      }}
    />
  ),
  hero: KeyhanHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={KEYHAN_DEFAULTS.marquee.items}
      tone="brand"
    />
  ),
  features: KeyhanFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={KEYHAN_DEFAULTS.courses}
      card={KEYHAN_COURSE_CARD}
      tone="surface"
    />
  ),
  categories: KeyhanCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={KEYHAN_DEFAULTS.missions} tone="surface" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={KEYHAN_DEFAULTS.teachers} tone="page" />
  ),
  cta: ({ id, config, storeContext }) => (
    <TemplateCta
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={KEYHAN_DEFAULTS.cta}
      tone="deep"
    />
  ),
  footer: ({ id, config, storeContext }) => (
    <TemplateSiteFooter
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={KEYHAN_DEFAULTS.footer}
    />
  ),
};
