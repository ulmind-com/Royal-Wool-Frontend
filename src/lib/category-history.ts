/**
 * Client-side category browsing tracker.
 *
 * Stores the most recent category IDs the user has visited in localStorage.
 * The "Picked for You" home section reads this to show personalised products
 * — no backend or login required.
 */

const STORAGE_KEY = "rw_recent_categories";
const MAX_ENTRIES = 5;

export interface CategoryEntry {
  id: string;
  slug: string;
  name: string;
  /** ISO timestamp of the last visit. */
  visitedAt: string;
}

/** Record that the user just viewed a category. */
export function trackCategoryView(id: string, slug: string, name: string): void {
  try {
    const existing = getRecentCategories();
    // Remove any older entry for the same category
    const filtered = existing.filter((e) => e.id !== id);
    // Prepend this one (most recent first)
    const updated: CategoryEntry[] = [
      { id, slug, name, visitedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be unavailable (private browsing, SSR)
  }
}

/** Get the user's recently viewed categories, most recent first. */
export function getRecentCategories(): CategoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CategoryEntry[];
  } catch {
    return [];
  }
}

/** Get just the category IDs, most recent first. */
export function getRecentCategoryIds(): string[] {
  return getRecentCategories().map((e) => e.id);
}
