"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const AdSense = dynamic(() => import("@/components/AdSense"), {
  ssr: false,
  loading: () => null,
});

type AdSenseSlotProps = ComponentProps<typeof AdSense>;

/** Client-only ad slot — avoids SSR/hydration crashes with adsbygoogle. */
export default function AdSenseSlot(props: AdSenseSlotProps) {
  return <AdSense {...props} />;
}
