import { cache } from 'react';

import { getStoreThemeAndTemplate } from './theme-config';
import { isTemplateKey, type TemplateKey } from '@/components/templates/registry-types';

/**
 * Which of the shipped templates the academy is running.
 *
 * A preset writes its key into every block's `config.style`, so the home page
 * blocks are the source of truth. Reading it here lets pages that render no
 * blocks at all — the courses list, a course detail page — still follow the
 * manager's template choice instead of falling back to the generic look.
 */
export const getActiveTemplateKey = cache(async (): Promise<TemplateKey | null> => {
  const { template } = await getStoreThemeAndTemplate();
  for (const block of template?.blocks ?? []) {
    const style = block.config?.style;
    if (isTemplateKey(style)) return style;
  }
  return null;
});
