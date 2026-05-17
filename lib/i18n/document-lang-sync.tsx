"use client";

import { useEffect } from "react";

import { useI18n } from "./provider";

export function DocumentLangSync() {
  const { language, direction } = useI18n();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  return null;
}
