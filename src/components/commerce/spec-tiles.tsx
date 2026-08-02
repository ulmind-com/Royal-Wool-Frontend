import { SPEC_ICON } from "@/components/commerce/spec-icons";
import type { SpecRow } from "@/lib/api/specs";

/**
 * Yarn spec sheet — one soft-tinted row per admin-provided attribute. Rows the
 * backend doesn't send are simply never rendered.
 */
export function SpecTiles({ specs }: { specs: SpecRow[] }) {
  if (!specs.length) return null;

  return (
    <ul className="mt-8 grid gap-2 sm:grid-cols-2">
      {specs.map((row) => {
        const Icon = SPEC_ICON[row.id];
        return (
          <li
            key={row.id}
            className="flex items-center gap-3 rounded-2xl border border-border/70 px-3 py-3"
            style={{
              backgroundImage:
                "linear-gradient(120deg, color-mix(in oklab, var(--madder) 6%, transparent), color-mix(in oklab, var(--marigold) 5%, transparent))",
            }}
          >
            <Icon className="h-7 w-7 shrink-0 text-madder" />
            <div className="min-w-0">
              <p className="font-data text-2xs text-muted-foreground">{row.label}</p>
              <p className="truncate text-sm text-foreground">{row.value}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
