import { createFileRoute } from "@tanstack/react-router";

import { PageShell, Prose } from "@/components/layout/page-shell";
import { useSettings } from "@/hooks/use-settings";
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
  component: ContactPage,
});

function ContactPage() {
  const { shop } = useSettings();

  return (
    <PageShell light eyebrow="Contact" title="Talk to a human">
      <Prose>
        <p>Fastest route is WhatsApp — we answer between 10am and 7pm IST, every day.</p>
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
        {shop?.phone ? (
          <p>
            <strong>Phone:</strong>{" "}
            <a href={`tel:${shop.phone}`} className="underline decoration-madder underline-offset-4">
              {shop.phone}
            </a>
          </p>
        ) : null}
        {shop?.email ? (
          <p>
            <strong>Email:</strong>{" "}
            <a
              href={`mailto:${shop.email}`}
              className="underline decoration-madder underline-offset-4"
            >
              {shop.email}
            </a>
          </p>
        ) : null}
        {shop?.address ? (
          <p>
            <strong>Store address:</strong> {shop.address}
          </p>
        ) : null}
      </Prose>
    </PageShell>
  );
}
