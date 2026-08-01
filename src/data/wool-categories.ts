/**
 * Static wool categories for the home "Shop by Category" section.
 *
 * The backend still holds the old clothing categories, so the storefront shows
 * these hand-written wool ranges for now. Once real wool categories are seeded
 * from the admin panel, set USE_STATIC_CATEGORIES to false in
 * src/components/commerce/category-showcase.tsx and /categories/tree takes over.
 */

export type WoolCategory = {
  name: string;
  slug: string;
  image: string;
  blurb: string;
};

export const WOOL_CATEGORIES: WoolCategory[] = [
  {
    name: "Cotton Delight",
    slug: "cotton-delight",
    image: "/assets/categories/yarn-pink.jpg",
    blurb: "Soft mercerised cotton · 8 ply",
  },
  {
    name: "Cotton Delight Deep",
    slug: "cotton-delight-deep",
    image: "/assets/categories/yarn-rust.jpg",
    blurb: "Rich rust & earth shades",
  },
  {
    name: "Cotton Delight Pastel",
    slug: "cotton-delight-pastel",
    image: "/assets/categories/yarn-coral.jpg",
    blurb: "Coral & soft pastel shades",
  },
  {
    name: "Hobby India",
    slug: "hobby-india",
    image: "/assets/categories/yarn-yellow.jpg",
    blurb: "Everyday knitting wool",
  },
];

