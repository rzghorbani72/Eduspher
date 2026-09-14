'use client';

import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { uploadSupportAttachment } from '@/lib/api/client';

const MAX = 5;
const ACCEPT = 'image/png,image/jpeg,image/webp';

interface Props {
  imageIds: string[];
  onChange: (ids: string[]) => void;
}

interface Preview {
  id: string;
  url: string;
}

export function AttachmentInput({ imageIds, onChange }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    if (imageIds.length >= MAX) {
      setError(t('support.attachmentTooMany'));
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const result = await uploadSupportAttachment(file);
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

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {previews.map((p) => (
          <div
            key={p.id}
            className="border-theme relative h-16 w-16 overflow-hidden rounded-lg border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label={t('support.cancel')}
              onClick={() => remove(p.id)}
              className="absolute top-0 right-0 rounded-bl bg-black/60 p-0.5 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {imageIds.length < MAX && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="border-theme text-muted hover:text-primary flex h-16 w-16 items-center justify-center rounded-lg border border-dashed disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={pick}
          aria-label={t('support.addImage')}
        />
      </div>
      <p className="text-muted text-xs">{t('support.onlyImages')}</p>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
