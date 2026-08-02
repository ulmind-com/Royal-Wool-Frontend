import candyBlack from "@/assets/yarn/candy-black.jpg.asset.json";
import candyBlue from "@/assets/yarn/candy-blue.jpg.asset.json";
import candyLilac from "@/assets/yarn/candy-lilac.jpg.asset.json";
import delightCoral from "@/assets/yarn/delight-coral.jpg.asset.json";
import delightPink from "@/assets/yarn/delight-pink.jpg.asset.json";
import delightRust from "@/assets/yarn/delight-rust.jpg.asset.json";
import hobbyGreen from "@/assets/yarn/hobby-green.jpg.asset.json";
import hobbyRed from "@/assets/yarn/hobby-red.jpg.asset.json";
import hobbyYellow from "@/assets/yarn/hobby-yellow.jpg.asset.json";
import type { Review } from "@/lib/api/reviews";

/**
 * Placeholder review feed shown ONLY while the backend has zero reviews, so the
 * homepage section can be designed and demoed. The moment a real review exists
 * the API feed wins and none of this is used (see lib/api/reviews).
 */

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export const DEMO_REVIEWS: Review[] = [
  {
    id: "demo-1",
    rating: 5,
    title: "Softest cotton I've worked with",
    text: "Ordered six skeins of Cotton Delight in pink for a baby blanket and the gauge stayed perfectly consistent across every ball. No splitting, no knots, and the colour is exactly what the photos showed. My hook glides through it.",
    photos: [delightPink.url, delightCoral.url],
    tags: ["Baby blanket", "Crochet"],
    verified: true,
    createdAt: daysAgo(2),
    author: "Ananya Sen",
    product: { id: null, title: "Cotton Delight · Pink", image: delightPink.url },
  },
  {
    id: "demo-2",
    rating: 5,
    title: null,
    text: "Dye lot matched perfectly. Ten out of ten.",
    photos: [],
    tags: [],
    verified: true,
    createdAt: daysAgo(5),
    author: "Rhea Kapoor",
    product: { id: null, title: "Hobby India · Lemon", image: hobbyYellow.url },
  },
  {
    id: "demo-3",
    rating: 4,
    title: "Great yarn, delivery took a day extra",
    text: "The Cotton Candy lilac is gorgeous under daylight — much richer than a screen can show. Knitted a summer top on 3.5mm and the drape is lovely. Only reason for four stars is the courier was a day late.",
    photos: [candyLilac.url],
    tags: ["Knitting"],
    verified: true,
    createdAt: daysAgo(9),
    author: "Meghna Iyer",
    product: { id: null, title: "Cotton Candy · Lilac", image: candyLilac.url },
  },
  {
    id: "demo-4",
    rating: 5,
    title: "My students love it",
    text: "I run a small crochet class in Howrah and switched the whole batch to Royal Wool. Beginners find it easy to see their stitches and nobody has complained about itchiness — even the kids.",
    photos: [hobbyRed.url, hobbyGreen.url, hobbyYellow.url],
    tags: ["Workshop", "Beginner friendly"],
    verified: true,
    createdAt: daysAgo(14),
    author: "Sourav Das",
    product: { id: null, title: "Hobby India · Red", image: hobbyRed.url },
  },
  {
    id: "demo-5",
    rating: 5,
    title: null,
    text: "Second order already. The rust shade is a proper deep terracotta, not orange. Amigurumi stitches hold their shape beautifully.",
    photos: [delightRust.url],
    tags: ["Amigurumi"],
    verified: true,
    createdAt: daysAgo(21),
    author: "Priyanka Roy",
    product: { id: null, title: "Cotton Delight · Rust", image: delightRust.url },
  },
  {
    id: "demo-6",
    rating: 4,
    title: null,
    text: "Good value for the yardage. Wish the label had a washing symbol printed on it.",
    photos: [],
    tags: [],
    verified: true,
    createdAt: daysAgo(27),
    author: "Nisha Verma",
    product: { id: null, title: "Cotton Candy · Sky", image: candyBlue.url },
  },
  {
    id: "demo-7",
    rating: 5,
    title: "Onyx is a true black",
    text: "Most black cottons come out charcoal in photos. This one photographs like proper black, which matters a lot for the pieces I sell. Zero dye bleed on the first wash.",
    photos: [candyBlack.url],
    tags: ["Small business"],
    verified: true,
    createdAt: daysAgo(38),
    author: "Farhan Ahmed",
    product: { id: null, title: "Cotton Candy · Onyx", image: candyBlack.url },
  },
  {
    id: "demo-8",
    rating: 5,
    title: null,
    text: "Packed really well, reached Bengaluru in three days. Mint green is my new favourite.",
    photos: [hobbyGreen.url],
    tags: [],
    verified: true,
    createdAt: daysAgo(52),
    author: "Lakshmi Nair",
    product: { id: null, title: "Hobby India · Mint", image: hobbyGreen.url },
  },
  {
    id: "demo-9",
    rating: 3,
    title: "Lovely yarn, one ball had a knot",
    text: "Eight out of nine balls were flawless. One had a join midway which broke my colour run. Support replaced it without arguing, so I'd still order again.",
    photos: [],
    tags: [],
    verified: true,
    createdAt: daysAgo(64),
    author: "Debjani Mitra",
    product: { id: null, title: "Cotton Delight · Coral", image: delightCoral.url },
  },
  {
    id: "demo-10",
    rating: 5,
    title: null,
    text: "Bought for my mother who has sensitive skin — she has been wearing the shawl daily with no irritation at all. That alone earns five stars from me.",
    photos: [],
    tags: ["Gift"],
    verified: true,
    createdAt: daysAgo(80),
    author: "Aditya Bose",
    product: { id: null, title: "Aroma Cotton · Natural", image: delightPink.url },
  },
];
