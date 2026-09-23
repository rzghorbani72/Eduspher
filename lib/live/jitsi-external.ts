import type { JitsiLeaveApi } from '@/lib/live/leave-jitsi';

export type JitsiApi = JitsiLeaveApi;
export type JitsiApiCtor = new (domain: string, options: Record<string, unknown>) => JitsiApi;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiApiCtor;
  }
}

const scriptPromises = new Map<string, Promise<JitsiApiCtor>>();

export const loadExternalApi = (domain: string): Promise<JitsiApiCtor> => {
  const existing = scriptPromises.get(domain);
  if (existing) return existing;

  const promise = new Promise<JitsiApiCtor>((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) {
      resolve(window.JitsiMeetExternalAPI);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => {
      if (window.JitsiMeetExternalAPI) resolve(window.JitsiMeetExternalAPI);
      else reject(new Error('JitsiMeetExternalAPI missing after load'));
    };
    script.onerror = () => reject(new Error(`Failed to load https://${domain}/external_api.js`));
    document.body.appendChild(script);
  });

  scriptPromises.set(domain, promise);
  return promise;
};

export const buildJitsiOptions = (input: {
  roomName: string;
  parentNode: HTMLElement;
  jwt: string | null;
  displayName?: string | null;
  roomSubject: string;
}): Record<string, unknown> => ({
  roomName: input.roomName,
  parentNode: input.parentNode,
  width: '100%',
  height: '100%',
  jwt: input.jwt ?? undefined,
  userInfo: input.displayName?.trim() ? { displayName: input.displayName.trim() } : undefined,
  configOverwrite: {
    defaultLanguage: 'fa',
    subject: input.roomSubject,
    localSubject: input.roomSubject,
    prejoinConfig: { enabled: true },
    enableWelcomePage: false,
    enableClosePage: false,
    disableDeepLinking: true,
    startWithAudioMuted: false,
    startWithVideoMuted: false,
  },
  interfaceConfigOverwrite: {
    APP_NAME: 'منتوما',
    NATIVE_APP_NAME: input.roomSubject,
    PROVIDER_NAME: 'منتوما',
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    SHOW_POWERED_BY: false,
    DEFAULT_LOGO_URL: 'https://mentoma.ir/meet-branding/logo-mark.svg',
    DEFAULT_WELCOME_PAGE_LOGO_URL: 'https://mentoma.ir/meet-branding/logo-type.svg',
  },
});
