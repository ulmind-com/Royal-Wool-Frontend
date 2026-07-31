import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Baby, Heart, Truck } from "lucide-react";

import { CategoryTiles } from "@/components/commerce/category-tiles";
import { ProductRail } from "@/components/commerce/product-rail";
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
      {/* ── Hero shell. The 3D yarn ball mounts into the right cell in Phase 5. ── */}
      <section className="relative overflow-hidden" data-thread-anchor="hero">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[680px] w-[680px] rounded-full opacity-[0.28] blur-3xl"
          style={{ backgroundImage: "var(--dye-flow)" }}
          aria-hidden
        />
        <div className="relative mx-auto grid w-full max-w-[1600px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-10 lg:py-32">
          <div className="min-w-0">
            <p className="font-data text-2xs text-marigold">Small-batch dye house · India</p>
            <h1 className="mt-6 font-display text-6xl font-light">
              Colour you can
              <span className="italic text-marigold"> feel</span> between your fingers.
            </h1>
            <p className="mt-8 max-w-lg text-lg text-muted-foreground">
              Acrylic, cotton and blends wound for stitch definition — dyed in small lots so every
              skein in your project matches.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/collections"
                data-cursor="link"
                className="sheen inline-flex items-center rounded-full bg-madder px-7 py-3.5 font-data text-2xs text-primary-foreground transition-transform duration-[var(--dur-micro)] hover:-translate-y-0.5"
              >
                Shop all yarns
              </Link>
              <Link
                to="/upcoming"
                data-cursor="link"
                className="inline-flex items-center rounded-full border border-border px-7 py-3.5 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
              >
                See what's coming
              </Link>
            </div>
          </div>

          <Glass
            variant="panel"
            refract
            className="aspect-[4/3] w-full lg:aspect-square"
            data-cursor="drag"
          >
            <div className="flex h-full flex-col justify-between">
              <p className="font-data text-2xs text-muted-foreground">Hero canvas · Phase 5</p>
              <div
                className="mx-auto h-40 w-40 rounded-full sm:h-56 sm:w-56"
                style={{
                  backgroundImage: "var(--dye-flow)",
                  boxShadow: "0 40px 80px -30px color-mix(in oklab, var(--madder) 60%, transparent)",
                }}
                aria-hidden
              />
              <p className="font-data text-2xs text-muted-foreground">
                A rotating 3D yarn ball lands here, with banners driving the copy layer.
              </p>
            </div>
          </Glass>
        </div>
      </section>

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

      <SectionStub
        anchor="upcoming"
        eyebrow="04 · Upcoming products"
        title="Six ranges, pinned rail"
        note="Six glass cards with WhatsApp notify CTAs. Full page already at /upcoming."
      />
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
