'use client';

import { useEffect, useRef } from 'react';

import { getClientBackendApiBaseUrl } from '@/lib/env';
import { useTranslation } from '@/lib/i18n/hooks';
import { toPlayableMediaUrl } from '@/components/media/playable-media-url';

interface AudioLessonProps {
  title: string;
  audioId?: string | null;
  initialPosition: number;
  onHeartbeat: (position: number, duration?: number) => void;
}

export function AudioLesson({ title, audioId, initialPosition, onHeartbeat }: AudioLessonProps) {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || initialPosition <= 0) return;
    const resume = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        audio.currentTime = initialPosition;
        return;
      }
      if (initialPosition >= audio.duration - 1) {
        audio.currentTime = 0;
        return;
      }
      audio.currentTime = Math.min(initialPosition, audio.duration - 1);
    };
    if (audio.readyState >= 1) resume();
    else audio.addEventListener('loadedmetadata', resume, { once: true });
    return () => audio.removeEventListener('loadedmetadata', resume);
  }, [initialPosition]);

  if (!audioId) {
    return (
      <div className="border-theme bg-surface flex min-h-[120px] w-full flex-col justify-center gap-2 rounded-[10px] border border-dashed px-8 text-center">
        <p className="text-base font-extrabold">{t('learning.audioUnavailable')}</p>
      </div>
    );
  }

  const src = toPlayableMediaUrl(`${getClientBackendApiBaseUrl()}/audios/stream/${audioId}`);

  return (
    <div className="border-theme bg-card rounded-[10px] border p-5">
      <p className="mb-3 text-sm font-extrabold text-(--theme-foreground)">{title}</p>
      <audio
        ref={audioRef}
        src={src}
        controls
        controlsList="nodownload noremoteplayback"
        preload="metadata"
        onContextMenu={(event) => event.preventDefault()}
        onTimeUpdate={(event) => {
          if (event.currentTarget.paused) return;
          const duration = event.currentTarget.duration;
          onHeartbeat(
            event.currentTarget.currentTime,
            Number.isFinite(duration) ? duration : undefined,
          );
        }}
        className="w-full"
      />
    </div>
  );
}
