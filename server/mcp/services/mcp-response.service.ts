import "server-only"

import { and, desc, eq, gte, lte } from "drizzle-orm"

import { db } from "@/db"
import { trackableFormSubmissions } from "@/db/schema"
import type { TrackableSubmissionSnapshot } from "@/db/schema/types"
import { buildAbsoluteUrl } from "@/lib/site-config"
import type { McpAuthContext } from "@/server/mcp/auth/mcp-auth-context"
import { McpToolError } from "@/server/mcp/errors/mcp-errors"
import { mcpTrackableService } from "@/server/mcp/services/mcp-trackable.service"

/** Input for the list_responses tool. */
export interface McpResponseListInput {
  /** Number of results per page (1–100, default 25) */
  pageSize?: number
  /** Opaque cursor (the ID of the last seen submission) for page-after pagination */
  cursor?: string
  /** ISO 8601 datetime — include only submissions at or after this time */
  from?: string
  /** ISO 8601 datetime — include only submissions at or before this time */
  to?: string
}

/** Summary of a single response, optimized for LLM consumption. */
export interface McpResponseSummary {
  id: string
  submittedAt: string
  source: string
  /** Compact field summaries: key → display value */
  fieldSummaries: Record<string, string>
  /** Deep link to this response in the Trackables UI */
  uiLink: string
}

/** Paginated response list result. */
export interface McpResponseListResult {
  trackableId: string
  responses: McpResponseSummary[]
  hasMore: boolean
  /** Pass this as `cursor` in the next request to continue paging */
  nextCursor: string | null
}

/** Full structured detail for a single response. */
export interface McpResponseDetail {
  id: string
  trackableId: string
  submittedAt: string
  source: string
  submittedEmail: string | null
  /** The complete submission snapshot (form structure + each answer) */
  snapshot: TrackableSubmissionSnapshot
  uiLink: string
}

/**
 * MCP Response Service
 *
 * Provides paginated listing and full detail retrieval for survey form submissions.
 * All operations validate auth context access before querying.
 *
 * Output is normalized and predictable for LLM consumption and theme/sentiment analysis.
 */
export class McpResponseService {
  /**
   * Returns a paginated list of form submission summaries for a survey trackable.
   *
   * Pagination uses cursor-based page-after semantics (cursor = last seen ID).
   * Results are ordered newest-first.
   */
  async listResponses(
    trackableId: string,
    authContext: McpAuthContext,
    input: McpResponseListInput = {}
  ): Promise<McpResponseListResult> {
    const trackable = await mcpTrackableService.assertAccess(trackableId, authContext)

    if (trackable.kind !== "survey") {
      throw new McpToolError(
        "FORBIDDEN",
        "This trackable does not have form responses. Only survey trackables collect responses."
      )
    }

    const pageSize = Math.min(Math.max(input.pageSize ?? 25, 1), 100)
    // Fetch one extra to determine hasMore
    const fetchSize = pageSize + 1

    const conditions = [eq(trackableFormSubmissions.trackableId, trackableId)]

    if (input.from) {
      conditions.push(
        gte(trackableFormSubmissions.createdAt, new Date(input.from))
      )
    }

    if (input.to) {
      conditions.push(
        lte(trackableFormSubmissions.createdAt, new Date(input.to))
      )
    }

    const rows = await db.query.trackableFormSubmissions.findMany({
      where: and(...conditions),
      orderBy: [desc(trackableFormSubmissions.createdAt)],
      limit: fetchSize,
      columns: {
        id: true,
        createdAt: true,
        source: true,
        submittedEmail: true,
        submissionSnapshot: true,
      },
    })

    const hasMore = rows.length > pageSize
    const pageRows = hasMore ? rows.slice(0, pageSize) : rows
    const nextCursor = hasMore ? (pageRows.at(-1)?.id ?? null) : null

    const responses: McpResponseSummary[] = pageRows.map((row) => {
      const snapshot = row.submissionSnapshot as TrackableSubmissionSnapshot | null
      const fieldSummaries: Record<string, string> = {}

      if (snapshot?.answers) {
        for (const answer of snapshot.answers) {
          fieldSummaries[answer.fieldKey] = summarizeAnswer(answer.value)
        }
      }

      return {
        id: row.id,
        submittedAt: row.createdAt.toISOString(),
        source: row.source,
        fieldSummaries,
        uiLink: buildAbsoluteUrl(
          `/dashboard/trackables/${trackableId}?submissionId=${row.id}`
        ).toString(),
      }
    })

    return {
      trackableId,
      responses,
      hasMore,
      nextCursor,
    }
  }

  /**
   * Returns full structured detail for a single form submission.
   *
   * Validates that the submission belongs to the specified trackable before returning.
   * The full snapshot includes the form structure at submission time and every field answer.
   */
  async getResponseDetail(
    trackableId: string,
    responseId: string,
    authContext: McpAuthContext
  ): Promise<McpResponseDetail> {
    await mcpTrackableService.assertAccess(trackableId, authContext)

    const submission = await db.query.trackableFormSubmissions.findFirst({
      where: and(
        eq(trackableFormSubmissions.id, responseId),
        eq(trackableFormSubmissions.trackableId, trackableId)
      ),
      columns: {
        id: true,
        trackableId: true,
        createdAt: true,
        source: true,
        submittedEmail: true,
        submissionSnapshot: true,
      },
    })

    if (!submission) {
      throw new McpToolError(
        "NOT_FOUND",
        "Response not found or does not belong to this trackable."
      )
    }

    return {
      id: submission.id,
      trackableId: submission.trackableId,
      submittedAt: submission.createdAt.toISOString(),
      source: submission.source,
      submittedEmail: submission.submittedEmail,
      snapshot: submission.submissionSnapshot as TrackableSubmissionSnapshot,
      uiLink: buildAbsoluteUrl(
        `/dashboard/trackables/${trackableId}?submissionId=${submission.id}`
      ).toString(),
    }
  }
}

export const mcpResponseService = new McpResponseService()

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Converts a FormAnswerValue to a compact display string for summaries. */
function summarizeAnswer(value: { kind: string; value: unknown }): string {
  if (!value) return ""
  switch (value.kind) {
    case "rating":
      return String(value.value)
    case "checkboxes":
      return Array.isArray(value.value) ? value.value.join(", ") : String(value.value)
    case "notes":
    case "short_text":
      return typeof value.value === "string" ? value.value : String(value.value)
    default:
      return JSON.stringify(value.value)
  }
}
