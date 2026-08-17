import type { TemplateSectionMap } from '../registry-types';
import { BaranHero } from './hero';

/**
 * Baran currently implements only its hero design. Every other section type
 * falls through to the legacy shared block, which is the supported mixable
 * pattern documented on `TemplateSectionMap`.
 */
export const BARAN_SECTIONS: TemplateSectionMap = {
  hero: BaranHero,
};
