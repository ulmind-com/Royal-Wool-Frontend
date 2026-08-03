import { motion } from "framer-motion";

import { CONTACT_ART } from "@/components/contact/contact-art";
import { useReducedMotion } from "@/hooks/use-motion";
import type { ContactContent } from "@/lib/api/contact";

/**
 * Ink-glass support card: the fastest route to a human.
 * Every row is admin-driven; icons resolve by channel key.
 */
export function ContactSupportCard({ content }: { content: ContactContent }) {
  const reduced = useReducedMotion();

  return (
    <div className="relative">
      {/* marigold bloom behind the glass — glass never sits on flat colour */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] blur-3xl"
        style={{
          background:
            "radial-gradient(60% 55% at 30% 12%, color-mix(in oklab, var(--marigold) 45%, transparent), transparent 70%), radial-gradient(55% 50% at 80% 85%, color-mix(in oklab, var(--madder) 32%, transparent), transparent 72%)",
        }}
      />

      <div
        className="relative isolate overflow-hidden rounded-[2rem] border p-6 backdrop-blur-[22px] backdrop-saturate-[1.6] sm:p-8"
        style={{
          backgroundImage:
            "linear-gradient(150deg, color-mix(in oklab, var(--ink) 94%, transparent), color-mix(in oklab, var(--ink) 80%, transparent))",
          borderColor: "color-mix(in oklab, var(--fleece) 16%, transparent)",
          boxShadow:
            "inset 0 1px 0 color-mix(in oklab, var(--fleece) 22%, transparent), 0 40px 90px -40px color-mix(in oklab, var(--ink) 75%, transparent)",
        }}
      >
        <p className="font-data text-2xs text-marigold">Support</p>
        <p className="mt-3 font-display text-2xl font-light leading-snug text-fleece sm:text-[1.75rem]">
          {content.cardTitle}
        </p>
        <p className="mt-2 text-sm text-fleece/65">{content.cardNote}</p>

        <ul className="mt-7 space-y-3">
          {content.channels.map((channel, index) => {
            const Row = (
              <>
                <span
                  aria-hidden
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border"
                  style={{
                    borderColor: "color-mix(in oklab, var(--fleece) 22%, transparent)",
                    backgroundColor: "color-mix(in oklab, var(--fleece) 10%, transparent)",
                  }}
                >
                  <img
                    src={CONTACT_ART[channel.key]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={512}
                    height={512}
                    className="h-6 w-6 object-contain"
                    style={{ filter: "invert(1) brightness(2.2) contrast(1.4)" }}
                  />
                </span>
                <span className="min-w-0">
                  <span className="block font-data text-2xs text-fleece/55">{channel.label}</span>
                  <span className="mt-0.5 block break-words text-sm text-fleece">
                    {channel.value}
                  </span>
                </span>
              </>
            );

            return (
              <motion.li
                key={channel.key}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
              >
                {channel.href ? (
                  <a
                    href={channel.href}
                    target={channel.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener"
                    data-cursor="link"
                    className="flex min-h-14 items-center gap-4 rounded-2xl border px-4 py-3 transition-all duration-[var(--dur-standard)] ease-[var(--ease-enter)] hover:-translate-y-0.5"
                    style={{
                      borderColor: "color-mix(in oklab, var(--fleece) 12%, transparent)",
                      backgroundColor: "color-mix(in oklab, var(--fleece) 7%, transparent)",
                    }}
                  >
                    {Row}
                  </a>
                ) : (
                  <div
                    className="flex min-h-14 items-center gap-4 rounded-2xl border px-4 py-3"
                    style={{
                      borderColor: "color-mix(in oklab, var(--fleece) 12%, transparent)",
                      backgroundColor: "color-mix(in oklab, var(--fleece) 7%, transparent)",
                    }}
                  >
                    {Row}
                  </div>
                )}
              </motion.li>
            );
          })}
        </ul>

        {content.hours ? (
          <div
            className="mt-7 flex items-center gap-3 border-t pt-5"
            style={{ borderColor: "color-mix(in oklab, var(--fleece) 14%, transparent)" }}
          >
            <img
              src={CONTACT_ART.hours}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              width={512}
              height={512}
              className="h-5 w-5 object-contain"
              style={{ filter: "invert(1) brightness(2.2) contrast(1.4)" }}
            />
            <p className="font-data text-2xs text-fleece/70">{content.hours}</p>
          </div>
        ) : null}

        {content.socials.length ? (
          <div className="mt-5">
            <p className="font-data text-2xs text-marigold">Connect with us</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {content.socials.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener"
                  data-cursor="link"
                  className="rounded-full border px-4 py-2 font-data text-2xs text-fleece/80 transition-colors hover:text-fleece"
                  style={{
                    borderColor: "color-mix(in oklab, var(--fleece) 18%, transparent)",
                  }}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
