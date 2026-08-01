import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { CardSkeleton, DataError } from "@/components/data-state";
import { Glass } from "@/components/ui/glass";
import { YARN_WEIGHTS } from "@/data/yarn-weights";
import { useReducedMotion } from "@/hooks/use-motion";
import { categoryTreeQuery } from "@/lib/api/queries";
import type { CategoryNode } from "@/lib/api/types";

/**
 * "Shop by Yarn Weight" — liquid-glass tile rail, fully admin-driven.
 *
 * Tiles come from /categories/tree: we look for a group whose name/slug reads
 * like "yarn weight" and use its children. Rename, reorder, add or remove
 * weight categories in the admin panel and this section follows — no code
 * change. Clicking a tile opens that category's own product listing.
 * When the backend has no weight group yet, the local 1–7 scale is shown as a
 * fallback so the page never looks broken.
 */

type WeightTileData = {
  key: string;
  /** Number badge, derived from position (or the matched standard weight). */
  weight: number;
  name: string;
  /** Small marigold spec line. */
  spec: string;
  note: string;
  href:
    | { to: "/search"; search: { q: string } }
    | { to: "/collections/$slug"; params: { slug: string } };
};

const WEIGHT_GROUP_RE = /(yarn\s*)?weight|gauge|ply|thickness/i;

/** Local spec lookup so API categories still get "Hook 5 mm" when admin has none. */
function specFor(name: string, index: number): { spec: string; note: string; weight: number } {
  const normalized = name.trim().toLowerCase();
  const match =
    YARN_WEIGHTS.find((w) => w.name.toLowerCase() === normalized) ??
    YARN_WEIGHTS.find((w) => normalized.includes(w.name.toLowerCase())) ??
    YARN_WEIGHTS[index % YARN_WEIGHTS.length]!;
  const exact = match.name.toLowerCase() === normalized || normalized.includes(match.name.toLowerCase());
  return {
    spec: exact ? `Hook ${match.hookMm}` : "Shop range",
    note: exact ? match.note : "Every shade at this gauge",
    weight: exact ? match.weight : index + 1,
  };
}

const byOrder = (a: CategoryNode, b: CategoryNode) => (a.order ?? 0) - (b.order ?? 0);

/** Finds the weight group anywhere in the tree and maps its children to tiles. */
function toWeightTiles(tree: CategoryNode[] | undefined): WeightTileData[] {
  if (!tree?.length) return [];

  const stack = [...tree];
  let group: CategoryNode | undefined;
  while (stack.length) {
    const node = stack.shift()!;
    if (WEIGHT_GROUP_RE.test(node.name) || WEIGHT_GROUP_RE.test(node.slug)) {
      if (node.children?.length) {
        group = node;
        break;
      }
    }
    if (node.children?.length) stack.push(...node.children);
  }

  // Fall back to top-level categories that themselves name a standard weight.
  const nodes = group?.children?.length
    ? [...group.children].sort(byOrder)
    : tree
        .filter((n) => YARN_WEIGHTS.some((w) => n.name.toLowerCase().includes(w.name.toLowerCase())))
        .sort(byOrder);

  return nodes.map((node, index) => {
    const { spec, note, weight } = specFor(node.name, index);
    return {
      key: node.id,
      weight,
      name: node.name,
      spec,
      note,
      href: { to: "/collections/$slug", params: { slug: node.slug } },
    } satisfies WeightTileData;
  });
}

const FALLBACK_TILES: WeightTileData[] = YARN_WEIGHTS.map((w) => ({
  key: w.id,
  weight: w.weight,
  name: w.name,
  spec: `Hook ${w.hookMm}`,
  note: w.note,
  href: { to: "/search", search: { q: w.query } },
}));

/** Twisted-strand mark; thickness and spacing are derived from the weight. */
function StrandMark({ weight }: { weight: number }) {
  const t = Math.min(Math.max(weight - 1, 0), 6) / 6; // 0 → 1
  const stroke = 1.1 + t * 5.4;
  const strands = weight <= 2 ? 4 : weight <= 4 ? 3 : 2;
  const gap = 20 / (strands + 1);

  return (
    <svg
      viewBox="0 0 88 20"
      className="h-8 w-full text-marigold"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      {Array.from({ length: strands }, (_, i) => {
        const y = gap * (i + 1);
        const amp = 2.4 + t * 2;
        return (
          <path
            key={i}
            d={`M4 ${y} C 20 ${y - amp}, 30 ${y + amp}, 44 ${y} S 68 ${y - amp}, 84 ${y}`}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            opacity={0.55 + (i % 2) * 0.35}
          />
        );
      })}
    </svg>
  );
}

/** Renders the right typed Link for an API (collection) or fallback (search) tile. */
function TileLink({
  href,
  children,
  ...rest
}: {
  href: WeightTileData["href"];
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  "data-cursor"?: string;
}) {
  if (href.to === "/search") {
    return (
      <Link to="/search" search={href.search} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/collections/$slug" params={href.params} {...rest}>
      {children}
    </Link>
  );
}

function WeightTile({
  item,
  index,
  reduced,
}: {
  item: WeightTileData;
  index: number;
  reduced: boolean;
}) {
  return (
    <motion.li
      className="min-w-[11rem] snap-start sm:min-w-0"
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <TileLink
        href={item.href}
        data-cursor="link"
        aria-label={`Shop ${item.name} yarn`}
        className="group block h-full focus-visible:outline-none"
      >
        <Glass
          variant="card"
          refract
          className="sheen flex h-full flex-col items-center gap-2.5 rounded-[1.25rem] p-4 text-center group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_56px_-38px_color-mix(in_oklab,var(--ink)_45%,transparent)] group-focus-visible:-translate-y-1.5"
        >
          {/* marigold bloom on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-[var(--dur-slow)] group-hover:opacity-100"
            style={{
              backgroundImage:
                "radial-gradient(110% 80% at 50% 0%, color-mix(in oklab, var(--marigold) 24%, transparent), transparent 65%)",
            }}
          />

          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-foreground font-data text-2xs text-background transition-transform duration-[var(--dur-base)] ease-[var(--ease-enter)] group-hover:scale-110">
            {item.weight}
          </span>

          <span className="relative block w-full">
            <StrandMark weight={item.weight} />
          </span>

          <span className="relative mt-auto block w-full">
            <span className="block truncate font-display text-base font-normal leading-tight text-foreground">
              {item.name}
            </span>
            <span className="mt-1 block font-data text-2xs text-marigold">{item.spec}</span>
            <span className="mt-1 block truncate text-xs leading-snug text-muted-foreground">
              {item.note}
            </span>
          </span>
        </Glass>
      </TileLink>
    </motion.li>
  );
}

export function YarnWeightRail() {
  const reduced = useReducedMotion();
  const { data, isPending, isError, error, refetch } = useQuery(categoryTreeQuery);

  const apiTiles = toWeightTiles(data);
  const tiles = apiTiles.length ? apiTiles : FALLBACK_TILES;

  return (
    <section
      data-thread-anchor="weights"
      className="mt-24 sm:mt-28"
      aria-labelledby="shop-by-yarn-weight"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-data text-2xs text-marigold">04 · Yarn weight</p>
            <h2
              id="shop-by-yarn-weight"
              className="mt-3 font-display text-4xl font-light tracking-[-0.02em] text-foreground sm:text-5xl"
            >
              Shop by Yarn Weight
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Thinnest to thickest. Pick a weight and see every shade we wind at that gauge.
            </p>
          </div>

          <Glass variant="pill" className="font-data text-2xs text-muted-foreground">
            {tiles.length} weights
          </Glass>
        </div>

        {/* mobile: snap rail with edge fade · sm+: 4 cols · lg: full 7-up */}
        <div className="relative mt-10">
          {isPending ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              {Array.from({ length: 7 }, (_, i) => (
                <CardSkeleton key={i} className="aspect-[4/5]" />
              ))}
            </div>
          ) : isError && !apiTiles.length && !FALLBACK_TILES.length ? (
            <DataError error={error} retry={() => void refetch()} />
          ) : (
            <>
              <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-7">
                {tiles.map((item, i) => (
                  <WeightTile key={item.key} item={item} index={i} reduced={reduced} />
                ))}
              </ul>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:hidden"
                style={{
                  backgroundImage:
                    "linear-gradient(to left, var(--background), color-mix(in oklab, var(--background) 0%, transparent))",
                }}
              />
            </>
          )}
        </div>

        <Link
          to="/collections"
          data-cursor="link"
          className="sheen mt-8 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
        >
          Browse every weight
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
