import { cn } from "@/lib/utils";

/** The empty/'not available' box shared by every lesson type. */
export function Unavailable({
  message,
  tone = "muted",
}: {
  message: string;
  tone?: "muted" | "error";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed p-6 text-center text-sm",
        tone === "error"
          ? "border-red-500/30 bg-red-500/5 text-red-600"
          : "border-theme bg-surface text-muted",
      )}
    >
      {message}
    </div>
  );
}
