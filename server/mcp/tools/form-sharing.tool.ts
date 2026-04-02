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
import { mcpFormSharingService } from "@/server/mcp/services/mcp-form-sharing.service"
import type { McpTool } from "@/server/mcp/tools/base-tool"

/**
 * update_form_sharing Tool
 *
 * Manages public sharing for survey forms independently from form creation.
 * This tool controls whether a public survey link is enabled and whether
 * anonymous responders may submit the survey.
 */
export class FormSharingTool implements McpTool {
  readonly name = "update_form_sharing" as const

  register(server: McpServer, authContext: McpAuthContext): void {
    server.registerTool(
      "update_form_sharing",
      {
        description:
          "Update public sharing settings for an existing survey form. " +
          "Can enable or disable the public survey link, toggle anonymous responses, " +
          "and returns the full generated public link when one is active.",
        inputSchema: {
          trackable_id: z
            .string()
            .uuid("trackable_id must be a valid UUID")
            .describe(
              "UUID of an existing survey-kind trackable to update sharing for."
            ),
          enable_public_link: z
            .boolean()
            .optional()
            .describe(
              "Whether the public survey link should be active. Omit to leave unchanged."
            ),
          allow_anonymous_responses: z
            .boolean()
            .optional()
            .describe(
              "Whether anonymous responders can open and submit the shared survey. Omit to leave unchanged."
            ),
        },
      },
      async (args) => {
        const start = Date.now()
        try {
          if (!authContext.canUseTool("update_form_sharing")) {
            throw new McpToolError(
              "SCOPE_ERROR",
              "This token does not have permission to use update_form_sharing."
            )
          }

          const result = await mcpFormSharingService.updateSharing(
            args.trackable_id,
            {
              enablePublicLink: args.enable_public_link,
              allowAnonymousResponses: args.allow_anonymous_responses,
            },
            authContext
          )

          mcpAuditService.record({
            tokenId: authContext.tokenId,
            ownerUserId: authContext.ownerUserId,
            tool: "update_form_sharing",
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
            tool: "update_form_sharing",
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
