import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AnnouncementTicker } from "@/components/layout/announcement-ticker";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

import { PageTransition } from "@/components/page-transition";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { WakeGate } from "@/components/wake-gate";
import { Toaster } from "@/components/ui/sonner";
import { LoginModal } from "@/components/auth/login-modal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-6xl font-light text-foreground">404</h1>
        <p className="mt-4 font-data text-2xs text-marigold">A dropped stitch</p>
        <p className="mt-3 text-muted-foreground">
          This page unravelled. The yarn ball animation lands here in the 3D phase.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="sheen inline-flex items-center justify-center rounded-full bg-madder px-6 py-3 font-data text-2xs text-primary-foreground"
          >
            Back to the shop
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-light text-foreground">This page didn't load</h1>
        <p className="mt-3 text-muted-foreground">
          Something snagged. Retry, or head back to the shop.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="sheen inline-flex items-center justify-center rounded-full bg-madder px-6 py-3 font-data text-2xs text-primary-foreground"
          >
            Retry
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 font-data text-2xs text-foreground"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Royaall Wool | Every Stitch Has a Story" },
      { name: "description", content: "Shop premium crochet yarn, knitting wool & amigurumi supplies online at Royaall Wool. Skin-safe, baby-friendly yarn with pan-India delivery. 156+ Google reviews ⭐ 4.9 rating." },
      { name: "keywords", content: "Royaall Wool, royaallwool, premium crochet yarn online India, knitting yarn India, baby safe wool, amigurumi yarn, buy wool online India, skin safe baby wool, crochet thread India, knitting supplies India" },
      { name: "author", content: "Royaall Wool" },
      { name: "theme-color", content: "#F7F3EA" },
      { name: "geo.region", content: "IN-WB" },
      { name: "geo.placename", content: "Howrah, West Bengal" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Royaall Wool" },
      { property: "og:title", content: "Royaall Wool | Every Stitch Has a Story" },
      { property: "og:description", content: "Shop premium crochet yarn, knitting wool & amigurumi supplies online at Royaall Wool. Skin-safe yarn with pan-India delivery." },
      { property: "og:image", content: "https://royaallwool.com/logo.jpeg" },
      { property: "og:url", content: "https://royaallwool.com/" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Royaall Wool | Every Stitch Has a Story" },
      { name: "twitter:description", content: "Shop premium crochet yarn, knitting wool & amigurumi supplies online at Royaall Wool. Skin-safe yarn with pan-India delivery." },
      { name: "twitter:image", content: "https://royaallwool.com/logo.jpeg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { rel: "icon", href: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { rel: "icon", href: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { rel: "icon", href: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "canonical", href: "https://royaallwool.com/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://api.fontshare.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..600,50,1;1,9..144,300..600,50,1&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap",
      },
    ],
    scripts: [
      // ── Organization + Store (dual-type) ──
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["Organization", "Store"],
          "@id": "https://royaallwool.com/#organization",
          name: "Royaall Wool",
          legalName: "Royaall Wool",
          alternateName: ["Royal Wool", "Royaal Wool", "Royall Wool"],
          url: "https://royaallwool.com",
          logo: {
            "@type": "ImageObject",
            url: "https://royaallwool.com/logo.jpeg",
            width: 512,
            height: 512,
          },
          image: "https://royaallwool.com/logo.jpeg",
          description:
            "Premium knitting & crochet yarn brand in India. Small-batch dyed acrylic, cotton and blended yarn. Every stitch has a story.",
          foundingDate: "2020",
          foundingLocation: {
            "@type": "Place",
            name: "Howrah, West Bengal, India",
          },
          areaServed: {
            "@type": "Country",
            name: "India",
          },
          address: {
            "@type": "PostalAddress",
            streetAddress: "104, Shri Aurobindo Rd, Babudanga",
            addressLocality: "Howrah",
            addressRegion: "West Bengal",
            postalCode: "711106",
            addressCountry: "IN",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 22.6087,
            longitude: 88.3476,
          },
          telephone: "+918910792214",
          contactPoint: [
            {
              "@type": "ContactPoint",
              telephone: "+918910792214",
              contactType: "customer service",
              areaServed: "IN",
              availableLanguage: ["English", "Hindi", "Bengali"],
              hoursAvailable: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "10:00",
                closes: "19:00",
              },
            },
          ],
          sameAs: [
            "https://www.instagram.com/royaallwool",
            "https://www.facebook.com/share/1SEBGxnKW6/",
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "156",
            bestRating: "5",
          },
          priceRange: "₹₹",
        }),
      },
      // ── WebSite + SearchAction ──
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://royaallwool.com/#website",
          name: "Royaall Wool",
          alternateName: "Royal Wool",
          url: "https://royaallwool.com",
          publisher: { "@id": "https://royaallwool.com/#organization" },
          potentialAction: {
            "@type": "SearchAction",
            target: "https://royaallwool.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
          inLanguage: "en-IN",
        }),
      },
      // ── SiteNavigationElement — tells Google which pages deserve sitelinks ──
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": "https://royaallwool.com/#navigation",
          name: "Main Navigation",
          itemListElement: [
            {
              "@type": "SiteNavigationElement",
              position: 1,
              name: "Shop",
              description: "Browse & buy premium knitting and crochet yarn online",
              url: "https://royaallwool.com/collections",
            },
            {
              "@type": "SiteNavigationElement",
              position: 2,
              name: "About Us",
              description: "Our story — small-batch yarn from Howrah, West Bengal",
              url: "https://royaallwool.com/about",
            },
            {
              "@type": "SiteNavigationElement",
              position: 3,
              name: "Blog",
              description: "Knitting patterns, crochet tutorials & yarn stories",
              url: "https://royaallwool.com/blog",
            },
            {
              "@type": "SiteNavigationElement",
              position: 4,
              name: "Offers",
              description: "Live yarn coupons, bundles & combo deals",
              url: "https://royaallwool.com/offers",
            },
            {
              "@type": "SiteNavigationElement",
              position: 5,
              name: "Contact",
              description: "Reach us via WhatsApp, phone or email",
              url: "https://royaallwool.com/contact",
            },
            {
              "@type": "SiteNavigationElement",
              position: 6,
              name: "FAQ",
              description: "Common questions about yarn, delivery & dye lots",
              url: "https://royaallwool.com/faq",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* Hidden SVG filter for liquid glass refraction */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <filter id="liquid-glass-filter" x="0%" y="0%" width="100%" height="100%" primitiveUnits="objectBoundingBox">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012"
                numOctaves="3"
                seed="5"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="14"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrateWishlist = useWishlistStore((s) => s.hydrate);
  const clearWishlist = useWishlistStore((s) => s.clearLocal);

  // Hearts across the catalogue need the saved ids before anything renders them.
  useEffect(() => {
    if (isAuthenticated) void hydrateWishlist();
    else clearWishlist();
  }, [isAuthenticated, hydrateWishlist, clearWishlist]);

  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScrollProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-marigold focus:px-5 focus:py-2 focus:font-data focus:text-2xs focus:text-ink"
        >
          Skip to content
        </a>
        <AnnouncementTicker />
        <Header />
        <main id="main" className="min-h-[60dvh]">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <Footer />
        <WhatsAppFab />
        <MobileBottomNav />

        <WakeGate />
        <Toaster />
        <LoginModal />
        <CartDrawer />
        <div className="grain" aria-hidden />
      </SmoothScrollProvider>
    </QueryClientProvider>
  );
}
