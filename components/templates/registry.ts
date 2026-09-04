import { KEYHAN_SECTIONS } from './keyhan';
import { TAVAN_SECTIONS } from './tavan';
import { DASTAN_SECTIONS } from './dastan';
import { PARASTOO_SECTIONS } from './parastoo';
import { NOKHBEH_SECTIONS } from './nokhbeh';
import { ZABANEH_SECTIONS } from './zabaneh';
import { BIKARAN_SECTIONS } from './bikaran';
import { RAUSHAN_SECTIONS } from './raushan';
import { SHABTAB_SECTIONS } from './shabtab';
import { SEPID_SECTIONS } from './sepid';
import { HAMRANG_SECTIONS } from './hamrang';
import { BARAN_SECTIONS } from './baran';
import { SHAFAGH_SECTIONS } from './shafagh';
import { ELEKTRON_SECTIONS } from './elektron';
import { ROUZAN_SECTIONS } from './rouzan';
import { DANESHVAR_SECTIONS } from './daneshvar';
import { PELEH_SECTIONS } from './peleh';
import { ANDISHEH_SECTIONS } from './andisheh';
import { SHAPARAK_SECTIONS } from './shaparak';
import { KEYHAN_COURSE_CARD } from './keyhan';
import { TAVAN_COURSE_CARD } from './tavan';
import { DASTAN_COURSE_CARD } from './dastan';
import { PARASTOO_COURSE_CARD } from './parastoo';
import { NOKHBEH_COURSE_CARD } from './nokhbeh';
import { ZABANEH_COURSE_CARD } from './zabaneh';
import { BIKARAN_COURSE_CARD } from './bikaran';
import { SHAFAGH_COURSE_CARD } from './shafagh';
import { ELEKTRON_COURSE_CARD } from './elektron';
import { ROUZAN_COURSE_CARD } from './rouzan';
import { DANESHVAR_COURSE_CARD } from './daneshvar';
import { PELEH_COURSE_CARD } from './peleh';
import { ANDISHEH_COURSE_CARD } from './andisheh';
import { SHAPARAK_COURSE_CARD } from './shaparak';
import type { CourseCardSpec } from './_shared/course-card';
import type { TemplateKey, TemplateSectionMap, TemplateSectionType } from './registry-types';
import { isTemplateKey } from './registry-types';
import type { ComponentType } from 'react';
import type { TemplateSectionProps } from './_shared/types';

/**
 * Template key → its section implementations.
 *
 * A block carries its template in `config.style`, so a section keeps its own
 * design when a manager imports it into a page built from another template.
 * Nothing here mutates the legacy block components: a type this map does not
 * cover falls through to the shared block, so academies on older styles are
 * untouched.
 */
const TEMPLATE_SECTIONS: Record<TemplateKey, TemplateSectionMap> = {
  keyhan: KEYHAN_SECTIONS,
  tavan: TAVAN_SECTIONS,
  dastan: DASTAN_SECTIONS,
  parastoo: PARASTOO_SECTIONS,
  nokhbeh: NOKHBEH_SECTIONS,
  zabaneh: ZABANEH_SECTIONS,
  bikaran: BIKARAN_SECTIONS,
  raushan: RAUSHAN_SECTIONS,
  shabtab: SHABTAB_SECTIONS,
  sepid: SEPID_SECTIONS,
  hamrang: HAMRANG_SECTIONS,
  baran: BARAN_SECTIONS,
  shafagh: SHAFAGH_SECTIONS,
  elektron: ELEKTRON_SECTIONS,
  rouzan: ROUZAN_SECTIONS,
  daneshvar: DANESHVAR_SECTIONS,
  peleh: PELEH_SECTIONS,
  andisheh: ANDISHEH_SECTIONS,
  shaparak: SHAPARAK_SECTIONS,
};

export function resolveTemplateSection(
  style: unknown,
  type: string
): ComponentType<TemplateSectionProps> | null {
  if (!isTemplateKey(style)) return null;
  const sections = TEMPLATE_SECTIONS[style];
  return sections[type as TemplateSectionType] ?? null;
}

/**
 * Template key → its course-card look. Read by every page that lists courses
 * (home, catalogue, course detail), so the manager's template choice is not a
 * home-page-only decision. A template with no entry keeps the built-in card.
 */
const TEMPLATE_COURSE_CARDS: Partial<Record<TemplateKey, CourseCardSpec>> = {
  keyhan: KEYHAN_COURSE_CARD,
  tavan: TAVAN_COURSE_CARD,
  dastan: DASTAN_COURSE_CARD,
  parastoo: PARASTOO_COURSE_CARD,
  nokhbeh: NOKHBEH_COURSE_CARD,
  zabaneh: ZABANEH_COURSE_CARD,
  bikaran: BIKARAN_COURSE_CARD,
  shafagh: SHAFAGH_COURSE_CARD,
  elektron: ELEKTRON_COURSE_CARD,
  rouzan: ROUZAN_COURSE_CARD,
  daneshvar: DANESHVAR_COURSE_CARD,
  peleh: PELEH_COURSE_CARD,
  andisheh: ANDISHEH_COURSE_CARD,
  shaparak: SHAPARAK_COURSE_CARD,
};

export function resolveTemplateCourseCard(style: unknown): CourseCardSpec | null {
  if (!isTemplateKey(style)) return null;
  return TEMPLATE_COURSE_CARDS[style] ?? null;
}
