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
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-border bg-muted/30 text-muted-foreground",
      )}
    >
      {message}
    </div>
  );
}
