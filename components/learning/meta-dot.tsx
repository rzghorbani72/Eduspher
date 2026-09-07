/**
 * The separator between two facts on one meta line ("ویدیو · ۱۹:۴۲").
 *
 * It is deliberately dimmed and given its own breathing room: the Persian zero
 * (۰) is itself a small dot, so a tight "·" beside a numeral gets read as part
 * of the number — "· ۱ دقیقه" turns into "۱۰ دقیقه".
 */
export function MetaDot() {
  return (
    <span aria-hidden="true" className="px-0.5 text-current/40">
      ·
    </span>
  );
}
