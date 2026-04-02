import { Suspense } from "react"

import { WebhooksPageEntry } from "./webhooks-page-entry"

export default function TrackableWebhooksPage() {
  return (
    <Suspense fallback={null}>
      <WebhooksPageEntry />
    </Suspense>
  )
}
