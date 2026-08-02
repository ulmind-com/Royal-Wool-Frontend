Tighten the `/collections` page vertical spacing so the left filter rail sits closer to the top of the viewport.

Changes in `src/routes/collections.index.tsx`:
- Reduce page top padding from `pt-10 sm:pt-14` to `pt-6 sm:pt-8`.
- Reduce the gap between the centered header and the two-column grid from `mt-8 lg:mt-12` to `mt-5 lg:mt-6`.
- Reduce the sticky sidebar top offset from `lg:top-24` to `lg:top-16` so it sticks higher while scrolling.
- Trim the header block bottom margin if you keep the heading visible but move the filters up.

No other layout or component changes are needed.