/**
 * Yarn spec reader.
 *
 * The backend can attach product attributes under several shapes depending on
 * how the admin panel evolves (`specs`, `attributes`, `meta`, or flat fields).
 * This module reads all of them tolerantly and returns only the specs that are
 * actually present — nothing is ever invented for a row the admin left blank.
 */

import type { Product } from "@/lib/api/types";

export type SpecId =
  | "fibre"
  | "weight"
  | "length"
  | "needle"
  | "hook"
  | "needle_stitch"
  | "crochet_stitch"
  | "ball_weight";

export interface SpecRow {
  id: SpecId;
  label: string;
  value: string;
}

type Bag = Record<string, unknown>;

const SPEC_DEFS: { id: SpecId; label: string; keys: string[]; unit?: string }[] = [
  {
    id: "fibre",
    label: "Fibre / Blend",
    keys: ["fibre", "fiber", "blend", "composition", "material"],
  },
  { id: "weight", label: "Yarn Weight", keys: ["yarn_weight", "weight", "thickness", "ply"] },
  {
    id: "length",
    label: "Yarn Length",
    keys: ["yardage", "yarn_length", "length", "meterage", "metres", "meters"],
    unit: "m",
  },
  { id: "needle", label: "Needle Size", keys: ["needle_size", "needle", "needles"] },
  {
    id: "hook",
    label: "Crochet Hook Size",
    keys: ["hook_size", "crochet_hook", "crochet_hook_size", "hook"],
  },
  {
    id: "needle_stitch",
    label: "Needle Stitch",
    keys: ["needle_stitch", "needle_gauge", "knit_gauge", "gauge_info"],
  },
  { id: "crochet_stitch", label: "Crochet Stitch", keys: ["crochet_stitch", "crochet_gauge"] },
  {
    id: "ball_weight",
    label: "Ball Weight",
    keys: ["skein_weight", "ball_weight", "net_weight", "pack_weight", "grams"],
    unit: "g",
  },
];

function bags(product: Product): Bag[] {
  const p = product as unknown as Bag;
  const out: Bag[] = [p];
  for (const key of ["specs", "attributes", "meta", "details", "specifications"]) {
    const value = p[key];
    if (value && typeof value === "object" && !Array.isArray(value)) out.push(value as Bag);
    // Admins may also send [{ label, value }] pairs.
    if (Array.isArray(value)) {
      const pairs: Bag = {};
      for (const row of value) {
        if (!row || typeof row !== "object") continue;
        const r = row as Bag;
        const label = String(r["label"] ?? r["name"] ?? r["key"] ?? "").trim();
        if (label) pairs[normalizeKey(label)] = r["value"] ?? r["text"];
      }
      out.push(pairs);
    }
  }
  return out;
}

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function read(bag: Bag, keys: string[], unit?: string): string | null {
  const normalised: Bag = {};
  for (const [k, v] of Object.entries(bag)) normalised[normalizeKey(k)] = v;
  for (const key of keys) {
    const value = normalised[key];
    if (value == null) continue;
    if (typeof value === "number" && Number.isFinite(value)) {
      return unit ? `${value} ${unit}` : String(value);
    }
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/** "70% Acrylic · 30% Wool" built from the admin's fiber_content rows, or null. */
function fiberBlend(product: Product): string | null {
  const raw = (product as unknown as Bag)["fiber_content"];
  if (!Array.isArray(raw) || !raw.length) return null;
  const parts = raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const fiber = String((row as Bag)["fiber"] ?? "").trim();
      if (!fiber) return null;
      const pct = (row as Bag)["percentage"];
      return typeof pct === "number" ? `${pct}% ${fiber}` : fiber;
    })
    .filter((part): part is string => Boolean(part));
  return parts.length ? parts.join(" · ") : null;
}

/** Every spec for this product that the admin actually filled in. */
export function productSpecs(product: Product): SpecRow[] {
  const sources = bags(product);
  const rows: SpecRow[] = [];
  for (const def of SPEC_DEFS) {
    let value = def.id === "fibre" ? fiberBlend(product) : null;
    if (!value) {
      for (const bag of sources) {
        value = read(bag, def.keys, def.unit);
        if (value) break;
      }
    }
    if (value) rows.push({ id: def.id, label: def.label, value });
  }
  return rows;
}

/** Free-text wash-care copy from the admin, or null when not set. */
export function washCare(product: Product): string | null {
  for (const bag of bags(product)) {
    const value = read(bag, ["wash_care", "care", "care_instructions", "washing"]);
    if (value) return value;
  }
  return null;
}

/** Shade code such as "DSR001" when the admin stores one on the colour. */
export function shadeCode(color: { name: string } & Record<string, unknown>): string | null {
  for (const key of ["code", "sku", "shade_code", "shade"]) {
    const value = color[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  const embedded = color.name.match(/\b([A-Z]{2,5}\s?-?\d{2,4})\b/);
  return embedded ? embedded[1]!.replace(/\s/g, "") : null;
}
