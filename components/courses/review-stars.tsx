'use client';

import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

type ReviewStarsProps = {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE_CLASS = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
} as const;

export function ReviewStars({ rating, size = 'sm', className }: ReviewStarsProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-hidden>
      {STAR_VALUES.map((value) => (
        <Star
          key={value}
          className={cn(
            SIZE_CLASS[size],
            value <= rating ? 'cd-star-fill' : 'text-(--theme-border-strong)',
          )}
        />
      ))}
    </div>
  );
}

type ReviewStarPickerProps = {
  rating: number;
  hover: number;
  onChange: (value: number) => void;
  onHover: (value: number) => void;
  labelFor: (value: number) => string;
};

export function ReviewStarPicker({
  rating,
  hover,
  onChange,
  onHover,
  labelFor,
}: ReviewStarPickerProps) {
  const shown = hover || rating;

  return (
    <div className="flex items-center gap-1" role="radiogroup">
      {STAR_VALUES.map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={rating === value}
          aria-label={labelFor(value)}
          onClick={() => onChange(value)}
          onMouseEnter={() => onHover(value)}
          onMouseLeave={() => onHover(0)}
          onFocus={() => onHover(value)}
          onBlur={() => onHover(0)}
          className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--theme-primary)"
        >
          <Star
            className={cn(
              'h-7 w-7 transition-colors',
              value <= shown ? 'cd-star-fill' : 'text-(--theme-border-strong)',
            )}
          />
        </button>
      ))}
    </div>
  );
}
