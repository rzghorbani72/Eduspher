'use client';

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { type BrowserLogContext, setLogContext } from '@/lib/logging/browser-context';

type AuthContextValue = {
  isAuthenticated: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  setAuthenticated: (value: boolean) => void;
  setHeaderUser: (user: { displayName?: string | null; avatarUrl?: string | null }) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = PropsWithChildren<{
  initialAuthenticated?: boolean;
  initialDisplayName?: string | null;
  initialAvatarUrl?: string | null;
  logContext?: BrowserLogContext;
}>;

export const AuthProvider = ({
  initialAuthenticated = false,
  initialDisplayName = null,
  initialAvatarUrl = null,
  logContext,
  children,
}: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [displayName, setDisplayName] = useState<string | null>(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);

  // Layout re-renders on hard nav / router.refresh with fresh SSR props; keep
  // client state in sync so the header does not stay stuck on "Login".
  useEffect(() => {
    setIsAuthenticated(initialAuthenticated);
  }, [initialAuthenticated]);

  useEffect(() => {
    setDisplayName(initialDisplayName);
    setAvatarUrl(initialAvatarUrl);
  }, [initialDisplayName, initialAvatarUrl]);

  const { user_id, academy_id, role } = logContext ?? {};
  useEffect(() => {
    setLogContext({ user_id, academy_id, role });
  }, [user_id, academy_id, role]);

  const setAuthenticated = useCallback((value: boolean) => {
    setIsAuthenticated(value);
    if (!value) {
      setDisplayName(null);
      setAvatarUrl(null);
    }
  }, []);

  const setHeaderUser = useCallback(
    (user: { displayName?: string | null; avatarUrl?: string | null }) => {
      if (user.displayName !== undefined) setDisplayName(user.displayName);
      if (user.avatarUrl !== undefined) setAvatarUrl(user.avatarUrl);
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      displayName,
      avatarUrl,
      setAuthenticated,
      setHeaderUser,
    }),
    [isAuthenticated, displayName, avatarUrl, setAuthenticated, setHeaderUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
