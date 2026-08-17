import type { TemplateSectionMap } from '../registry-types';
import { SepidHero } from './hero';

/**
 * Sepid currently implements only its hero design. Every other section type
 * falls through to the legacy shared block, which is the supported mixable
 * pattern documented on `TemplateSectionMap`.
 */
export const SEPID_SECTIONS: TemplateSectionMap = {
  hero: SepidHero,
};
