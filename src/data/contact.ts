import { WHATSAPP_DISPLAY } from "@/lib/whatsapp";

/**
 * Demo contact content. Every field here is a fallback only — the admin panel
 * payload (see src/lib/api/contact.ts) overrides anything it provides.
 */
export const CONTACT_DEMO = {
  eyebrow: "Contact",
  title: "Contact Us",
  intro:
    "A question, a colour match, a bulk order — write to us and a human from the dye house replies.",
  formTitle: "Send us a message",
  formNote:
    "Tell us what you're making and which shade you're after. We usually reply the same day.",
  cardTitle: "We're always here to help you.",
  cardNote: "Reach us on whichever channel suits you.",
  hours: "Open 10am – 7pm IST, every day",
  channels: [
    { key: "hotline", label: "Hotline", value: "+91 89107 92214", href: "tel:+918910792214" },
    { key: "whatsapp", label: "SMS / WhatsApp", value: WHATSAPP_DISPLAY, href: null },
    { key: "email", label: "Email", value: "care@royalwool.in", href: "mailto:care@royalwool.in" },
    {
      key: "location",
      label: "Studio",
      value: "Royal Wool Dye House, Kolkata, West Bengal",
      href: null,
    },
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com/royalwool" },
    { label: "Facebook", href: "https://facebook.com/royalwool" },
  ],
} as const;
