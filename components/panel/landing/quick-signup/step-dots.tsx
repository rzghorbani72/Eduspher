import { cn } from '@/lib/utils';

import { LANDING } from '../landing.messages';
import type { QuickSignupStep } from './use-quick-signup';

const ORDER: QuickSignupStep[] = ['identity', 'phone', 'otp'];

export function StepDots({ step }: { step: QuickSignupStep }) {
  const current = ORDER.indexOf(step);

  return (
    <ol className="mt-5 flex items-center justify-center gap-2">
      {LANDING.quickSignup.steps.map((label, index) => (
        <li key={label} className="flex items-center gap-2">
          <span
            aria-current={index === current ? 'step' : undefined}
            className={cn(
              'text-[12px] font-semibold transition-colors',
              index === current ? 'text-lp-ink' : 'text-lp-muted/60',
            )}
          >
            {label}
          </span>
          {index < LANDING.quickSignup.steps.length - 1 && (
            <span className="bg-lp-line-2 h-px w-4" aria-hidden />
          )}
        </li>
      ))}
    </ol>
  );
}
