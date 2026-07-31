/**
 * Upcoming ranges fallback.
 *
 * Resolution order used by the Upcoming section (Phase 7):
 *   1. GET /categories/tree -> a category whose name/slug matches "upcoming"
 *      -> GET /products?category_id=<id>
 *   2. GET /site-media -> a section keyed "upcoming" for visuals
 *   3. this constant
 *
 * Swapping to live data is a one-line change: replace the array passed to the
 * section with the normalized API list — the shape below is the contract.
 */
export interface UpcomingRange {
  name: string;
  blurb: string;
  palette: string[];
}

export const UPCOMING_FALLBACK: UpcomingRange[] = [
  {
    name: "Acrylic Rainbow",
    blurb: "One ball, seven gradients. Self-striping without changing yarn.",
    palette: ["#C6402E", "#E9A93C", "#5FA35A", "#3C4FA0"],
  },
  {
    name: "MultiTone Acrylic",
    blurb: "Two shades plied together, so flat stitches read with depth.",
    palette: ["#7C3B6B", "#E9A93C", "#2F3A72"],
  },
  {
    name: "CloudCotton",
    blurb: "Matte, brushed cotton with almost no sheen — built for baby blankets.",
    palette: ["#EFE7DA", "#D8CDBB", "#A79C8E"],
  },
  {
    name: "Aroma Cotton",
    blurb: "Micro-encapsulated scent in the fibre that survives the first few washes.",
    palette: ["#E7A0A6", "#F0C979", "#B9D3B0"],
  },
  {
    name: "TwistTone Cotton",
    blurb: "A visible high-twist ply that gives crochet stitches a crisp edge.",
    palette: ["#3C4FA0", "#EFE7DA", "#C6402E"],
  },
  {
    name: "Exclusive Acrylic",
    blurb: "Limited dye lots, numbered. When a colour is gone, it is gone.",
    palette: ["#171220", "#C6402E", "#E9A93C"],
  },
];
