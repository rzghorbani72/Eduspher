import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import type { CourseCardSpec } from '../_shared/course-card';
import { TemplateDataTable } from '../_shared/data-table';
import { DANESHVAR_DEFAULTS } from './defaults';
import { DaneshvarHero } from './hero';
import { DaneshvarFeatures } from './features';
import { DaneshvarCategories } from './categories';
import styles from './daneshvar.module.css';

/** Daneshvar — university teacher: ruled paper, brass keylines, plate portrait. */
const DANESHVAR_HEADER = headerDefaults({
  tagline: 'درس‌ها، پژوهش و ساعات مراجعه',
  ctaText: 'رزرو ساعت مراجعه',
  nav: FULL_NAV,
});

export const DANESHVAR_COURSE_CARD: CourseCardSpec = {
  thumbTones: [styles.tA, styles.tB, styles.tC, styles.tD],
  thumbClassName: 'relative aspect-[4/3] overflow-hidden',
};

export const DANESHVAR_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={DANESHVAR_HEADER}
      spec={{ tone: 'page', height: 76, navStyle: 'underline', thickBorder: true }}
    />
  ),
  hero: DaneshvarHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={DANESHVAR_DEFAULTS.marquee.items}
      tone="deep"
      separator="diamond"
    />
  ),
  features: DaneshvarFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={DANESHVAR_DEFAULTS.courses}
      card={DANESHVAR_COURSE_CARD}
      tone="page"
      bordered
    />
  ),
  categories: DaneshvarCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable
      id={id}
      config={config}
      defaults={DANESHVAR_DEFAULTS.showcase}
      tone="surface"
    />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={DANESHVAR_DEFAULTS.teachers} tone="page" />
  ),
  cta: ({ id, config, storeContext }) => (
    <TemplateCta
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={DANESHVAR_DEFAULTS.cta}
      tone="deep"
    />
  ),
  footer: ({ id, config, storeContext }) => (
    <TemplateSiteFooter
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={DANESHVAR_DEFAULTS.footer}
    />
  ),
};
