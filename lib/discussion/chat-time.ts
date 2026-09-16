const SAME_AUTHOR_MS = 5 * 60 * 1000;

export function formatChatTime(iso: string, language: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const locale = language === 'fa' ? 'fa-IR' : language;
  const sameDay = date.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat(locale, {
    ...(sameDay ? {} : { month: 'short', day: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

export function formatChatDay(iso: string, language: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const locale = language === 'fa' ? 'fa-IR' : language;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export function chatDayKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function isSameAuthorBurst(
  previous: { Author?: { id: string }; created_at: string } | undefined,
  current: { Author?: { id: string }; created_at: string },
): boolean {
  if (!previous?.Author?.id || previous.Author.id !== current.Author?.id) return false;
  return (
    Math.abs(new Date(current.created_at).getTime() - new Date(previous.created_at).getTime()) <
    SAME_AUTHOR_MS
  );
}
