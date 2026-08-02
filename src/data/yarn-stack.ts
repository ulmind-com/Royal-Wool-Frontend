import candyLilac from "@/assets/yarn/candy-lilac.jpg.asset.json";
import delightPink from "@/assets/yarn/delight-pink.jpg.asset.json";
import hobbyYellow from "@/assets/yarn/hobby-yellow.jpg.asset.json";

export type StackCardData = {
  key: string;
  /** Small uppercase eyebrow on the glass pill. */
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
  imageAlt: string;
  /** Three short spec lines shown under the copy. */
  specs: { label: string; value: string }[];
  cta: string;
  /** Search query used for the range link until the backend has real wool data. */
  query: string;
};

/**
 * Editorial range cards for the scroll-stacking section. Copy and photography
 * live here so the admin/backend can replace them later without touching layout.
 */
export const YARN_STACK_CARDS: StackCardData[] = [
  {
    key: "cotton-delight",
    eyebrow: "Range 01 · Cotton",
    title: "Cotton Delight",
    copy: "Mercerised cotton with a quiet sheen — batch-matched dye lots, soft enough for baby blankets and crisp enough for amigurumi.",
    image: delightPink.url,
    imageAlt: "Skeins of pink Cotton Delight yarn",
    specs: [
      { label: "Fibre", value: "100% mercerised cotton" },
      { label: "Weight", value: "Light worsted · 3" },
      { label: "Care", value: "Hand wash, dry flat" },
    ],
    cta: "Shop Cotton Delight",
    query: "Cotton Delight",
  },
  {
    key: "cotton-candy",
    eyebrow: "Range 02 · Pastel",
    title: "Cotton Candy",
    copy: "Powder-soft pastels wound for even stitch definition. Built for nursery sets, bonnets and anything that should feel like air.",
    image: candyLilac.url,
    imageAlt: "Skeins of lilac Cotton Candy yarn",
    specs: [
      { label: "Fibre", value: "Cotton–acrylic blend" },
      { label: "Weight", value: "DK · 3" },
      { label: "Care", value: "Machine wash cold" },
    ],
    cta: "Shop Cotton Candy",
    query: "Cotton Candy",
  },
  {
    key: "hobby-india",
    eyebrow: "Range 03 · Everyday",
    title: "Hobby India",
    copy: "Hard-wearing acrylic in saturated, no-bleed shades. The workhorse skein that keeps its bloom wash after wash.",
    image: hobbyYellow.url,
    imageAlt: "Skeins of lemon Hobby India yarn",
    specs: [
      { label: "Fibre", value: "Premium acrylic" },
      { label: "Weight", value: "Worsted · 4" },
      { label: "Care", value: "Machine wash, tumble low" },
    ],
    cta: "Shop Hobby India",
    query: "Hobby India",
  },
];
