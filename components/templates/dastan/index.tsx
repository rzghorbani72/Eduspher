import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import type { CourseCardSpec } from '../_shared/course-card';
import { TemplateDataTable } from '../_shared/data-table';
import { DASTAN_DEFAULTS } from './defaults';
import { DastanHero } from './hero';
import { DastanFeatures } from './features';
import { DastanCategories } from './categories';
import styles from './dastan.module.css';

const DASTAN_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Dastan — working kitchen: warm paper, chalk service board, printed hairlines. */
const DASTAN_HEADER = headerDefaults({
  tagline: 'کارگاه آموزش آشپزی',
  ctaText: 'ثبت‌نام دوره',
  nav: FULL_NAV,
});

export const DASTAN_COURSE_CARD: CourseCardSpec = {
  thumbTones: DASTAN_THUMBS,
  thumbClassName: styles.thumb,
};

export const DASTAN_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar id={id} config={config} editMode={storeContext?.editMode} defaults={DASTAN_HEADER} spec={{ tone: 'page', height: 78, navStyle: 'border', markClassName: styles.logoMark }} />
  ),
  hero: DastanHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={DASTAN_DEFAULTS.marquee.items}
      tone="brand"
      separator="diamond"
    />
  ),
  features: DastanFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={DASTAN_DEFAULTS.courses}
      card={DASTAN_COURSE_CARD}
      tone="surface"
    />
  ),
  categories: DastanCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={DASTAN_DEFAULTS.schedule} tone="page" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={DASTAN_DEFAULTS.teachers} tone="deep" avatarShape="round" />
  ),
  cta: ({ id, config }) => <TemplateCta id={id} config={config} defaults={DASTAN_DEFAULTS.cta} tone="brand" />,
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={DASTAN_DEFAULTS.footer} />,
};
