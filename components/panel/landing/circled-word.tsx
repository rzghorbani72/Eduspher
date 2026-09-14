import { cn } from '@/lib/utils';

type Props = {
  children: string;
  className?: string;
};

/**
 * Wraps a word in the hand-drawn brand scribble.
 *
 * The SVG is inlined rather than loaded via <img> so it can stretch to whatever
 * the word measures at the current breakpoint — the loop has to hug the text,
 * and a fixed-size raster/img would drift as the type scale changes.
 * `preserveAspectRatio="none"` lets it squash to the word's proportions;
 * `vector-effect` keeps the stroke an even 3px however far it stretches.
 */
export function CircledWord({ children, className }: Props) {
  return (
    <span className={cn('relative isolate inline-block whitespace-nowrap', className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 194 163"
        fill="none"
        preserveAspectRatio="none"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[152%] w-[115%] -translate-x-1/2 -translate-y-1/2"
      >
        <path
          d="M93.8826 146.505C66.3817 152.425 -12.3353 125.76 3.61245 48.5257C23.5472 -48.0174 204.681 22.8246 191.482 93.8387C174.624 184.535 1.38003 184.183 3.61129 86.4725C6.56995 -43.094 167.93 5.47921 186.963 45.1626"
          stroke="#30FFB4"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {children}
    </span>
  );
}
