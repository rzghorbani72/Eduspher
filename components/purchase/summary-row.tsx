import { cn } from '@/lib/utils';

/** One label/amount line in the checkout summary. */
export function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'positive';
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span
        className={cn(
          'cd-price font-medium',
          tone === 'positive' ? 'text-emerald-600' : 'text-(--theme-foreground)',
        )}
      >
        {value}
      </span>
    </div>
  );
}
