import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import type { McpAuthContext } from "@/server/mcp/auth/mcp-auth-context"
import {
  buildMcpErrorContent,
  McpToolError,
  type McpErrorCode,
} from "@/server/mcp/errors/mcp-errors"
import type { McpAuditService } from "@/server/mcp/audit/mcp-audit.service"
import type { McpTrackableService } from "@/server/mcp/services/mcp-trackable.service"
import type { McpTool } from "@/server/mcp/tools/base-tool"

/**
 * find_trackables Tool
 *
 * Searches accessible trackables across all workspaces the MCP token can access.
 * This is the preferred discovery step before agents act on an existing trackable.
 */
export class FindTrackablesTool implements McpTool {
  readonly name = "find_trackables" as const

  constructor(
    private readonly trackableService: Pick<McpTrackableService, "findAccessible">,
    private readonly auditService: Pick<McpAuditService, "record">
  ) {}

  register(server: McpServer, authContext: McpAuthContext): void {
    server.registerTool(
      "find_trackables",
      {
        description:
          "Find trackables in the current active user workspace by default. " +
          "Supports optional name text, kind, workspace, and limit filters. " +
          "When workspace_id is omitted, results are scoped to the active workspace. " +
          "Prefer this before read, update, or other actions on an existing trackable.",
        inputSchema: {
          query: z
            .string()
            .trim()
            .max(200)
            .optional()
            .describe(
              "Optional fuzzy search text for trackable name or slug."
            ),
          kind: z
            .enum(["survey", "api_ingestion"])
            .optional()
            .describe('Optional filter: "survey" or "api_ingestion".'),
          workspace_id: z
            .string()
            .uuid("workspace_id must be a valid UUID")
            .optional()
            .describe(
              "Optional workspace UUID to restrict the search to one accessible workspace. " +
                "Defaults to the current active user workspace when omitted."
            ),
          limit: z
            .number()
            .int()
            .min(1)
            .max(25)
            .optional()
            .default(10)
            .describe("Maximum number of results to return (1-25). Default: 10."),
        },
      },
      async (args) => {
        const start = Date.now()
        try {
          if (!authContext.canUseTool("find_trackables")) {
            throw new McpToolError(
              "SCOPE_ERROR",
              "This token does not have permission to use find_trackables."
            )
          }

          const result = await this.trackableService.findAccessible(authContext, {
            query: args.query,
            kind: args.kind,
            workspaceId: args.workspace_id,
            limit: args.limit,
          })

          this.auditService.record({
            tokenId: authContext.tokenId,
            ownerUserId: authContext.ownerUserId,
            workspaceId: args.workspace_id,
            tool: "find_trackables",
            success: true,
            durationMs: Date.now() - start,
            timestamp: new Date().toISOString(),
          })

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          }
        } catch (error) {
          this.auditService.record({
            tokenId: authContext.tokenId,
            ownerUserId: authContext.ownerUserId,
            workspaceId: args.workspace_id,
            tool: "find_trackables",
            success: false,
            errorCode: (error as { code?: McpErrorCode }).code,
            durationMs: Date.now() - start,
            timestamp: new Date().toISOString(),
          })

          return {
            content: [
              { type: "text" as const, text: buildMcpErrorContent(error) },
            ],
          }
        }
      }
    )
  }
}
