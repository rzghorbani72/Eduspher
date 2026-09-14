'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePassword } from '@/lib/api/client';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn } from '@/lib/utils';

type Translate = (key: string) => string;

/** Built per render so the validation messages follow the active language. */
const buildSchema = (t: Translate) =>
  z
    .object({
      current_password: z.string().min(6, t('auth.passwordMinLength')),
      new_password: z.string().min(6, t('auth.passwordMinLength')),
      confirm_new_password: z.string().min(6, t('auth.passwordMinLength')),
    })
    .refine((data) => data.new_password === data.confirm_new_password, {
      message: t('account.passwordsDoNotMatch'),
      path: ['confirm_new_password'],
    });

type ChangePasswordFormValues = z.infer<ReturnType<typeof buildSchema>>;

interface ChangePasswordFormProps {
  profileId: string;
  onSuccess?: () => void;
}

export const ChangePasswordForm = ({ profileId, onSuccess }: ChangePasswordFormProps) => {
  const { t } = useTranslation();
  const schema = useMemo(() => buildSchema(t), [t]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await changePassword({
        profile_id: profileId,
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_new_password: data.confirm_new_password,
      });

      setMessage(t('account.passwordChanged'));
      reset();
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('account.passwordChangeFailed');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current_password">{t('account.currentPassword')}</Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <Lock className="text-muted h-5 w-5" />
          </div>
          <Input
            id="current_password"
            type={showCurrentPassword ? 'text' : 'password'}
            {...register('current_password')}
            className={cn(
              'ps-10 pe-10',
              errors.current_password && 'border-amber-500 focus:border-amber-500',
            )}
            autoComplete="current-password"
            placeholder={t('account.currentPasswordPlaceholder')}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="text-muted hover:text-foreground absolute inset-y-0 end-0 flex items-center pe-3 transition-colors"
          >
            {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.current_password && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {errors.current_password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="new_password">{t('account.newPassword')}</Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <Lock className="text-muted h-5 w-5" />
          </div>
          <Input
            id="new_password"
            type={showNewPassword ? 'text' : 'password'}
            {...register('new_password')}
            className={cn(
              'ps-10 pe-10',
              errors.new_password && 'border-amber-500 focus:border-amber-500',
            )}
            autoComplete="new-password"
            placeholder={t('account.newPasswordPlaceholder')}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="text-muted hover:text-foreground absolute inset-y-0 end-0 flex items-center pe-3 transition-colors"
          >
            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.new_password && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {errors.new_password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_new_password">{t('account.confirmNewPassword')}</Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <Lock className="text-muted h-5 w-5" />
          </div>
          <Input
            id="confirm_new_password"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirm_new_password')}
            className={cn(
              'ps-10 pe-10',
              errors.confirm_new_password && 'border-amber-500 focus:border-amber-500',
            )}
            autoComplete="new-password"
            placeholder={t('account.confirmPasswordPlaceholder')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-muted hover:text-foreground absolute inset-y-0 end-0 flex items-center pe-3 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.confirm_new_password && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {errors.confirm_new_password.message}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
          {error}
        </div>
      )}

      {message && !error && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/70 dark:text-green-300">
          {message}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full" loading={isLoading}>
        {isLoading ? t('account.changingPassword') : t('account.changePassword')}
      </Button>
    </form>
  );
};
