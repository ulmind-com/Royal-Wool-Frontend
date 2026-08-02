import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Baby, Heart, Truck } from "lucide-react";

import { BrandBanner } from "@/components/commerce/brand-banner";
import { CategoryShowcase } from "@/components/commerce/category-showcase";
import { CustomerReviews } from "@/components/commerce/customer-reviews";

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
        className="mx-auto w-full max-w-[1600px] px-4 pt-8 sm:px-6 sm:pt-12 lg:px-10"
        data-thread-anchor="trust"
        aria-label="Why Royal Wool"
      >
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 border-y border-border/60 py-9 sm:gap-y-10 sm:py-16 lg:grid-cols-4 lg:divide-x lg:divide-border/60">
          {TRUST.map(({ icon: Icon, title, copy }) => (
            <li
              key={title}
              className="group flex flex-col items-center px-2 text-center transition-transform duration-[var(--dur-micro)] hover:-translate-y-0.5 sm:px-6"
            >
              <Icon
                className="h-6 w-6 shrink-0 text-marigold sm:h-7 sm:w-7"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className="mt-3.5 font-display text-[0.95rem] font-normal leading-snug text-foreground sm:mt-5 sm:text-lg">
                {title}
              </p>
              <p className="mt-1.5 max-w-[16rem] text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:text-sm">
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

      <BrandBanner />

      <CustomerReviews />

    </>
  );
}
