import type { TemplateSectionMap } from '../registry-types';
import { TemplateTopBar, headerDefaults, FULL_NAV } from '../_shared/header';
import { TemplateMarquee } from '../_shared/marquee';
import { TemplateSiteFooter } from '../_shared/footer';
import { TemplateTeachers } from '../_shared/teachers';
import { TemplateCta } from '../_shared/cta';
import { TemplateCourses } from '../_shared/courses';
import { TemplateDataTable } from '../_shared/data-table';
import { SHAFAGH_COURSE_CARD } from '../shafagh';
import { ShafaghFeatures } from '../shafagh/features';
import { ShafaghCategories } from '../shafagh/categories';
import { PARDEH_DEFAULTS } from './defaults';
import { PardehHero } from './hero';

/** Pardeh — "the screen": Shafagh's gallery voice opened with a full-bleed looping video banner. */
const PARDEH_HEADER = headerDefaults({
  tagline: PARDEH_DEFAULTS.hero.kicker,
  ctaText: 'ثبت‌نام در دوره',
  nav: FULL_NAV,
});

export const PARDEH_COURSE_CARD = SHAFAGH_COURSE_CARD;

export const PARDEH_SECTIONS: TemplateSectionMap = {
  header: ({ id, config, storeContext }) => (
    <TemplateTopBar
      id={id}
      config={config}
      editMode={storeContext?.editMode}
      defaults={PARDEH_HEADER}
      spec={{ tone: 'page', height: 76, navStyle: 'underline' }}
    />
  ),
  hero: PardehHero,
  marquee: ({ id, config }) => (
    <TemplateMarquee
      id={id}
      config={config}
      fallbackItems={PARDEH_DEFAULTS.marquee.items}
      tone="brand"
    />
  ),
  features: ShafaghFeatures,
  courses: ({ id, config, storeContext }) => (
    <TemplateCourses
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={PARDEH_DEFAULTS.courses}
      card={PARDEH_COURSE_CARD}
      tone="page"
    />
  ),
  categories: ShafaghCategories,
  showcase: ({ id, config }) => (
    <TemplateDataTable id={id} config={config} defaults={PARDEH_DEFAULTS.showcase} tone="surface" />
  ),
  teachers: ({ id, config }) => (
    <TemplateTeachers
      id={id}
      config={config}
      defaults={PARDEH_DEFAULTS.teachers}
      tone="page"
      avatarShape="round"
    />
  ),
  cta: ({ id, config, storeContext }) => (
    <TemplateCta
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={PARDEH_DEFAULTS.cta}
      tone="deep"
      boxed
    />
  ),
  footer: ({ id, config, storeContext }) => (
    <TemplateSiteFooter
      id={id}
      config={config}
      storeContext={storeContext}
      defaults={PARDEH_DEFAULTS.footer}
    />
  ),
};
