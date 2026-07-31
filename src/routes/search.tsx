import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { ProductGrid } from "@/components/commerce/product-card";
import { DataError, EmptyState, GridSkeleton } from "@/components/data-state";
import { productsQuery } from "@/lib/api/queries";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  head: () => ({
    meta: [
      { title: "Search yarns — Royal Wool" },
      {
        name: "description",
        content: "Search Royal Wool by colour, fibre, weight, brand, price and rating.",
      },
      { property: "og:title", content: "Search yarns — Royal Wool" },
      { property: "og:description", content: "Filter by colour, fibre, weight, price and rating." },
      { property: "og:url", content: "/search" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/search" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  // The query lives in the URL so results stay shareable and back/forward work.
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(q);

  useEffect(() => setDraft(q), [q]);

  const results = useQuery({
    ...productsQuery({ q, limit: 48 }),
    enabled: q.trim().length > 1,
  });

  const submit = (value: string) => {
    void navigate({ to: "/search", search: { q: value.trim() } });
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-24 pt-16 sm:px-6 lg:px-10">
      <p className="font-data text-2xs text-marigold">Search</p>
      <h1 className="mt-4 font-display text-fluid-3xl font-light tracking-[-0.03em] text-fleece">
        Find your colour
      </h1>

      <form
        className="mt-10 flex max-w-2xl items-center gap-3 rounded-full border border-border px-5 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
        role="search"
      >
        <SearchIcon className="h-4 w-4 shrink-0 text-fleece-dim" aria-hidden />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Try “cotton”, “baby soft”, “mustard”"
          aria-label="Search yarns"
          className="min-w-0 flex-1 bg-transparent font-data text-2xs text-fleece outline-none placeholder:text-fleece-dim/60"
        />
        <button
          type="submit"
          data-cursor="link"
          className="shrink-0 rounded-full bg-madder px-4 py-2 font-data text-2xs text-primary-foreground"
        >
          Search
        </button>
      </form>

      <div className="mt-12">
        {q.trim().length < 2 ? (
          <EmptyState
            title="Start typing"
            note="Search by fibre, colour or brand — two letters is enough to get going."
          />
        ) : results.isPending ? (
          <GridSkeleton count={8} />
        ) : results.isError ? (
          <DataError error={results.error} retry={() => void results.refetch()} />
        ) : results.data?.length ? (
          <>
            <p className="mb-6 font-data text-2xs text-fleece-dim">
              {results.data.length} result{results.data.length === 1 ? "" : "s"} for “{q}”
            </p>
            <ProductGrid products={results.data} />
          </>
        ) : (
          <EmptyState
            title={`Nothing matched “${q}”`}
            note="Try a broader word like “cotton” or “acrylic”, or message us and we'll point you at the right shade."
          />
        )}
      </div>
    </div>
  );
}
