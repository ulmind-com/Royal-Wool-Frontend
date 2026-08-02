import { SPEC_ART } from "@/components/commerce/spec-art";
import type { SpecRow } from "@/lib/api/specs";

/**
 * Yarn spec sheet — a two-column deck of quiet cards, each carrying a
 * hand-drawn ink medallion, a micro label and the admin-provided value.
 * Rows the backend doesn't send are never rendered.
 */
export function SpecTiles({ specs }: { specs: SpecRow[] }) {
  if (!specs.length) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <p className="font-data text-2xs uppercase tracking-[0.22em] text-marigold">
          Specifications
        </p>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>

      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {specs.map((row) => (
          <li
            key={row.id}
            className="group relative overflow-hidden rounded-2xl border border-border/70 transition-all duration-[var(--dur-standard)] ease-[var(--ease-enter)] hover:-translate-y-0.5 hover:border-marigold/50"
            style={{
              backgroundImage:
                "linear-gradient(135deg, color-mix(in oklab, var(--madder) 5%, transparent), color-mix(in oklab, var(--marigold) 4%, transparent))",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-marigold transition-transform duration-[var(--dur-standard)] ease-[var(--ease-enter)] group-hover:scale-x-100"
            />
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-3.5 py-3">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border/60 bg-card/70"
                aria-hidden
              >
                <img
                  src={SPEC_ART[row.id]}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={512}
                  height={512}
                  className="h-7 w-7 object-contain opacity-85 transition-transform duration-[var(--dur-standard)] ease-[var(--ease-enter)] group-hover:scale-105"
                />
              </span>
              <div className="min-w-0">
                <p className="font-data text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {row.label}
                </p>
                <p className="mt-0.5 truncate text-[0.95rem] leading-snug text-foreground">
                  {row.value}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
