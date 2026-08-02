Two quick layout refinements on `/collections` based on the latest screenshot and feedback.

1. **Heading smaller + single-line**
   - In `src/routes/collections.index.tsx`, reduce the active-brand heading from `text-2xl sm:text-4xl` to `text-xl sm:text-3xl`.
   - Add `whitespace-nowrap` and `truncate` so long brand names like "Ganga Acrowools Knitting Yarn" stay on one line and ellipsize if needed.
   - Keep the header block centered.

2. **Raise the left filter rail even higher**
   - Reduce page top padding from `pt-6 sm:pt-8` to `pt-4 sm:pt-5`.
   - Reduce the gap between header and grid from `mt-5 lg:mt-6` to `mt-4 lg:mt-5`.
   - Reduce sticky sidebar top offset from `lg:top-16` to `lg:top-14`.
   - Trim header bottom margin if needed so the sidebar starts closer to the viewport top.

No component or logic changes beyond these spacing/typography tweaks.