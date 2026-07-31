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
import { CustomCursor } from "@/components/custom-cursor";
import { PageTransition } from "@/components/page-transition";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { WakeGate } from "@/components/wake-gate";

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
        <p className="mt-3 text-muted-foreground">Something snagged. Retry, or head back to the shop.</p>
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
      { name: "author", content: "Royal Wool" },
      { name: "theme-color", content: "#0D0A12" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Royal Wool" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Royal Wool",
          description: "Premium knitting & crochet yarn brand in India.",
          areaServed: "IN",
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
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

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
        <CustomCursor />
        <WakeGate />
        <div className="grain" aria-hidden />
      </SmoothScrollProvider>
    </QueryClientProvider>
  );
}
