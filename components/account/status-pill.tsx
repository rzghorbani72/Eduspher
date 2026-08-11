import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  neutral: "bg-surface text-muted",
};

/** One status chip shared by assignments, payments, subscriptions and tutoring. */
export function StatusPill({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONE_CLASS[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

/** Maps the backend status vocabulary onto a chip tone. */
export const toneForStatus = (status: string): Tone => {
  switch (status.toUpperCase()) {
    case "PAID":
    case "ACTIVE":
    case "GRADED":
    case "COMPLETED":
      return "success";
    case "PENDING":
    case "SUBMITTED":
      return "warning";
    case "FAILED":
    case "CANCELLED":
    case "REJECTED":
    case "EXPIRED":
      return "danger";
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "info";
    default:
      return "neutral";
  }
};
