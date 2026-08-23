"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getProgress,
  recordVideoHeartbeat,
  saveProgress,
  type LearningProgress,
  type ProgressStatus,
} from "@/lib/api/learning";
import { useQueryClient } from "@tanstack/react-query";

import { useApiQuery } from "@/hooks/use-api-query";
import { queryKeys } from "@/lib/query/keys";

const HEARTBEAT_SECONDS = 15;

/**
 * Progress belongs to an enrollment. A free lesson opened by someone who has not
 * enrolled has nowhere to record it, so the hook stays inert instead of firing
 * requests that can only 400.
 */
export function useLessonProgress(
  enrollmentId: string | null,
  lessonId: string,
  options?: { useVideoHeartbeat?: boolean },
) {
  const useVideoHeartbeat = options?.useVideoHeartbeat ?? false;
  const queryClient = useQueryClient();
  const progressKey = queryKeys.lessonProgress(enrollmentId ?? "none", lessonId);

  const { data } = useApiQuery({
    queryKey: progressKey,
    enabled: Boolean(enrollmentId),
    queryFn: async (signal) => {
      if (!enrollmentId) return null;
      const result = await getProgress(
        { enrollmentId, lessonId, limit: 1 },
        { signal },
      );
      return result.progress[0] ?? null;
    },
  });
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const lastSavedPosition = useRef(0);
  const currentPosition = useRef(0);
  const lastHeartbeatAt = useRef(0);
  const pendingSave = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const position = data?.last_position || data?.watch_time || 0;
    lastSavedPosition.current = position;
    currentPosition.current = position;
    lastHeartbeatAt.current = position;
  }, [data]);

  const awaitPending = useCallback(async () => {
    if (!pendingSave.current) return;
    try {
      await pendingSave.current;
    } catch {
      // The next heartbeat retries after a failed save.
    }
  }, []);

  const persistStatus = useCallback(
    async (status: ProgressStatus, position: number) => {
      if (!enrollmentId) return false;
      await awaitPending();
      setSaving(true);
      setSaveFailed(false);
      const request = (async () => {
        const progress = await saveProgress({
          enrollmentId,
          lessonId,
          status,
          watchTime: position,
        });
        lastSavedPosition.current = position;
        queryClient.setQueryData(progressKey, progress);
      })();
      pendingSave.current = request;
      try {
        await request;
        return true;
      } catch {
        setSaveFailed(true);
        return false;
      } finally {
        if (pendingSave.current === request) pendingSave.current = null;
        setSaving(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [awaitPending, enrollmentId, lessonId, queryClient],
  );

  const persistVideoHeartbeat = useCallback(
    async (position: number, activeSeconds: number, segmentStart: number) => {
      if (!enrollmentId) return false;
      await awaitPending();
      setSaving(true);
      setSaveFailed(false);
      const request = (async () => {
        await recordVideoHeartbeat({
          lessonId,
          enrollmentId,
          lastPosition: position,
          activeSeconds,
          segmentStart,
          segmentEnd: position,
        });
        lastSavedPosition.current = position;
        lastHeartbeatAt.current = position;
        queryClient.setQueryData<LearningProgress | null>(
          progressKey,
          (current) =>
            current
              ? {
                  ...current,
                  last_position: position,
                  watch_time: (current.watch_time ?? 0) + activeSeconds,
                  status:
                    current.status === "COMPLETED"
                      ? "COMPLETED"
                      : "IN_PROGRESS",
                }
              : current,
        );
      })();
      pendingSave.current = request;
      try {
        await request;
        return true;
      } catch {
        setSaveFailed(true);
        return false;
      } finally {
        if (pendingSave.current === request) pendingSave.current = null;
        setSaving(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [awaitPending, enrollmentId, lessonId, queryClient],
  );

  const heartbeat = useCallback(
    (position: number) => {
      currentPosition.current = position;
      const delta = position - lastHeartbeatAt.current;
      if (delta < HEARTBEAT_SECONDS) return;

      if (useVideoHeartbeat) {
        const segmentStart = lastHeartbeatAt.current;
        lastHeartbeatAt.current = position;
        void persistVideoHeartbeat(
          position,
          Math.min(120, Math.max(1, Math.floor(delta))),
          Math.floor(segmentStart),
        );
        return;
      }

      lastSavedPosition.current = position;
      void persistStatus("IN_PROGRESS", position);
    },
    [persistStatus, persistVideoHeartbeat, useVideoHeartbeat],
  );

  useEffect(() => {
    const flush = () => {
      const position = currentPosition.current;
      const delta = position - lastHeartbeatAt.current;
      if (delta <= 0) return;
      if (useVideoHeartbeat) {
        void persistVideoHeartbeat(
          position,
          Math.min(120, Math.max(1, Math.floor(delta))),
          Math.floor(lastHeartbeatAt.current),
        );
        return;
      }
      void persistStatus("IN_PROGRESS", position);
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [persistStatus, persistVideoHeartbeat, useVideoHeartbeat]);

  return {
    progress: data as LearningProgress | null | undefined,
    initialPosition: data?.last_position || data?.watch_time || 0,
    saving,
    saveFailed,
    heartbeat,
    complete: () => persistStatus("COMPLETED", currentPosition.current),
  };
}
