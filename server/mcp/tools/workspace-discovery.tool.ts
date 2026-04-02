import "server-only"

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import type { McpAuthContext } from "@/server/mcp/auth/mcp-auth-context"
import { mcpAuditService } from "@/server/mcp/audit/mcp-audit.service"
import {
  buildMcpErrorContent,
  McpToolError,
  type McpErrorCode,
} from "@/server/mcp/errors/mcp-errors"
import { mcpWorkspaceService } from "@/server/mcp/services/mcp-workspace.service"
import type { McpTool } from "@/server/mcp/tools/base-tool"

export class WorkspaceDiscoveryTool implements McpTool {
  readonly name = "list_workspaces" as const

  register(server: McpServer, authContext: McpAuthContext): void {
    server.registerTool(
      "list_workspaces",
      {
        description:
          "List all workspaces accessible to this MCP token. " +
          "The active workspace is marked with isActive=true, and workspace-scoped tools default to it when workspace_id is omitted.",
        inputSchema: {},
      },
      async () => {
        const start = Date.now()
        try {
          if (!authContext.canUseTool("list_workspaces")) {
            throw new McpToolError(
              "SCOPE_ERROR",
              "This token does not have permission to use list_workspaces."
            )
          }

          const workspaces =
            await mcpWorkspaceService.listAccessible(authContext)

          mcpAuditService.record({
            tokenId: authContext.tokenId,
            ownerUserId: authContext.ownerUserId,
            tool: "list_workspaces",
            success: true,
            durationMs: Date.now() - start,
            timestamp: new Date().toISOString(),
          })

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ workspaces }, null, 2),
              },
            ],
          }
        } catch (error) {
          mcpAuditService.record({
            tokenId: authContext.tokenId,
            ownerUserId: authContext.ownerUserId,
            tool: "list_workspaces",
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
