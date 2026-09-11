import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  success: "bg-white text-green-700 dark:text-green-400",
  warning: "bg-white text-amber-700 dark:text-amber-400",
  danger: "bg-white text-red-700 dark:text-red-400",
  info: "bg-white text-blue-700 dark:text-blue-400",
  neutral: "bg-white text-muted",
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
