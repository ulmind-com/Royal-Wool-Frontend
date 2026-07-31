import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Baby, Heart, Truck } from "lucide-react";

import { CategoryTiles } from "@/components/commerce/category-tiles";
import { ProductRail } from "@/components/commerce/product-rail";
import { UpcomingRail } from "@/components/commerce/upcoming-rail";
import { HeroSlider } from "@/components/commerce/hero-slider";

import { Glass } from "@/components/ui/glass";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Royal Wool — Premium Knitting & Crochet Yarn in India" },
      {
        name: "description",
        content:
          "Small-batch dyed acrylic, cotton and blended yarn for knitting, crochet and amigurumi. Pan-India delivery.",
      },
      { property: "og:title", content: "Royal Wool — Premium Knitting & Crochet Yarn" },
      {
        property: "og:description",
        content: "Small-batch dyed yarn for knitting, crochet and amigurumi. Pan-India delivery.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const TRUST = [
  { icon: BadgeCheck, title: "Quality guarantee", copy: "Consistent gauge, batch-matched dye lots" },
  { icon: Baby, title: "Safe for babies", copy: "Skin-friendly, tested dyes" },
  { icon: Truck, title: "Pan-India delivery", copy: "Tracked dispatch from West Bengal" },
  { icon: Heart, title: "Loved by crafters", copy: "Reviewed by knitters and crocheters" },
];

function Home() {
  return (
    <>
      {/* ── Hero: admin-driven auto slider ── */}
      <HeroSlider />

      {/* ── Trust bar ── */}
      <section
        className="mx-auto w-full max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-10"
        data-thread-anchor="trust"
        aria-label="Why Royal Wool"
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, copy }) => (
            <li key={title}>
              <Glass variant="card" className="h-full">
                <Icon className="h-5 w-5 text-marigold" aria-hidden />
                <p className="mt-3 font-data text-2xs text-foreground">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
              </Glass>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Live catalogue sections; remaining stubs stay in §5 order ── */}
      <CategoryTiles />

      <ProductRail
        anchor="sections"
        eyebrow="03 · Fresh off the winder"
        title="New arrivals"
        note="The latest shades to leave the dye house."
        filters={{ sort: "newest" }}
      />

      <ProductRail
        anchor="bestsellers"
        eyebrow="03b · Loved most"
        title="Best sellers"
        note="What crafters reorder skein after skein."
        filters={{ sort: "popular" }}
      />

      <UpcomingRail />

      <SectionStub
        anchor="story"
        eyebrow="05 · Brand story"
        title="Parallax dye-house sequence"
        note="Full-bleed media from /site-media, scroll-scrubbed."
      />
      <SectionStub
        anchor="lookbook"
        eyebrow="06 · Lookbook"
        title="Masonry gallery"
        note="Light section, cursor-reactive tiles, lightbox."
        light
      />
      <SectionStub
        anchor="offers"
        eyebrow="07 · Offers"
        title="Tear-off coupon cards"
        note="From /coupons/active, tap to copy."
      />
      <SectionStub
        anchor="recs"
        eyebrow="08 · Picked for you"
        title="Recommendations"
        note="From /recommendations/home."
      />
    </>
  );
}

function SectionStub({
  anchor,
  eyebrow,
  title,
  note,
  light = false,
}: {
  anchor: string;
  eyebrow: string;
  title: string;
  note: string;
  light?: boolean;
}) {
  return (
    <section
      data-thread-anchor={anchor}
      className={light ? "light-section mt-20" : "mt-20"}
      aria-label={title}
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
        <p className="font-data text-2xs text-marigold">{eyebrow}</p>
        <h2 className="mt-4 font-display text-4xl font-light">{title}</h2>
        <p className="mt-4 max-w-xl text-muted-foreground">{note}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-2xl border border-border"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, color-mix(in oklab, var(--foreground) 7%, transparent), color-mix(in oklab, var(--foreground) 2%, transparent))",
              }}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </section>
  );
}
