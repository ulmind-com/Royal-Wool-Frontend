import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ContactForm } from "@/components/contact/contact-form";
import { ContactSupportCard } from "@/components/contact/contact-support-card";
import { useSettings } from "@/hooks/use-settings";
import { contactContentQuery, normalizeContact } from "@/lib/api/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Royal Wool — WhatsApp, phone & email" },
      {
        name: "description",
        content:
          "Reach Royal Wool on WhatsApp, phone or email, or send a message from our contact form. Open 10am–7pm IST, every day.",
      },
      { property: "og:title", content: "Contact Royal Wool" },
      {
        property: "og:description",
        content: "Reach us on WhatsApp, phone or email — a human from the dye house replies.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://royal-yarn-threads.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://royal-yarn-threads.lovable.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { settings } = useSettings();
  const { data } = useQuery(contactContentQuery);
  const content = normalizeContact(data, settings);

  return (
    <div className="light-section relative overflow-hidden">
      {/* soft dye-bloom backdrop so the glass has colour behind it */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 15% 0%, color-mix(in oklab, var(--marigold) 22%, transparent), transparent 70%), radial-gradient(45% 45% at 90% 30%, color-mix(in oklab, var(--madder) 14%, transparent), transparent 72%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-data text-2xs text-marigold">{content.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-light tracking-[-0.03em] text-foreground sm:text-5xl">
            {content.title}
          </h1>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">{content.intro}</p>
        </header>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
          {/* support card first on mobile: fastest path to a human */}
          <div className="order-1 lg:order-2">
            <ContactSupportCard content={content} />
          </div>

          <div
            className="order-2 min-w-0 rounded-[2rem] border border-border/70 p-6 backdrop-blur-[22px] backdrop-saturate-[1.6] sm:p-8 lg:order-1"
            style={{
              backgroundImage:
                "linear-gradient(135deg, color-mix(in oklab, var(--fleece) 88%, transparent), color-mix(in oklab, var(--fleece) 62%, transparent))",
              boxShadow:
                "inset 0 1px 0 color-mix(in oklab, var(--fleece) 90%, transparent), 0 30px 70px -34px color-mix(in oklab, var(--ink) 26%, transparent)",
            }}
          >
            <ContactForm title={content.formTitle} note={content.formNote} />
          </div>
        </div>
      </div>
    </div>
  );
}
