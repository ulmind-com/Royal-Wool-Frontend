# Remove the "Details" block from the product page

## Goal
Hide the product description "Details" section on `/product/$id` while keeping everything else (spec tiles, assurance band, manufacturer/wash care/returns accordions, and the colour note) intact.

## Current state
`src/routes/product.$id.tsx` renders the description inside a conditional block at lines 295-300:

```tsx
{product.description ? (
  <div className="mt-10">
    <p className="font-data text-2xs uppercase tracking-[0.16em] text-marigold">Details</p>
    <p className="mt-3 whitespace-pre-line text-muted-foreground">{product.description}</p>
  </div>
) : null}
```

This is the block the user wants removed.

## Change
Delete lines 295-300 from `src/routes/product.$id.tsx`. The surrounding spacing and remaining sections stay untouched.

## Verification
- Build the project and confirm no TypeScript/JSX errors.
- Open a product page in the preview and confirm the "Details" heading and description no longer appear.
- Confirm spec tiles, assurance band, and accordions still render in the same order.