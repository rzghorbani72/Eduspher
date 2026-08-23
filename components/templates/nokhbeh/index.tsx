import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplatePricing } from '../_shared/pricing';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import type { CourseCardSpec } from '../_shared/course-card';
import { TemplateTracks } from '../_shared/tracks';
import { NOKHBEH_DEFAULTS } from './defaults';
import { NokhbehHero } from './hero';
import { NokhbehFeatures } from './features';
import { NokhbehQuiz } from './quiz';
import styles from './nokhbeh.module.css';

const NOKHBEH_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Nokhbeh — worked on paper: squared grid, blue ink, red pen, mono numerals. */
const NOKHBEH_HEADER = headerDefaults({
  tagline: 'ریاضی و آمادگی کنکور',
  ctaText: 'مشاورهٔ رایگان',
  nav: FULL_NAV,
});

export const NOKHBEH_COURSE_CARD: CourseCardSpec = {
  thumbTones: NOKHBEH_THUMBS,
  thumbClassName: styles.thumb,
};

export const NOKHBEH_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar id={id} config={config} editMode={storeContext?.editMode} defaults={NOKHBEH_HEADER} spec={{ tone: 'page', height: 76, navStyle: 'plain', markClassName: styles.logoMark, monoTagline: true }} />
  ),
  hero: NokhbehHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee id={id} config={config} fallbackItems={NOKHBEH_DEFAULTS.marquee.items} tone="deep" />
  ),
  features: NokhbehFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={NOKHBEH_DEFAULTS.courses}
      card={NOKHBEH_COURSE_CARD}
      tone="page"
    />
  ),
  categories: ({ id, config }) => (
    <TemplateTracks id={id} config={config} defaults={NOKHBEH_DEFAULTS.categories} tone="surface" columns={4} />
  ),
  showcase: NokhbehQuiz,
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={NOKHBEH_DEFAULTS.teachers} tone="surface" />
  ),
  pricing: ({ id, config }) => (
    <TemplatePricing id={id} config={config} defaults={NOKHBEH_DEFAULTS.pricing} tone="page" />
  ),
  cta: ({ id, config }) => <TemplateCta id={id} config={config} defaults={NOKHBEH_DEFAULTS.cta} tone="deep" />,
  footer: ({ id, config }) => <TemplateSiteFooter id={id} config={config} defaults={NOKHBEH_DEFAULTS.footer} />,
};
