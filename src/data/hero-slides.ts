import hero1 from "@/assets/hero-1.asset.json";
import hero2 from "@/assets/hero-2.asset.json";
import hero3 from "@/assets/hero-3.asset.json";
import type { MediaItem } from "@/lib/api/types";

/**
 * Fallback hero slides, used only until the backend returns a `hero` section
 * from /site-media. Same shape as the API rows, so the admin panel can take
 * over every field (image, eyebrow, title, subtitle, CTA) with no code change.
 */
export const HERO_FALLBACK: MediaItem[] = [
  {
    id: "hero-fallback-1",
    section: "hero",
    url: hero1.url,
    poster: null,
    eyebrow: "Small-batch dye house · India",
    title: "Colour you can feel between your fingers",
    subtitle:
      "Acrylic, cotton and blends wound for stitch definition — dyed in small lots so every skein matches.",
    cta_label: "Shop all yarns",
    cta_href: "/collections",
    order: 0,
    active: true,
  },
  {
    id: "hero-fallback-2",
    section: "hero",
    url: hero2.url,
    poster: null,
    eyebrow: "Chenille & velvet",
    title: "Soft enough for the smallest hands",
    subtitle:
      "Plush, skin-friendly fibres with tested dyes — made for baby blankets and amigurumi.",
    cta_label: "Explore soft yarns",
    cta_href: "/collections",
    order: 1,
    active: true,
  },
  {
    id: "hero-fallback-3",
    section: "hero",
    url: hero3.url,
    poster: null,
    eyebrow: "New ranges arriving",
    title: "Premium knitting yarns, royally wound",
    subtitle:
      "Six new Acrylic and Cotton ranges are on the winder. Get a WhatsApp ping the day they land.",
    cta_label: "See what's coming",
    cta_href: "/upcoming",
    order: 2,
    active: true,
  },
];

/** Picks the admin-managed hero rows, falling back to the curated set. */
export function resolveHeroSlides(media: Record<string, MediaItem[]> | undefined): MediaItem[] {
  const rows = media?.["hero"] ?? media?.["hero_slider"] ?? [];
  const live = rows.filter((r) => r.active !== false && Boolean(r.url));
  if (live.length === 0) return HERO_FALLBACK;
  return [...live].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
