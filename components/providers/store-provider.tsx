"use client";

import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

type StoreState = {
  id: number | null;
  slug: string | null;
  name: string;
};

type AcademyContextValue = StoreState & {
  setStore: Dispatch<SetStateAction<StoreState>>;
};

const TenantAcademyContext = createContext<AcademyContextValue | undefined>(undefined);

type StoreProviderProps = PropsWithChildren<{
  initialValue: StoreState;
}>;

export const StoreProvider = ({ initialValue, children }: StoreProviderProps) => {
  const [store, setStore] = useState<StoreState>(initialValue);

  const value = useMemo<AcademyContextValue>(
    () => ({
      ...store,
      setStore,
    }),
    [store],
  );

  return <TenantAcademyContext.Provider value={value}>{children}</TenantAcademyContext.Provider>;
};

export const useAcademyContext = () => {
  const context = useContext(TenantAcademyContext);
  if (!context) {
    throw new Error("useAcademyContext must be used within a StoreProvider");
  }
  return context;
};

export const useStorePath = () => {
  const { slug } = useAcademyContext();
  return (path: string) => {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    if (!slug) {
      return normalized === "//" ? "/" : normalized;
    }
    if (normalized === "/") {
      return `/${slug}`;
    }
    return `/${slug}${normalized}`;
  };
};
