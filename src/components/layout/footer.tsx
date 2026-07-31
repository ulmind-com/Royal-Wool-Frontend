import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

import { useSettings } from "@/hooks/use-settings";
import { BRAND, POLICY_LINKS } from "@/lib/site";
import { WHATSAPP_DISPLAY, waGeneral } from "@/lib/whatsapp";

export function Footer() {
  const { shop } = useSettings();

  return (
    <footer className="ink-section relative mt-24 border-t border-border">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div className="min-w-0">
            <p className="font-display text-4xl font-light tracking-[-0.03em] text-foreground">
              Royal <span className="italic text-marigold">Wool</span>
            </p>
            <p className="mt-4 max-w-sm text-muted-foreground">{BRAND.tagline}</p>

            <a
              href={waGeneral()}
              target="_blank"
              rel="noopener"
              aria-label="Chat with Royal Wool on WhatsApp"
              className="sheen mt-8 inline-flex items-center gap-3 rounded-full bg-madder px-6 py-3 font-data text-2xs text-foreground transition-transform duration-[var(--dur-micro)] hover:-translate-y-0.5"
              data-cursor="link"
            >
              Chat on WhatsApp
            </a>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <nav aria-label="Shop">
              <p className="font-data text-2xs text-marigold">Shop</p>
              <ul className="mt-4 space-y-2">
                {[
                  { to: "/collections", label: "All yarns" },
                  { to: "/upcoming", label: "Upcoming" },
                  { to: "/offers", label: "Offers" },
                  { to: "/search", label: "Search" },
                ].map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      data-cursor="link"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Help">
              <p className="font-data text-2xs text-marigold">Help</p>
              <ul className="mt-4 space-y-2">
                {POLICY_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      data-cursor="link"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="font-data text-2xs text-marigold">Reach us</p>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                {shop?.address ? (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/70" />
                    <span>{shop.address}</span>
                  </li>
                ) : null}
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  <a
                    href={waGeneral()}
                    target="_blank"
                    rel="noopener"
                    aria-label="WhatsApp Royal Wool"
                    className="font-data text-2xs transition-colors hover:text-foreground"
                  >
                    {shop?.phone ?? WHATSAPP_DISPLAY}
                  </a>
                </li>
                {shop?.email ? (
                  <li className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                    <a
                      href={`mailto:${shop.email}`}
                      className="font-data text-2xs transition-colors hover:text-foreground"
                    >
                      {shop.email}
                    </a>
                  </li>
                ) : null}
                <li className="flex items-center gap-3">
                  <Instagram className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  <span className="font-data text-2xs">@royalwool</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-border pt-6 font-data text-2xs text-muted-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Royal Wool. All rights reserved.</p>
          <p>Made in India</p>
        </div>
      </div>
    </footer>
  );
}
