export const ADSENSE_CLIENT = "ca-pub-8512064525174724";

/** Ad unit slot IDs from AdSense dashboard → Ads → By ad unit */
export const ADSENSE_SLOTS = {
  display: process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY?.trim() || "",
  inArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE?.trim() || "",
  footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER?.trim() || "",
} as const;

export function hasAdSlot(slot: string | undefined): slot is string {
  return Boolean(slot && /^\d+$/.test(slot));
}
