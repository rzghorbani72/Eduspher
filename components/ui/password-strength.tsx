'use client';

import { Check, Circle, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';
import { getPasswordChecks, type PasswordChecks } from '@/lib/password-utils';

interface PasswordStrengthProps {
  password: string;
}

/** The same four rules the panel shows, so one password reads the same in both apps. */
export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation();
  const checks = getPasswordChecks(password);
  const untouched = password === '';
  const items: { key: keyof PasswordChecks; label: string }[] = [
    { key: 'minLength', label: t('auth.passwordMinLength') },
    { key: 'hasLetter', label: t('auth.passwordHasLetter') },
    { key: 'hasNumber', label: t('auth.passwordHasNumber') },
    { key: 'hasSymbol', label: t('auth.passwordHasSymbol') },
  ];

  return (
    <div className="auth-password-checks">
      {items.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-1 text-[11px]">
          <span className="grid h-3 w-3 shrink-0 place-items-center">
            {untouched ? (
              <Circle className="text-muted-foreground/60 h-2 w-2" />
            ) : checks[key] ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <X className="text-destructive h-3 w-3" />
            )}
          </span>
          <span
            className={!untouched && checks[key] ? 'text-emerald-600' : 'text-muted-foreground'}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
