import { createFileRoute } from "@tanstack/react-router";

import { PageShell, Prose } from "@/components/layout/page-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Royal Wool — small-batch yarn from India" },
      {
        name: "description",
        content:
          "Royal Wool dyes and winds yarn in small lots in West Bengal, for knitters and crocheters who care about gauge and colour consistency.",
      },
      { property: "og:title", content: "About Royal Wool" },
      { property: "og:description", content: "Small-batch dyed yarn, wound in West Bengal." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: () => (
    <PageShell light eyebrow="About" title="We dye small, so your project matches" >
      <Prose>
        <p>
          Royal Wool started with a simple complaint: you buy five skeins, and the sixth one — bought
          two weeks later — is a shade off. So we work in small lots, log every dye batch, and keep
          skeins from the same lot together.
        </p>
        <h2>What we make</h2>
        <p>
          Acrylic for everyday warmth, cotton for summer garments and amigurumi, and blends that sit
          in between. Every base is wound for stitch definition, which matters more in crochet than
          most sellers admit.
        </p>
        <h2>Who we make it for</h2>
        <p>
          Crafters who read a gauge swatch. Parents knitting for babies who want to know what the dye
          is. Small businesses buying the same colour month after month.
        </p>
        <h2>Where we are</h2>
        <p>
          We ship pan-India from West Bengal. Store address, phone and email on the contact page are
          read live from our store settings, so they're never out of date.
        </p>
      </Prose>
    </PageShell>
  ),
});
