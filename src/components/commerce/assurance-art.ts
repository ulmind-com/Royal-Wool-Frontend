import baby from "@/assets/assurance/baby.png.asset.json";
import delivery from "@/assets/assurance/delivery.png.asset.json";
import quality from "@/assets/assurance/quality.png.asset.json";
import secure from "@/assets/assurance/secure.png.asset.json";

import type { AssuranceId } from "@/lib/api/assurance";

/** Hand-drawn ink illustrations for the store assurance band. */
export const ASSURANCE_ART: Record<AssuranceId, string> = {
  secure: secure.url,
  delivery: delivery.url,
  baby: baby.url,
  quality: quality.url,
};
