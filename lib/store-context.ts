import 'server-only';

import { cookies, headers as nextHeaders } from 'next/headers';

import { env } from '@/lib/env';

export type ResolvedAcademy = {
  id: string | null;
  slug: string | null;
  name: string;
  isSubdomain: boolean;
};

const decodeCookieValue = (value?: string | null) => {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const getAcademyContext = async (): Promise<ResolvedAcademy> => {
  const cookieStore = await cookies();
  const headerStore = await nextHeaders();

  if (headerStore.get('x-panel-root') === '1') {
    return {
      id: null,
      slug: null,
      name: env.siteName,
      isSubdomain: false,
    };
  }

  const headerAcademyId =
    headerStore?.get?.('x-academy-id') ?? headerStore?.get?.('X-Academy-ID') ?? null;
  const headerAcademySlug =
    headerStore?.get?.('x-academy-slug') ?? headerStore?.get?.('X-Academy-Slug') ?? null;
  const cookieAcademyId = cookieStore.get(env.academyIdCookie)?.value;
  const cookieAcademySlug = cookieStore.get(env.academySlugCookie)?.value;
  const cookieAcademyName = decodeCookieValue(cookieStore.get(env.academyNameCookie)?.value);

  const resolvedSlug = headerAcademySlug ?? cookieAcademySlug ?? env.defaultAcademySlug ?? null;

  const resolvedId =
    headerAcademyId ??
    cookieAcademyId ??
    (resolvedSlug ? null : env.defaultAcademyId ? String(env.defaultAcademyId) : null);

  // Admin previewing a public template: it belongs to no academy, so show a
  // neutral sample brand instead of leaking the previewing academy's name.
  // Slug/id are kept so the preview still renders real catalog and theme data.
  const isSamplePreview = headerStore.get('x-preview-sample') === '1';
  const resolvedName = isSamplePreview ? 'نمونه' : (cookieAcademyName ?? env.siteName);

  return {
    id: resolvedId ?? null,
    slug: resolvedSlug,
    name: resolvedName,
    isSubdomain: headerStore.get('x-academy-subdomain') === '1',
  };
};
