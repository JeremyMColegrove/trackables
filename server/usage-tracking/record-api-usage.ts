import "server-only"

import { randomUUID } from "node:crypto"

import { TRPCError } from "@trpc/server"
import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import {
  apiKeys,
  trackableApiUsageEvents,
  trackableItems,
} from "@/db/schema"
import type { UsageEventMetadata, UsageEventPayload } from "@/db/schema/types"
import { hashApiKey } from "@/server/api-keys"

interface RecordApiUsageInput {
  apiKey: string
  name: string
  payload?: UsageEventPayload
  metadata?: UsageEventMetadata | null
  requestId?: string | null
}

export async function recordApiUsage(input: RecordApiUsageInput) {
  const normalizedName = input.name.trim()

  if (!normalizedName) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Usage name is required.",
    })
  }

  const keyPrefix = input.apiKey.slice(0, 20)
  const secretHash = hashApiKey(input.apiKey)
  const now = new Date()

  const apiKey = await db.query.apiKeys.findFirst({
    where: and(
      eq(apiKeys.keyPrefix, keyPrefix),
      eq(apiKeys.secretHash, secretHash),
      eq(apiKeys.status, "active")
    ),
    columns: {
      id: true,
      ownerId: true,
      projectId: true,
      expiresAt: true,
      usageCount: true,
    },
  })

  if (!apiKey || (apiKey.expiresAt && apiKey.expiresAt <= now)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid API key.",
    })
  }

  if (!apiKey.projectId) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "This API key is not bound to a project. Create a new API key for this project.",
    })
  }

  const project = await db.query.trackableItems.findFirst({
    where: and(
      eq(trackableItems.id, apiKey.projectId),
      eq(trackableItems.ownerId, apiKey.ownerId)
    ),
    columns: {
      id: true,
      name: true,
      apiUsageCount: true,
      lastApiUsageAt: true,
      archivedAt: true,
      settings: true,
    },
  })

  if (!project || project.archivedAt) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Project not found.",
    })
  }

  const isApiEnabled = project.settings?.isApiEnabled ?? true

  if (!isApiEnabled) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "API usage tracking is disabled for this project.",
    })
  }

  const occurredAt = new Date()
  const requestId = input.requestId?.trim() || randomUUID()
  const payload = {
    ...(input.payload ?? {}),
    name: normalizedName,
  }

  const [createdUsageEvent] = await db.transaction(async (tx) => {
    const [usageEvent] = await tx
      .insert(trackableApiUsageEvents)
      .values({
        trackableId: project.id,
        apiKeyId: apiKey.id,
        requestId,
        occurredAt,
        payload,
        metadata: input.metadata ?? undefined,
      })
      .returning({
        id: trackableApiUsageEvents.id,
        occurredAt: trackableApiUsageEvents.occurredAt,
      })

    await tx
      .update(trackableItems)
      .set({
        apiUsageCount: project.apiUsageCount + 1,
        lastApiUsageAt: occurredAt,
        updatedAt: occurredAt,
      })
      .where(eq(trackableItems.id, project.id))

    await tx
      .update(apiKeys)
      .set({
        usageCount: apiKey.usageCount + 1,
        lastUsedAt: occurredAt,
        updatedAt: occurredAt,
      })
      .where(eq(apiKeys.id, apiKey.id))

    return [usageEvent]
  })

  return {
    id: createdUsageEvent.id,
    occurredAt: createdUsageEvent.occurredAt.toISOString(),
    project: {
      id: project.id,
      name: project.name,
    },
  }
}
