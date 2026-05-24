"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, hasAdSlot } from "@/lib/adsense-config";

type AdFormat = "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";

interface AdSenseProps {
  slot: string;
  format?: AdFormat;
  layout?: string;
  layoutKey?: string;
  className?: string;
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export default function AdSense({
  slot,
  format = "auto",
  layout,
  layoutKey,
  className = "",
  label = "Advertisement",
}: AdSenseProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!hasAdSlot(slot) || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.error("[AdSense] push failed:", err);
    }
  }, [slot]);

  if (!hasAdSlot(slot)) {
    return null;
  }

  return (
    <aside
      className={`ad-wrap my-8 w-full max-w-full ${className}`}
      aria-label={label}
    >
      <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <div className="mx-auto w-full max-w-full overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50/80 p-1">
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block", minHeight: format === "horizontal" ? 90 : 250 }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
          {...(layout ? { "data-ad-layout": layout } : {})}
          {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
        />
      </div>
    </aside>
  );
}
