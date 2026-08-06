export const API_BASE_URL =
  import.meta.env["VITE_API_BASE_URL"] ?? "https://royal-wool-backend.onrender.com";

/** Brand identity is ours; all commerce copy comes from /settings (Phase 2). */
export const BRAND = {
  name: "Royal Wool",
  tagline: "Premium knitting & crochet yarn, dyed in small batches.",
} as const;

/** Social profiles shown in the footer. Swap in the real handles here. */
export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/royaallwool",
  facebook: "https://facebook.com/royaallwool",
  twitter: "https://twitter.com/royaallwool",
} as const;

export const POLICY_LINKS = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
  { to: "/shipping", label: "Shipping" },
  { to: "/returns-policy", label: "Returns & Exchange" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
] as const;
