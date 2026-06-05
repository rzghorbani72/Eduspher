import { getPreviewToken, isEmbedMode } from '@/lib/preview-token';

export async function PreviewModeBanner() {
  const previewToken = await getPreviewToken();
  const embedMode = await isEmbedMode();
  if (!previewToken || embedMode) return null;

  return (
    <div
      className="sticky top-0 z-[100] w-full px-4 py-2 text-center text-sm font-medium"
      style={{
        backgroundColor: 'var(--theme-primary)',
        color: 'var(--theme-on-primary)',
      }}
    >
      Preview mode — showing unpublished draft. This view is only visible to you.
    </div>
  );
}
