import type { UsageEventPayload } from "@/db/schema/types"

export function getUsagePayloadSizeBytes(payload: UsageEventPayload) {
  return Buffer.byteLength(JSON.stringify(payload), "utf8")
}
