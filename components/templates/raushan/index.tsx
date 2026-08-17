import type { TemplateSectionMap } from '../registry-types';
import { RaushanHero } from './hero';

/**
 * Raushan currently implements only its hero design. Every other section type
 * falls through to the legacy shared block, which is the supported mixable
 * pattern documented on `TemplateSectionMap`.
 */
export const RAUSHAN_SECTIONS: TemplateSectionMap = {
  hero: RaushanHero,
};
