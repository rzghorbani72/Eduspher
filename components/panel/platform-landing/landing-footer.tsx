import { LP } from "../platform-landing-page.messages";

export function LandingFooter() {
  return (
    <footer style={{ borderTop: "1px solid #E5E3DA", padding: "34px 0", background: "#F8F7F2" }}>
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 44px" }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-.01em", color: "#100F0C" }}>
          {LP.footer.logoText}
          <em style={{ color: "#CC7A00", fontStyle: "normal" }}>{LP.footer.logoHighlight}</em>
        </div>

        <p style={{ fontSize: 12, color: "#A09B8C" }}>{LP.footer.copyright}</p>

        <div className="flex gap-5">
          {LP.footer.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="lp-nav-link"
              style={{ fontSize: 12 }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
