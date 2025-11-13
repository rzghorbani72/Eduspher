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

type SchoolContextValue = {
  id: number | null;
  slug: string | null;
  name: string;
  setSchool: Dispatch<SetStateAction<SchoolContextValue>>;
};

const SchoolContext = createContext<SchoolContextValue | undefined>(undefined);

type SchoolProviderProps = PropsWithChildren<{
  initialValue: Omit<SchoolContextValue, "setSchool">;
}>;

export const SchoolProvider = ({ initialValue, children }: SchoolProviderProps) => {
  const [school, setSchool] = useState<Omit<SchoolContextValue, "setSchool">>(initialValue);

  const value = useMemo<SchoolContextValue>(
    () => ({
      ...school,
      setSchool,
    }),
    [school]
  );

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
};

export const useSchoolContext = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error("useSchoolContext must be used within a SchoolProvider");
  }
  return context;
};

export const useSchoolPath = () => {
  const { slug } = useSchoolContext();
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

