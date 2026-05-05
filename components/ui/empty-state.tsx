import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ title, description, action, className, ...props }: EmptyStateProps) => (
  <div
    className={cn(
      "flex w-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-card",
      className
    )}
    {...props}
  >
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {description ? (
        <p className="mx-auto max-w-md text-sm text-muted opacity-70">
          {description}
        </p>
      ) : null}
    </div>
    {action}
  </div>
);

