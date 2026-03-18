import { TRPCError } from "@trpc/server"
import { and, desc, gte, inArray, sum } from "drizzle-orm"

import { db } from "@/db"
import {
  trackableApiUsageEvents,
  trackableFormSubmissions,
  trackableItems,
} from "@/db/schema"
import { getAccessibleProjectIds } from "@/server/project-access"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

const ACTIVITY_WINDOW_DAYS = 7
const DAY_IN_MS = 24 * 60 * 60 * 1000

function getWindowStart(now: Date) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (ACTIVITY_WINDOW_DAYS - 1))
  return start
}

function createEmptyActivitySeries() {
  return Array.from({ length: ACTIVITY_WINDOW_DAYS }, (_, index) => ({
    dayOffset: index,
    count: 0,
  }))
}

function getDayOffset(date: Date, windowStart: Date) {
  const eventDay = new Date(date)
  eventDay.setHours(0, 0, 0, 0)

  return Math.floor((eventDay.getTime() - windowStart.getTime()) / DAY_IN_MS)
}

export const dashboardRouter = createTRPCRouter({
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    const now = new Date()
    const windowStart = getWindowStart(now)
    const projectIds = await getAccessibleProjectIds(userId)

    const projectsCount = projectIds.length

    const [submissionTotals, recentSubmissions, recentUsageEvents] =
      await Promise.all([
        projectIds.length === 0
          ? Promise.resolve([])
          : db
              .select({
                totalSubmissions: sum(trackableItems.submissionCount),
                totalUsageTracks: sum(trackableItems.apiUsageCount),
              })
              .from(trackableItems)
              .where(inArray(trackableItems.id, projectIds)),
        db
          .query.trackableFormSubmissions.findMany({
              where: and(
                inArray(trackableFormSubmissions.trackableId, projectIds),
                gte(trackableFormSubmissions.createdAt, windowStart)
              ),
              columns: {
                createdAt: true,
              },
            }),
        projectIds.length === 0
          ? Promise.resolve([])
          : db.query.trackableApiUsageEvents.findMany({
              where: and(
                inArray(trackableApiUsageEvents.trackableId, projectIds),
                gte(trackableApiUsageEvents.occurredAt, windowStart)
              ),
              columns: {
                occurredAt: true,
              },
            }),
      ])

    const totals = submissionTotals[0]
    const totalSubmissions = Number(totals?.totalSubmissions) || 0
    const totalUsageTracks = Number(totals?.totalUsageTracks) || 0
    const submissionActivity = createEmptyActivitySeries()
    const usageActivity = createEmptyActivitySeries()

    for (const submission of recentSubmissions) {
      const dayOffset = getDayOffset(submission.createdAt, windowStart)

      if (dayOffset >= 0 && dayOffset < ACTIVITY_WINDOW_DAYS) {
        submissionActivity[dayOffset]!.count += 1
      }
    }

    for (const usageEvent of recentUsageEvents) {
      const dayOffset = getDayOffset(usageEvent.occurredAt, windowStart)

      if (dayOffset >= 0 && dayOffset < ACTIVITY_WINDOW_DAYS) {
        usageActivity[dayOffset]!.count += 1
      }
    }

    return {
      projectsCount,
      totalSubmissions,
      totalUsageTracks,
      submissionActivity,
      usageActivity,
    }
  }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    const projectIds = await getAccessibleProjectIds(userId)

    if (projectIds.length === 0) {
      return []
    }

    return db.query.trackableItems.findMany({
      where: inArray(trackableItems.id, projectIds),
      orderBy: [desc(trackableItems.createdAt)],
      limit: 10,
      columns: {
        id: true,
        name: true,
        submissionCount: true,
        apiUsageCount: true,
      },
      with: {
        owner: {
          columns: {
            displayName: true,
            imageUrl: true,
          },
        },
      },
    })
  }),
})
