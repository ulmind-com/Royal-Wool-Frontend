import type { Review } from "@/lib/api/reviews";

/**
 * Real reviews from the Royaall Wool Google Business Profile
 * (Salkia, Howrah — 4.9★ from 153 reviews as of Aug 2026).
 *
 * Shown only while the backend has no reviews of its own; the API feed wins the
 * moment a customer review is published (see lib/api/reviews).
 *
 * Photos were downloaded from the review attachments into
 * public/assets/reviews/ so the site does not hotlink googleusercontent.
 */
export const GOOGLE_REVIEWS: Review[] = [
  {
    id: "google-sumit-banerjee",
    rating: 4,
    title: null,
    text: "Very good quality wools and very warm and gentle behaviour is there, I would suggest all of you If you have time, definitely come here, I promise you won't be disappointed.",
    photos: [
      "/assets/reviews/sumit-1.jpg",
      "/assets/reviews/sumit-2.jpg",
      "/assets/reviews/sumit-3.jpg",
      "/assets/reviews/sumit-4.jpg",
    ],
    tags: ["Google review"],
    verified: true,
    createdAt: "2026-05-06T00:00:00.000Z",
    author: "Sumit Banerjee",
    product: { id: null, title: null, image: null },
  },
  {
    id: "google-nafisa-nasim",
    rating: 5,
    title: null,
    text: "Highly recommended for yarns, best offers and absolutely amazing service",
    photos: [
      "/assets/reviews/nafisa-1.jpg",
      "/assets/reviews/nafisa-2.jpg",
      "/assets/reviews/nafisa-3.jpg",
    ],
    tags: ["Google review"],
    verified: true,
    createdAt: "2026-03-06T00:00:00.000Z",
    author: "Nafisa Nasim",
    product: { id: null, title: null, image: null },
  },
  {
    id: "google-bidisha-kundu",
    rating: 5,
    title: null,
    text: "Lots of variety available and the owner is very friendly as I am a beginner at crochetting he helped me pick the items I shall need Really happy with the experience. Definitely gonna purchase again.",
    photos: [
      "/assets/reviews/bidisha-1.jpg",
      "/assets/reviews/bidisha-2.jpg",
      "/assets/reviews/bidisha-3.jpg",
      "/assets/reviews/bidisha-4.jpg",
    ],
    tags: ["Google review"],
    verified: true,
    createdAt: "2025-08-06T00:00:00.000Z",
    author: "Bidisha Kundu",
    product: { id: null, title: null, image: null },
  },
];
