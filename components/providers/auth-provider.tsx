"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { identifyAnalytics } from "@/lib/analytics/analytics";
import {
  type BrowserLogContext,
  setLogContext,
} from "@/lib/logging/browser-context";

type AuthContextValue = {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = PropsWithChildren<{
  initialAuthenticated?: boolean;
  logContext?: BrowserLogContext;
}>;

export const AuthProvider = ({
  initialAuthenticated = false,
  logContext,
  children,
}: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);

  const { user_id, academy_id, role } = logContext ?? {};
  useEffect(() => {
    setLogContext({ user_id, academy_id, role });
    identifyAnalytics({ user_id, academy_id, role });
  }, [user_id, academy_id, role]);

  const setAuthenticated = useCallback((value: boolean) => {
    setIsAuthenticated(value);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      setAuthenticated,
    }),
    [isAuthenticated, setAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

