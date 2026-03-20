import "server-only"

import { TRPCError } from "@trpc/server"
import { type LiqeQuery, parse, test } from "liqe"

import type { UsageEventSearchInput } from "@/lib/usage-event-search"

export type UsageEventRecord = {
  id: string
  occurredAt: Date
  payload: Record<string, unknown>
  metadata: string | null
  apiKey: {
    id: string
    name: string
    maskedKey: string
  }
}

function buildSearchableSubject(event: UsageEventRecord) {
  return {
    ...event.payload,
    occurredAt: event.occurredAt.toISOString(),
    apiKey: event.apiKey,
    metadata: parseMetadata(event.metadata),
  }
}

function parseMetadata(metadata: string | null) {
  if (!metadata) return null

  try {
    return JSON.parse(metadata) as unknown
  } catch {
    return metadata
  }
}

export class EventSearchFilter {
  applyTimeRange(
    events: UsageEventRecord[],
    input: UsageEventSearchInput
  ): UsageEventRecord[] {
    return events.filter((event) => {
      const occurredAtTime = event.occurredAt.getTime()

      if (input.from && occurredAtTime < new Date(input.from).getTime()) {
        return false
      }

      if (input.to && occurredAtTime > new Date(input.to).getTime()) {
        return false
      }

      return true
    })
  }

  applyQuery(events: UsageEventRecord[], query: string): UsageEventRecord[] {
    const normalizedQuery = query.trim()

    if (!normalizedQuery) return events

    let parsedQuery: LiqeQuery

    try {
      parsedQuery = parse(normalizedQuery)
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          error instanceof Error ? error.message : "Invalid liqe query.",
      })
    }

    return events.filter((event) =>
      test(parsedQuery, buildSearchableSubject(event))
    )
  }

  filter(
    events: UsageEventRecord[],
    input: UsageEventSearchInput
  ): UsageEventRecord[] {
    const timeFiltered = this.applyTimeRange(events, input)
    return this.applyQuery(timeFiltered, input.query)
  }
}

export const eventSearchFilter = new EventSearchFilter()
