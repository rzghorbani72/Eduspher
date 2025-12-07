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

type StoreContextValue = {
  id: number | null;
  slug: string | null;
  name: string;
  setStore: Dispatch<SetStateAction<StoreContextValue>>;
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

type StoreProviderProps = PropsWithChildren<{
  initialValue: Omit<StoreContextValue, "setStore">;
}>;

export const StoreProvider = ({ initialValue, children }: StoreProviderProps) => {
  const [store, setStore] = useState<Omit<StoreContextValue, "setStore">>(initialValue);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...store,
      setStore,
    }),
    [store]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return context;
};

export const useStorePath = () => {
  const { slug } = useStoreContext();
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
