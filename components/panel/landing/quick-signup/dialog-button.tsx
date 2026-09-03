import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  pendingLabel?: string;
  pending?: boolean;
  onClick: () => void;
  variant?: "primary" | "ghost";
  type?: "button" | "submit";
};

/** The one button shape every step of the signup dialog uses. */
export function DialogButton({
  label,
  pendingLabel,
  pending = false,
  onClick,
  variant = "primary",
  type = "button",
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={pending}
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 rounded-lp text-[15px] font-bold transition-transform disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary"
          ? "bg-lp-mint text-lp-ink shadow-lp-mint hover:-translate-y-0.5"
          : "border border-lp-line-2 bg-white text-lp-ink hover:border-lp-ink/25",
      )}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending && pendingLabel ? pendingLabel : label}
    </button>
  );
}
