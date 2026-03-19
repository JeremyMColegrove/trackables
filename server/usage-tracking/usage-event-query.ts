import "server-only"

import { and, count, eq, gte, lte, max } from "drizzle-orm"

import { db } from "@/db"
import { trackableApiUsageEvents } from "@/db/schema"
import type {
  UsageEventSearchInput,
  UsageEventSourceSnapshot,
} from "@/lib/usage-event-search"

export async function getTrackableUsageSourceSnapshot(
  trackableId: string
): Promise<UsageEventSourceSnapshot> {
  const [summary] = await db
    .select({
      totalEventCount: count(trackableApiUsageEvents.id),
      latestOccurredAt: max(trackableApiUsageEvents.occurredAt),
    })
    .from(trackableApiUsageEvents)
    .where(eq(trackableApiUsageEvents.trackableId, trackableId))

  return {
    totalEventCount: Number(summary?.totalEventCount) || 0,
    latestOccurredAt: summary?.latestOccurredAt?.toISOString() ?? null,
  }
}

export async function getTrackableUsageAggregateFields(trackableId: string) {
  const events = await db.query.trackableApiUsageEvents.findMany({
    where: eq(trackableApiUsageEvents.trackableId, trackableId),
    columns: {
      payload: true,
    },
  })

  const fields = new Set<string>()

  for (const event of events) {
    for (const key of Object.keys(event.payload)) {
      fields.add(key)
    }
  }

  return Array.from(fields).sort((left, right) => left.localeCompare(right))
}

export async function getTrackableUsageEvents(input: UsageEventSearchInput) {
  const conditions = [eq(trackableApiUsageEvents.trackableId, input.trackableId)]

  if (input.from) {
    conditions.push(gte(trackableApiUsageEvents.occurredAt, new Date(input.from)))
  }

  if (input.to) {
    conditions.push(lte(trackableApiUsageEvents.occurredAt, new Date(input.to)))
  }

  return db.query.trackableApiUsageEvents.findMany({
    where:
      conditions.length === 1
        ? conditions[0]
        : and(...conditions),
    with: {
      apiKey: {
        columns: {
          id: true,
          name: true,
          keyPrefix: true,
          lastFour: true,
        },
      },
    },
    orderBy: (table, { desc }) => [desc(table.occurredAt)],
  })
}
