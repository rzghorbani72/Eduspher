import "server-only";

import { cookies } from "next/headers";
import { decodeJwt } from "jose";

export type SessionPayload = {
  userId: number | null;
  profileId: number | null;
  schoolId: number | null;
  roles: string[];
};

export const getSession = async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;
  if (!token) return null;
  try {
    const payload = decodeJwt(token);
    return {
      userId: typeof payload.userId === "number" ? payload.userId : null,
      profileId: typeof payload.profileId === "number" ? payload.profileId : null,
      schoolId: typeof payload.schoolId === "number" ? payload.schoolId : null,
      roles: Array.isArray(payload.roles) ? (payload.roles as string[]) : [],
    };
  } catch {
    return null;
  }
};

