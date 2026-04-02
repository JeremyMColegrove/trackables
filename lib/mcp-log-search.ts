import { buildAbsoluteUrl } from "@/lib/site-config"
import type { UsageEventTableResult } from "@/lib/usage-event-search"

export interface McpLogSummaryRow {
  id: string
  type: "group" | "log"
  level: string | null
  message: string | null
  occurredAt: string | null
  payloadPreview: Record<string, unknown> | null
  totalHits: number
  groupBy: string | null
  groupValue: string | null
  firstOccurredAt: string
  lastOccurredAt: string
  apiKeyCount: number
  uiLink: string
}

export function buildMcpLogSummaryRows(
  rows: UsageEventTableResult["rows"],
  trackableId: string
): McpLogSummaryRow[] {
  return rows.flatMap<McpLogSummaryRow>((row) => {
    if (row.aggregation === "payload_field" && row.groupField) {
      const params = new URLSearchParams({
        aggregate: row.groupField,
      })

      return [
        {
          id: row.id,
          type: "group" as const,
          level: null,
          message: null,
          occurredAt: null,
          payloadPreview: null,
          totalHits: row.totalHits,
          groupBy: row.groupField,
          groupValue: row.event,
          firstOccurredAt: row.firstOccurredAt,
          lastOccurredAt: row.lastOccurredAt,
          apiKeyCount: row.apiKeyCount,
          uiLink: buildAbsoluteUrl(
            `/dashboard/trackables/${trackableId}?${params.toString()}`
          ).toString(),
        },
      ]
    }

    return row.hits.map((hit) => {
      const payload = hit.payload as Record<string, unknown>
      const level = (payload.level as string | null | undefined) ?? null
      const message = (payload.message as string | null | undefined) ?? null

      return {
        id: hit.id,
        type: "log" as const,
        level,
        message,
        occurredAt: hit.occurredAt,
        payloadPreview: Object.fromEntries(Object.entries(payload).slice(0, 8)),
        totalHits: 1,
        groupBy: null,
        groupValue: null,
        firstOccurredAt: hit.occurredAt,
        lastOccurredAt: hit.occurredAt,
        apiKeyCount: 1,
        uiLink: buildAbsoluteUrl(
          `/dashboard/trackables/${trackableId}?logId=${hit.id}`
        ).toString(),
      }
    })
  })
}
