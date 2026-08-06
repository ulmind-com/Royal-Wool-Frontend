export const API_BASE_URL =
  import.meta.env["VITE_API_BASE_URL"] ?? "https://royal-wool-backend.onrender.com";

/** Brand identity is ours; all commerce copy comes from /settings (Phase 2). */
export const BRAND = {
  name: "Royal Wool",
  tagline: "Premium knitting & crochet yarn, dyed in small batches.",
} as const;

/** Live social profiles shown in the footer. */
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/royaallwool",
  facebook: "https://www.facebook.com/share/1SEBGxnKW6/",
} as const;

export const POLICY_LINKS = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
  { to: "/shipping", label: "Shipping" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
] as const;
