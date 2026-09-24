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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="flex items-center gap-2.5 text-base font-semibold text-(--theme-foreground)">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--theme-primary) 12%, var(--theme-background))',
                color: 'var(--theme-primary-ink)',
              }}
            >
              <Shield className="size-4" aria-hidden="true" />
            </span>
            {t.title}
          </h3>
          <p className="text-muted text-sm leading-relaxed">{t.description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSessions}
          disabled={isLoading}
          className="text-muted shrink-0 hover:text-(--theme-foreground)"
          aria-label={t.refresh}
        >
          <RefreshCw className={cn('size-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {message && !error && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/70 dark:text-green-300">
          <CheckCircle2 className="size-4 shrink-0" />
          {message}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse py-1">
              <div className="flex items-center gap-3">
                <div className="bg-surface-alt size-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="bg-surface-alt h-4 w-32 rounded" />
                  <div className="bg-surface-alt h-3 w-48 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl bg-(--theme-primary)/5 px-4 py-8 text-center">
          <Globe className="text-muted mx-auto size-9" />
          <p className="text-muted mt-2 text-sm">{t.noSessions}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.device_info);
            const isCurrent = session.is_current;

            return (
              <li key={session.id}>
                <div className="flex items-start gap-3.5 rounded-xl bg-(--theme-background)/55 px-3 py-3">
                  <div
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-lg',
                      isCurrent
                        ? 'bg-(--theme-primary)/10 text-(--theme-primary-ink)'
                        : 'bg-surface-alt text-muted',
                    )}
                  >
                    <DeviceIcon className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-(--theme-foreground)">
                        {session.device_info}
                      </p>
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-(--theme-primary)/12 px-2 py-0.5 text-xs font-medium text-(--theme-primary-ink)">
                          <CheckCircle2 className="size-3" />
                          {t.currentSession}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-muted mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="flex items-center gap-1">
                        <Globe className="size-3" />
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

                  {!isCurrent ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={isRevoking === session.id}
                      className="shrink-0 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                    >
                      {isRevoking === session.id ? (
                        <RefreshCw className="size-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="me-1 size-4" />
                          {t.revokeSession}
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {sessions.length > 1 ? (
        <div className="pt-1">
          <Button
            variant="ghost"
            onClick={handleLogoutAllDevices}
            disabled={isRevokingAll}
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50"
          >
            {isRevokingAll ? (
              <RefreshCw className="me-2 size-4 animate-spin" />
            ) : (
              <LogOut className="me-2 size-4" />
            )}
            {t.logoutAllDevices}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
