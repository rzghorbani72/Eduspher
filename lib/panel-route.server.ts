import 'server-only';

import { headers as nextHeaders } from 'next/headers';

export const isPanelRootRequest = async (): Promise<boolean> => {
  const headerStore = await nextHeaders();
  return headerStore.get('x-panel-root') === '1';
};

export const isAcademyPathRequest = async (): Promise<boolean> => {
  const headerStore = await nextHeaders();
  return headerStore.get('x-academy-from-path') === '1';
};
