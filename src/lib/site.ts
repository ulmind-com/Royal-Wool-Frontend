export const API_BASE_URL =
  import.meta.env["VITE_API_BASE_URL"] ?? "https://royal-wool-backend.onrender.com";

/** Canonical site URL — every absolute canonical/og:url must use this. */
export const SITE_URL = "https://royaallwool.com";

/** Brand identity is ours; all commerce copy comes from /settings (Phase 2). */
export const BRAND = {
  name: "Royaall Wool",
  legalName: "Royaall Wool",
  tagline: "Every Stitch Has a Story",
  description:
    "Premium knitting & crochet yarn brand in India. Small-batch dyed acrylic, cotton and blended yarn for knitters, crocheters and amigurumi lovers.",
  /** Alternate spellings / common misspellings — helps Google establish the entity. */
  alternateName: ["Royal Wool", "Royaal Wool", "Royall Wool"],
  foundingYear: "2020",
  /** NAP — must be identical everywhere: website, GMB, citations. */
  phone: "+918910792214",
  phoneDisplay: "089107 92214",
  email: "royaallwool@gmail.com",
  whatsapp: "918910792214",
  address: {
    streetAddress: "104, Shri Aurobindo Rd, Babudanga",
    addressLocality: "Howrah",
    addressRegion: "West Bengal",
    postalCode: "711106",
    addressCountry: "IN",
    /** Human-readable one-liner for footer / citations. */
    full: "104, Shri Aurobindo Rd, Babudanga, Bandhaghat, Salkia, Howrah, West Bengal 711106",
  },
  geo: {
    latitude: 22.6087,
    longitude: 88.3476,
  },
} as const;

/** Live social profiles shown in the footer. */
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/royaallwool",
  facebook: "https://www.facebook.com/share/1SEBGxnKW6/",
} as const;

/** All social profile URLs for Schema.org sameAs — only real, verified profiles. */
export const SAME_AS = [
  SOCIAL_LINKS.instagram,
  SOCIAL_LINKS.facebook,
] as const;

export const POLICY_LINKS = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
  { to: "/shipping", label: "Shipping" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
] as const;
