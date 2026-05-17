"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  applyThemeCssVariables,
  type ThemeConfigInput,
} from "@/lib/theme-apply";

type ThemeStyleSyncProps = {
  theme: ThemeConfigInput | null;
  syncKey: string;
};

export function ThemeStyleSync({ theme, syncKey }: ThemeStyleSyncProps) {
  const pathname = usePathname();

  useEffect(() => {
    applyThemeCssVariables(theme);
  }, [theme, syncKey, pathname]);

  useEffect(() => {
    if (theme?.dark_mode !== null && theme?.dark_mode !== undefined) return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyThemeCssVariables(theme);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, syncKey, pathname]);

  return null;
}
