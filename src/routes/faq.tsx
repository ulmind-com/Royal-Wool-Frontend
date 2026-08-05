import { createFileRoute } from "@tanstack/react-router";

import { PageShell, Prose } from "@/components/layout/page-shell";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Royal Wool yarn, dye lots & delivery" },
      {
        name: "description",
        content: "Common questions about Royal Wool dye lots, gauge, washing, and delivery times.",
      },
      { property: "og:title", content: "Royal Wool FAQ" },
      { property: "og:description", content: "Dye lots, gauge, washing, and delivery." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
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
