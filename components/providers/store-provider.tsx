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
import { usePathname } from "next/navigation";

import {
  buildAcademyPathFromSlug,
  slugFromPathname,
} from "@/lib/academy-path";

type StoreState = {
  id: number | null;
  slug: string | null;
  name: string;
  isSubdomain: boolean;
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

  // Re-sync from the server-provided value when the tenant changes, without an
  // effect (React's "adjust state on prop change" pattern).
  const tenantKey = `${initialValue.id}|${initialValue.slug}|${initialValue.name}`;
  const [prevTenantKey, setPrevTenantKey] = useState(tenantKey);
  if (tenantKey !== prevTenantKey) {
    setPrevTenantKey(tenantKey);
    setStore(initialValue);
  }

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
  const { slug, isSubdomain } = useAcademyContext();
  const pathname = usePathname();
  const pathSlug = slugFromPathname(pathname);
  // In subdomain mode the slug lives in the hostname, not the path.
  const effectiveSlug = isSubdomain ? null : (slug ?? pathSlug);

  return (path: string) => buildAcademyPathFromSlug(effectiveSlug, path);
};
