'use client';

import { useEffect, useState } from 'react';

import { getJson } from '@/lib/api/client';
import type { WeeklyWindow } from '@/lib/courses/class-request-windows';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

/** The weekly times the course teacher already teaches. Empty for guests or on failure. */
export function useTeacherBusyTimes(courseId: string, enabled: boolean): WeeklyWindow[] {
  const [busy, setBusy] = useState<WeeklyWindow[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const result = await getJson<{ data: WeeklyWindow[] }>(
          `/class-requests/busy?course_id=${encodeURIComponent(courseId)}`,
          { signal: controller.signal },
        );
        setBusy(result.data ?? []);
      } catch (err) {
        if (!controller.signal.aborted) {
          logger.warn('ClassRequest', 'BusyTimesFailed', errorFields(err));
        }
      }
    };
    void load();
    return () => controller.abort();
  }, [courseId, enabled]);

  return busy;
}
