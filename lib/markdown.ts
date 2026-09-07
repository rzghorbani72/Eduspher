import { marked } from "marked";

import { sanitizeHtml } from "@/lib/sanitize";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "del",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "code",
  "pre",
  "hr",
];

const ALLOWED_ATTR = ["href", "target", "rel"];

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

/**
 * Raw HTML in the source is neutralised before Markdown is parsed, so the only
 * tags in the output are the ones Markdown itself produced. `<u>` is the one
 * exception — the editor's underline button writes it. Doing it here means the
 * output is already safe on the server, where DOMPurify has no DOM to work
 * with and silently does nothing.
 */
function escapeRawHtml(markdown: string): string {
  return markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&lt;(\/?)u&gt;/gi, "<$1u>");
}

/** Drops `javascript:` and other non-navigational link targets. */
function stripUnsafeHrefs(html: string): string {
  return html.replace(/href="([^"]*)"/gi, (match, href: string) =>
    SAFE_HREF.test(href.trim()) ? match : 'href="#"',
  );
}

/**
 * Markdown ignores `**text **` because the closing marker touches a space.
 * Older descriptions were saved that way, so the spaces are pushed outside the
 * markers before parsing instead of showing raw asterisks to the reader.
 */
function healPaddedEmphasis(markdown: string): string {
  return markdown.replace(
    /(\*\*|~~)(\s+)?([^\s*~][^*~\n]*?)(\s+)?\1/g,
    (_match, marker: string, lead = "", text: string, trail = "") =>
      `${lead}${marker}${text}${marker}${trail}`,
  );
}

/**
 * ATX headings only work at the start of a line. Authors often type
 * `## Title` in the middle of a paragraph, so a newline is inserted first.
 */
function healInlineHeadings(markdown: string): string {
  return markdown.replace(
    /(?<!^)(?<!\n)[ \t]+(#{1,4}[ \t]+\S)/gm,
    "\n\n$1",
  );
}

function toHtml(markdown: string): string {
  const html = marked.parse(
    healInlineHeadings(escapeRawHtml(healPaddedEmphasis(markdown))),
    {
      async: false,
      breaks: true,
      gfm: true,
    },
  );
  return stripUnsafeHrefs(html);
}

/**
 * Descriptions are stored as Markdown and rendered as HTML wherever they are
 * shown to a reader.
 */
export function renderMarkdown(markdown: string): string {
  return sanitizeHtml(toHtml(markdown), { ALLOWED_TAGS, ALLOWED_ATTR });
}

/** Markdown reduced to readable plain text, for list rows and previews. */
export function markdownToPlainText(markdown: string): string {
  return toHtml(markdown)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
