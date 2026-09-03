"use client";

import { AppImage } from "@/components/ui/app-image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateProfile, uploadImage } from "@/lib/api/client";
import { useTranslation } from "@/lib/i18n/hooks";
import { logger } from "@/lib/logging/app-logger";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

interface ProfileAvatarCardProps {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
}

export function ProfileAvatarCard({
  profileId,
  displayName,
  avatarUrl,
}: ProfileAvatarCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleFile(file: File) {
    setError(null);
    setMessage(null);

    if (!ACCEPTED.includes(file.type)) {
      setError(t("account.avatarWrongType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t("account.avatarTooLarge"));
      return;
    }

    setBusy(true);
    try {
      const image = await uploadImage(file, displayName || "avatar");
      await updateProfile(profileId, { image_id: image.id });
      logger.ok("Account", "AvatarUpdated", { size_bytes: file.size });
      setMessage(t("account.avatarUpdated"));
      router.refresh();
    } catch (err) {
      logger.error("Account", "AvatarUpdateFailed", { size_bytes: file.size });
      setError(err instanceof Error ? err.message : t("account.avatarUploadFailed"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-theme bg-card p-5 shadow-sm">
      <h3 className="mb-1 text-base font-semibold text-(--theme-foreground)">
        {t("account.avatar")}
      </h3>
      <p className="mb-4 text-sm text-muted">{t("account.avatarDescription")}</p>

      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <AppImage
            src={avatarUrl}
            alt={displayName}
            preset="avatar"
            width={80}
            height={80}
            sizes="80px"
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-(--theme-primary) text-2xl font-bold text-(--theme-on-primary)">
            {initials}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              <Loader2 className="me-2 size-4 animate-spin" />
            ) : (
              <Camera className="me-2 size-4" />
            )}
            {busy ? t("account.uploadingAvatar") : t("account.uploadAvatar")}
          </Button>
          {avatarUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await updateProfile(profileId, { image_id: "" });
                  logger.ok("Account", "AvatarRemoved", {});
                  router.refresh();
                } catch (err) {
                  setError(err instanceof Error ? err.message : t("common.error"));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Trash2 className="me-2 size-4" />
              {t("account.removeAvatar")}
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="mt-3 text-sm text-green-600">{message}</p> : null}
    </div>
  );
}
