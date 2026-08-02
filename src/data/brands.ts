/**
 * Brand display metadata for the Shop page.
 *
 * Brands themselves are DYNAMIC — they come from the `brand` field on
 * /products. This file only carries presentation extras (blurb, accent, fallback
 * image, aliases) for the brands the client named, so they look finished before
 * the catalogue is renamed in the admin panel.
 *
 * Any brand returned by the API that isn't listed here still renders, using
 * brandDisplay()'s deterministic fallback.
 */

import candyBlue from "@/assets/yarn/candy-blue.jpg.asset.json";
import candyLilac from "@/assets/yarn/candy-lilac.jpg.asset.json";
import delightPink from "@/assets/yarn/delight-pink.jpg.asset.json";
import delightRust from "@/assets/yarn/delight-rust.jpg.asset.json";
import hobbyGreen from "@/assets/yarn/hobby-green.jpg.asset.json";
import hobbyYellow from "@/assets/yarn/hobby-yellow.jpg.asset.json";

export type BrandMeta = {
  /** Canonical display name. */
  name: string;
  blurb: string;
  /** Accent used for the dye glow on the card. */
  accent: string;
  image: string;
  /** Extra lowercase tokens that also identify this brand in product text. */
  aliases: string[];
};

export const BRAND_FALLBACK_IMAGES = [
  delightPink.url,
  candyBlue.url,
  hobbyYellow.url,
  delightRust.url,
  candyLilac.url,
  hobbyGreen.url,
];

/** Seeded brands, keyed by normalized name. */
export const SEEDED_BRANDS: BrandMeta[] = [
  {
    name: "Heartbeats Premium Yarns",
    blurb: "Merino, alpaca & cotton blends — soft-spun premium skeins.",
    accent: "#C0405A",
    image: delightPink.url,
    aliases: ["heartbeats", "heart beats", "heart-beats"],
  },
  {
    name: "Ganga Acrowools Knitting Yarn",
    blurb: "Everyday acrylic & acrowool ranges in every shade of the deck.",
    accent: "#2F7E8C",
    image: candyBlue.url,
    aliases: ["ganga", "acrowool", "acrowools", "acro wool"],
  },
];

export function normalizeBrand(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

const SEEDED_BY_KEY = new Map(SEEDED_BRANDS.map((b) => [normalizeBrand(b.name), b]));

/** Cheap deterministic hash so unknown brands keep a stable image/accent. */
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const FALLBACK_ACCENTS = ["#B4482A", "#5C7C4A", "#8A5BA8", "#C48A22", "#3A6EA5", "#A63D5B"];

/** Presentation for any brand name, seeded or admin-added. */
export function brandDisplay(name: string): BrandMeta {
  const seeded = SEEDED_BY_KEY.get(normalizeBrand(name));
  if (seeded) return seeded;
  const h = hash(normalizeBrand(name));
  return {
    name,
    blurb: "Explore the full range from this house.",
    accent: FALLBACK_ACCENTS[h % FALLBACK_ACCENTS.length]!,
    image: BRAND_FALLBACK_IMAGES[h % BRAND_FALLBACK_IMAGES.length]!,
    aliases: [],
  };
}
