import { Suspense } from "react"

import {
  TrackableLayoutClient,
  TrackableShellSkeleton,
} from "./trackable-shell"

export default function TrackableLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<TrackableShellSkeleton />}>
      <TrackableLayoutClient>{children}</TrackableLayoutClient>
    </Suspense>
  )
}
