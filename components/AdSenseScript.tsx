import Script from "next/script";
import { ADSENSE_CLIENT, hasAnyAdSlot } from "@/lib/adsense-config";

/** Site-wide AdSense loader — only when ad units are configured in env. */
export default function AdSenseScript() {
  if (!hasAnyAdSlot()) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
