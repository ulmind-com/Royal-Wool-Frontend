import { createFileRoute } from "@tanstack/react-router";

import { PageShell, Prose } from "@/components/layout/page-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Royaall Wool" },
      {
        name: "description",
        content:
          "What Royaall Wool collects, why, how long we keep it, and how to ask us to delete it.",
      },
      { property: "og:title", content: "Privacy Policy — Royaall Wool" },
      { property: "og:description", content: "What we collect, why, and how to have it deleted." },
      { property: "og:url", content: "https://royaallwool.com/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://royaallwool.com/privacy" }],
  }),
  component: () => (
    <PageShell light eyebrow="Legal" title="Privacy policy">
      <Prose>
        <h2>What we collect</h2>
        <p>
          Your name, email, phone and delivery addresses, plus your order and review history. If you
          use the "use my location" button we store the coordinates you share so we can price
          delivery.
        </p>
        <h2>What we don't do</h2>
        <p>
          We don't sell your data, and we don't store card details — payments run through Razorpay.
        </p>
        <h2>Cookies &amp; local storage</h2>
        <p>
          Your bag, saved addresses and login token live in your browser's local storage. Clearing
          site data signs you out and empties your bag.
        </p>
        <h2>Deletion</h2>
        <p>Message us on WhatsApp or email and we'll delete your account and personal data.</p>
      </Prose>
    </PageShell>
  ),
});
