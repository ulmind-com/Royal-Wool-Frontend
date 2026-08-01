## Goal

Home page-এর "New Arrivals" rail-টা সরিয়ে সেখানে React Bits-এর **CircularGallery** (WebGL, `ogl`) বসানো — তোর দেওয়া yarn ছবিগুলো দিয়ে, প্রতিটা tile dynamic ও click করলে সেই product-এর page খুলবে।

## What gets built

1. **Dependency**: `ogl` install।

2. **Component**: `src/components/commerce/circular-gallery.tsx` — React Bits-এর source, project-এর জন্য adapted:
   - TypeScript + typed props (`items: { image, text, href? }[]`)
   - CSS inline/Tailwind-এ (আলাদা `.css` file না, Tailwind v4 setup-এর সাথে মেলাতে)
   - **Click → product page**: pointer-down/up-এর distance ছোট হলে (drag নয়, tap) সেই index-এর item-এর `href`-এ router navigate। Media-র x-position থেকে কোন card-এ click হলো তা হিসাব করা হবে।
   - **Scroll fix**: original component global `wheel` listener লাগায়, যা page scroll-কে hijack করে। এখানে wheel/drag শুধু container-এর ভিতরে bind হবে, আর reduced-motion থাকলে RAF loop বন্ধ থাকবে — বাকি site-এর Lenis smooth scroll অটুট থাকবে।
   - SSR-safe: `<ClientOnly>`/mount-gate, WebGL না থাকলে graceful fallback (নিচের point 4)।

3. **Assets**: তোর দেওয়া yarn ছবিগুলো (Cotton Candy black/blue/lilac, Cotton Delight coral/pink/rust, Hobby India red/yellow/green) Lovable asset pointer হিসেবে `src/assets/`-এ যোগ হবে — repo-তে binary copy হবে না।

4. **Section**: `src/components/commerce/new-arrivals-gallery.tsx`
   - Data source: `productsQuery({ sort: "newest", limit: 12 })` — API থেকে আসা product-এর title + image + `/product/$id` link ব্যবহার হবে (পুরোপুরি dynamic, admin panel থেকে control)।
   - যতক্ষণ backend-এ আসল yarn product নেই, ততক্ষণ তোর ছবিগুলো fallback হিসেবে দেখাবে (category showcase-এ যেমন `PREFER_LOCAL_IMAGES` flag আছে, একইভাবে একটা flag থাকবে যাতে পরে backend ready হলে switch করা যায়)।
   - Heading: `03 · Fresh off the winder` / **New arrivals** + "View all" link — বর্তমান rail-এর style ধরে রাখা হবে।
   - Height ~560px desktop / ~420px mobile, light theme-এর সাথে মিলিয়ে `textColor` = ink token-এর hex, `bend={3}`, `borderRadius={0.05}`, `scrollEase={0.02}`।
   - WebGL unavailable / reduced motion হলে existing `ProductRail`-এর grid fallback দেখাবে।

5. **Wire-up**: `src/routes/index.tsx`-এ প্রথম `<ProductRail anchor="sections" … sort:newest>` সরিয়ে `<NewArrivalsGallery />` বসানো। Best sellers rail যেমন আছে তেমনই থাকবে।

## Technical notes

- `ogl` pure-JS WebGL, edge/SSR bundle-এ যাবে না কারণ component client-only import হবে।
- Font labels-এর জন্য project-এর display font ব্যবহার হবে (`fontUrl` দিয়ে Google Fonts stylesheet), তাই canvas label আর site typography মিলবে।
- Cleanup: unmount-এ RAF cancel + listeners removed + canvas removed (source-এর `destroy()` ধরে রাখা হবে)।
- Verification: Playwright-এ home page load করে canvas render, drag, এবং একটা tile click করে `/product/...`-এ navigation check করা হবে; console error zero হতে হবে।
