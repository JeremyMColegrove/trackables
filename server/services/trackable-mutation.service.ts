import "server-only"

import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { trackableForms, trackableItems } from "@/db/schema"
import type { TrackableKind, TrackableSettings } from "@/db/schema/types"
import { accessControlService } from "@/server/services/access-control.service"
import { getDefaultTrackableSettings } from "@/server/services/project-settings"
import { quotaService } from "@/server/subscriptions/quota.service"

function generateSlug(name: string) {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")

  if (!baseSlug) {
    return `trackable-${Math.random().toString(36).substring(2, 8)}`
  }

  const randomSuffix = Math.random().toString(36).substring(2, 6)
  return `${baseSlug}-${randomSuffix}`
}

export class TrackableMutationService {
  async create(input: {
    kind: TrackableKind
    name: string
    description?: string
    userId: string
  }) {
    const activeWorkspace = await accessControlService.resolveActiveWorkspace(
      input.userId
    )
    await quotaService.assertCanCreateTrackable(activeWorkspace.workspaceId)

    const maxLogRetentionDays =
      input.kind === "api_ingestion"
        ? await quotaService.getEffectiveLogRetentionDays(
            activeWorkspace.workspaceId
          )
        : null
    const slug = generateSlug(input.name)

    const [newTrackable] = await db.transaction(async (tx) => {
      const [createdTrackable] = await tx
        .insert(trackableItems)
        .values({
          workspaceId: activeWorkspace.workspaceId,
          kind: input.kind,
          name: input.name,
          description: input.description,
          slug,
          settings: getDefaultTrackableSettings({
            kind: input.kind,
            maxLogRetentionDays,
          }),
        })
        .returning()

      if (input.kind === "survey") {
        const [createdForm] = await tx
          .insert(trackableForms)
          .values({
            trackableId: createdTrackable.id,
            version: 1,
            title: `${createdTrackable.name} feedback form`,
            description:
              createdTrackable.description ??
              "Fill out the form below and submit your response.",
            status: "draft",
            submitLabel: "Submit response",
            successMessage: "Thanks for your response.",
          })
          .returning()

        await tx
          .update(trackableItems)
          .set({
            activeFormId: createdForm.id,
          })
          .where(eq(trackableItems.id, createdTrackable.id))
      }

      return [createdTrackable]
    })

    return newTrackable
  }

  async updateSettings(input: {
    trackableId: string
    userId: string
    name: string
    description?: string
    allowAnonymousSubmissions?: boolean
    apiLogRetentionDays?: 3 | 7 | 30 | 90 | null
  }) {
    const trackable = await accessControlService.assertTrackableAccess(
      input.trackableId,
      input.userId,
      "manage"
    )

    const trackableRecord = await db.query.trackableItems.findFirst({
      where: eq(trackableItems.id, trackable.id),
      columns: {
        id: true,
        kind: true,
        settings: true,
      },
    })

    if (!trackableRecord) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Trackable not found.",
      })
    }

    const existingSettings = trackableRecord.settings || {}
    let nextSettings: TrackableSettings

    if (trackableRecord.kind === "survey") {
      nextSettings = {
        ...existingSettings,
        allowAnonymousSubmissions: input.allowAnonymousSubmissions ?? true,
      }
    } else {
      const tierRetention = await quotaService.getEffectiveLogRetentionDays(
        trackable.workspaceId
      )
      let retention = input.apiLogRetentionDays ?? null

      if (tierRetention !== null && (retention === null || retention > tierRetention)) {
        retention = tierRetention as 3 | 7 | 30 | 90
      }

      nextSettings = {
        ...existingSettings,
        apiLogRetentionDays: retention,
      }
    }

    const [updated] = await db
      .update(trackableItems)
      .set({
        name: input.name,
        description: input.description,
        settings: nextSettings,
      })
      .where(eq(trackableItems.id, trackableRecord.id))
      .returning()

    return updated
  }
}

export const trackableMutationService = new TrackableMutationService()
