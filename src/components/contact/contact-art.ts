import email from "@/assets/contact/email.png.asset.json";
import hotline from "@/assets/contact/hotline.png.asset.json";
import hours from "@/assets/contact/hours.png.asset.json";
import location from "@/assets/contact/location.png.asset.json";
import whatsapp from "@/assets/contact/whatsapp.png.asset.json";

import type { ChannelKey } from "@/lib/api/contact";

/** Hand-drawn ink illustrations for the contact channels. */
export const CONTACT_ART: Record<ChannelKey, string> = {
  hotline: hotline.url,
  whatsapp: whatsapp.url,
  email: email.url,
  location: location.url,
  hours: hours.url,
};
