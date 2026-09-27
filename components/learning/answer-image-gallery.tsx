'use client';

import { useState } from 'react';

import { ImageLightbox } from '@/components/shared/image-lightbox';
import { getClientBackendApiBaseUrl } from '@/lib/env';
import { useTranslation } from '@/lib/i18n/hooks';

interface AnswerImageGalleryProps {
  submissionId: string;
  imageIds: readonly string[];
}

/** Private route: the server lets only the student and the course staff see these. */
function answerImageUrl(submissionId: string, imageId: string): string {
  return `${getClientBackendApiBaseUrl()}/assignments/submissions/${encodeURIComponent(submissionId)}/images/${encodeURIComponent(imageId)}`;
}

export function AnswerImageGallery({ submissionId, imageIds }: AnswerImageGalleryProps) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (imageIds.length === 0) return null;
  const urls = imageIds.map((imageId) => answerImageUrl(submissionId, imageId));

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {urls.map((url, index) => (
        <button
          key={url}
          type="button"
          onClick={() => setOpenIndex(index)}
          aria-label={t('learning.imagePreview')}
          className="overflow-hidden rounded-xl"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="size-20 object-cover transition-opacity hover:opacity-80"
          />
        </button>
      ))}
      <ImageLightbox urls={urls} index={openIndex} onIndexChange={setOpenIndex} />
    </div>
  );
}
