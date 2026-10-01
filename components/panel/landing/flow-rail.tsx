import { cn } from '@/lib/utils';

type Props = {
  steps: readonly string[];
  /** Index of the highlighted (mint) chip. */
  active: number;
  className?: string;
};

/** Horizontal "step ← step ← step" chips; scrolls inside itself on phones. */
export function FlowRail({ steps, active, className }: Props) {
  return (
    <div className={cn('lp-rail flex h-10 items-center gap-2.5 overflow-x-auto pb-1', className)}>
      {steps.map((step, index) => (
        <div key={step} className="contents">
          {index > 0 ? <span className="text-lp-faint-3">←</span> : null}
          <span
            className={cn(
              'rounded-xl px-3.5 py-2.5 text-[13.5px] whitespace-nowrap',
              index === active
                ? 'bg-lp-mint-soft text-lp-on-mint font-extrabold'
                : 'border-lp-line text-lp-ink-2 border bg-white font-semibold',
            )}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}
