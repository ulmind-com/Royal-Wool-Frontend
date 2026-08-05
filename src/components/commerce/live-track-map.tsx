import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Home, PackageCheck, Store, Truck } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Live shipment map. Draws an OpenStreetMap tile mosaic directly (slippy-tile
 * maths — no map library, no SSR-only globals), sized to whatever box it lands
 * in, with the studio, the delivery address and a courier interpolated along
 * the route by the order's status.
 */

const TILE = 256;

/** How far along the route each status sits, 0 = studio, 1 = doorstep. */
const STATUS_PROGRESS: Record<string, number> = {
  placed: 0.04,
  confirmed: 0.12,
  packed: 0.22,
  processing: 0.22,
  shipped: 0.5,
  out_for_delivery: 0.85,
  delivered: 1,
};

const STATUS_COPY: Record<string, string> = {
  placed: "Order placed — awaiting confirmation",
  confirmed: "Confirmed and being packed",
  packed: "Packed and labelled",
  processing: "Being packed for you",
  shipped: "In transit to your city",
  out_for_delivery: "Out for delivery — arriving today",
  delivered: "Delivered to your doorstep",
  cancelled: "Order cancelled",
  returned: "Return completed",
};

const lngToX = (lng: number, z: number) => ((lng + 180) / 360) * 2 ** z;

const latToY = (lat: number, z: number) => {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z;
};

export interface LiveTrackMapProps {
  status: string;
  from: { lat: number; lng: number; label?: string };
  to: { lat: number; lng: number; label?: string };
  className?: string;
}

export function LiveTrackMap({ status, from, to, className }: LiveTrackMapProps) {
  const key = status?.toLowerCase().replace(/\s+/g, "_") ?? "placed";
  const target = STATUS_PROGRESS[key] ?? 0.1;
  const dead = key === "cancelled" || key === "returned";
  const delivered = key === "delivered";

  const frameRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // The mosaic must cover the real box, so it is measured rather than assumed.
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const read = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The courier eases into position once the tiles are up — reads as "live".
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (dead) return setProgress(0);
    const t = setTimeout(() => setProgress(target), 260);
    return () => clearTimeout(t);
  }, [target, dead]);

  const view = useMemo(() => {
    const w = box.w || 960;
    const h = box.h || 280;

    // Deepest zoom that still leaves margin around both endpoints.
    let zoom = 4;
    for (let z = 14; z >= 4; z -= 1) {
      const dx = Math.abs(lngToX(from.lng, z) - lngToX(to.lng, z)) * TILE;
      const dy = Math.abs(latToY(from.lat, z) - latToY(to.lat, z)) * TILE;
      if (dx < w * 0.5 && dy < h * 0.52) {
        zoom = z;
        break;
      }
    }

    const cx = (lngToX(from.lng, zoom) + lngToX(to.lng, zoom)) / 2;
    const cy = (latToY(from.lat, zoom) + latToY(to.lat, zoom)) / 2;

    // Top-left of the visible box, in fractional tile units.
    const originX = cx - w / 2 / TILE;
    const originY = cy - h / 2 / TILE;

    const cols = Math.ceil(w / TILE) + 1;
    const rows = Math.ceil(h / TILE) + 1;
    const span = 2 ** zoom;

    const tiles: Array<{ key: string; url: string; left: number; top: number }> = [];
    for (let i = 0; i < cols; i += 1) {
      for (let j = 0; j < rows; j += 1) {
        const tx = Math.floor(originX) + i;
        const ty = Math.floor(originY) + j;
        if (ty < 0 || ty >= span) continue;
        const wrapped = ((tx % span) + span) % span;
        tiles.push({
          key: `${zoom}-${wrapped}-${ty}-${i}-${j}`,
          url: `https://tile.openstreetmap.org/${zoom}/${wrapped}/${ty}.png`,
          left: (Math.floor(originX) + i - originX) * TILE,
          top: (Math.floor(originY) + j - originY) * TILE,
        });
      }
    }

    const project = (lat: number, lng: number) => ({
      x: (lngToX(lng, zoom) - originX) * TILE,
      y: (latToY(lat, zoom) - originY) * TILE,
    });

    return { tiles, a: project(from.lat, from.lng), b: project(to.lat, to.lng) };
  }, [box.w, box.h, from.lat, from.lng, to.lat, to.lng]);

  // A gentle arc reads as a courier route rather than a ruler line.
  const midX = (view.a.x + view.b.x) / 2;
  const midY = (view.a.y + view.b.y) / 2;
  const bowX = midX + (view.b.y - view.a.y) * 0.18;
  const bowY = midY - (view.b.x - view.a.x) * 0.18;
  const path = `M ${view.a.x} ${view.a.y} Q ${bowX} ${bowY} ${view.b.x} ${view.b.y}`;

  const t = dead ? 0 : progress;
  const inv = 1 - t;
  const truckX = inv * inv * view.a.x + 2 * inv * t * bowX + t * t * view.b.x;
  const truckY = inv * inv * view.a.y + 2 * inv * t * bowY + t * t * view.b.y;

  return (
    <figure
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border shadow-[0_18px_50px_-24px_rgba(13,10,18,0.55)]",
        className,
      )}
    >
      <div ref={frameRef} className="relative h-[260px] w-full sm:h-[320px]">
        {/* ── Tile mosaic, tinted to sit inside the palette ───────── */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ filter: "saturate(0.62) contrast(1.04) brightness(1.03) sepia(0.16)" }}
          aria-hidden
        >
          {view.tiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.url}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute select-none"
              style={{ left: tile.left, top: tile.top, width: TILE, height: TILE }}
            />
          ))}
        </div>

        {/* Warm wash so the map reads as one surface with the page. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(120% 90% at 50% 30%, transparent 35%, color-mix(in oklab, var(--ink) 24%, transparent) 100%)",
          }}
          aria-hidden
        />

        {/* ── Route + markers ─────────────────────────────────────── */}
        <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <filter id="rw-route-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Halo, full path, then the travelled portion drawn over it. */}
          <path
            d={path}
            fill="none"
            stroke="var(--fleece)"
            strokeOpacity={0.55}
            strokeWidth={7}
            strokeLinecap="round"
          />
          <path
            d={path}
            fill="none"
            stroke="var(--ink)"
            strokeOpacity={0.22}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="1 9"
          />
          <path
            d={path}
            fill="none"
            stroke="var(--madder)"
            strokeWidth={3.5}
            strokeLinecap="round"
            filter="url(#rw-route-glow)"
            pathLength={1}
            strokeDasharray={1}
            style={{
              strokeDashoffset: 1 - (dead ? 0 : progress),
              transition: "stroke-dashoffset 1400ms cubic-bezier(0.22,1,0.36,1)",
              opacity: dead ? 0.25 : 1,
            }}
          />
        </svg>

        <Marker x={view.a.x} y={view.a.y} label={from.label ?? "Studio"} side="right">
          <Store className="h-3.5 w-3.5" />
        </Marker>
        <Marker
          x={view.b.x}
          y={view.b.y}
          label={to.label ?? "You"}
          side="left"
          tone={delivered ? "madder" : "ink"}
        >
          <Home className="h-3.5 w-3.5" />
        </Marker>

        {!dead ? (
          <div
            className="absolute z-20"
            style={{
              left: truckX,
              top: truckY,
              transform: "translate(-50%, -50%)",
              transition: "left 1400ms cubic-bezier(0.22,1,0.36,1), top 1400ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <span
              className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-madder/25"
              aria-hidden
            />
            <span className="relative grid h-10 w-10 place-items-center rounded-full bg-madder text-primary-foreground shadow-[0_6px_18px_-4px_rgba(198,64,46,0.9)] ring-4 ring-fleece/85">
              {delivered ? <PackageCheck className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
            </span>
          </div>
        ) : null}

        {/* ── Status bar ──────────────────────────────────────────── */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
          style={{
            backgroundImage:
              "linear-gradient(to top, color-mix(in oklab, var(--ink) 92%, transparent) 12%, color-mix(in oklab, var(--ink) 55%, transparent) 55%, transparent)",
          }}
          aria-hidden
        />

        <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="font-data text-[10px] uppercase tracking-[0.22em] text-marigold">
                Live status
              </p>
              <p className="mt-1 truncate font-display text-base font-light text-fleece sm:text-lg">
                {STATUS_COPY[key] ?? "In progress"}
              </p>
              {to.label ? (
                <p className="mt-0.5 truncate font-data text-2xs text-fleece/60">
                  {from.label ?? "Studio"} → {to.label}
                </p>
              ) : null}
            </div>
            <span className="shrink-0 rounded-full border border-fleece/20 bg-fleece/10 px-3 py-1.5 font-data text-2xs text-fleece backdrop-blur-md">
              {Math.round((dead ? 0 : target) * 100)}%
            </span>
          </div>

          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-fleece/15">
            <div
              className="h-full rounded-full bg-marigold"
              style={{
                width: `${(dead ? 0 : progress) * 100}%`,
                transition: "width 1400ms cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          </div>
        </figcaption>
      </div>

      <p className="border-t border-border px-4 py-1.5 text-right font-data text-[9px] text-muted-foreground/60">
        Map data © OpenStreetMap contributors
      </p>
    </figure>
  );
}

function Marker({
  x,
  y,
  label,
  side,
  tone = "ink",
  children,
}: {
  x: number;
  y: number;
  label: string;
  side: "left" | "right";
  tone?: "ink" | "madder";
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute z-10 flex items-center gap-2"
      style={{
        left: x,
        top: y,
        transform: `translate(${side === "right" ? "-14px" : "calc(-100% + 14px)"}, -50%)`,
        flexDirection: side === "right" ? "row" : "row-reverse",
      }}
    >
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full ring-4 ring-fleece/85 shadow-md",
          tone === "madder" ? "bg-madder text-primary-foreground" : "bg-ink text-fleece",
        )}
      >
        {children}
      </span>
      <span className="max-w-[9rem] truncate rounded-full bg-fleece/90 px-2.5 py-1 font-data text-[10px] uppercase tracking-wider text-ink shadow-sm backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}
