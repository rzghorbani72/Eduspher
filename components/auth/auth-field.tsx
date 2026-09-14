'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AuthFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
}

/**
 * Pill input for the auth pane: the label lives in the placeholder, so the
 * white card never carries a second column of text. Mirrors AdminPanel's
 * AuthField so both apps ask for the same field the same way.
 */
export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, error, type, ...props },
  ref,
) {
  const [show, setShow] = React.useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={isPassword && show ? 'text' : type}
          placeholder={label}
          aria-label={label}
          className={cn('auth-input', isPassword && 'with-toggle', error && 'has-error')}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((v) => !v)}
            aria-label={label}
            className="auth-input-toggle"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error && <p className="auth-field-error">{error}</p>}
    </div>
  );
});
