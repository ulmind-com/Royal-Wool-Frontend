import candyBlack from "@/assets/yarn/candy-black.jpg.asset.json";
import candyBlue from "@/assets/yarn/candy-blue.jpg.asset.json";
import candyLilac from "@/assets/yarn/candy-lilac.jpg.asset.json";
import delightCoral from "@/assets/yarn/delight-coral.jpg.asset.json";
import delightPink from "@/assets/yarn/delight-pink.jpg.asset.json";
import delightRust from "@/assets/yarn/delight-rust.jpg.asset.json";
import hobbyGreen from "@/assets/yarn/hobby-green.jpg.asset.json";
import hobbyRed from "@/assets/yarn/hobby-red.jpg.asset.json";
import hobbyYellow from "@/assets/yarn/hobby-yellow.jpg.asset.json";

/**
 * Client-supplied yarn photography used by the New Arrivals gallery until the
 * backend catalogue holds real wool products with images.
 */
export const NEW_ARRIVAL_FALLBACKS: { image: string; text: string }[] = [
  { image: delightPink.url, text: "Cotton Delight · Pink" },
  { image: candyBlue.url, text: "Cotton Candy · Sky" },
  { image: hobbyYellow.url, text: "Hobby India · Lemon" },
  { image: delightRust.url, text: "Cotton Delight · Rust" },
  { image: candyLilac.url, text: "Cotton Candy · Lilac" },
  { image: hobbyGreen.url, text: "Hobby India · Mint" },
  { image: delightCoral.url, text: "Cotton Delight · Coral" },
  { image: hobbyRed.url, text: "Hobby India · Red" },
  { image: candyBlack.url, text: "Cotton Candy · Onyx" },
];
