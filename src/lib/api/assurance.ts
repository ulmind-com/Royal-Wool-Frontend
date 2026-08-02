/**
 * Store assurances (secure checkout, delivery, safety, quality).
 *
 * Values are read tolerantly from whatever the admin panel sends — a
 * `product.assurances` / `settings.assurances` array of `{ id, title, note }`
 * (or `{ key, label, text }`) — and fall back to a demo set until real data
 * exists. Unknown ids never render.
 */

export type AssuranceId = "secure" | "delivery" | "baby" | "quality";

export interface AssuranceRow {
  id: AssuranceId;
  title: string;
  note: string;
  /** True when the copy is demo filler, not admin-provided data. */
  placeholder?: boolean;
}

/** Flip to false once the admin panel supplies real assurance copy. */
export const ASSURANCE_PLACEHOLDERS = true;

const ORDER: AssuranceId[] = ["secure", "delivery", "baby", "quality"];

const DEFAULTS: Record<AssuranceId, { title: string; note: string }> = {
  secure: { title: "Secure Checkout", note: "Safe, fast & encrypted" },
  delivery: { title: "Pan India Delivery", note: "Fast, reliable shipping across India" },
  baby: { title: "Safe for Babies", note: "Skin-friendly, tested dyes" },
  quality: { title: "Quality Guarantee", note: "Batch-matched, hand-checked yarn" },
};

const ALIASES: Record<string, AssuranceId> = {
  secure: "secure",
  secure_checkout: "secure",
  checkout: "secure",
  payment: "secure",
  delivery: "delivery",
  shipping: "delivery",
  pan_india_delivery: "delivery",
  baby: "baby",
  safe_for_babies: "baby",
  safety: "baby",
  quality: "quality",
  quality_guarantee: "quality",
  guarantee: "quality",
};

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function text(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

/**
 * Reads any admin-provided assurance list; falls back to the demo set.
 * Pass the product and/or settings payloads — both are searched.
 */
export function storeAssurances(...sources: unknown[]): AssuranceRow[] {
  const found = new Map<AssuranceId, AssuranceRow>();

  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const bag = source as Record<string, unknown>;
    for (const key of ["assurances", "trust", "trust_badges", "usps", "highlights"]) {
      const list = bag[key];
      if (!Array.isArray(list)) continue;
      for (const raw of list) {
        if (!raw || typeof raw !== "object") continue;
        const row = raw as Record<string, unknown>;
        const rawId = text(row["id"]) ?? text(row["key"]) ?? text(row["slug"]) ?? text(row["type"]);
        const title = text(row["title"]) ?? text(row["label"]) ?? text(row["heading"]);
        const id = ALIASES[normalizeKey(rawId ?? title ?? "")];
        if (!id) continue;
        found.set(id, {
          id,
          title: title ?? DEFAULTS[id].title,
          note: text(row["note"]) ?? text(row["text"]) ?? text(row["subtitle"]) ?? DEFAULTS[id].note,
        });
      }
    }
  }

  return ORDER.flatMap((id) => {
    const row = found.get(id);
    if (row) return [row];
    if (!ASSURANCE_PLACEHOLDERS) return [];
    return [{ id, ...DEFAULTS[id], placeholder: true }];
  });
}
