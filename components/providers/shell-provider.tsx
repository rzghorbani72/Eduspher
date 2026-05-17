"use client";

import { createContext, useContext, type PropsWithChildren } from "react";

type ShellContextValue = {
  isPanelRoot: boolean;
  headerDisplayName: string | null;
  headerIsAuthenticated: boolean;
};

const ShellContext = createContext<ShellContextValue | undefined>(undefined);

type ShellProviderProps = PropsWithChildren<ShellContextValue>;

export function ShellProvider({
  isPanelRoot,
  headerDisplayName,
  headerIsAuthenticated,
  children,
}: ShellProviderProps) {
  return (
    <ShellContext.Provider
      value={{ isPanelRoot, headerDisplayName, headerIsAuthenticated }}
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
