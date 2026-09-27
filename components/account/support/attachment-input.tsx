'use client';

import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { uploadSupportAttachment } from '@/lib/api/client';
import { ImageLightbox } from '@/components/shared/image-lightbox';

const ACCEPT = 'image/png,image/jpeg,image/webp';

interface Props {
  imageIds: string[];
  onChange: (ids: string[]) => void;
  upload?: (file: File) => Promise<{ id: string }>;
  max?: number;
  hint?: string;
}

interface Preview {
  id: string;
  url: string;
}

export function AttachmentInput({
  imageIds,
  onChange,
  upload = uploadSupportAttachment,
  max = 5,
  hint,
}: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    if (imageIds.length >= max) {
      setError(t('support.attachmentTooMany'));
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const result = await upload(file);
      onChange([...imageIds, result.id]);
      setPreviews((p) => [...p, { id: result.id, url: URL.createObjectURL(file) }]);
    } catch {
      setError(t('support.onlyImages'));
    } finally {
      setUploading(false);
    }
  };

  const remove = (id: string) => {
    onChange(imageIds.filter((x) => x !== id));
    setPreviews((p) => p.filter((x) => x.id !== id));
  };

  // Parent may clear its ids after sending; drop previews it no longer holds.
  const visible = previews.filter((p) => imageIds.includes(p.id));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {visible.map((p, index) => (
          <div
            key={p.id}
            className="relative size-16 overflow-hidden rounded-xl bg-(--theme-primary)/5"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={t('learning.imagePreview')}
              className="size-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="size-full object-cover" />
            </button>
            <button
              type="button"
              aria-label={t('support.cancel')}
              onClick={() => remove(p.id)}
              className="absolute end-1 top-1 rounded-full bg-black/55 p-0.5 text-white"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        {imageIds.length < max ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-muted flex size-16 items-center justify-center rounded-xl border border-dashed border-(--theme-foreground)/15 bg-(--theme-background)/50 transition-colors hover:border-(--theme-primary)/40 hover:bg-(--theme-primary)/5 hover:text-(--theme-primary-ink) disabled:opacity-50"
          >
            <ImagePlus className="size-5" />
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={pick}
          aria-label={t('support.addImage')}
        />
      </div>
      <p className="text-muted text-xs">{hint ?? t('support.onlyImages')}</p>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <ImageLightbox
        urls={visible.map((p) => p.url)}
        index={openIndex}
        onIndexChange={setOpenIndex}
      />
    </div>
  );
}
