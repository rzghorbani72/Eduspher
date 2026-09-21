import { cn } from '@/lib/utils';

type Props = {
  items: readonly string[];
  className?: string;
  /** Row padding and type differ slightly between the editor and courses lists. */
  size?: 'md' | 'lg';
};

/** Hairline-separated "✓ item" rows used beside every product mockup. */
export function CheckList({ items, className, size = 'md' }: Props) {
  return (
    <ul className={cn('flex flex-col', className)}>
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            'border-lp-ink/9 flex items-start gap-3 not-last:border-b',
            size === 'lg' ? 'py-3.5 text-[14.5px]' : 'py-3 text-[15px]',
          )}
        >
          <span className="text-lp-blue font-bold">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}
