import babySafe from "@/assets/about/baby-safe.png.asset.json";
import colourLot from "@/assets/about/colour-lot.png.asset.json";
import dyeVat from "@/assets/about/dye-vat.png.asset.json";
import winder from "@/assets/about/winder.png.asset.json";

export type AboutValue = {
  id: string;
  icon: string;
  title: string;
  note: string;
};

/** Icon-led values shown under the About hero. */
export const ABOUT_VALUES: AboutValue[] = [
  {
    id: "dye-vat",
    icon: dyeVat.url,
    title: "Small-batch dyeing",
    note: "Every colour is dyed in short lots, so nothing is rushed through the vat.",
  },
  {
    id: "colour-lot",
    icon: colourLot.url,
    title: "Colour consistency",
    note: "Each lot is logged and swatched — skeins from one batch stay together.",
  },
  {
    id: "baby-safe",
    icon: babySafe.url,
    title: "Baby-safe dyes",
    note: "Tested, skin-friendly dyes for blankets, booties and soft toys.",
  },
  {
    id: "winder",
    icon: winder.url,
    title: "Wound for stitch definition",
    note: "Twist and ply chosen so knit and crochet stitches read clean.",
  },
];

export const ABOUT_STATS = [
  { value: "Small-batch", label: "dyed in short lots" },
  { value: "Pan-India", label: "shipped from West Bengal" },
] as const;

export const ABOUT_STORY = [
  {
    id: "what",
    title: "What we make",
    body: "Acrylic for everyday warmth, cotton for summer garments and amigurumi, and blends that sit in between. Every base is wound for stitch definition, which matters more in crochet than most sellers admit.",
  },
  {
    id: "who",
    title: "Who we make it for",
    body: "Crafters who read a gauge swatch. Parents knitting for babies who want to know what the dye is. Small businesses buying the same colour month after month.",
  },
  {
    id: "where",
    title: "Where we are",
    body: "We ship pan-India from West Bengal. Store address, phone and email on the contact page are read live from our store settings, so they are never out of date.",
  },
] as const;
