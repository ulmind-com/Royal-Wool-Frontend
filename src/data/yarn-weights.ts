/**
 * Standard yarn weight system (0–7 scale, we ship 1–7) used by the
 * "Shop by Yarn Weight" rail on the home page.
 *
 * Fully data-driven: when the backend exposes weight facets, feed the same
 * shape from the API and the section keeps working unchanged.
 */

export type YarnWeight = {
  id: string;
  /** Number badge, 1–7. */
  weight: number;
  name: string;
  /** Recommended hook size, shown as the spec line. */
  hookMm: string;
  /** Wraps per inch — the quiet secondary spec. */
  wpi: string;
  note: string;
  /** Search query used for the tile link. */
  query: string;
};

export const YARN_WEIGHTS: YarnWeight[] = [
  {
    id: "super-fine",
    weight: 1,
    name: "Super Fine",
    hookMm: "2.25 mm",
    wpi: "14–30 wpi",
    note: "Socks, lace, fine shawls",
    query: "super fine",
  },
  {
    id: "fine",
    weight: 2,
    name: "Fine",
    hookMm: "3 mm",
    wpi: "12–18 wpi",
    note: "Baby wear, light tops",
    query: "fine",
  },
  {
    id: "light",
    weight: 3,
    name: "Light",
    hookMm: "4 mm",
    wpi: "11–15 wpi",
    note: "Cardigans, amigurumi",
    query: "light",
  },
  {
    id: "medium",
    weight: 4,
    name: "Medium",
    hookMm: "5 mm",
    wpi: "9–12 wpi",
    note: "Everyday knit & crochet",
    query: "medium",
  },
  {
    id: "bulky",
    weight: 5,
    name: "Bulky",
    hookMm: "7 mm",
    wpi: "7–9 wpi",
    note: "Warm sweaters, scarves",
    query: "bulky",
  },
  {
    id: "super-bulky",
    weight: 6,
    name: "Super Bulky",
    hookMm: "9 mm",
    wpi: "5–7 wpi",
    note: "Blankets, quick makes",
    query: "super bulky",
  },
  {
    id: "jumbo",
    weight: 7,
    name: "Jumbo",
    hookMm: "12 mm",
    wpi: "1–4 wpi",
    note: "Chunky throws, rugs",
    query: "jumbo",
  },
];
