/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      "group relative overflow-hidden rounded-theme border border-slate-200 bg-white shadow-theme transition-all duration-300 hover:-translate-y-1 hover:border-[var(--theme-primary)]/30 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950",
      className
    )}
    data-animation-style="moderate"
    {...props}
  />
);

export const CardContent = ({ className, ...props }: CardProps) => (
  <div className={cn("space-y-3 p-5", className)} {...props} />
);

export const CardMedia = ({
  className,
  alt = "",
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <div className="relative aspect-[3/2] overflow-hidden">
    <img
      className={cn(
        "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
        className
      )}
      alt={alt}
      {...props}
    />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
  </div>
);

