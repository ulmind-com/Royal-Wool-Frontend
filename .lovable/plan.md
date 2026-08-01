## Goal

Home page-এ New Arrivals-এর পরে একটা নতুন "Spotlight" section — বাঁ দিকে 3D tilt card (তোর দেওয়া component), ডান দিকে screenshot-এর মতো editorial copy (eyebrow, দুই লাইনের headline, description, spec row, "Learn more →" link)।

## Layout

```text
┌──────────────────────────┬──────────────────────────────┐
│  [3D tilt card]          │  SPOTLIGHT · COTTON DELIGHT  │
│   yarn image             │  Spun for softness.          │
│   title + subtitle       │  Made to last.               │
│   ↗ link (top-right)     │  ───                         │
│   [Shop the range] btn   │  short paragraph             │
│                          │  COMPOSITION | GAUGE | CARE  │
│                          │  LEARN MORE  →               │
└──────────────────────────┴──────────────────────────────┘
```
Mobile-এ card উপরে, copy নিচে।

## What gets built

1. `src/components/ui/3d-card.tsx` — তোর দেওয়া `InteractiveTravelCard` component, framer-motion tilt logic হুবহু রেখে, কিন্তু JSX-টা সম্পূর্ণ করে লেখা হবে (তোর paste-এ markup গুলো ফাঁকা এসেছে)। হার্ডকোড করা color নয় — project-এর semantic token ব্যবহার করব, তাই light theme-এর সাথে মিলে যাবে। `prefers-reduced-motion` হলে tilt বন্ধ।
2. `src/components/commerce/spotlight-section.tsx` — section wrapper: card + editorial column, স্ক্রলে staggered fade-up, existing section rhythm (`max-w-[1600px]`, eyebrow font-data, font-display headline) অনুযায়ী।
3. `src/routes/index.tsx` — `<NewArrivalsGallery />`-এর পরে `<SpotlightSection />` বসবে, একটা SectionStub সরে যাবে না (শুধু নতুন section যোগ হচ্ছে)।

## Content & image

- ছবি: existing yarn asset `src/assets/yarn/delight-pink.jpg.asset.json` (তোর আগে দেওয়া Cotton Delight ছবি)। চাইলে পরে বদলানো যাবে।
- Copy: Cotton Delight-কে spotlight করে premium wording; card link + button যাবে `/search?q=Cotton%20Delight`।
- Text/image/link সব component prop হিসেবে, তাই পরে admin/API থেকে feed করা সহজ হবে।

## Dependencies

`framer-motion` আর `lucide-react` আগেই install করা আছে — নতুন কিছু লাগবে না।
