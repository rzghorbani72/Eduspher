/** Parse a Mentoma Meet / Jitsi room URL into External API pieces. */
export type ParsedMeetUrl = {
  readonly domain: string;
  readonly roomName: string;
  readonly jwt: string | null;
};

export const parseMeetUrl = (url: string): ParsedMeetUrl | null => {
  try {
    const parsed = new URL(url);
    const roomName = parsed.pathname.replace(/^\/+|\/+$/g, '').split('/')[0] ?? '';
    if (!roomName) return null;
    return {
      domain: parsed.hostname,
      roomName,
      jwt: parsed.searchParams.get('jwt'),
    };
  } catch {
    return null;
  }
};
