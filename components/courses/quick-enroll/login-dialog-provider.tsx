'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { QuickEnrollDialog } from '@/components/courses/quick-enroll/quick-enroll-dialog';
import { resolveStorefrontLoginHref } from '@/lib/api/notify-api-error';
import { useTranslation } from '@/lib/i18n/hooks';

/** Opens the quick sign-in dialog; after sign-in the page reloads at `next` (default: here). */
type RequireLogin = (next?: string) => void;

const LoginDialogContext = createContext<RequireLogin | null>(null);

export function useRequireLogin(): RequireLogin {
  const value = useContext(LoginDialogContext);
  if (!value) throw new Error('useRequireLogin must be used inside LoginDialogProvider');
  return value;
}

/** Guests on the course page sign in here instead of leaving for the login page. */
export function LoginDialogProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [next, setNext] = useState<string | null>(null);

  const requireLogin = useCallback<RequireLogin>((target) => {
    setNext(target ?? `${window.location.pathname}${window.location.search}`);
  }, []);

  return (
    <LoginDialogContext.Provider value={requireLogin}>
      {children}
      {next ? (
        <QuickEnrollDialog
          title={t('courses.quickLoginTitle')}
          confirmLabel={t('courses.quickLoginConfirm')}
          loginHref={resolveStorefrontLoginHref(next)}
          onDone={() => window.location.assign(next)}
          onClose={() => setNext(null)}
        />
      ) : null}
    </LoginDialogContext.Provider>
  );
}
