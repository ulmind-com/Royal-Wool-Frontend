import { createFileRoute } from "@tanstack/react-router";

import { PageShell, Prose } from "@/components/layout/page-shell";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Yarn Care, Delivery & Dye Lots | Royaall Wool India" },
      {
        name: "description",
        content: "Common questions about Royaall Wool yarn — dye lots, gauge, washing instructions, baby safety, pan-India delivery and more.",
      },
      { property: "og:title", content: "Frequently Asked Questions — Royaall Wool" },
      { property: "og:description", content: "Dye lots, gauge, yarn care, baby safety and delivery." },
      { property: "og:url", content: "https://royaallwool.com/faq" },
    ],
    links: [{ rel: "canonical", href: "https://royaallwool.com/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Will two skeins of the same colour match?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Skeins from the same dye lot match. We keep lots together, and we tell you on the product page when a lot is running low.",
              },
            },
            {
              "@type": "Question",
              name: "How do I wash finished pieces?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Cold hand wash, no wringing, dry flat. Acrylic tolerates a gentle machine cycle in a mesh bag.",
              },
            },
            {
              "@type": "Question",
              name: "Is Royaall Wool yarn safe for babies?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. All Royaall Wool yarns use skin-safe, tested dyes that are gentle enough for baby knits. Our Cotton Delight and Cotton Candy ranges are especially popular for baby blankets and amigurumi toys.",
              },
            },
            {
              "@type": "Question",
              name: "Does Royaall Wool deliver across India?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, Royaall Wool offers pan-India delivery with tracked dispatch from our store in Howrah, West Bengal. Delivery fees are distance-based and shown at checkout.",
              },
            },
            {
              "@type": "Question",
              name: "What types of yarn does Royaall Wool sell?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Royaall Wool offers premium acrylic, cotton, and blended yarns for knitting, crochet, and amigurumi. We carry multiple yarn weights from lace to super bulky, all small-batch dyed for colour consistency.",
              },
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://royaallwool.com/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "FAQ",
              item: "https://royaallwool.com/faq",
            },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <PageShell light eyebrow="FAQ" title="Questions we get every week">
      <Prose>
        <h2>Will two skeins of the same colour match?</h2>
        <p>
          Skeins from the same dye lot match. We keep lots together when packing, and we flag it on
          the product page when a lot is running low.
        </p>
        <h2>How do I wash finished pieces?</h2>
        <p>
          Cold hand wash, no wringing, dry flat. Acrylic tolerates a gentle machine cycle in a mesh
          bag.
        </p>
        <h2>How long does delivery take?</h2>
        <p>
          Delivery fees and free-delivery thresholds are set in our store settings and shown live at
          checkout — we never quote a number here that could go stale.
        </p>
      </Prose>
    </PageShell>
  ),
});
