'use client';

import { AppImage } from '@/components/ui/app-image';

/**
 * HLS attaches a MediaSource before the first frame exists, which clears the
 * native `poster` and leaves a black box. Keep the cover painted until play.
 */
export function VideoPreparingPoster({ src }: { src: string }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <AppImage src={src} alt="" preset="cover" fill priority className="object-cover" />
    </div>
  );
}
