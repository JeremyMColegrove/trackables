import { Suspense } from "react"

import { TrackableOverviewEntry } from "./trackable-overview-entry"

export default function TrackablePage() {
  return (
    <Suspense fallback={null}>
      <TrackableOverviewEntry />
    </Suspense>
  )
}
