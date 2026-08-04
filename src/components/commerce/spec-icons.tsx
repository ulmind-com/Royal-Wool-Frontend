import type { SpecId } from "@/lib/api/specs";

/**
 * Hand-drawn-feel inline SVG iconography for the yarn spec sheet and trust
 * band. Inline (not raster) so they stay crisp at any DPI and inherit
 * `currentColor` from the theme.
 */

type IconProps = { className?: string };

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Frame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string | undefined;
}) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} {...S}>
      {children}
    </svg>
  );
}

export function YarnBallIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <circle cx="16" cy="16" r="10.5" />
      <path d="M8 11c5 1.5 9 5.5 10.5 10.5M6.5 17c6 .5 9.5 4 10.5 8M11 7.5c5.5 2 9 6.5 10.5 12M17 6c4 2.5 6.5 6 7.5 10" />
    </Frame>
  );
}

export function WeightGaugeIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path d="M5 24a11 11 0 1 1 22 0z" />
      <path d="M16 24 21 13" />
      <circle cx="16" cy="24" r="1.6" />
    </Frame>
  );
}

export function TapeIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <rect x="3.5" y="11" width="25" height="10" rx="5" />
      <path d="M9 11v4M13 11v3M17 11v4M21 11v3M25 11v4" />
    </Frame>
  );
}

export function NeedlesIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path d="M6 26 24 6M26 26 8 6" />
      <circle cx="24.6" cy="5.4" r="1.6" />
      <circle cx="7.4" cy="5.4" r="1.6" />
    </Frame>
  );
}

export function HookIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path d="M9 27 22 10" />
      <path d="M22 10c2-2.6 5.5-1.6 5.8 1.2.3 2.6-2.6 4-4.5 2.4" />
      <path d="M7 25.5 9 27l1.5 2" />
    </Frame>
  );
}

export function StitchIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <rect x="5" y="7" width="22" height="18" rx="3" />
      <path d="M9 7v18M14 7v18M19 7v18M24 7v18M5 12h22M5 17h22M5 22h22" opacity="0.55" />
    </Frame>
  );
}

export function ScaleIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <rect x="5" y="9" width="22" height="17" rx="4" />
      <path d="M11 9V7a5 5 0 0 1 10 0v2" />
      <path d="M16 14v4M16 18l3.5 2" />
      <circle cx="16" cy="18" r="4.5" />
    </Frame>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path d="M16 4 26 7.5v8c0 6-4.2 10.9-10 12.5-5.8-1.6-10-6.5-10-12.5v-8z" />
      <path d="M11.5 16.5 15 20l6-7" />
    </Frame>
  );
}

export function TruckIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path d="M3 9h13v12H3zM16 13h6l4 4v4h-10z" />
      <circle cx="9" cy="23" r="2.4" />
      <circle cx="21.5" cy="23" r="2.4" />
    </Frame>
  );
}

export function BabyIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <circle cx="16" cy="16" r="11" />
      <path d="M12 14.5h.01M20 14.5h.01" strokeWidth="2.2" />
      <path d="M11.5 20c1.4 1.8 3 2.6 4.5 2.6s3.1-.8 4.5-2.6" />
    </Frame>
  );
}

export function AwardIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <circle cx="16" cy="13" r="8" />
      <path d="M11.5 19.5 9 28l7-3 7 3-2.5-8.5" />
      <path d="M12.8 12.8 15.4 15.4 19.6 10.8" />
    </Frame>
  );
}

export const SPEC_ICON: Record<SpecId, (p: IconProps) => React.ReactElement> = {
  fibre: StitchIcon,
  weight: WeightGaugeIcon,
  length: TapeIcon,
  needle: NeedlesIcon,
  hook: HookIcon,
  needle_stitch: YarnBallIcon,
  crochet_stitch: StitchIcon,
  ball_weight: ScaleIcon,
};
