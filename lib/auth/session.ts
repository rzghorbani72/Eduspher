import "server-only";

import { cookies } from "next/headers";
import { decodeJwt } from "jose";

export type SessionPayload = {
  userId: number | null;
  profileId: number | null;
  academyId: number | null;
  roles: string[];
};

export const getSession = async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;
  if (!token) return null;
  try {
    const payload = decodeJwt(token);
    // Token contains profileId (primary), use it for both userId and profileId for backward compatibility
    const profileId = typeof payload.profileId === "number" ? payload.profileId : 
                     (typeof payload.userId === "number" ? payload.userId : null);
    const p = payload as Record<string, unknown>;
    const rawAcademy = typeof p.academyId === "number" ? p.academyId : null;
    return {
      userId: profileId, // Use profileId as userId for backward compatibility
      profileId: profileId,
      academyId: rawAcademy,
      roles: Array.isArray(payload.roles) ? (payload.roles as string[]) : [],
    };
  } catch {
    return null;
  }
};

