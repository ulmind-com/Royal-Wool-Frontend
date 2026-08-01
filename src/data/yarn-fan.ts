import candyBlack from "@/assets/yarn/candy-black.jpg.asset.json";
import candyBlue from "@/assets/yarn/candy-blue.jpg.asset.json";
import candyLilac from "@/assets/yarn/candy-lilac.jpg.asset.json";
import delightCoral from "@/assets/yarn/delight-coral.jpg.asset.json";
import delightPink from "@/assets/yarn/delight-pink.jpg.asset.json";
import delightRust from "@/assets/yarn/delight-rust.jpg.asset.json";
import hobbyGreen from "@/assets/yarn/hobby-green.jpg.asset.json";
import hobbyRed from "@/assets/yarn/hobby-red.jpg.asset.json";
import hobbyYellow from "@/assets/yarn/hobby-yellow.jpg.asset.json";

export type FanCardData = {
  key: string;
  image: string;
  /** Small uppercase pill label at the top of the card. */
  label: string;
  title: string;
  caption: string;
};

/**
 * Client-supplied yarn photography for the fanned lookbook carousel, used until
 * the backend catalogue returns real wool products with images.
 */
export const YARN_FAN_FALLBACKS: FanCardData[] = [
  {
    key: "delight-pink",
    image: delightPink.url,
    label: "Cotton",
    title: "Cotton Delight · Pink",
    caption: "Mercerised sheen, soft enough for baby blankets.",
  },
  {
    key: "candy-blue",
    image: candyBlue.url,
    label: "Pastel",
    title: "Cotton Candy · Sky",
    caption: "Airy pastel blue, wound for even stitch definition.",
  },
  {
    key: "hobby-yellow",
    image: hobbyYellow.url,
    label: "Everyday",
    title: "Hobby India · Lemon",
    caption: "Bright, hard-wearing acrylic for daily projects.",
  },
  {
    key: "delight-rust",
    image: delightRust.url,
    label: "Deep",
    title: "Cotton Delight · Rust",
    caption: "Earthen depth from a small, batch-matched dye lot.",
  },
  {
    key: "candy-lilac",
    image: candyLilac.url,
    label: "Pastel",
    title: "Cotton Candy · Lilac",
    caption: "Powder lilac with a whisper of warmth.",
  },
  {
    key: "hobby-green",
    image: hobbyGreen.url,
    label: "Everyday",
    title: "Hobby India · Mint",
    caption: "Fresh mint acrylic that keeps its bloom after washing.",
  },
  {
    key: "delight-coral",
    image: delightCoral.url,
    label: "Cotton",
    title: "Cotton Delight · Coral",
    caption: "Sun-warmed coral for amigurumi and summer tops.",
  },
  {
    key: "hobby-red",
    image: hobbyRed.url,
    label: "Everyday",
    title: "Hobby India · Red",
    caption: "A true, saturated red with no bleed.",
  },
  {
    key: "candy-black",
    image: candyBlack.url,
    label: "Classic",
    title: "Cotton Candy · Onyx",
    caption: "Deep onyx that frames every other shade.",
  },
];
