/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      "group relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950",
      className
    )}
    {...props}
  />
);

export const CardContent = ({ className, ...props }: CardProps) => (
  <div className={cn("space-y-4 p-7", className)} {...props} />
);

export const CardMedia = ({
  className,
  alt = "",
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <div className="relative aspect-[3/2] overflow-hidden">
    <img
      className={cn(
        "h-full w-full object-cover transition duration-500 group-hover:scale-105",
        className
      )}
      alt={alt}
      {...props}
    />
    <div className="pointer-events-none absolute inset-0 bg-slate-900/10 opacity-0 transition group-hover:opacity-100 dark:bg-slate-950/20" />
  </div>
);

