'use client';

import { type LucideIcon, MessagesSquare, UserRound, Video } from 'lucide-react';
import { useState } from 'react';

import { DiscussionThread } from '@/components/discussion/discussion-thread';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/hooks';

type ChatScope = 'session' | 'group' | 'private';

interface ClassChatProps {
  sessionId: string | null;
  groupThreadParent: string | null;
  privateThreadParent: string | null;
  currentProfileId: string;
  /** Prefer SSE when Mentoma is the live chat hub. */
  realtime?: boolean;
}

interface ScopeTab {
  id: ChatScope;
  label: string;
  hint: string;
  placeholder: string;
  icon: LucideIcon;
}

export function ClassChat({
  sessionId,
  groupThreadParent,
  privateThreadParent,
  currentProfileId,
  realtime = false,
}: ClassChatProps) {
  const { t } = useTranslation();
  const tabs: ScopeTab[] = [
    ...(sessionId
      ? [
          {
            id: 'session' as const,
            label: t('live.chatSession'),
            hint: t('live.chatSessionHint'),
            placeholder: t('live.chatSessionPlaceholder'),
            icon: Video,
          },
        ]
      : []),
    ...(groupThreadParent
      ? [
          {
            id: 'group' as const,
            label: t('live.chatGroup'),
            hint: t('live.chatGroupHint'),
            placeholder: t('live.chatGroupPlaceholder'),
            icon: MessagesSquare,
          },
        ]
      : []),
    ...(privateThreadParent
      ? [
          {
            id: 'private' as const,
            label: t('live.chatPrivate'),
            hint: t('live.chatPrivateHint'),
            placeholder: t('live.chatPrivatePlaceholder'),
            icon: UserRound,
          },
        ]
      : []),
  ];
  const [scope, setScope] = useState<ChatScope>(tabs[0]?.id ?? 'private');
  const active = tabs.find((tab) => tab.id === scope) ?? tabs[0];

  if (!active) return null;

  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label={t('live.tabChat')}
        className="bg-surface flex gap-1 rounded-xl p-1"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = tab.id === active.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`chat-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`chat-panel-${tab.id}`}
              onClick={() => setScope(tab.id)}
              className={cn(
                'flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors',
                selected
                  ? 'bg-(--theme-primary) text-(--theme-on-primary) shadow-sm'
                  : 'text-muted hover:text-(--theme-foreground)',
              )}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-muted px-1 text-xs leading-relaxed">{active.hint}</p>
      {realtime ? (
        <p className="text-muted px-1 text-[11px] leading-relaxed">{t('live.chatRealtimeHint')}</p>
      ) : null}
      <div role="tabpanel" id={`chat-panel-${active.id}`} aria-labelledby={`chat-tab-${active.id}`}>
        {active.id === 'session' && sessionId ? (
          <DiscussionThread
            key={`session-${sessionId}`}
            sessionId={sessionId}
            currentProfileId={currentProfileId}
            placeholder={active.placeholder}
            emptyDescription={active.hint}
            realtime={realtime}
            allowAttachments={false}
          />
        ) : active.id === 'group' && groupThreadParent ? (
          <DiscussionThread
            key="group"
            groupId={groupThreadParent}
            currentProfileId={currentProfileId}
            placeholder={active.placeholder}
            emptyDescription={active.hint}
            realtime={realtime}
            allowAttachments={false}
          />
        ) : (
          <DiscussionThread
            key="private"
            engagementId={privateThreadParent ?? undefined}
            currentProfileId={currentProfileId}
            placeholder={active.placeholder}
            emptyDescription={active.hint}
            realtime={realtime}
            allowAttachments={false}
          />
        )}
      </div>
    </div>
  );
}
