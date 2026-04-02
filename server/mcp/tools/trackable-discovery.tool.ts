import "server-only"

import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import type { McpAuthContext } from "@/server/mcp/auth/mcp-auth-context"
import { mcpAuditService } from "@/server/mcp/audit/mcp-audit.service"
import {
  buildMcpErrorContent,
  McpToolError,
  type McpErrorCode,
} from "@/server/mcp/errors/mcp-errors"
import { mcpTrackableService } from "@/server/mcp/services/mcp-trackable.service"
import type { McpTool } from "@/server/mcp/tools/base-tool"

/**
 * list_trackables Tool
 *
 * Discovers trackables accessible to the authenticated MCP token in a selected workspace.
 * Returns summary metadata including kind, activity counts, and UI deep links.
 *
 * Agents should prefer `find_trackables` first when they need to locate an existing trackable
 * across workspaces. Use this tool when the workspace is already known and a workspace-scoped
 * browse is more appropriate.
 */
export class TrackableDiscoveryTool implements McpTool {
  readonly name = "list_trackables" as const

  register(server: McpServer, authContext: McpAuthContext): void {
    server.registerTool(
      "list_trackables",
      {
        description:
          "List all trackables accessible to this MCP token within one workspace. " +
          "If workspace_id is omitted, the current active user workspace is used by default. " +
          "Returns summary info including kind (survey or api_ingestion), " +
          "activity counts, and admin UI links. " +
          "Prefer find_trackables first for cross-workspace discovery, then use this tool to browse one known workspace.",
        inputSchema: {
          workspace_id: z
            .string()
            .uuid("workspace_id must be a valid UUID")
            .optional()
            .describe(
              "Optional UUID of the workspace to list trackables from. " +
                "Defaults to the current active user workspace when omitted."
            ),
          kind: z
            .enum(["survey", "api_ingestion"])
            .optional()
            .describe(
              'Optional filter: "survey" returns form/survey trackables, ' +
                '"api_ingestion" returns log trackables.'
            ),
          include_archived: z
            .boolean()
            .optional()
            .default(false)
            .describe(
              "Set to true to include archived trackables. Default: false."
            ),
        },
      },
      async (args) => {
        const start = Date.now()
        try {
          if (!authContext.canUseTool("list_trackables")) {
            throw new McpToolError(
              "SCOPE_ERROR",
              "This token does not have permission to use list_trackables."
            )
          }

          const items = await mcpTrackableService.listAccessible(authContext, {
            workspaceId: args.workspace_id,
            kind: args.kind,
            includeArchived: args.include_archived,
          })

          mcpAuditService.record({
            tokenId: authContext.tokenId,
            ownerUserId: authContext.ownerUserId,
            workspaceId: args.workspace_id,
            tool: "list_trackables",
            success: true,
            durationMs: Date.now() - start,
            timestamp: new Date().toISOString(),
          })

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ trackables: items }, null, 2),
              },
            ],
          }
        } catch (error) {
          mcpAuditService.record({
            tokenId: authContext.tokenId,
            ownerUserId: authContext.ownerUserId,
            workspaceId: args.workspace_id,
            tool: "list_trackables",
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
