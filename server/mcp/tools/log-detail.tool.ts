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
import { mcpLogService } from "@/server/mcp/services/mcp-log.service"
import type { McpTool } from "@/server/mcp/tools/base-tool"

/**
 * get_log Tool
 *
 * Retrieves a single API ingestion log event in full structured detail,
 * including the complete payload, metadata, associated API key info,
 * and a deep link into the Trackables UI.
 *
 * Use `search_logs` to discover log IDs before calling this tool.
 */
export class LogDetailTool implements McpTool {
  readonly name = "get_log" as const

  register(server: McpServer, authContext: McpAuthContext): void {
    server.registerTool(
      "get_log",
      {
        description:
          "Retrieve a single log event in full detail. " +
          "Returns the complete payload, metadata, API key info, and a UI deep link. " +
          "Use search_logs to discover log IDs first.",
        inputSchema: {
          trackable_id: z
            .string()
            .uuid("trackable_id must be a valid UUID")
            .describe(
              "UUID of the api_ingestion trackable that owns this log."
            ),
          log_id: z
            .string()
            .uuid("log_id must be a valid UUID")
            .describe("UUID of the specific log event to retrieve."),
        },
      },
      async (args) => {
        const start = Date.now()
        try {
          if (!authContext.canUseTool("get_log")) {
            throw new McpToolError(
              "SCOPE_ERROR",
              "This token does not have permission to use get_log."
            )
          }

          const detail = await mcpLogService.getLogDetail(
            args.trackable_id,
            args.log_id,
            authContext
          )

          mcpAuditService.record({
            tokenId: authContext.tokenId,
            ownerUserId: authContext.ownerUserId,
            tool: "get_log",
            targetResourceId: args.log_id,
            success: true,
            durationMs: Date.now() - start,
            timestamp: new Date().toISOString(),
          })

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(detail, null, 2),
              },
            ],
          }
        } catch (error) {
          mcpAuditService.record({
            tokenId: authContext.tokenId,
            ownerUserId: authContext.ownerUserId,
            tool: "get_log",
            targetResourceId: args.log_id,
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
