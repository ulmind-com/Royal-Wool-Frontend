import { useQuery } from "@tanstack/react-query";

import { ProductCard } from "@/components/commerce/product-card";
import { homeSectionsQuery } from "@/lib/api/catalog-extras";

/**
 * Sections the admin orders in "Mobile App Layout" — recommendations, manual
 * picks and category rails — rendered in exactly the order they were arranged.
 * The endpoint drops empty sections, so anything here has products.
 */
export function AdminHomeSections() {
  const { data } = useQuery(homeSectionsQuery);
  const sections = data ?? [];
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <section
          key={section.id}
          aria-label={section.title}
          className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10"
        >
          <h2 className="font-display text-2xl font-light tracking-[-0.02em] text-foreground sm:text-3xl">
            {section.title}
          </h2>

          {section.layout === "grid" ? (
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {section.products.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} className="h-full" />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="-mx-1 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {section.products.map((p) => (
                <li
                  key={p.id}
                  className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%] xl:w-[19%]"
                >
                  <ProductCard product={p} className="h-full" />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}
