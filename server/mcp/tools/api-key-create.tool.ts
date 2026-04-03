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
 * create_api_key Tool
 *
 * Creates a new API key for an api_ingestion trackable.
 * The plaintext key is returned ONCE in the response and cannot be retrieved again.
 * Only works on trackables of kind api_ingestion.
 */
export class ApiKeyCreateTool implements McpTool {
  readonly name = "create_api_key" as const

  register(server: McpServer, authContext: McpAuthContext): void {
    server.registerTool(
      "create_api_key",
      {
        description:
          "Create a new API key for an api_ingestion trackable. " +
          "The plaintext key is returned once and cannot be retrieved again — save it immediately. " +
          "Only works on trackables of kind api_ingestion.",
        inputSchema: {
          trackable_id: z
            .string()
            .uuid("trackable_id must be a valid UUID")
            .describe("UUID of the api_ingestion trackable."),
          name: z
            .string()
            .trim()
            .min(1)
            .max(100)
            .describe("Human-readable label for this API key."),
          expiration: z
            .enum(["never", "30_days", "60_days", "90_days"])
            .optional()
            .default("never")
            .describe(
              "When the key should expire. One of: never, 30_days, 60_days, 90_days. Default: never."
            ),
        },
      },
      async (args) => {
        const start = Date.now()
        try {
          if (!authContext.canUseTool("create_api_key")) {
            throw new McpToolError(
              "SCOPE_ERROR",
              "This token does not have permission to use create_api_key."
            )
          }

          const result = await mcpApiKeyService.createApiKey(
            args.trackable_id,
            {
              name: args.name,
              expirationPreset: args.expiration,
            },
            authContext
          )

          mcpAuditService.record({
            tokenId: authContext.tokenId,
            ownerUserId: authContext.ownerUserId,
            tool: "create_api_key",
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
            tool: "create_api_key",
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
