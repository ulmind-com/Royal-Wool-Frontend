import featured from "@/assets/blog/featured.jpg.asset.json";
import p1 from "@/assets/blog/p1.jpg.asset.json";
import p2 from "@/assets/blog/p2.jpg.asset.json";
import p3 from "@/assets/blog/p3.jpg.asset.json";
import p4 from "@/assets/blog/p4.jpg.asset.json";
import p5 from "@/assets/blog/p5.jpg.asset.json";
import p6 from "@/assets/blog/p6.jpg.asset.json";
import p7 from "@/assets/blog/p7.jpg.asset.json";
import p8 from "@/assets/blog/p8.jpg.asset.json";
import p9 from "@/assets/blog/p9.jpg.asset.json";

/** One block of long-form article copy. */
export type BlogBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string };

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  tag: string;
  featured?: boolean;
  /** Long-form article body, when the source provides one. */
  body?: BlogBlock[];
  /** True while the copy is demo filler, not admin-provided data. */
  placeholder?: boolean;
}


/**
 * Demo posts used until the admin panel exposes a blog endpoint.
 * Shape matches the normaliser in `src/lib/api/blog.ts`, so switching to
 * live data needs no component changes.
 */
export const DEMO_POSTS: BlogPost[] = [
  {
    id: "featured",
    slug: "reading-a-gauge-swatch",
    title: "Reading a gauge swatch: the ten minutes that save a whole project",
    excerpt:
      "Most sizing problems are decided before the first row of the real garment. Here's how we swatch, block and measure in the dye house — and what we do when the numbers don't agree with the pattern.",
    image: featured.url,
    author: "Ritika Sen",
    date: "2 Aug 2026",
    tag: "Featured",
    featured: true,
    placeholder: true,
  },
  {
    id: "p1",
    slug: "how-to-read-a-yarn-label",
    title: "How to read a yarn label",
    excerpt: "Fibre, weight, metres, dye lot — what each line on the band actually tells you.",
    image: p1.url,
    author: "Ritika Sen",
    date: "28 Jul 2026",
    tag: "Basics",
    placeholder: true,
  },
  {
    id: "p2",
    slug: "why-dye-lots-matter",
    title: "Why dye lots matter in crochet",
    excerpt: "Two skeins, one shade, two weeks apart. Why the sixth ball looks off — and the fix.",
    image: p2.url,
    author: "Arun Das",
    date: "24 Jul 2026",
    tag: "Colour",
    placeholder: true,
  },
  {
    id: "p3",
    slug: "cotton-vs-acrylic",
    title: "Cotton vs acrylic: when to choose which",
    excerpt: "Breathability, drape, wash care and cost, compared across the bases we wind.",
    image: p3.url,
    author: "Ritika Sen",
    date: "19 Jul 2026",
    tag: "Fibre",
    placeholder: true,
  },
  {
    id: "p4",
    slug: "inside-a-small-batch-dye-day",
    title: "Inside a small-batch dye day",
    excerpt: "One vat, one shade, one afternoon — and the log book that keeps lots repeatable.",
    image: p4.url,
    author: "Arun Das",
    date: "15 Jul 2026",
    tag: "Dye house",
    placeholder: true,
  },
  {
    id: "p5",
    slug: "amigurumi-yarn-guide",
    title: "Choosing yarn for amigurumi",
    excerpt: "Stitch definition, stuffing show-through and the twist that keeps faces crisp.",
    image: p5.url,
    author: "Priya Nair",
    date: "11 Jul 2026",
    tag: "Projects",
    placeholder: true,
  },
  {
    id: "p6",
    slug: "baby-safe-dyes",
    title: "What makes a dye baby-safe",
    excerpt: "The tests we run before a shade goes near a blanket, in plain language.",
    image: p6.url,
    author: "Priya Nair",
    date: "6 Jul 2026",
    tag: "Safety",
    placeholder: true,
  },
  {
    id: "p7",
    slug: "winding-a-centre-pull-cake",
    title: "Winding a centre-pull cake",
    excerpt: "Tension, angle and speed — how we wind so your yarn never collapses mid-row.",
    image: p7.url,
    author: "Arun Das",
    date: "2 Jul 2026",
    tag: "Craft",
    placeholder: true,
  },
  {
    id: "p8",
    slug: "building-a-colour-card",
    title: "Building a colour card you can trust",
    excerpt: "Why we swatch every lot and pin it to the wall before it ever ships.",
    image: p8.url,
    author: "Ritika Sen",
    date: "27 Jun 2026",
    tag: "Colour",
    placeholder: true,
  },
  {
    id: "p9",
    slug: "washing-hand-knits",
    title: "Washing hand-knits without regret",
    excerpt: "Water temperature, soap choice and the flat-dry habit that keeps shape for years.",
    image: p9.url,
    author: "Priya Nair",
    date: "21 Jun 2026",
    tag: "Care",
    placeholder: true,
  },
];
