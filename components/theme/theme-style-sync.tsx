'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { applyThemeCssVariables, type ThemeConfigInput } from '@/lib/theme-apply';

type ThemeStyleSyncProps = {
  theme: ThemeConfigInput | null;
  syncKey: string;
};

export function ThemeStyleSync({ theme, syncKey }: ThemeStyleSyncProps) {
  const pathname = usePathname();

  useEffect(() => {
    applyThemeCssVariables(theme);
  }, [theme, syncKey, pathname]);

  return null;
}
