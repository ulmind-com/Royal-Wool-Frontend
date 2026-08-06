import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";
import type { ComponentType } from "react";

import { useReducedMotion } from "@/hooks/use-motion";
import type { ChannelKey, ContactContent } from "@/lib/api/contact";

/** Map each channel key to a Lucide icon. */
const CHANNEL_ICON: Record<ChannelKey, ComponentType<{ className?: string }>> = {
  hotline: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  location: MapPin,
  hours: Clock,
};

/**
 * Light-gradient support card with Lucide icons.
 * Every row is admin-driven; icons resolve by channel key.
 */
export function ContactSupportCard({ content }: { content: ContactContent }) {
  const reduced = useReducedMotion();

  return (
    <div className="relative">
      {/* soft bloom behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] blur-3xl"
        style={{
          background:
            "radial-gradient(60% 55% at 30% 12%, color-mix(in oklab, var(--marigold) 30%, transparent), transparent 70%), radial-gradient(55% 50% at 80% 85%, color-mix(in oklab, var(--madder) 20%, transparent), transparent 72%)",
        }}
      />

      <div
        className="relative isolate overflow-hidden rounded-[2rem] border p-6 backdrop-blur-[22px] backdrop-saturate-[1.6] sm:p-8"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #fdf2e9 0%, #f5e6f0 30%, #e8f0fe 60%, #fce4ec 100%)",
          borderColor: "color-mix(in oklab, var(--ink) 10%, transparent)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.7), 0 40px 90px -40px rgba(0,0,0,0.08)",
        }}
      >
        <p className="font-data text-2xs text-madder">Support</p>
        <p className="mt-3 font-display text-2xl font-light leading-snug text-foreground sm:text-[1.75rem]">
          {content.cardTitle}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{content.cardNote}</p>

        <ul className="mt-7 space-y-3">
          {content.channels.map((channel, index) => {
            const Icon = CHANNEL_ICON[channel.key] ?? Phone;
            const Row = (
              <>
                <span
                  aria-hidden
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border"
                  style={{
                    borderColor: "color-mix(in oklab, var(--ink) 12%, transparent)",
                    backgroundColor: "rgba(255,255,255,0.55)",
                  }}
                >
                  <Icon className="h-5 w-5 text-madder" />
                </span>
                <span className="min-w-0">
                  <span className="block font-data text-2xs text-muted-foreground">{channel.label}</span>
                  <span className="mt-0.5 block break-words text-sm text-foreground">
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
                      borderColor: "color-mix(in oklab, var(--ink) 8%, transparent)",
                      backgroundColor: "rgba(255,255,255,0.45)",
                    }}
                  >
                    {Row}
                  </a>
                ) : (
                  <div
                    className="flex min-h-14 items-center gap-4 rounded-2xl border px-4 py-3"
                    style={{
                      borderColor: "color-mix(in oklab, var(--ink) 8%, transparent)",
                      backgroundColor: "rgba(255,255,255,0.45)",
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
            style={{ borderColor: "color-mix(in oklab, var(--ink) 10%, transparent)" }}
          >
            <Clock className="h-5 w-5 shrink-0 text-madder" />
            <p className="font-data text-2xs text-muted-foreground">{content.hours}</p>
          </div>
        ) : null}

        {content.socials.length ? (
          <div className="mt-5">
            <p className="font-data text-2xs text-madder">Connect with us</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {content.socials.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener"
                  data-cursor="link"
                  className="rounded-full border px-4 py-2 font-data text-2xs text-foreground/80 transition-colors hover:text-foreground"
                  style={{
                    borderColor: "color-mix(in oklab, var(--ink) 14%, transparent)",
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
