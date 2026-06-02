import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState = ({ title, description, action, icon, className, style, ...props }: EmptyStateProps) => (
  <div
    className={cn(
      "flex w-full flex-col items-center justify-center gap-5 rounded-3xl border border-dashed px-8 py-20 text-center",
      className
    )}
    style={{
      borderColor: 'var(--theme-border-strong)',
      backgroundColor: 'var(--theme-surface)',
      ...style,
    }}
    {...props}
  >
    {icon ? (
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, var(--theme-background))',
          color: 'var(--theme-primary)',
        }}
      >
        {icon}
      </div>
    ) : null}
    <div className="space-y-2">
      <h3 className="text-xl font-semibold" style={{ color: 'var(--theme-foreground)' }}>{title}</h3>
      {description ? (
        <p className="mx-auto max-w-md text-sm opacity-60" style={{ color: 'var(--theme-muted)' }}>
          {description}
        </p>
      ) : null}
    </div>
    {action}
  </div>
);

