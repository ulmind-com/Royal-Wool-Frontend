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
    blurb: "Soft cotton · 8 ply",
  },
  {
    name: "Acrylic Rainbow",
    slug: "acrylic-rainbow",
    image: "/assets/categories/yarn-rust.jpg",
    blurb: "Multi-tone acrylic",
  },
  {
    name: "Aroma Cotton",
    slug: "aroma-cotton",
    image: "/assets/categories/yarn-coral.jpg",
    blurb: "Skin-friendly cotton",
  },
  {
    name: "Hobby India",
    slug: "hobby-india",
    image: "/assets/categories/yarn-yellow.jpg",
    blurb: "Everyday knitting wool",
  },
];
