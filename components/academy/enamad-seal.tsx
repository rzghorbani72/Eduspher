/**
 * Official eNamad trustseal widget. The image and link must stay on
 * trustseal.enamad.ir — a local copy would fail their domain check.
 * No `rel` here on purpose: `noreferrer` would strip the Referer header
 * that eNamad uses to verify the seal is served from our domain.
 */
export function EnamadSeal({
  sealId,
  code,
}: {
  sealId: string;
  code: string;
}) {
  const href = `https://trustseal.enamad.ir/?id=${encodeURIComponent(sealId)}&Code=${encodeURIComponent(code)}`;
  const src = `https://trustseal.enamad.ir/logo.aspx?id=${encodeURIComponent(sealId)}&Code=${encodeURIComponent(code)}`;
  // eNamad's own snippet puts a non-standard `code` attribute on the img and
  // their verifier looks for it; React only passes it through via a spread.
  const enamadCodeAttr: Record<string, string> = { code };
  return (
    <a
      referrerPolicy="origin"
      target="_blank"
      href={href}
    >
      {/* eNamad requires a plain img with referrerPolicy=origin, not next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        referrerPolicy="origin"
        src={src}
        alt="نماد اعتماد الکترونیکی"
        {...enamadCodeAttr}
        width={125}
        height={136}
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
