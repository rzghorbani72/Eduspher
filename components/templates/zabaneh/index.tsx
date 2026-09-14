import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, COMPACT_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import type { CourseCardSpec } from '../_shared/course-card';
import { ZABANEH_DEFAULTS } from './defaults';
import { ZabanehHero } from './hero';
import { ZabanehFeatures } from './features';
import { ZabanehLevels } from './levels';
import styles from './zabaneh.module.css';

const ZABANEH_THUMBS = [styles.t1, styles.t2, styles.t3, styles.t4];

/** Zabaneh — dictionary and transcript: highlighter signal, tilted cards. */
const ZABANEH_HEADER = headerDefaults({
  tagline: 'آکادمی زبان',
  ctaText: 'آزمون تعیین سطح',
  nav: COMPACT_NAV,
});

export const ZABANEH_COURSE_CARD: CourseCardSpec = {
  thumbTones: ZABANEH_THUMBS,
  thumbClassName: styles.thumb,
};

export const ZABANEH_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={ZABANEH_HEADER}
      spec={{ tone: 'surface', height: 74, navStyle: 'underline' }}
    />
  ),
  hero: ZabanehHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={ZABANEH_DEFAULTS.marquee.items}
      tone="deep"
    />
  ),
  features: ZabanehFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={ZABANEH_DEFAULTS.courses}
      card={ZABANEH_COURSE_CARD}
      tone="surface"
    />
  ),
  showcase: ZabanehLevels,
  teachers: ({ id, config }) => (
    <TemplateTeachers
      id={id}
      config={config}
      defaults={ZABANEH_DEFAULTS.teachers}
      tone="page"
      avatarShape="round"
    />
  ),
  cta: ({ id, config, storeContext }) => (
    <TemplateCta
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={ZABANEH_DEFAULTS.cta}
      tone="deep"
    />
  ),
  footer: ({ id, config, storeContext }) => (
    <TemplateSiteFooter
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={ZABANEH_DEFAULTS.footer}
    />
  ),
};
