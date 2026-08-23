import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Package2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { DataError, EmptyState, GridSkeleton } from "@/components/data-state";
import { CouponTicket } from "@/components/commerce/coupon-ticket";
import { useSettings } from "@/hooks/use-settings";
import { type Combo, comboIsLive, combosQuery } from "@/lib/api/catalog-extras";
import { activeCouponsQuery, productsQuery } from "@/lib/api/queries";
import type { Coupon, Product } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

/** Hero slides — cutout skeins fanned per theme. Copy and shades rotate on
 *  their own; the imagery is decorative. */
const HERO_SLIDES = [
  {
    badge: "Bundles & offers",
    title: "Buy them in sets. Pay the bundle price.",
    note: "Pick your shades, add the set, and the flat price lands on the bill. Coupons stack on top — applied automatically at checkout.",
    skeins: [
      { src: "/assets/yarn-cutout/delight-pink.webp", left: "6%", top: "14%", rotate: -12 },
      { src: "/assets/yarn-cutout/candy-lilac.webp", left: "30%", top: "2%", rotate: -4 },
      { src: "/assets/yarn-cutout/hobby-yellow.webp", left: "54%", top: "12%", rotate: 9 },
      { src: "/assets/yarn-cutout/candy-blue.webp", left: "18%", top: "44%", rotate: 6 },
      { src: "/assets/yarn-cutout/delight-rust.webp", left: "44%", top: "50%", rotate: -8 },
    ],
  },
  {
    badge: "Coupons",
    title: "Your best code, applied for you.",
    note: "No code to hunt for. Checkout reads every live coupon and keeps the one that saves you the most.",
    skeins: [
      { src: "/assets/yarn-cutout/hobby-red.webp", left: "8%", top: "10%", rotate: 10 },
      { src: "/assets/yarn-cutout/delight-coral.webp", left: "33%", top: "4%", rotate: -6 },
      { src: "/assets/yarn-cutout/candy-black.webp", left: "56%", top: "16%", rotate: 7 },
      { src: "/assets/yarn-cutout/hobby-green.webp", left: "20%", top: "46%", rotate: -9 },
      { src: "/assets/yarn-cutout/candy-lilac.webp", left: "46%", top: "48%", rotate: 5 },
    ],
  },
  {
    badge: "Free delivery",
    title: "Cross ₹1,500 and we ship it free.",
    note: "Pan-India dispatch from West Bengal, tracked end to end. Bundles are the quickest way past the threshold.",
    skeins: [
      { src: "/assets/yarn-cutout/candy-blue.webp", left: "5%", top: "16%", rotate: -8 },
      { src: "/assets/yarn-cutout/hobby-yellow.webp", left: "29%", top: "3%", rotate: 6 },
      { src: "/assets/yarn-cutout/delight-rust.webp", left: "55%", top: "12%", rotate: -5 },
      { src: "/assets/yarn-cutout/delight-pink.webp", left: "17%", top: "45%", rotate: 11 },
      { src: "/assets/yarn-cutout/hobby-green.webp", left: "45%", top: "47%", rotate: -7 },
    ],
  },
];

/** Shown only while the admin has no live bundle — a worked example of what a
 *  bundle looks like, never addable. The moment /combos returns one, this goes. */
const PREVIEW_BUNDLES = [
  {
    name: "Pastel Trio",
    qty: 3,
    price: 249,
    was: 390,
    note: "Any three pastel skeins — baby blankets and amigurumi.",
    shades: [
      "/assets/yarn-cutout/delight-pink.webp",
      "/assets/yarn-cutout/candy-lilac.webp",
      "/assets/yarn-cutout/candy-blue.webp",
    ],
  },
  {
    name: "Warm Five",
    qty: 5,
    price: 399,
    was: 650,
    note: "Rust, coral and marigold shades wound for stitch definition.",
    shades: [
      "/assets/yarn-cutout/delight-rust.webp",
      "/assets/yarn-cutout/delight-coral.webp",
      "/assets/yarn-cutout/hobby-yellow.webp",
      "/assets/yarn-cutout/hobby-red.webp",
    ],
  },
  {
    name: "Studio Six",
    qty: 6,
    price: 449,
    was: 780,
    note: "A full palette for one project — mix any six from the range.",
    shades: [
      "/assets/yarn-cutout/hobby-green.webp",
      "/assets/yarn-cutout/candy-black.webp",
      "/assets/yarn-cutout/delight-pink.webp",
      "/assets/yarn-cutout/candy-blue.webp",
    ],
  },
];

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Yarn Offers & Bundles — Coupons & Discounts | Royaall Wool India" },
      {
        name: "description",
        content:
          "Save on premium yarn with live coupons, bundle deals & combo offers. Buy crochet & knitting yarn at best prices. Royaall Wool India.",
      },
      { property: "og:title", content: "Yarn Offers & Bundles — Coupons & Discounts | Royaall Wool India" },
      { property: "og:description", content: "Live coupons and yarn bundles from Royaall Wool. Flat price on combo sets." },
      { property: "og:url", content: "https://royaallwool.com/offers" },
    ],
    links: [{ rel: "canonical", href: "https://royaallwool.com/offers" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://royaallwool.com/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Offers",
              item: "https://royaallwool.com/offers",
            },
          ],
        }),
      },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const coupons = useQuery(activeCouponsQuery);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance the hero; hovering (or focusing a control) holds it still.
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setSlide((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const active = HERO_SLIDES[slide]!;
  const combos = useQuery(combosQuery);
  const catalogue = useQuery(productsQuery({ limit: 100 }));

  const liveCombos = (combos.data ?? []).filter(comboIsLive);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-16 lg:px-10">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <header
        className="relative overflow-hidden rounded-3xl border border-border"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-[26rem] w-[26rem] rounded-full blur-3xl"
          style={{ background: "color-mix(in oklab, var(--marigold) 26%, transparent)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-24 h-[24rem] w-[24rem] rounded-full blur-3xl"
          style={{ background: "color-mix(in oklab, var(--indigo) 16%, transparent)" }}
          aria-hidden
        />

        <div className="relative grid items-center gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* copy — keyed so each slide fades in on its own */}
          <div key={slide} className="animate-[rw-slide-in_600ms_ease-out]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-marigold/40 px-3 py-1 font-data text-2xs uppercase tracking-[0.18em] text-marigold">
              <Sparkles className="h-3 w-3" /> {active.badge}
            </span>
            <h1 className="mt-4 max-w-xl font-display text-3xl font-light leading-[1.06] tracking-[-0.03em] text-foreground sm:text-[2.75rem]">
              {active.title}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {active.note}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <a
                href="#bundles"
                data-cursor="link"
                className="sheen inline-flex items-center gap-2 rounded-full bg-madder px-5 py-2.5 font-data text-2xs text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Package2 className="h-4 w-4" /> Build a bundle
              </a>
              <Link
                to="/collections"
                data-cursor="link"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
              >
                Browse every yarn
              </Link>
            </div>

            {/* slide dots */}
            <div className="mt-6 flex items-center gap-2">
              {HERO_SLIDES.map((sl, i) => (
                <button
                  key={sl.badge}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={`Show ${sl.badge}`}
                  aria-current={i === slide}
                  data-cursor="link"
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i === slide ? "w-8 bg-marigold" : "w-4 bg-border hover:bg-marigold/50",
                  )}
                />
              ))}
            </div>
          </div>

          {/* skein stack — one fan per slide, cross-faded */}
          <div className="relative mx-auto hidden h-52 w-full max-w-sm sm:block">
            <div
              className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
              style={{ background: "color-mix(in oklab, var(--marigold) 30%, transparent)" }}
              aria-hidden
            />
            {HERO_SLIDES.map((sl, si) => (
              <div
                key={sl.badge}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  si === slide ? "opacity-100" : "opacity-0",
                )}
                aria-hidden
              >
                {sl.skeins.map((sk, i) => (
                  <img
                    key={sk.src}
                    src={sk.src}
                    alt=""
                    loading="lazy"
                    className="absolute w-[38%] drop-shadow-xl transition-transform duration-500 hover:-translate-y-1.5"
                    style={{
                      left: sk.left,
                      top: sk.top,
                      transform: `rotate(${sk.rotate}deg)`,
                      zIndex: sl.skeins.length - i,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Bundles ────────────────────────────────────────────────── */}
      <section id="bundles" className="mt-14 scroll-mt-24 sm:mt-20" aria-label="Yarn bundles">
        <SectionHead
          eyebrow="01 · Bundles"
          title="Build a bundle"
          note="Choose any set from a bundle's shades. The flat bundle price replaces the regular total at checkout."
        />

        <div className="mt-8">
          {combos.isPending || catalogue.isPending ? (
            <GridSkeleton count={2} ratio="aspect-[16/9]" />
          ) : combos.isError ? (
            <DataError error={combos.error} retry={() => void combos.refetch()} />
          ) : liveCombos.length ? (
            <div className="grid max-w-5xl items-start gap-5 lg:grid-cols-2">
              {liveCombos.map((c) => (
                <BundleCard key={c.id} combo={c} catalogue={catalogue.data ?? []} />
              ))}
            </div>
          ) : (
            <PreviewBundles />
          )}
        </div>
      </section>

      {/* ── Coupons ────────────────────────────────────────────────── */}
      <section className="mt-16 sm:mt-24" aria-label="Coupons">
        <SectionHead
          eyebrow="02 · Coupons"
          title="Codes on the rack"
          note="Nothing to type — checkout picks your best code on its own. Copy one if you'd rather share it."
        />

        <div className="mt-8">
          {coupons.isPending ? (
            <GridSkeleton count={3} ratio="aspect-[6/1]" />
          ) : coupons.isError ? (
            <DataError error={coupons.error} retry={() => void coupons.refetch()} />
          ) : coupons.data?.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.data.map((c) => (
                <li key={c.id}>
                  <CouponCard coupon={c} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No live coupons right now"
              note="Free delivery thresholds still apply on every order."
            />
          )}
        </div>
      </section>
    </div>
  );
}

function SectionHead({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <div className="max-w-2xl">
      <p className="font-data text-2xs uppercase tracking-[0.18em] text-marigold">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-light tracking-[-0.02em] text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

/* ── Bundle builder ───────────────────────────────────────────────── */

function BundleCard({ combo, catalogue }: { combo: Combo; catalogue: Product[] }) {
  const { formatMoney } = useSettings();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [picked, setPicked] = useState<string[]>([]);

  // A bundle either lists its products or qualifies them by skein weight —
  // both resolve to the same pickable set here.
  const eligible = useMemo(() => {
    const ids = combo.product_ids ?? [];
    if (ids.length) return catalogue.filter((p) => ids.includes(p.id));
    if (combo.weight_target != null) {
      return catalogue.filter((p) => Number(p.skein_weight) === Number(combo.weight_target));
    }
    return [];
  }, [catalogue, combo.product_ids, combo.weight_target]);

  const priceOf = (p: Product) => p.final_price ?? p.price;
  const need = combo.qty;
  // When the admin pinned exactly as many yarns as the bundle needs, the set is
  // already decided — nothing for the shopper to choose.
  const fixed = eligible.length > 0 && eligible.length <= need;
  const chosen = fixed ? eligible.length : picked.length;
  const ready = fixed || chosen === need;

  // What the picked set would normally cost. Before anything is picked we show
  // the dearest qualifying set, so the headline saving is never overstated.
  const regular = fixed
    ? eligible.reduce((sum, p) => sum + priceOf(p), 0)
    : ready
    ? picked.reduce((sum, id) => {
        const p = eligible.find((x) => x.id === id);
        return sum + (p ? priceOf(p) : 0);
      }, 0)
    : eligible
        .map(priceOf)
        .sort((a, b) => b - a)
        .slice(0, need)
        .reduce((sum, v) => sum + v, 0);
  const saving = Math.max(0, regular - combo.price);

  const toggle = (id: string) => {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= need) return [...prev.slice(1), id]; // oldest pick rolls off
      return [...prev, id];
    });
  };

  /** Straight to checkout with the set in the bag — no cart detour. */
  const buyBundle = () => {
    const chosenProducts = fixed
      ? eligible
      : picked.map((id) => eligible.find((x) => x.id === id)).filter(Boolean as unknown as (p: Product | undefined) => p is Product);

    chosenProducts.forEach((p) => {
      addItem({
        productId: p.id,
        title: p.title,
        price: priceOf(p),
        qty: 1,
        image: p.images?.[0],
      });
    });
    setPicked([]);
    toast.success(`${combo.name} added — bundle price applies at checkout.`);
    void navigate({ to: "/checkout" });
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-border">
      {/* head */}
      <div
        className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-6"
        style={{ background: "color-mix(in oklab, var(--marigold) 7%, transparent)" }}
      >
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-marigold/20 px-2.5 py-1 font-data text-2xs uppercase tracking-wider text-marigold">
            <Package2 className="h-3.5 w-3.5" /> Any {need}
          </span>
          <h3 className="mt-2.5 truncate font-display text-2xl font-light text-foreground">
            {combo.name}
          </h3>
          {combo.description ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {combo.description}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <p className="font-display text-3xl font-light leading-none text-foreground">
            {formatMoney(combo.price)}
          </p>
          {saving > 0 ? (
            <p className="mt-1.5 font-data text-2xs text-indigo">
              Save {formatMoney(saving)}
              <span className="ml-1.5 text-muted-foreground/70 line-through">
                {formatMoney(regular)}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      {/* picker */}
      <div className="flex-1 px-5 py-5 sm:px-6">
        {eligible.length ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="font-data text-2xs uppercase tracking-[0.14em] text-muted-foreground">
                {fixed ? "What's in the bundle" : "Pick your shades"}
              </p>
              {fixed ? null : (
                <p className="font-data text-2xs text-foreground">
                  {chosen} / {need} chosen
                </p>
              )}
            </div>

            {fixed ? null : (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-marigold transition-[width] duration-300"
                  style={{ width: `${Math.min(100, (chosen / need) * 100)}%` }}
                />
              </div>
            )}

            <ul className="mt-3 flex flex-wrap justify-center gap-2">
              {eligible.map((p) => {
                const on = fixed || picked.includes(p.id);
                return (
                  <li key={p.id} className="w-[92px] sm:w-[100px]">
                    <button
                      type="button"
                      onClick={fixed ? undefined : () => toggle(p.id)}
                      disabled={fixed}
                      data-cursor={fixed ? undefined : "link"}
                      aria-pressed={on}
                      className={cn(
                        "group w-full overflow-hidden rounded-xl border text-left transition-all",
                        on
                          ? "border-marigold shadow-[0_0_0_1px_var(--marigold)]"
                          : "border-border hover:border-marigold/60",
                      )}
                    >
                      <span className="relative block aspect-square overflow-hidden bg-secondary/40">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        ) : null}
                        <span
                          className={cn(
                            "absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                            on
                              ? "border-marigold bg-marigold text-ink"
                              : "border-border bg-background/80 text-transparent",
                          )}
                          aria-hidden
                        >
                          <Check className="h-3 w-3" />
                        </span>
                      </span>
                      <span className="block px-2 py-1.5">
                        <span className="line-clamp-1 text-2xs text-foreground">{p.title}</span>
                        <span className="mt-0.5 block font-data text-2xs text-muted-foreground">
                          {formatMoney(priceOf(p))}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            This bundle applies to qualifying yarns by weight — add any matching skeins and the
            price adjusts at checkout.
          </p>
        )}
      </div>

      {/* action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-6">
        <p className="font-data text-2xs text-muted-foreground">
          {eligible.length
            ? fixed
              ? `${eligible.length} yarns · ${formatMoney(combo.price)} at checkout`
              : ready
                ? `Bundle ready · ${formatMoney(combo.price)} at checkout`
                : `Choose ${need - chosen} more to unlock this price`
            : "Bundle price is applied automatically"}
        </p>

        {eligible.length ? (
          <button
            type="button"
            onClick={buyBundle}
            disabled={!ready}
            data-cursor="link"
            className="sheen inline-flex shrink-0 items-center gap-2 rounded-full bg-madder px-5 py-2.5 font-data text-2xs text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Package2 className="h-3.5 w-3.5" /> Buy this bundle
          </button>
        ) : (
          <Link
            to="/collections"
            data-cursor="link"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-5 py-2.5 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
          >
            Browse yarns
          </Link>
        )}
      </div>
    </article>
  );
}

/* ── Preview (no live bundle yet) ─────────────────────────────────── */

function PreviewBundles() {
  const { formatMoney } = useSettings();

  return (
    <div>
      <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-data text-2xs text-muted-foreground">
        <Package2 className="h-3.5 w-3.5 text-marigold" />
        No bundle is live yet — here is how one will look
      </p>

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {PREVIEW_BUNDLES.map((b) => (
          <li
            key={b.name}
            className="flex flex-col overflow-hidden rounded-3xl border border-dashed border-border"
          >
            <div
              className="relative flex h-44 items-center justify-center overflow-hidden"
              style={{ background: "color-mix(in oklab, var(--marigold) 8%, transparent)" }}
            >
              <div
                className="absolute h-32 w-32 rounded-full blur-2xl"
                style={{ background: "color-mix(in oklab, var(--marigold) 34%, transparent)" }}
                aria-hidden
              />
              {b.shades.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="relative h-24 w-24 object-contain drop-shadow-lg"
                  style={{
                    marginLeft: i === 0 ? 0 : "-1.6rem",
                    transform: `rotate(${(i - 1.5) * 7}deg)`,
                    zIndex: b.shades.length - i,
                  }}
                />
              ))}
              <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 font-data text-2xs uppercase tracking-wider text-muted-foreground">
                Preview
              </span>
            </div>

            <div className="flex flex-1 flex-col px-5 py-4">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-marigold/15 px-2.5 py-1 font-data text-2xs uppercase tracking-wider text-marigold">
                <Package2 className="h-3.5 w-3.5" /> Any {b.qty}
              </span>
              <h3 className="mt-2.5 font-display text-xl font-light text-foreground">{b.name}</h3>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{b.note}</p>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-2xl font-light text-foreground">
                  {formatMoney(b.price)}
                </span>
                <span className="font-data text-2xs text-muted-foreground/70 line-through">
                  {formatMoney(b.was)}
                </span>
                <span className="ml-auto font-data text-2xs text-indigo">
                  Save {formatMoney(b.was - b.price)}
                </span>
              </div>

              <button
                type="button"
                disabled
                className="mt-4 w-full rounded-full border border-border px-5 py-2.5 font-data text-2xs text-muted-foreground opacity-60"
              >
                Coming soon
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Coupons ──────────────────────────────────────────────────────── */

function CouponCard({ coupon }: { coupon: Coupon }) {
  const { formatMoney } = useSettings();

  const headline =
    coupon.type === "percent" ? `${Math.round(coupon.value)}%` : formatMoney(coupon.value);

  const terms = [
    coupon.min_order ? `Min ${formatMoney(coupon.min_order)}` : null,
    coupon.max_discount ? `Up to ${formatMoney(coupon.max_discount)} off` : null,
    coupon.first_order_only ? "First order only" : null,
    coupon.valid_until ? `Till ${new Date(coupon.valid_until).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <CouponTicket
      code={coupon.code}
      headline={headline}
      description={coupon.description || undefined}
      terms={terms || undefined}
      copyable
    />
  );
}
