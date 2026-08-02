import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Baby, Heart, Truck } from "lucide-react";

import { CategoryShowcase } from "@/components/commerce/category-showcase";
import { FeaturedYarn } from "@/components/commerce/featured-yarn";
import { NewArrivalsGallery } from "@/components/commerce/new-arrivals-gallery";
import { SpotlightSection } from "@/components/commerce/spotlight-section";
import { YarnFanCarousel } from "@/components/commerce/yarn-fan-carousel";
import { YarnStackCards } from "@/components/commerce/yarn-stack-cards";
import { YarnWeightRail } from "@/components/commerce/yarn-weight-rail";

import { HeroSlider } from "@/components/commerce/hero-slider";


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

      {/* ── Trust band: icon over text, no cards ── */}
      <section
        className="mx-auto w-full max-w-[1600px] px-4 pt-12 sm:px-6 lg:px-10"
        data-thread-anchor="trust"
        aria-label="Why Royal Wool"
      >
        <ul className="grid grid-cols-2 gap-y-10 border-y border-border/60 py-14 sm:py-16 lg:grid-cols-4 lg:divide-x lg:divide-border/60">
          {TRUST.map(({ icon: Icon, title, copy }) => (
            <li
              key={title}
              className="group flex flex-col items-center px-4 text-center transition-transform duration-[var(--dur-micro)] hover:-translate-y-0.5 sm:px-6"
            >
              <Icon
                className="h-7 w-7 shrink-0 text-marigold"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className="mt-5 font-display text-base font-normal text-foreground sm:text-lg">
                {title}
              </p>
              <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
                {copy}
              </p>
            </li>
          ))}
        </ul>
      </section>


      {/* ── Live catalogue sections; remaining stubs stay in §5 order ── */}
      <CategoryShowcase />

      <NewArrivalsGallery />

      <SpotlightSection />

      <YarnWeightRail />

      <YarnStackCards />

      <YarnFanCarousel />

      <FeaturedYarn />
    </>
  );
}
