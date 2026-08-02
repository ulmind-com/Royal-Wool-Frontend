## Goal
Replace the current header navigation with the exact list the client asked for:
**Home | Shop | Categories | About Us | Blog | Contact | My Account | Cart**

## Current state (verified)
- `src/components/layout/header.tsx` renders:
  - Left: hamburger + Royal Wool wordmark (links to `/`)
  - Center desktop nav: backend category mega-menu + `Upcoming` + `Offers`
  - Right: Search, Wishlist, Notifications, Account, Cart icons
- Existing routes: `/`, `/about`, `/contact`, `/cart`, `/account/*`, `/collections/*`, `/upcoming`, `/offers`, etc.
- **Missing route:** `/blog` does not exist yet.
- **Missing route/label:** There is no explicit "Shop" link (closest is `/collections`).

## Plan

### 1. Add a Blog route
Create `src/routes/blog.tsx` so the nav link has a real destination.
- Keep it lightweight: page shell, hero heading "From the Dye House", and a short "Coming soon" / placeholder grid.
- Add `head()` with title, description, og tags.
- TanStack Router will auto-register the route on next dev run.

### 2. Update desktop center nav (`src/components/layout/header.tsx`)
Replace the current category-driven mega-menu + Upcoming/Offers with a clean, explicit list:
1. **Home** → `/`
2. **Shop** → `/collections`
3. **Categories** → keep the backend-driven mega-menu (hover panel with category tree), but the trigger label becomes "Categories"
4. **About Us** → `/about`
5. **Blog** → `/blog`
6. **Contact** → `/contact`

Styling:
- Use the existing pill link style (`rounded-full px-4 py-2 font-data text-2xs`).
- Active link gets `text-foreground` / `font-medium`; inactive gets `text-muted-foreground`.
- Keep the existing Liquid Glass mega-menu panel for Categories.
- Remove `Upcoming` and `Offers` from the desktop center nav.

### 3. Update right-side icon cluster
Keep only:
- Search icon (existing)
- **My Account** → `/account` (User icon)
- **Cart** → `/cart` (ShoppingBag icon + badge)

Remove or hide from the icon cluster:
- Wishlist and Notifications icons (they are still reachable via `/account/*` and can be added back later if the client asks).

This keeps the requested nav items while decluttering the top bar.

### 4. Update mobile drawer
Rewrite the mobile drawer contents to mirror the requested nav:
- Home
- Shop
- Categories (expandable accordion showing backend category tree)
- About Us
- Blog
- Contact
- My Account
- Cart

Remove the current category-only list + Upcoming/Offers/Wishlist/Alerts grid, or move them lower as secondary links if desired. Per the client’s list, the primary drawer items should be the 8 requested links.

### 5. Active states
Use `activeProps` / `data-status="active"` on TanStack `<Link>` for Home, Shop, About Us, Blog, Contact, My Account, Cart so users can see where they are.

### 6. Verification
- Run `bun run build` or `tsgo` to confirm no type errors after route changes.
- Check desktop and mobile previews to ensure:
  - All 8 labels are visible
  - Categories mega-menu still opens on hover
  - Mobile drawer is scrollable and links close the drawer on tap
  - No horizontal overflow on small screens

## Files to change
- `src/components/layout/header.tsx` (desktop nav, right icons, mobile drawer)
- `src/routes/blog.tsx` (new)

## Out of scope
- Backend integration for blog posts (will be a placeholder page; client can wire CMS later).
- Footer changes unless requested.
- Renaming existing `/about` route to `/about-us` (we will label it "About Us" in the nav while keeping the URL `/about`).