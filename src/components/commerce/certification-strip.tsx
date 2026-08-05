import { useQuery } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";

import { certificationsQuery } from "@/lib/api/catalog-extras";

/** Mill certifications the admin maintains — trust marks under the buy box. */
export function CertificationStrip() {
  const { data } = useQuery(certificationsQuery);
  const certs = data ?? [];
  if (certs.length === 0) return null;

  return (
    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Certifications">
      {certs.map((c) => (
        <li
          key={c.id}
          title={c.description || c.name}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 font-data text-2xs text-muted-foreground"
        >
          {c.logo ? (
            <img src={c.logo} alt="" loading="lazy" className="h-4 w-4 rounded-sm object-contain" />
          ) : (
            <BadgeCheck className="h-3.5 w-3.5 text-indigo" />
          )}
          {c.name}
        </li>
      ))}
    </ul>
  );
}
