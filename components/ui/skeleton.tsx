import { cn } from "@/lib/utils";
 
type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;
 
export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    className={cn(
      "animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800/60",
      className
    )}
    {...props}
  />
);

