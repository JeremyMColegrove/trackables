import { z } from "zod"

import { MCP_TOOL_NAMES } from "@/lib/mcp-tools"
import {
  createTRPCRouter,
  getRequiredUserId,
  protectedProcedure,
} from "@/server/api/trpc"
import { mcpTokenService } from "@/server/mcp/auth/mcp-token.service"

/** Valid tool names for capability configuration. */
const mcpToolNameSchema = z.enum(MCP_TOOL_NAMES)

/** Schema for MCP token capabilities input. */
const mcpCapabilitiesSchema = z.object({
  tools: z.union([
    z.literal("all"),
    z.array(mcpToolNameSchema).min(1, "Specify at least one tool."),
  ]),
  workspaceIds: z
    .array(z.string().uuid())
    .optional()
    .describe(
      "Optional whitelist of workspace UUIDs this token may access. " +
        "Omit to allow access to all workspaces the account can access."
    ),
  trackableIds: z
    .array(z.string().uuid())
    .optional()
    .describe(
      "Optional whitelist of trackable UUIDs this token may access. " +
        "Omit to allow access to all accessible trackables."
    ),
})

/**
 * MCP Router
 *
 * Provides token management procedures for MCP access tokens.
 * All operations are scoped to the authenticated user's account.
 *
 * Token lifecycle:
 * - createToken: generates a new token (raw secret returned once, never again)
 * - revokeToken: permanently disables a token and evicts it from cache
 * - listTokens: returns all account tokens (no secrets, safe to display)
 */
export const mcpRouter = createTRPCRouter({
  /**
   * Creates a new MCP access token for the caller's account.
   * Returns the raw token string once — it must be shown to the user immediately.
   */
  createToken: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .trim()
          .min(1, "Token name is required.")
          .max(100, "Token name must be at most 100 characters."),
        capabilities: mcpCapabilitiesSchema,
        expiration: z
          .enum(["never", "30_days", "60_days", "90_days"])
          .default("never"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getRequiredUserId(ctx)

      const result = await mcpTokenService.createToken(
        userId,
        input.name,
        input.capabilities,
        input.expiration
      )

      return {
        /** Raw token — show once, never recoverable */
        token: result.token,
        id: result.record.id,
        name: result.record.name,
        lastFour: result.record.lastFour,
        capabilities: result.record.capabilities,
        status: result.record.status,
        expiresAt: result.record.expiresAt,
        createdAt: result.record.createdAt,
      }
    }),

  /**
   * Revokes an MCP access token immediately.
   * The token stops working within seconds (cache TTL).
   */
  revokeToken: protectedProcedure
    .input(
      z.object({
        tokenId: z.string().uuid("Invalid token ID."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getRequiredUserId(ctx)

      await mcpTokenService.revokeToken(input.tokenId, userId)

      return { success: true }
    }),

  /**
   * Lists all MCP access tokens for the caller's account.
   * Returns token metadata only — no secrets are included.
   */
  listTokens: protectedProcedure.query(async ({ ctx }) => {
    const userId = getRequiredUserId(ctx)
    const tokens = await mcpTokenService.listTokens(userId)

    // Strip createdByUserId from the public response for privacy
    return tokens.map((token) => {
      const { createdByUserId, ...safeToken } = token
      void createdByUserId
      return safeToken
    })
  }),
})
