"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Monitor, 
  Smartphone, 
  Globe, 
  Trash2, 
  LogOut, 
  RefreshCw,
  Shield,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getActiveSessions, 
  revokeSession, 
  logoutAllDevices,
  type ActiveSession 
} from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface ActiveSessionsProps {
  translations?: {
    title?: string;
    description?: string;
    currentSession?: string;
    lastUsed?: string;
    createdAt?: string;
    revokeSession?: string;
    logoutAllDevices?: string;
    refresh?: string;
    noSessions?: string;
    sessionRevoked?: string;
    allSessionsRevoked?: string;
    errorLoadingSessions?: string;
    errorRevokingSession?: string;
    confirmRevokeAll?: string;
  };
}

const getDeviceIcon = (deviceInfo: string) => {
  const info = deviceInfo.toLowerCase();
  if (info.includes("mobile") || info.includes("phone") || info.includes("android") || info.includes("iphone")) {
    return Smartphone;
  }
  return Monitor;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const ActiveSessions = ({ translations = {} }: ActiveSessionsProps) => {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<number | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const t = {
    title: translations.title ?? "Active Sessions",
    description: translations.description ?? "Manage your active sessions across devices. You can revoke access to any session you don't recognize.",
    currentSession: translations.currentSession ?? "Current Session",
    lastUsed: translations.lastUsed ?? "Last used",
    createdAt: translations.createdAt ?? "Created",
    revokeSession: translations.revokeSession ?? "Revoke",
    logoutAllDevices: translations.logoutAllDevices ?? "Logout from all devices",
    refresh: translations.refresh ?? "Refresh",
    noSessions: translations.noSessions ?? "No active sessions found",
    sessionRevoked: translations.sessionRevoked ?? "Session revoked successfully",
    allSessionsRevoked: translations.allSessionsRevoked ?? "All sessions have been revoked. Please log in again.",
    errorLoadingSessions: translations.errorLoadingSessions ?? "Failed to load sessions",
    errorRevokingSession: translations.errorRevokingSession ?? "Failed to revoke session",
    confirmRevokeAll: translations.confirmRevokeAll ?? "Are you sure you want to logout from all devices? You will need to log in again.",
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

  const handleRevokeSession = async (sessionId: number) => {
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
        window.location.href = "/auth/login";
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
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t.title}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSessions}
          disabled={isLoading}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t.description}
      </p>

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
            <div
              key={i}
              className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-48 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <Globe className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t.noSessions}
          </p>
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
                  "group relative rounded-xl border p-4 transition-all",
                  isCurrent
                    ? "border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/5 dark:border-[var(--theme-primary)]/30 dark:bg-[var(--theme-primary)]/10"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      isCurrent
                        ? "bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    )}
                  >
                    <DeviceIcon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {session.device_info}
                      </p>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--theme-primary)] px-2 py-0.5 text-xs font-medium text-white">
                          <CheckCircle2 className="h-3 w-3" />
                          {t.currentSession}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {session.ip_address || "Unknown IP"}
                      </span>
                      <span>
                        {t.lastUsed}: {formatDate(session.last_used_at)}
                      </span>
                      <span>
                        {t.createdAt}: {formatDate(session.created_at)}
                      </span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={isRevoking === session.id}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isRevoking === session.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
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
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="outline"
            onClick={handleLogoutAllDevices}
            disabled={isRevokingAll}
            className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-900 dark:hover:bg-red-950/50"
          >
            {isRevokingAll ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            {t.logoutAllDevices}
          </Button>
        </div>
      )}
    </div>
  );
};

