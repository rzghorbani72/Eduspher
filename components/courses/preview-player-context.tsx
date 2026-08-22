"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface PreviewMedia {
  lessonId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  /** Body of a free text lesson, shown under the player. */
  content: string | null;
}

interface PreviewPlayerValue {
  /** The lesson currently loaded in the cover player, if any. */
  selected: PreviewMedia | null;
  /** True once the visitor picked a lesson, so the player may autoplay. */
  autoPlay: boolean;
  isPlayable: (lessonId: string) => boolean;
  select: (lessonId: string) => void;
}

const PreviewPlayerContext = createContext<PreviewPlayerValue | null>(null);

/**
 * Shares one player between the cover card and the curriculum list: picking a
 * free lesson swaps the source in place instead of opening another page.
 */
export function PreviewPlayerProvider({
  media,
  defaultLessonId,
  children,
}: {
  media: readonly PreviewMedia[];
  defaultLessonId: string | null;
  children: React.ReactNode;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(defaultLessonId);
  const [autoPlay, setAutoPlay] = useState(false);

  const select = useCallback((lessonId: string) => {
    setSelectedId(lessonId);
    setAutoPlay(true);
  }, []);

  const value = useMemo<PreviewPlayerValue>(() => {
    const byId = new Map(media.map((item) => [item.lessonId, item]));
    return {
      selected: selectedId ? (byId.get(selectedId) ?? null) : null,
      autoPlay,
      isPlayable: (lessonId: string) => byId.has(lessonId),
      select,
    };
  }, [media, selectedId, autoPlay, select]);

  return (
    <PreviewPlayerContext.Provider value={value}>
      {children}
    </PreviewPlayerContext.Provider>
  );
}

/** Null outside the provider, so a curriculum rendered elsewhere still works. */
export function usePreviewPlayer(): PreviewPlayerValue | null {
  return useContext(PreviewPlayerContext);
}
