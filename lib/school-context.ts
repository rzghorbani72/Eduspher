import "server-only";

import { cookies, headers as nextHeaders } from "next/headers";

import { env } from "@/lib/env";

export type SchoolContext = {
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

export const getSchoolContext = async (): Promise<SchoolContext> => {
  const cookieStore = await cookies();
  const headerStore = await nextHeaders();

  const headerSchoolId = headerStore?.get?.("x-school-id") ?? null;
  const headerSchoolSlug = headerStore?.get?.("x-school-slug") ?? null;
  const cookieSchoolId = cookieStore.get(env.schoolIdCookie)?.value;
  const cookieSchoolSlug = cookieStore.get(env.schoolSlugCookie)?.value;
  const cookieSchoolName = decodeCookieValue(cookieStore.get(env.schoolNameCookie)?.value);

  const resolvedId =
    headerSchoolId ??
    cookieSchoolId ??
    (env.defaultSchoolId ? String(env.defaultSchoolId) : null);

  const resolvedSlug =
    headerSchoolSlug ??
    cookieSchoolSlug ??
    env.defaultSchoolSlug ??
    null;

  const resolvedName = cookieSchoolName ?? env.siteName;

  return {
    id: resolvedId ? Number(resolvedId) : null,
    slug: resolvedSlug,
    name: resolvedName,
  };
};

