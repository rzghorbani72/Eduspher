import { ExternalLink } from 'lucide-react';

import { useTranslation } from '@/lib/i18n/hooks';

/** One quiet line: the teacher's external room, for when Meet quality drops. */
export function BackupLinkHint({ url }: { url: string }) {
  const { t } = useTranslation();
  return (
    <p className="text-muted px-1 text-xs" data-testid="live-backup-link">
      {t('live.backupLinkPrompt')}{' '}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-semibold text-(--theme-primary-ink) underline-offset-4 hover:underline"
      >
        {t('live.backupLinkAction')}
        <ExternalLink className="size-3" aria-hidden="true" />
      </a>
    </p>
  );
}
