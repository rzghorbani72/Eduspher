'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cropImageFile, type CropPreset } from '@/lib/image-crop';
import { useTranslation } from '@/lib/i18n/hooks';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

export interface ImageCropDialogProps {
  file: File | null;
  preset: CropPreset;
  onCancel: () => void;
  onCropped: (file: File) => void;
}

const MAX_ZOOM = 3;

export function ImageCropDialog({ file, preset, onCancel, onCropped }: ImageCropDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={file !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent closeLabel={t('common.close')} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('account.cropTitle')}</DialogTitle>
          <DialogDescription>{t('account.cropHint')}</DialogDescription>
        </DialogHeader>
        {file ? (
          <CropBody file={file} preset={preset} onCancel={onCancel} onCropped={onCropped} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CropBody({ file, preset, onCancel, onCropped }: ImageCropDialogProps & { file: File }) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const areaRef = useRef<Area | null>(null);
  const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => () => URL.revokeObjectURL(imageUrl), [imageUrl]);

  async function handleConfirm() {
    if (!areaRef.current) return;
    setSaving(true);
    setFailed(false);
    try {
      onCropped(await cropImageFile(file, areaRef.current, preset.maxWidth));
    } catch (error) {
      logger.error('Account', 'AvatarCropFailed', errorFields(error));
      setFailed(true);
      setSaving(false);
    }
  }

  return (
    <>
      {/* The cropper math assumes LTR; RTL would mirror the drag direction. */}
      <div
        dir="ltr"
        className="relative h-72 w-full overflow-hidden rounded-xl bg-black/80 sm:h-80"
      >
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          maxZoom={MAX_ZOOM}
          aspect={preset.aspect}
          cropShape={preset.shape}
          showGrid={preset.shape === 'rect'}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_area, pixels) => {
            areaRef.current = pixels;
          }}
        />
      </div>
      <label className="text-muted flex items-center gap-3 text-sm">
        {t('account.cropZoom')}
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.05}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="w-full accent-(--theme-primary)"
        />
      </label>
      {failed ? (
        <p className="text-sm text-red-600" role="alert">
          {t('account.cropFailed')}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          {t('common.cancel')}
        </Button>
        <Button type="button" size="sm" loading={saving} onClick={() => void handleConfirm()}>
          {t('account.cropConfirm')}
        </Button>
      </div>
    </>
  );
}
