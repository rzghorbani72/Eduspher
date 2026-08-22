"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/api/client";
import { useTranslation } from "@/lib/i18n/hooks";
import { cn } from "@/lib/utils";

interface EditDisplayNameFormProps {
  profileId: string;
  currentDisplayName: string;
  onSuccess?: () => void;
}

export const EditDisplayNameForm = ({
  profileId,
  currentDisplayName,
  onSuccess,
}: EditDisplayNameFormProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      setError(t("account.displayNameRequired"));
      return;
    }

    if (displayName.trim().length < 1 || displayName.trim().length > 255) {
      setError(t("account.displayNameTooLong"));
      return;
    }

    if (displayName.trim() === currentDisplayName) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await updateProfile(profileId, { display_name: displayName.trim() });
      setMessage(t("account.displayNameUpdated"));
      setIsEditing(false);
      onSuccess?.();
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("account.displayNameUpdateFailed");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
              <User className="h-5 w-5 text-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("account.displayName")}
              </p>
              <p className="text-sm text-muted">{currentDisplayName}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8"
          >
            <Edit2 className="me-1 h-4 w-4" />
            {t("common.edit")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="display_name">{t("account.displayName")}</Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <User className="h-5 w-5 text-muted" />
          </div>
          <Input
            id="display_name"
            type="text"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setError(null);
            }}
            className={cn(
              "ps-10",
              error && "border-amber-500 focus:border-amber-500",
            )}
            placeholder={t("account.displayNamePlaceholder")}
            maxLength={255}
            autoFocus
          />
        </div>
        {error && (
          <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>
        )}
      </div>

      {message && !error && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/70 dark:text-green-300">
          {message}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsEditing(false);
            setDisplayName(currentDisplayName);
            setError(null);
            setMessage(null);
          }}
          disabled={isLoading}
          className="flex-1"
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={
            isLoading ||
            !displayName.trim() ||
            displayName.trim() === currentDisplayName
          }
          className="flex-1"
          loading={isLoading}
        >
          {isLoading ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </form>
  );
};
