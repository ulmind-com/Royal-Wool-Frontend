## Goal

`YarnStackScroll` (auto-sliding stack) সরিয়ে ulmind.com-এর মতো **scroll-driven stacking cards** বসবে — scroll করলে একটা card উপরে stick হয়ে থাকে, opacity + scale কমতে থাকে, আর পরের card তার উপরে উঠে আসে। প্রতিটা card-এ **left-এ image, right-এ লেখা + button**। কোনো partnership form / reCAPTCHA / formsubmit থাকবে না।

## যা সরবে

- `src/components/commerce/yarn-stack-scroll.tsx` — delete।
- `src/routes/index.tsx` থেকে `YarnStackScroll` import + usage বাদ। বাকি সব section অপরিবর্তিত।

## নতুন: `src/components/commerce/yarn-stack-cards.tsx`

Framer Motion `useScroll` + `useSpring` + `useTransform`, ঠিক তোমার দেওয়া pattern-এ:

```text
<section ref={containerRef} class="relative h-[300vh]">
  card 1  →  sticky top-0, h-screen-ish, opacity [0 → .33] 1→0, scale 1→0.9
  card 2  →  sticky, opacity [.33 → .66] 1→0, scale 1→0.9
  card 3  →  sticky, কোনো fade নেই (শেষ card)
</section>
```

- `offset: ["start start", "end start"]`, spring `{stiffness:30, damping:40, restDelta:0.001}` — তোমার কোডের value-ই।
- Sticky wrapper `min-h-svh` না নিয়ে compact রাখব: `h-[clamp(460px,78vh,620px)]` card + `items-center`, যাতে section অতিরিক্ত লম্বা না লাগে; দু'পাশে `max-w-[1200px]` + padding দিয়ে breathing room।
- Reduced motion / touch: `useReducedMotion` true হলে stacking transform বন্ধ, cards সাধারণ vertical stack হয়ে যাবে (`h-auto`, sticky off) — mobile-এও একই fallback, কারণ ছোট screen-এ sticky stack ভাঙে।

### Card layout (per card)

- Grid `lg:grid-cols-2`, rounded-[2rem], border + soft shadow, background `card` token; একটা হালকা marigold/madder dye-glow radial ভিতরে।
- **Left:** yarn image (`YARN_FAN_FALLBACKS` থেকে, `object-cover`, rounded, subtle hover zoom + specular sheen)।
- **Right:** `font-data` eyebrow pill (Glass primitive, liquid-glass look), `font-display` heading, 2-line copy, ছোট feature list (3 bullet: fibre / weight / care), আর একটা primary CTA button (`Shop the range` → `/collections`, বা live product থাকলে `/product/$id`) + secondary text link।
- Content 3টা card-এ: Cotton Delight (cotton range), Cotton Candy (pastel range), Hobby India (everyday acrylic) — image + copy `src/data/yarn-stack.ts`-এ নতুন const array হিসেবে থাকবে, তাই পরে backend/admin দিয়ে বদলানো সহজ।

## Wiring

`src/routes/index.tsx`-এ ঠিক আগের জায়গায় (`<YarnFanCarousel />`-এর উপরে) `<YarnStackCards />` বসবে।

## Technical notes

- Colour শুধু design token (marigold, madder, ink, fleece, border) — কোনো hardcoded hex/`text-white` না।
- `sticky` parent-এ `overflow-hidden` দেওয়া হবে না (নাহলে sticky ভাঙে); Lenis smooth scroll-এর সাথে `useScroll` কাজ করে, verify করব।
- Verification: Playwright দিয়ে তিনটে scroll position-এ screenshot + console check।
