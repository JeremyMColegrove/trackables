"use client"

import dynamic from "next/dynamic"

const WebhooksPageClient = dynamic(
  () => import("./webhooks-page-client").then((mod) => mod.WebhooksPageClient),
  {
    ssr: false,
  }
)

export function WebhooksPageEntry() {
  return <WebhooksPageClient />
}
