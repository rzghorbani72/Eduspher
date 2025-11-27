"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { School, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSchool } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface EditSchoolNameFormProps {
  currentSchoolName: string;
  onSuccess?: () => void;
}

export const EditSchoolNameForm = ({ 
  currentSchoolName,
  onSuccess 
}: EditSchoolNameFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState(currentSchoolName);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolName.trim()) {
      setError("School name is required");
      return;
    }

    if (schoolName.trim().length < 1 || schoolName.trim().length > 80) {
      setError("School name must be between 1 and 80 characters");
      return;
    }

    if (schoolName.trim() === currentSchoolName) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await updateSchool({ name: schoolName.trim() });
      setMessage("School name updated successfully");
      setIsEditing(false);
      onSuccess?.();
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update school name";
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
              <p className="text-sm font-medium text-slate-900 dark:text-white">School Name</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{currentSchoolName}</p>
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
        <Label htmlFor="school_name">School Name</Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <School className="h-5 w-5 text-slate-400" />
          </div>
          <Input
            id="school_name"
            type="text"
            value={schoolName}
            onChange={(e) => {
              setSchoolName(e.target.value);
              setError(null);
            }}
            className={cn("pl-10", error && "border-amber-500 focus:border-amber-500")}
            placeholder="Enter school name"
            maxLength={80}
            autoFocus
          />
        </div>
        {error && (
          <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          School name must be unique across all schools
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
            setSchoolName(currentSchoolName);
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
          disabled={isLoading || !schoolName.trim() || schoolName.trim() === currentSchoolName}
          className="flex-1"
          loading={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

