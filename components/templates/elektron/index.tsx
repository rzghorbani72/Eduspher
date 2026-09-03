import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import type { CourseCardSpec } from '../_shared/course-card';
import { TemplateDataTable } from '../_shared/data-table';
import { ELEKTRON_DEFAULTS } from './defaults';
import { ElektronHero } from './hero';
import { ElektronFeatures } from './features';
import { ElektronCategories } from './categories';
import styles from './elektron.module.css';

/** Elektron — digital/media academy: dark pulse stage, signal dots and a gradient wave. */
const ELEKTRON_HEADER = headerDefaults({
  tagline: 'آکادمی دیجیتال، رسانه و طراحی',
  ctaText: 'ثبت‌نام در دوره',
  nav: FULL_NAV,
});

export const ELEKTRON_COURSE_CARD: CourseCardSpec = {
  thumbTones: [styles.tA, styles.tB, styles.tC, styles.tD],
  thumbClassName: 'relative aspect-video overflow-hidden',
};

export const ELEKTRON_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={ELEKTRON_HEADER}
      spec={{ tone: 'deep', height: 72, navStyle: 'pill' }}
    />
  ),
  hero: ElektronHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee id={id} config={config} fallbackItems={ELEKTRON_DEFAULTS.marquee.items} tone="accent" />
  ),
  features: ElektronFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={ELEKTRON_DEFAULTS.courses}
      card={ELEKTRON_COURSE_CARD}
      tone="surface"
    />
  ),
  categories: ElektronCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={ELEKTRON_DEFAULTS.showcase} tone="surface" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={ELEKTRON_DEFAULTS.teachers} tone="page" />
  ),
  cta: ({ id, config, storeContext }) => <TemplateCta id={id} config={config} storeContext={storeContext} defaults={ELEKTRON_DEFAULTS.cta} tone="deep" boxed />,
  footer: ({ id, config, storeContext }) => <TemplateSiteFooter id={id} config={config} storeContext={storeContext} defaults={ELEKTRON_DEFAULTS.footer} />,
};
