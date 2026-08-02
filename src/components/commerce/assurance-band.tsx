import { ASSURANCE_ART } from "@/components/commerce/assurance-art";
import type { AssuranceRow } from "@/lib/api/assurance";

/**
 * Store assurance band — icon over title over note, two per row, hairline
 * separated. Rows come from the API when present, demo copy otherwise.
 */
export function AssuranceBand({ rows }: { rows: AssuranceRow[] }) {
  if (!rows.length) return null;

  return (
    <section className="mt-10 border-t border-border/70 pt-8" aria-label="Store assurances">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8">
        {rows.map((row) => (
          <li key={row.id} className="group flex flex-col items-center px-1 text-center">
            <span
              aria-hidden
              className="grid h-14 w-14 place-items-center rounded-full border border-border/60 bg-card/70 transition-all duration-[var(--dur-standard)] ease-[var(--ease-enter)] group-hover:-translate-y-0.5 group-hover:border-marigold/60"
            >
              <img
                src={ASSURANCE_ART[row.id]}
                alt=""
                loading="lazy"
                decoding="async"
                width={512}
                height={512}
                className="h-9 w-9 object-contain opacity-85 transition-transform duration-[var(--dur-standard)] ease-[var(--ease-enter)] group-hover:scale-105"
              />
            </span>
            <p className="mt-3 font-display text-[0.95rem] font-normal leading-snug text-foreground">
              {row.title}
            </p>
            <p className="mt-1 max-w-[15rem] text-xs leading-relaxed text-muted-foreground">
              {row.note}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
