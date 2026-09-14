import { cn } from '@/lib/utils';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  /**
   * Drops the dashed frame and shortens the padding. Use it when the empty
   * state already sits inside a bordered panel, so the two frames do not stack.
   */
  compact?: boolean;
}

export const EmptyState = ({
  title,
  description,
  action,
  icon,
  compact = false,
  className,
  style,
  ...props
}: EmptyStateProps) => (
  <div
    className={cn(
      'flex w-full flex-col items-center justify-center gap-4 rounded-3xl px-8 text-center',
      compact ? 'py-10' : 'border border-dashed py-16',
      className,
    )}
    style={{
      ...(compact
        ? {}
        : {
            borderColor: 'var(--theme-border-strong)',
            backgroundColor: 'var(--theme-surface)',
          }),
      ...style,
    }}
    {...props}
  >
    {icon ? (
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--theme-primary) 14%, var(--theme-background))',
          color: 'var(--theme-primary-ink)',
        }}
      >
        {icon}
      </div>
    ) : null}
    <div className="space-y-1.5">
      <h3
        className={cn('font-semibold', compact ? 'text-base' : 'text-xl')}
        style={{ color: 'var(--theme-foreground)' }}
      >
        {title}
      </h3>
      {description ? (
        <p className="mx-auto max-w-md text-sm" style={{ color: 'var(--theme-muted)' }}>
          {description}
        </p>
      ) : null}
    </div>
    {action}
  </div>
);
