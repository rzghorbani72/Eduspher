'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Monitor,
  Smartphone,
  Globe,
  Trash2,
  LogOut,
  RefreshCw,
  Shield,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getActiveSessions,
  revokeSession,
  logoutAllDevices,
  type ActiveSession,
} from '@/lib/api/client';
import { useLocaleFormat } from '@/hooks/use-locale-digits';
import { useTranslation } from '@/lib/i18n/hooks';
import { cn, formatDate } from '@/lib/utils';

const getDeviceIcon = (deviceInfo: string) => {
  const info = deviceInfo.toLowerCase();
  if (
    info.includes('mobile') ||
    info.includes('phone') ||
    info.includes('android') ||
    info.includes('iphone')
  ) {
    return Smartphone;
  }
  return Monitor;
};

type RelativeTime = { key: string; count: number } | { key: string; count: null };

/** "3 hours ago" as data, so the caller can translate and localise the digits. */
const relativeTime = (dateString: string, now: number): RelativeTime | null => {
  const time = new Date(dateString).getTime();
  if (Number.isNaN(time)) return null;

  const minutes = Math.floor((now - time) / 60000);
  if (minutes < 1) return { key: 'account.justNow', count: null };
  if (minutes < 60) return { key: 'account.minutesAgo', count: minutes };

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { key: 'account.hoursAgo', count: hours };

  const days = Math.floor(hours / 24);
  return days < 7 ? { key: 'account.daysAgo', count: days } : null;
};

export const ActiveSessions = () => {
  const { t: translate, language } = useTranslation();
  const format = useLocaleFormat();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // This is a client component, so it reads the message bundle itself instead of
  // taking a prop per string.
  const t = {
    title: translate('account.activeSessions'),
    description: translate('account.activeSessionsDescription'),
    currentSession: translate('account.currentSession'),
    lastUsed: translate('account.lastUsed'),
    createdAt: translate('account.createdAt'),
    revokeSession: translate('account.revokeSession'),
    logoutAllDevices: translate('account.logoutAllDevices'),
    refresh: translate('account.refresh'),
    noSessions: translate('account.noSessions'),
    sessionRevoked: translate('account.sessionRevoked'),
    allSessionsRevoked: translate('account.allSessionsRevoked'),
    errorLoadingSessions: translate('account.errorLoadingSessions'),
    errorRevokingSession: translate('account.errorRevokingSession'),
    confirmRevokeAll: translate('account.confirmRevokeAll'),
    unknownIp: translate('account.unknownIp'),
  };

  // Sessions older than a week fall back to a full date, which is already
  // localised by `formatDate`.
  const when = (value: string) => {
    const relative = relativeTime(value, Date.now());
    if (!relative) return formatDate(value, language, true);
    return relative.count == null
      ? translate(relative.key)
      : translate(relative.key).replace('{count}', format.number(relative.count));
  };

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getActiveSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorLoadingSessions);
    } finally {
      setIsLoading(false);
    }
  }, [t.errorLoadingSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevokeSession = async (sessionId: string) => {
    setIsRevoking(sessionId);
    setError(null);
    setMessage(null);

    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setMessage(t.sessionRevoked);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorRevokingSession);
    } finally {
      setIsRevoking(null);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm(t.confirmRevokeAll)) {
      return;
    }

    setIsRevokingAll(true);
    setError(null);
    setMessage(null);

    try {
      await logoutAllDevices();
      setMessage(t.allSessionsRevoked);
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorRevokingSession);
    } finally {
      setIsRevokingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[var(--theme-primary)]" />
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">{t.title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSessions}
          disabled={isLoading}
          className="text-muted hover:text-foreground"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      <p className="text-muted text-sm">{t.description}</p>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {message && !error && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/70 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-theme bg-surface animate-pulse rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-surface-alt h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="bg-surface-alt h-4 w-32 rounded" />
                  <div className="bg-surface-alt h-3 w-48 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="border-theme bg-surface rounded-xl border p-6 text-center">
          <Globe className="text-muted mx-auto h-10 w-10" />
          <p className="text-muted mt-2 text-sm">{t.noSessions}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.device_info);
            const isCurrent = session.is_current;

            return (
              <div
                key={session.id}
                className={cn(
                  'group relative rounded-xl border p-4 transition-all',
                  isCurrent
                    ? 'border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/5 dark:border-[var(--theme-primary)]/30 dark:bg-[var(--theme-primary)]/10'
                    : 'border-theme bg-card hover:border-theme-strong',
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      isCurrent
                        ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]'
                        : 'bg-surface-alt text-muted',
                    )}
                  >
                    <DeviceIcon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-[var(--theme-foreground)]">
                        {session.device_info}
                      </p>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--theme-primary)] px-2 py-0.5 text-xs font-medium text-[var(--theme-on-primary)]">
                          <CheckCircle2 className="h-3 w-3" />
                          {t.currentSession}
                        </span>
                      )}
                    </div>
                    <div className="text-muted mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {session.ip_address ? (
                          <span dir="ltr">{format.digits(session.ip_address)}</span>
                        ) : (
                          t.unknownIp
                        )}
                      </span>
                      <span>
                        {t.lastUsed}: {when(session.last_used_at)}
                      </span>
                      <span>
                        {t.createdAt}: {when(session.created_at)}
                      </span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={isRevoking === session.id}
                      className="shrink-0 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                    >
                      {isRevoking === session.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="mr-1 h-4 w-4" />
                          {t.revokeSession}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sessions.length > 1 && (
        <div className="border-theme border-t pt-4">
          <Button
            variant="outline"
            onClick={handleLogoutAllDevices}
            disabled={isRevokingAll}
            className="w-full border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50"
          >
            {isRevokingAll ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            {t.logoutAllDevices}
          </Button>
        </div>
      )}
    </div>
  );
};
