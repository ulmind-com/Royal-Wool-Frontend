## Goal
"New arrivals" CircularGallery টা যেমন আছে তেমনই থাকবে — শুধু কয়েক সেকেন্ড পরপর নিজে থেকে একটা করে item বাঁ দিকে বেরিয়ে যাবে আর ডান দিক থেকে একটা করে ঢুকবে, premium slow feel নিয়ে।

## Changes

### 1. `src/components/commerce/circular-gallery.tsx`
- নতুন optional props: `autoplay?: boolean` (default true) আর `autoplayDelay?: number` (default ~3500ms).
- App class-এ একটা autoplay timer: প্রতি delay-তে `scroll.target -= itemWidth` (এক item ডান দিক থেকে ঢোকা = বাঁ দিকে এক ধাপ move), তারপর existing `onCheck()` snap logic-ই position ঠিক রাখবে। ইতিমধ্যেই infinite wrap আছে (`extra` offset), তাই loop seamless থাকবে।
- Pause/resume:
  - pointer down / drag / wheel / arrow key হলে autoplay pause, interaction শেষ হওয়ার ~2.5s পরে আবার resume।
  - container hover-এ pause (mouseenter/mouseleave)।
  - tab hidden (`visibilitychange`) হলে timer বন্ধ, ফিরলে আবার চালু — background-এ CPU নষ্ট হবে না।
- `destroy()`-এ timer + নতুন listener গুলো clear।
- Reduced motion: `prefers-reduced-motion` থাকলে autoplay একেবারেই চালু হবে না।
- Smoothness: autoplay চলার সময় ease একটু slow (premium glide) রাখা হবে, manual scroll-এ আগের ease-ই থাকবে।

### 2. `src/components/commerce/new-arrivals-gallery.tsx`
- `<CircularGallery>`-এ `autoplay` আর `autoplayDelay={3500}` pass করা। বাকি layout/props (bend, scrollEase, items, onItemClick) অপরিবর্তিত।

## Not changing
Design, spacing, images, data flow, click-to-product navigation — সব যেমন আছে তেমনই।

## Verify
Playwright দিয়ে ~8s অপেক্ষা করে দুটো screenshot নিয়ে দেখা হবে যে item গুলো নিজে থেকে এক ধাপ এক ধাপ সরছে, hover-এ থামছে, click করলে product page খুলছে, console error নেই।
