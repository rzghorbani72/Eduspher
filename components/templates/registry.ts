import { SOHAIL_SECTIONS } from './sohail';
import { SETIGH_SECTIONS } from './setigh';
import { HAVAN_SECTIONS } from './havan';
import { TONDAK_SECTIONS } from './tondak';
import { MOMAS_SECTIONS } from './momas';
import { GOFTAVARD_SECTIONS } from './goftavard';
import { RASADANEH_SECTIONS } from './rasadaneh';
import { RAUSHAN_SECTIONS } from './raushan';
import { SHABTAB_SECTIONS } from './shabtab';
import { SEPID_SECTIONS } from './sepid';
import { HAMRANG_SECTIONS } from './hamrang';
import { BARAN_SECTIONS } from './baran';
import { SHAFAGH_SECTIONS } from './shafagh';
import { NABZ_SECTIONS } from './nabz';
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
  sohail: SOHAIL_SECTIONS,
  setigh: SETIGH_SECTIONS,
  havan: HAVAN_SECTIONS,
  tondak: TONDAK_SECTIONS,
  momas: MOMAS_SECTIONS,
  goftavard: GOFTAVARD_SECTIONS,
  rasadaneh: RASADANEH_SECTIONS,
  raushan: RAUSHAN_SECTIONS,
  shabtab: SHABTAB_SECTIONS,
  sepid: SEPID_SECTIONS,
  hamrang: HAMRANG_SECTIONS,
  baran: BARAN_SECTIONS,
  shafagh: SHAFAGH_SECTIONS,
  nabz: NABZ_SECTIONS,
};

export function resolveTemplateSection(
  style: unknown,
  type: string
): ComponentType<TemplateSectionProps> | null {
  if (!isTemplateKey(style)) return null;
  const sections = TEMPLATE_SECTIONS[style];
  return sections[type as TemplateSectionType] ?? null;
}
