/**
 * Shorten long API product titles for UI labels.
 *
 * "Ganga Acrowools Cotton Candy Knitting Yarn - Azure Blue (Cotton Candy 48% Acrylic)"
 * → "Cotton Candy · Azure Blue"
 */
export function shortProductName(title: string, max = 28): string {
  // Strip brand prefix (anything before the first known range keyword)
  let t = title
    .replace(/^.*?(?=Cotton Candy|Cotton Delight|Hobby India)/i, "")
    .replace(/\s*Knitting\s*Yarn\s*/gi, "")
    .replace(/\s*\(.*?\)\s*/g, "")          // remove parenthetical specs
    .replace(/\s*-\s*/g, " · ")             // dashes → mid-dot
    .trim();
  // If nothing matched, just truncate
  if (!t || t === title) {
    t = title.length > max ? title.slice(0, max - 2) + "…" : title;
  }
  return t;
}
