import candyBlack from "@/assets/yarn-cutout/candy-black.png.asset.json";
import candyBlue from "@/assets/yarn-cutout/candy-blue.png.asset.json";
import candyLilac from "@/assets/yarn-cutout/candy-lilac.png.asset.json";
import delightCoral from "@/assets/yarn-cutout/delight-coral.png.asset.json";
import delightPink from "@/assets/yarn-cutout/delight-pink.png.asset.json";
import delightRust from "@/assets/yarn-cutout/delight-rust.png.asset.json";
import hobbyGreen from "@/assets/yarn-cutout/hobby-green.png.asset.json";
import hobbyRed from "@/assets/yarn-cutout/hobby-red.png.asset.json";
import hobbyYellow from "@/assets/yarn-cutout/hobby-yellow.png.asset.json";

export type FeaturedYarnItem = {
  key: string;
  /** Background-removed PNG cutout, so the skein floats on the page. */
  image: string;
  name: string;
  /** Selling price in INR. */
  price: number;
  /** Optional MRP for the strikethrough. */
  mrp?: number;
  /** Accent used for the dye-glow behind the skein. */
  glow: string;
  href: string;
};

/**
 * Featured yarn fallback.
 *
 * Resolution order used by <FeaturedYarn />:
 *   1. GET /products?sort=popular  (admin-managed catalogue — name, price, image)
 *   2. this constant
 *
 * The backend catalogue still holds the old clothing products, so PREFER_LOCAL
 * in the component keeps these client-supplied cutouts on screen. Flip it off
 * once real wool products exist and everything becomes admin-controlled.
 */
export const FEATURED_YARN_FALLBACK: FeaturedYarnItem[] = [
  {
    key: "delight-pink",
    image: delightPink.url,
    name: "Cotton Delight · Pink",
    price: 249,
    mrp: 299,
    glow: "#E4568C",
    href: "/collections",
  },
  {
    key: "candy-blue",
    image: candyBlue.url,
    name: "Cotton Candy · Sky",
    price: 229,
    glow: "#6FC5E8",
    href: "/collections",
  },
  {
    key: "hobby-yellow",
    image: hobbyYellow.url,
    name: "Hobby India · Lemon",
    price: 179,
    mrp: 219,
    glow: "#E9C94A",
    href: "/collections",
  },
  {
    key: "delight-rust",
    image: delightRust.url,
    name: "Cotton Delight · Rust",
    price: 249,
    glow: "#B4482A",
    href: "/collections",
  },
  {
    key: "candy-lilac",
    image: candyLilac.url,
    name: "Cotton Candy · Lilac",
    price: 229,
    mrp: 269,
    glow: "#B69AE0",
    href: "/collections",
  },
  {
    key: "hobby-green",
    image: hobbyGreen.url,
    name: "Hobby India · Mint",
    price: 179,
    glow: "#8FD07A",
    href: "/collections",
  },
  {
    key: "delight-coral",
    image: delightCoral.url,
    name: "Cotton Delight · Coral",
    price: 249,
    glow: "#E86A5A",
    href: "/collections",
  },
  {
    key: "hobby-red",
    image: hobbyRed.url,
    name: "Hobby India · Red",
    price: 179,
    mrp: 209,
    glow: "#C6402E",
    href: "/collections",
  },
  {
    key: "candy-black",
    image: candyBlack.url,
    name: "Cotton Candy · Onyx",
    price: 229,
    glow: "#3A3340",
    href: "/collections",
  },
];
