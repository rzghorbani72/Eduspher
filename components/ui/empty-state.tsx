import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ title, description, action, className, style, ...props }: EmptyStateProps) => (
  <div
    className={cn(
      "flex w-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed",
      className
    )}
    style={{
      borderColor: 'var(--theme-border-strong)',
      backgroundColor: 'var(--theme-surface)',
      ...style,
    }}
    {...props}
  >
    <div className="space-y-2">
      <h3 className="text-xl font-semibold" style={{ color: 'var(--theme-foreground)' }}>{title}</h3>
      {description ? (
        <p className="mx-auto max-w-md text-sm text-muted opacity-70">
          {description}
        </p>
      ) : null}
    </div>
    {action}
  </div>
);

