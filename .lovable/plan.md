## Goal

Shade deck-এর ঠিক উপরে একটা নতুন section — reference-এর মতো stacked card animation, cards ডান থেকে বাঁয়ে এসে stack-এ বসে। উঁচু হবে না, দু'পাশে হালকা ফাঁকা থাকবে।

## Section: "Straight off the winder" (stacked shade strip)

New component `src/components/commerce/yarn-stack-scroll.tsx`:

- Layout: centered container, `max-w-[1100px]` with side padding so left/right breathing room থাকে; total height compact (~`clamp(300px, 44vh, 420px)`).
- Stack: 4–5 cards absolutely positioned, তিনটে পেছনের card উপরে সামান্য offset + scale-down + dim (reference-এর paper-stack look), সামনের card sharp with rounded-[1.75rem] + soft shadow.
- Motion (Framer Motion): প্রতি ~3.2s এ front card বাঁয়ে slide out + fade, বাকিরা এক ধাপ এগিয়ে আসে; নতুন card ডান দিক থেকে ঢোকে। Spring transition, `useReducedMotion` respect করবে, tab hidden হলে pause, mouse hover-এ pause; drag/swipe দিয়ে manual advance।
- Content: `YARN_FAN_FALLBACKS`-এর ছবি (আগেই আপলোড করা yarn images) reuse; front card-এ ছোট glass pill label + shade name, বাকিতে শুধু image। Card click করলে product page (live catalogue থাকলে `/product/$id`, না হলে `/collections`), shade deck-এর মতোই একই logic।
- Left column-এ ছোট eyebrow + heading + one-line copy, right-এ stack — বা reference-এর মতো heading উপরে, stack নিচে; compact রাখার জন্য heading উপরে থাকবে।

## Wiring

`src/routes/index.tsx`: `<YarnStackScroll />` `<YarnFanCarousel />`-এর ঠিক আগে বসবে; কোনো existing section সরানো হবে না।

## Technical notes

- Design tokens only (marigold, ink, fleece, border) — কোনো hardcoded color না।
- Images already Lovable Assets pointers, নতুন upload দরকার নেই।
- Verify with Playwright screenshot + console check.
