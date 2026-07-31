import { createFileRoute } from "@tanstack/react-router";

import { PageShell, Prose } from "@/components/layout/page-shell";
import { WHATSAPP_DISPLAY, waGeneral } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Royal Wool — WhatsApp, phone & email" },
      {
        name: "description",
        content: "Reach Royal Wool on WhatsApp at +91 89107 92214, or by phone and email.",
      },
      { property: "og:title", content: "Contact Royal Wool" },
      { property: "og:description", content: "Reach us on WhatsApp, phone or email." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: () => (
    <PageShell light eyebrow="Contact" title="Talk to a human">
      <Prose>
        <p>
          Fastest route is WhatsApp — we answer between 10am and 7pm IST, every day.
        </p>
        <p>
          <strong>WhatsApp:</strong>{" "}
          <a
            href={waGeneral()}
            target="_blank"
            rel="noopener"
            aria-label="Chat with Royal Wool on WhatsApp"
            className="underline decoration-madder underline-offset-4"
            data-cursor="link"
          >
            {WHATSAPP_DISPLAY}
          </a>
        </p>
        <p>
          <strong>Phone &amp; email:</strong> loaded from our store settings so they're always
          current (wired in Phase 2).
        </p>
        <p>
          <strong>Store address:</strong> loaded from store settings.
        </p>
      </Prose>
    </PageShell>
  ),
});
