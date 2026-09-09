import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import type { CourseCardSpec } from '../_shared/course-card';
import { TemplateDataTable } from '../_shared/data-table';
import { SHAPARAK_DEFAULTS } from './defaults';
import { ShaparakHero } from './hero';
import { ShaparakFeatures } from './features';
import { ShaparakCategories } from './categories';
import styles from './shaparak.module.css';

/** Shaparak — programming for kids: blobs, sticker cards, command blocks. */
const SHAPARAK_HEADER = headerDefaults({
  tagline: 'برنامه‌نویسی و رباتیک کودکان',
  ctaText: 'جلسهٔ آزمایشی رایگان',
  nav: FULL_NAV,
});

export const SHAPARAK_COURSE_CARD: CourseCardSpec = {
  thumbTones: [styles.tA, styles.tB, styles.tC, styles.tD],
  thumbClassName: 'relative aspect-[4/3] overflow-hidden',
  footer: 'action',
};

export const SHAPARAK_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={SHAPARAK_HEADER}
      spec={{ tone: 'page', height: 74, navStyle: 'pill', markClassName: 'rounded-full' }}
    />
  ),
  hero: ShaparakHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee id={id} config={config} fallbackItems={SHAPARAK_DEFAULTS.marquee.items} tone="accent" />
  ),
  features: ShaparakFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={SHAPARAK_DEFAULTS.courses}
      card={SHAPARAK_COURSE_CARD}
      tone="surface"
    />
  ),
  categories: ShaparakCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={SHAPARAK_DEFAULTS.showcase} tone="surface" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers id={id} config={config} defaults={SHAPARAK_DEFAULTS.teachers} tone="page" avatarShape="round" />
  ),
  cta: ({ id, config, storeContext }) => (
    <TemplateCta id={id} config={config} storeContext={storeContext} defaults={SHAPARAK_DEFAULTS.cta} tone="brand" boxed />
  ),
  footer: ({ id, config, storeContext }) => (
    <TemplateSiteFooter id={id} config={config} storeContext={storeContext} defaults={SHAPARAK_DEFAULTS.footer} />
  ),
};
