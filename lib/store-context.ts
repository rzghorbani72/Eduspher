import "server-only";

import { cookies, headers as nextHeaders } from "next/headers";

import { env } from "@/lib/env";

export type StoreContext = {
  id: number | null;
  slug: string | null;
  name: string;
};

const decodeCookieValue = (value?: string | null) => {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const getStoreContext = async (): Promise<StoreContext> => {
  const cookieStore = await cookies();
  const headerStore = await nextHeaders();

  const headerStoreId = headerStore?.get?.("x-store-id") ?? null;
  const headerStoreSlug = headerStore?.get?.("x-store-slug") ?? null;
  const cookieStoreId = cookieStore.get(env.storeIdCookie)?.value;
  const cookieStoreSlug = cookieStore.get(env.storeSlugCookie)?.value;
  const cookieStoreName = decodeCookieValue(cookieStore.get(env.storeNameCookie)?.value);

  const resolvedId =
    headerStoreId ??
    cookieStoreId ??
    (env.defaultStoreId ? String(env.defaultStoreId) : null);

  const resolvedSlug =
    headerStoreSlug ??
    cookieStoreSlug ??
    env.defaultStoreSlug ??
    null;

  const resolvedName = cookieStoreName ?? env.siteName;

  return {
    id: resolvedId ? Number(resolvedId) : null,
    slug: resolvedSlug,
    name: resolvedName,
  };
};
