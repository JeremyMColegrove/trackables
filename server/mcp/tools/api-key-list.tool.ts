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
import { mcpApiKeyService } from "@/server/mcp/services/mcp-api-key.service"
import type { McpTool } from "@/server/mcp/tools/base-tool"

/**
 * list_api_keys Tool
 *
 * Lists all API keys for an api_ingestion trackable.
 * Plaintext secrets are never returned — only metadata (id, name, lastFour, status, etc.).
 */
export class ApiKeyListTool implements McpTool {
  readonly name = "list_api_keys" as const

  register(server: McpServer, authContext: McpAuthContext): void {
    server.registerTool(
      "list_api_keys",
      {
        description:
          "List all API keys for an api_ingestion trackable. " +
          "Returns metadata only — plaintext secrets are never shown after creation. " +
          "Only works on trackables of kind api_ingestion.",
        inputSchema: {
          trackable_id: z
            .string()
            .uuid("trackable_id must be a valid UUID")
            .describe("UUID of the api_ingestion trackable."),
        },
      },
      async (args) => {
        const start = Date.now()
        try {
          if (!authContext.canUseTool("list_api_keys")) {
            throw new McpToolError(
              "SCOPE_ERROR",
              "This token does not have permission to use list_api_keys."
            )
          }

          const result = await mcpApiKeyService.listApiKeys(
            args.trackable_id,
            authContext
          )

          mcpAuditService.record({
            tokenId: authContext.tokenId,
            ownerUserId: authContext.ownerUserId,
            tool: "list_api_keys",
            targetResourceId: args.trackable_id,
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
          mcpAuditService.record({
            tokenId: authContext.tokenId,
            ownerUserId: authContext.ownerUserId,
            tool: "list_api_keys",
            targetResourceId: args.trackable_id,
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
