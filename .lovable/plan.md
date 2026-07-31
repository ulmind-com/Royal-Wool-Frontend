## Goal

Replace the placeholder "Upcoming products" block on the home page with a real, category-wise section showing the client's six ranges, each with a WhatsApp "Notify me" CTA on +91 89107 92214. Frontend only — no backend changes.

## What gets built

**1. Shared upcoming-ranges card component** (`src/components/commerce/upcoming-rail.tsx`)
- Reuses the existing glass card treatment already proven on `/upcoming`: colour-swatch dots, gradient yarn-ball disc, range name, blurb, WhatsApp notify button.
- Grouped **category-wise** using the data the client sent:
  - **Acrylic** — Acrylic Rainbow, MultiTone Acrylic, Exclusive Acrylic
  - **Cotton** — CloudCotton, Aroma Cotton, TwistTone Cotton
- On the home page it renders as a horizontal snap rail (matching the product rails), with a "View all" link to `/upcoming`.

**2. Home page** (`src/routes/index.tsx`)
- Swap the `SectionStub anchor="upcoming"` for the real section: eyebrow "04 · Upcoming products", heading, six cards, "View all upcoming" link.
- Everything below (story, lookbook, offers, recs) stays as-is.

**3. Upcoming page** (`src/routes/upcoming.tsx`)
- Regroup the existing grid under the same two category headings (Acrylic / Cotton) so both surfaces match.
- Drop the "In Phase 7 this becomes…" internal note from the customer-facing copy.

**4. Data** (`src/data/upcoming.ts`)
- Add a `category: "Acrylic" | "Cotton"` field to each of the six existing entries. Names, blurbs and palettes stay unchanged, so the swap to live API data later is still a one-liner.

**5. WhatsApp**
- Number is already wired as `918910792214` in `src/lib/whatsapp.ts` — confirmed correct, no change needed. Each card's CTA sends a prefilled "notify me when <range> is available" message; the floating WhatsApp button and footer link already use the same number.

## Technical notes

- Card markup extracted from `upcoming.tsx` into one component so home rail and full page never drift.
- Category grouping is derived in the component from the `category` field, so when the backend later returns an "Upcoming" category tree the grouping logic carries over untouched.
- Uses existing semantic light-mode tokens and the `Glass` primitive — no new colours or CSS.
- `/upcoming` head metadata already lists all six ranges; no SEO change needed beyond removing the phase note from body copy.
