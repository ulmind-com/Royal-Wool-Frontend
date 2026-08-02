import ballWeight from "@/assets/spec/ball-weight.png.asset.json";
import crochetStitch from "@/assets/spec/crochet-stitch.png.asset.json";
import fibre from "@/assets/spec/fibre.png.asset.json";
import hook from "@/assets/spec/hook.png.asset.json";
import length from "@/assets/spec/length.png.asset.json";
import needle from "@/assets/spec/needle.png.asset.json";
import needleStitch from "@/assets/spec/needle-stitch.png.asset.json";
import weight from "@/assets/spec/weight.png.asset.json";

import type { SpecId } from "@/lib/api/specs";

/**
 * Hand-drawn ink illustrations for the yarn spec sheet. Transparent PNGs served
 * from the CDN, keyed by spec id so unknown/absent specs simply never render.
 */
export const SPEC_ART: Record<SpecId, string> = {
  fibre: fibre.url,
  weight: weight.url,
  length: length.url,
  needle: needle.url,
  hook: hook.url,
  needle_stitch: needleStitch.url,
  crochet_stitch: crochetStitch.url,
  ball_weight: ballWeight.url,
};
