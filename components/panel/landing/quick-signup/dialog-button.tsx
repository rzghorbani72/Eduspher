import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

type Props = {
  label: string;
  pendingLabel?: string;
  pending?: boolean;
  disabled?: boolean;
  onClick: () => void;
  variant?: 'primary' | 'ghost';
  type?: 'button' | 'submit';
};

/** The one button shape every step of the signup dialog uses. */
export function DialogButton({
  label,
  pendingLabel,
  pending = false,
  disabled = false,
  onClick,
  variant = 'primary',
  type = 'button',
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={pending || disabled}
      className={cn(
        'rounded-lp flex h-12 w-full items-center justify-center gap-2 text-[15px] font-bold transition-transform disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary'
          ? 'bg-lp-mint text-lp-ink shadow-lp-mint enabled:hover:-translate-y-0.5'
          : 'border-lp-line-2 text-lp-ink enabled:hover:border-lp-ink/25 border bg-white',
      )}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending && pendingLabel ? pendingLabel : label}
    </button>
  );
}
