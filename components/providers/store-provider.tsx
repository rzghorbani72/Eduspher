"use client";

import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import {
  buildAcademyPathFromSlug,
  slugFromPathname,
} from "@/lib/academy-path";

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

  useEffect(() => {
    setStore(initialValue);
  }, [initialValue.id, initialValue.slug, initialValue.name]);

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
  const pathname = usePathname();
  const pathSlug = slugFromPathname(pathname);
  const effectiveSlug = slug ?? pathSlug;

  return (path: string) => buildAcademyPathFromSlug(effectiveSlug, path);
};
