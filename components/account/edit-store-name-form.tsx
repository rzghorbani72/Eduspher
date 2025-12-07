"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { School, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStore } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface EditStoreNameFormProps {
  currentStoreName: string;
  onSuccess?: () => void;
}

export const EditStoreNameForm = ({ 
  currentStoreName,
  onSuccess 
}: EditStoreNameFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [storeName, setStoreName] = useState(currentStoreName);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeName.trim()) {
      setError("Store name is required");
      return;
    }

    if (storeName.trim().length < 1 || storeName.trim().length > 80) {
      setError("Store name must be between 1 and 80 characters");
      return;
    }

    if (storeName.trim() === currentStoreName) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await updateStore({ name: storeName.trim() });
      setMessage("Store name updated successfully");
      setIsEditing(false);
      onSuccess?.();
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update store name";
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <School className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Store Name</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{currentStoreName}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="store_name">Store Name</Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <School className="h-5 w-5 text-slate-400" />
          </div>
          <Input
            id="store_name"
            type="text"
            value={storeName}
            onChange={(e) => {
              setStoreName(e.target.value);
              setError(null);
            }}
            className={cn("pl-10", error && "border-amber-500 focus:border-amber-500")}
            placeholder="Enter store name"
            maxLength={80}
            autoFocus
          />
        </div>
        {error && (
          <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Store name must be unique across all stores
        </p>
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
            setStoreName(currentStoreName);
            setError(null);
            setMessage(null);
          }}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !storeName.trim() || storeName.trim() === currentStoreName}
          className="flex-1"
          loading={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};
