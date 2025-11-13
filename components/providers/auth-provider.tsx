"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = PropsWithChildren<{
  initialAuthenticated?: boolean;
}>;

export const AuthProvider = ({
  initialAuthenticated = false,
  children,
}: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);

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

