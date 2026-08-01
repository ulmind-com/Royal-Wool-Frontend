## Goal

"Shop by Category" section-এ এখন backend-এর পুরনো clothing category (Mens/Womens…) দেখাচ্ছে। এখন থেকে frontend-এ wool-এর নিজের ৪টা category হার্ডকোড করা হবে — তোর দেওয়া ৪টা wool ছবি সহ। পরে backend ready হলে এক লাইনে API-তে ফিরিয়ে দেওয়া যাবে।

## ৪টি wool category (ছবি অনুযায়ী)

| Image | Category name | Subtext |
|---|---|---|
| yarn-pink.jpg | Cotton Delight | Soft cotton · 8 ply |
| yarn-rust.jpg | Acrylic Rainbow | Multi-tone acrylic |
| yarn-coral.jpg | Aroma Cotton | Skin-friendly cotton |
| yarn-yellow.jpg | Hobby India | Everyday knitting wool |

নাম/subtext পছন্দ না হলে বলে দিলে বদলে দেব — এগুলো এক জায়গায় একটা list-এ থাকবে, বদলানো সহজ।

## Changes

1. `src/data/wool-categories.ts` (new) — ৪টা entry: `name`, `slug`, `image`, `blurb`, `order`. একটাই source of truth।
2. `src/components/commerce/category-showcase.tsx`
   - API query (`categoryTreeQuery`)-এর উপর নির্ভরতা এই section থেকে সরানো; static list রেন্ডার হবে (loading/error state আর লাগবে না, তাই section সাথে সাথেই দেখাবে)।
   - বর্তমান premium tile design (dye glow, hover lift, arrow badge, underline, staggered fade-up) অপরিবর্তিত থাকবে।
   - উপরে স্পষ্ট comment: backend-এ আসল wool category seed হলে `USE_STATIC_CATEGORIES = false` করলেই `/categories/tree` আবার নিয়ন্ত্রণ নেবে (API branch কোডে রাখা হবে, মুছবে না)।
3. Click behaviour — tile → `/collections/$slug`; backend-এ ওই slug না থাকলে সেই পেজ খালি দেখাবে, তাই আপাতত প্রতিটা tile-এর link যাবে `/search?q=<category name>`-এ, যেন এখনই relevant product দেখায়। Backend ready হলে static branch off করলেই আবার asol collection page-এ যাবে।

## Notes

- ছবিগুলো ইতিমধ্যে `public/assets/categories/` (pink, rust, coral, yellow) আছে, নতুন upload লাগবে না।
- অন্য কোনো section (hero, trust band, upcoming, rails) ছোঁয়া হবে না।
