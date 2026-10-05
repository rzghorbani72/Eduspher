'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, Trash2, ImageIcon } from 'lucide-react';

import { AccountSection } from '@/components/account/account-section';
import { Button } from '@/components/ui/button';
import { ImageCropDialog } from '@/components/ui/image-crop-dialog';
import { useImageCrop } from '@/hooks/use-image-crop';
import { CROP_PRESETS } from '@/lib/image-crop';
import { updateProfile, uploadImage } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/hooks';
import { logger } from '@/lib/logging/app-logger';
import { resolveAssetUrl } from '@/lib/utils';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];

interface ProfileAvatarCardProps {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
}

export function ProfileAvatarCard({ profileId, displayName, avatarUrl }: ProfileAvatarCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => resolveAssetUrl(avatarUrl));
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setPreviewUrl(resolveAssetUrl(avatarUrl));
    setLoadFailed(false);
  }, [avatarUrl]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const showImage = Boolean(previewUrl) && !loadFailed;

  async function handleFile(file: File) {
    setError(null);
    setMessage(null);

    if (!ACCEPTED.includes(file.type)) {
      setError(t('account.avatarWrongType'));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t('account.avatarTooLarge'));
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const localPreview = URL.createObjectURL(file);
    objectUrlRef.current = localPreview;
    setPreviewUrl(localPreview);
    setLoadFailed(false);

    setBusy(true);
    try {
      const image = await uploadImage(file, displayName || 'avatar');
      const updated = await updateProfile(profileId, { image_id: image.id });
      const nextUrl = resolveAssetUrl(updated?.avatar?.url ?? image.publicUrl ?? image.url);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreviewUrl(nextUrl);
      logger.ok('Account', 'AvatarUpdated', { size_bytes: file.size });
      setMessage(t('account.avatarUpdated'));
      router.refresh();
    } catch (err) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreviewUrl(resolveAssetUrl(avatarUrl));
      logger.error('Account', 'AvatarUpdateFailed', { size_bytes: file.size });
      setError(err instanceof Error ? err.message : t('account.avatarUploadFailed'));
    } finally {
      setBusy(false);
    }
  }

  const cropper = useImageCrop(CROP_PRESETS.avatar, (file) => void handleFile(file));

  return (
    <AccountSection
      title={t('account.avatar')}
      description={t('account.avatarDescription')}
      icon={ImageIcon}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-1 text-center">
        {showImage && previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={displayName}
            width={112}
            height={112}
            onError={() => setLoadFailed(true)}
            className="size-28 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-28 items-center justify-center rounded-full bg-(--theme-primary) text-3xl font-bold text-(--theme-on-primary)">
            {initials}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-1">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) cropper.pick(file);
              event.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="text-(--theme-foreground) hover:bg-(--theme-primary)/8 hover:text-(--theme-foreground)"
          >
            {busy ? (
              <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <Camera className="size-3.5 shrink-0" aria-hidden="true" />
            )}
            {busy ? t('account.uploadingAvatar') : t('account.uploadAvatar')}
          </Button>
          {previewUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await updateProfile(profileId, { image_id: '' });
                  if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                    objectUrlRef.current = null;
                  }
                  setPreviewUrl(null);
                  logger.ok('Account', 'AvatarRemoved', {});
                  router.refresh();
                } catch (err) {
                  setError(err instanceof Error ? err.message : t('common.error'));
                } finally {
                  setBusy(false);
                }
              }}
              className="text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
            >
              <Trash2 className="size-3.5 shrink-0" aria-hidden="true" />
              {t('account.removeAvatar')}
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="mt-3 text-center text-sm text-green-600">{message}</p> : null}
      {cropper.dialog ? <ImageCropDialog {...cropper.dialog} /> : null}
    </AccountSection>
  );
}
