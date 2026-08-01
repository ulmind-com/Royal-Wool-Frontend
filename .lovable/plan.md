## Goal

Spotlight-এর পরে নতুন section: **Shop by Yarn Weight** — screenshot-এর idea (weight 1–7, number badge, label), কিন্তু layout ও aesthetic আলাদা এবং premium: liquid-glass tile rail, hardcoded লাল box নয়, project-এর marigold/ink token আর `<Glass>` primitive দিয়ে।

## Layout

```text
09 · Yarn weight
Shop by Yarn Weight                        [ hook scale: 2.25 – 12 mm ]
──────────────────────────────────────────────────────────────────────
┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐
│  (1)  ││  (2)  ││  (3)  ││  (4)  ││  (5)  ││  (6)  ││  (7)  │
│ glass ││       ││       ││       ││       ││       ││       │
│ twist ││       ││       ││       ││       ││       ││       │
│S.Fine ││ Fine  ││ Light ││Medium ││ Bulky ││S.Bulky││ Jumbo │
│2.25mm ││ 3mm   ││ 4mm   ││ 5mm   ││ 7mm   ││ 9mm   ││ 12mm  │
└───────┘└───────┘└───────┘└───────┘└───────┘└───────┘└───────┘
```

- Desktop: 7-column rail; প্রতিটা tile-এ thickness bar/twist graphic — 1 সরু → 7 মোটা (এটাই screenshot থেকে মূল differentiator)।
- Tablet: 4 columns; mobile: horizontal snap-scroll rail with edge fade (কিছু কাটা যাবে না)।
- Hover: liquid-glass sheen sweep + tile lift + marigold glow, badge number scale-up; scroll-এ staggered fade-up, `useReducedMotion` respect।

## Files

1. `src/data/yarn-weights.ts` — ৭টা entry: `{ id, weight, name, hookMm, wpi, note, query }`. পুরোপুরি data-driven, পরে admin/API থেকে feed করা সহজ।
2. `src/components/commerce/yarn-weight-rail.tsx` — section + `WeightTile`; `<Glass variant="panel">` reuse, inline SVG twist/thickness graphic, click → `/search?q=<weight name>`.
3. `src/routes/index.tsx` — `<SpotlightSection />`-এর পরে `<YarnWeightRail />`; existing stub গুলো যেমন আছে থাকবে।

## Notes

- ছবি generate করব না — number badge + procedural twist graphic দিয়েই art হবে, তাই সব weight-এ consistent আর fast load।
- সব color semantic token (`--marigold`, `--ink`, `card`, `border`) — hardcoded hex নেই, light theme-এ মিলে যাবে।
- নতুন dependency লাগবে না (framer-motion, lucide-react আছে)।
