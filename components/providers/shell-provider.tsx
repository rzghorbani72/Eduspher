"use client";

import { createContext, useContext, type PropsWithChildren } from "react";

type ShellContextValue = {
  isPanelRoot: boolean;
  headerDisplayName: string | null;
  headerIsAuthenticated: boolean;
  requestHost: string | null;
};

const ShellContext = createContext<ShellContextValue | undefined>(undefined);

type ShellProviderProps = PropsWithChildren<ShellContextValue>;

export function ShellProvider({
  isPanelRoot,
  headerDisplayName,
  headerIsAuthenticated,
  requestHost,
  children,
}: ShellProviderProps) {
  return (
    <ShellContext.Provider
      value={{ isPanelRoot, headerDisplayName, headerIsAuthenticated, requestHost }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error("useShell must be used within a ShellProvider");
  }
  return context;
}
