# Contact page redesign — premium liquid glass

Rebuild `/contact` in the reference layout: a centered "Contact Us" header, a wide message form on the left, and a dark liquid-glass support card on the right — but in Royal Wool's own visual language (fleece/ink/marigold/madder, display type, hairline detail), not a copy of the reference.

## Layout

```text
        Contact Us  (centered eyebrow + h1 + one line of intro)
 ┌───────────────────────────────────┬──────────────────────┐
 │ Send us a message                 │  We're always here   │
 │ First name | Last name            │  ▸ Hotline           │
 │ Email      | Phone (+91)          │  ▸ WhatsApp          │
 │ Message (textarea)                │  ▸ Email             │
 │                    [Send message] │  ▸ Store address     │
 └───────────────────────────────────┴──────────────────────┘
        Store hours / map-ish strip + social row
```

- Right card is the hero of the section: deep ink liquid glass, blurred marigold bloom behind it, each channel row its own inner glass tile with a generated icon, lifting slightly on hover.
- Form fields are light glass inputs with marigold focus rings; submit button uses the existing madder pill + sheen treatment.
- Mobile: single column, support card first (fastest path to WhatsApp), then form; large touch targets and safe-area padding.
- Motion: staggered fade/rise on scroll, respecting reduced-motion.

## Icons

Generate a small set of hand-drawn ink line-art icons matching the existing spec/assurance icon family (same style as `src/assets/spec/*`), registered as CDN asset pointers:
`hotline` (headset), `whatsapp` (chat bubble), `email` (envelope), `location` (pin), `hours` (clock).

## Dynamic data

Contact content is admin-driven, dummy values only as fallback:

- New `src/lib/api/contact.ts` — query for contact config, trying `/contact`, then `/site-content/contact`, falling back to values already in `/settings` (`shop.phone`, `shop.email`, `shop.address`), then to hardcoded demo defaults (WhatsApp 8910792214, 10am–7pm IST).
- Channels, hours, social handles and the heading/intro copy all come from that normalized object, so an admin update shows up with no code change. Icons resolve by key with a local fallback.
- Form submit posts to `/contact/messages` (alias `/contact-messages`); if the endpoint is missing or the backend is asleep, it falls back to opening a prefilled WhatsApp message so no enquiry is lost. Toast on both paths.

## Validation

Zod schema: trimmed name(s) ≤ 80, valid email ≤ 255, Indian phone digits check, message 10–1000 chars. Inline field errors, no PII logged.

## Files

- `src/routes/contact.tsx` — rebuilt page with `head()` metadata kept and self-referencing canonical/og:url.
- `src/components/contact/contact-support-card.tsx`, `contact-form.tsx`, `contact-channel-icons.ts` (new).
- `src/lib/api/contact.ts`, `src/data/contact.ts` (dummy fallback content) (new).
- `src/assets/contact/*.png.asset.json` — generated icons.
