/**
 * Serializes data for a JSON-LD <script> tag.
 *
 * `JSON.stringify` escapes quotes and backslashes but NOT `<`, so any value a
 * user controls (academy name, course or article title) containing `</script>`
 * would close the tag early and let the rest of the string run as HTML —
 * stored XSS on the public site. `<` is the JSON escape for `<`: the
 * parsed object is identical, but the HTML parser never sees a closing tag.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
