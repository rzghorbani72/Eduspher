/**
 * Official eNamad trustseal widget. The image and link must stay on
 * trustseal.enamad.ir — a local copy would fail their domain check.
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
  return (
    <a
      referrerPolicy="origin"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      {/* eNamad requires a plain img with referrerPolicy=origin, not next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        loading="lazy"
        referrerPolicy="origin"
        src={src}
        alt="نماد اعتماد الکترونیکی"
        width={125}
        height={136}
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
