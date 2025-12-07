const normalizeBaseUrl = (origin: string) => {
  const trimmed = origin.trim().replace(/\/+$/, '');
  return trimmed.length ? trimmed : 'http://localhost:3000';
};

const normalizeApiPath = (path: string) => {
  if (!path) return '/api';
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
};

export const env = {
  backendOrigin: normalizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? ''),
  backendApiPath: normalizeApiPath(process.env.NEXT_PUBLIC_BACKEND_API_PATH ?? '/api'),
  defaultStoreId: Number(process.env.NEXT_PUBLIC_DEFAULT_STORE_ID ?? '1'),
  defaultStoreSlug: process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG ?? null,
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? 'EduSpher',
  siteDescription:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
    'Discover flexible online learning with EduSpher.',
  storeIdCookie: process.env.NEXT_PUBLIC_STORE_ID_COOKIE ?? 'eduspher_store_id',
  storeSlugCookie: process.env.NEXT_PUBLIC_STORE_SLUG_COOKIE ?? 'eduspher_store_slug',
  storeNameCookie: process.env.NEXT_PUBLIC_STORE_NAME_COOKIE ?? 'eduspher_store_name',
};

export const backendApiBaseUrl = `${env.backendOrigin}${env.backendApiPath}`;

