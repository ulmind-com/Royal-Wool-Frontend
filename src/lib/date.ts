// Backend timestamps are UTC. Render them in India Standard Time (Asia/Kolkata)
// so dates/times are correct both during SSR (server may be UTC/US) and in the
// browser, regardless of the viewer's local timezone.
const TZ = "Asia/Kolkata";
const LOCALE = "en-IN";

type D = string | number | Date | null | undefined;

export const fmtDate = (d?: D) =>
  d != null ? new Date(d).toLocaleDateString(LOCALE, { timeZone: TZ }) : "";

export const fmtDateTime = (d?: D) =>
  d != null ? new Date(d).toLocaleString(LOCALE, { timeZone: TZ }) : "";

export const fmtTime = (d?: D) =>
  d != null ? new Date(d).toLocaleTimeString(LOCALE, { timeZone: TZ }) : "";
