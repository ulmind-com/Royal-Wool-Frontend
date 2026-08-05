import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Globe2, Layers } from "lucide-react";

import { countriesQuery, productLinesQuery } from "@/lib/api/catalog-extras";
import type { Product } from "@/lib/api/types";

/**
 * Product line and country of origin. Products store either a name or a slug,
 * so both admin lists are consulted to print a proper label.
 */
export function Provenance({ product }: { product: Product }) {
  const { data: lines } = useQuery(productLinesQuery);
  const { data: countries } = useQuery(countriesQuery);

  // These two live on the backend product but aren't in the shared Product type.
  const extra = product as unknown as Record<string, string | null | undefined>;
  const rawLine = extra["product_line"] ?? null;
  const rawCountry = extra["country_of_origin"] ?? null;
  if (!rawLine && !rawCountry) return null;

  const match = (list: Array<{ name: string; slug?: string }> | undefined, raw: string) =>
    list?.find((x) => x.slug === raw || x.name.toLowerCase() === raw.toLowerCase())?.name ?? raw;

  const line = rawLine ? match(lines, rawLine) : null;
  const country = rawCountry ? match(countries, rawCountry) : null;

  return (
    <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-data text-2xs text-muted-foreground">
      {line ? (
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-marigold" aria-hidden />
          <dt className="sr-only">Product line</dt>
          <dd>
            <Link
              to="/search"
              search={{ q: line }}
              className="transition-colors hover:text-marigold"
            >
              {line}
            </Link>
          </dd>
        </div>
      ) : null}
      {country ? (
        <div className="flex items-center gap-1.5">
          <Globe2 className="h-3.5 w-3.5 text-indigo" aria-hidden />
          <dt className="sr-only">Country of origin</dt>
          <dd>Made in {country}</dd>
        </div>
      ) : null}
    </dl>
  );
}
