"use client"

import dynamic from "next/dynamic"

const TrackableOverviewSection = dynamic(
  () =>
    import("./trackable-overview-section").then(
      (mod) => mod.TrackableOverviewSection
    ),
  {
    ssr: false,
  }
)

export function TrackableOverviewEntry() {
  return <TrackableOverviewSection />
}
