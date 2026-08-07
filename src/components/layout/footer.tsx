import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram } from "lucide-react";

import { categoryTreeQuery } from "@/lib/api/queries";
import { BRAND, SOCIAL_LINKS } from "@/lib/site";

interface GraphicCircle {
  cx: number;
  cy: number;
  size: number;
  color: string;
  innerColor: string;
}

/** Outlined "Royaall Wool" wordmark with real yarn balls resting on the letters. */
function Wordmark({
  id,
  className,
  viewBox,
  lines,
  circles,
}: {
  id: string;
  className: string;
  viewBox: string;
  lines: { text: string; x: number; y: number; size: number }[];
  circles: GraphicCircle[];
}) {
  return (
    <svg viewBox={viewBox} className={className} aria-label="Royaall Wool" role="img">
      <defs>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.22" />
        </filter>
      </defs>
      {lines.map((l) => (
        <text
          key={l.text + l.y}
          x={l.x}
          y={l.y}
          fontSize={l.size}
          textAnchor="middle"
          className="font-display"
          letterSpacing="-4"
          xmlSpace="preserve"
        >
          {l.text.split(" ").map((word, i) => (
            <tspan
              key={word + i}
              fill="none"
              stroke="#1A1A1A"
              strokeWidth="4"
              fontStyle={word === "Wool" ? "italic" : "normal"}
              fontWeight="600"
            >
              {i > 0 ? " " : ""}
              {word}
            </tspan>
          ))}
        </text>
      ))}
      {circles.map((c, idx) => (
        <g key={idx} transform={`translate(${c.cx}, ${c.cy})`}>
          <circle r={c.size / 2} fill={c.color} stroke="#1A1A1A" strokeWidth="4" />
          <circle r={c.size / 6} fill={c.innerColor} />
        </g>
      ))}
    </svg>
  );
}

const YARN = (name: string) => `/assets/yarn-cutout/${name}.webp`;

/** Mirrors the header nav, in the same order. */
const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Shop" },
  { to: "/about", label: "About Us" },
  { to: "/blog", label: "Blog" },
  { to: "/offers", label: "Offers" },
  { to: "/contact", label: "Contact" },
  { to: "/search", label: "Search" },
];

const LEGAL_LINKS = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms" },
];

const SOCIALS = [
  { href: SOCIAL_LINKS.instagram, label: "Instagram", Icon: Instagram },
  { href: SOCIAL_LINKS.facebook, label: "Facebook", Icon: Facebook },
];

export function Footer() {
  const { data: tree } = useQuery(categoryTreeQuery);
  const categories = (tree ?? []).filter((c) => !c.parent_id);

  return (
    <footer className="footer-wash relative mt-24 overflow-hidden">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
          {/* Brand + socials */}
          <div className="min-w-0">
            <Link to="/" data-cursor="link" className="flex items-center gap-3">
              <img
                src="/logo.jpeg"
                alt=""
                aria-hidden
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-full border border-marigold/40 object-cover shadow-sm"
              />
              <span className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-semibold tracking-[-0.04em] sm:text-3xl" style={{ color: "#800000" }}>
                  Royaall
                </span>
                <span className="font-display text-2xl font-light italic tracking-[-0.04em] sm:text-3xl" style={{ color: "#D4AF37" }}>
                  Wool
                </span>
              </span>
            </Link>

            <p className="mt-8 font-data text-2xs uppercase tracking-widest text-foreground">
              Follow Us
            </p>
            <div className="mt-4 flex items-center gap-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${BRAND.name} on ${label}`}
                  data-cursor="link"
                  className="grid h-11 w-11 place-items-center rounded-full border border-border text-foreground transition-colors duration-[var(--dur-micro)] hover:border-madder hover:text-madder"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns — 2 across on mobile, 3 on desktop */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:gap-x-10 lg:grid-cols-3">
            <nav aria-label="Menu">
              <p className="font-data text-2xs uppercase tracking-widest text-foreground">Menu</p>
              <ul className="mt-4 space-y-2.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      data-cursor="link"
                      className="text-muted-foreground transition-colors hover:text-madder"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Categories">
              <p className="font-data text-2xs uppercase tracking-widest text-foreground">
                Categories
              </p>
              <ul className="mt-4 space-y-2.5">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/collections/$slug"
                      params={{ slug: c.slug }}
                      data-cursor="link"
                      className="text-muted-foreground transition-colors hover:text-madder"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Legal">
              <p className="font-data text-2xs uppercase tracking-widest text-foreground">Legal</p>
              <ul className="mt-4 space-y-2.5">
                {LEGAL_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      data-cursor="link"
                      className="text-muted-foreground transition-colors hover:text-madder"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Oversized wordmark */}
        <div className="mt-14 sm:mt-20">
          <Wordmark
            id="rw-mark-desktop"
            className="hidden w-full sm:block"
            viewBox="-40 -70 1280 370"
            lines={[{ text: "Royaall Wool", x: 600, y: 178, size: 190 }]}
            circles={[
              { cx: 120, cy: 50, size: 80, color: "#3B82F6", innerColor: "#EF4444" },
              { cx: 350, cy: 220, size: 60, color: "#8B5CF6", innerColor: "#FBBF24" },
              { cx: 650, cy: 40, size: 70, color: "#EF4444", innerColor: "#3B82F6" },
              { cx: 920, cy: 230, size: 65, color: "#10B981", innerColor: "#EC4899" },
              { cx: 1150, cy: 60, size: 85, color: "#FBBF24", innerColor: "#8B5CF6" },
            ]}
          />
          <Wordmark
            id="rw-mark-mobile"
            className="w-full sm:hidden"
            viewBox="-40 -50 480 440"
            lines={[
              { text: "Royaall", x: 200, y: 150, size: 118 },
              { text: "Wool", x: 200, y: 290, size: 118 },
            ]}
            circles={[
              { cx: 60, cy: 30, size: 50, color: "#3B82F6", innerColor: "#EF4444" },
              { cx: 380, cy: 50, size: 40, color: "#EF4444", innerColor: "#3B82F6" },
              { cx: 50, cy: 210, size: 45, color: "#FBBF24", innerColor: "#8B5CF6" },
              { cx: 390, cy: 320, size: 55, color: "#10B981", innerColor: "#EC4899" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-border pb-28 pt-6 md:pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-data text-2xs text-muted-foreground">
            © {new Date().getFullYear()} Royaall Wool. All rights reserved.
          </p>
          <a
            href="https://www.ulmind.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 text-[13px] font-medium text-foreground/90"
          >
            <span className="opacity-80 transition-opacity group-hover:opacity-100">
              Designed and Developed by
            </span>
            <img
              src="/assets/ulmind.png"
              alt="Ulmind"
              className="h-10 w-auto object-contain transition-all group-hover:scale-105 sm:h-12"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
