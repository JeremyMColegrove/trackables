import "server-only"

import { randomBytes } from "node:crypto"

import { and, desc, eq, sql } from "drizzle-orm"
import { TRPCError } from "@trpc/server"

import { db } from "@/db"
import {
  mcpAccessTokens,
  type McpTokenCapabilities,
} from "@/db/schema/mcp-tokens"
import { hashApiKey } from "@/server/api-keys"
import { logger } from "@/lib/logger"
import { userMembershipsCache } from "@/server/redis/access-control-cache.repository"
import {
  McpAuthContextImpl,
  type McpAuthContext,
} from "@/server/mcp/auth/mcp-auth-context"
import { McpAuthError } from "@/server/mcp/errors/mcp-errors"
import { mcpTokenCache } from "@/server/mcp/auth/mcp-token-cache.repository"

/** The raw token string returned only at creation time. Never stored. */
export interface McpTokenCreationResult {
  /** Full raw token — shown once, never stored after this */
  token: string
  record: McpTokenRecord
}

/** Public representation of an MCP token (no secrets). */
export interface McpTokenRecord {
  id: string
  createdByUserId: string
  name: string
  keyPrefix: string
  lastFour: string
  capabilities: McpTokenCapabilities
  status: string
  expiresAt: Date | null
  lastUsedAt: Date | null
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

/** Expiration presets, matching the pattern used for API keys. */
export type McpTokenExpirationPreset =
  | "never"
  | "30_days"
  | "60_days"
  | "90_days"

function resolveExpiration(preset: McpTokenExpirationPreset): Date | null {
  if (preset === "never") return null
  const days = preset === "30_days" ? 30 : preset === "60_days" ? 60 : 90
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

/**
 * Generates an MCP token string.
 * Format: `trk_mcp_<24 bytes base64url>`
 * The prefix is `trk_mcp_` to distinguish from ingestion keys (`trk_live_`).
 */
function buildMcpTokenSecret(): string {
  return `trk_mcp_${randomBytes(24).toString("base64url")}`
}

/**
 * MCP Token Service
 *
 * Handles the full lifecycle of MCP access tokens:
 * - Validation (auth path): resolves a raw token into a normalized McpAuthContext
 * - Creation: generates and stores a new token (returning the raw secret once)
 * - Revocation: marks a token as revoked and evicts it from cache
 * - Listing: returns all active tokens for an account (no secrets)
 *
 * Token format: `trk_mcp_<base64url>` — only the prefix (first 20 chars) and
 * SHA256 hash are stored; the full raw token is returned once at creation only.
 */
export class McpTokenService {
  /**
   * Validates a raw MCP token string and returns a normalized McpAuthContext.
   *
   * Throws McpAuthError (UNAUTHORIZED) if:
   * - The token format is invalid or the prefix/hash are not found
   * - The token is revoked (not in cache because status ≠ active)
   * - The token has expired
   *
   * The business layer receives only the returned McpAuthContext — never the raw token.
   */
  async validateToken(rawToken: string): Promise<McpAuthContext> {
    if (!rawToken || rawToken.length < 20) {
      throw new McpAuthError("UNAUTHORIZED", "Invalid token.")
    }

    const keyPrefix = rawToken.slice(0, 20)
    const secretHash = hashApiKey(rawToken)

    const cached = await mcpTokenCache.getValidation(keyPrefix, secretHash)

    if (!cached) {
      logger.warn({ keyPrefix }, "MCP token not found or revoked.")
      throw new McpAuthError("UNAUTHORIZED", "Invalid or revoked token.")
    }

    const { token } = cached

    if (token.expiresAt && token.expiresAt <= new Date()) {
      logger.warn({ tokenId: token.id }, "Expired MCP token used.")
      throw new McpAuthError("UNAUTHORIZED", "Token has expired.")
    }

    // Fire-and-forget: update last_used_at and usage_count asynchronously
    void db
      .update(mcpAccessTokens)
      .set({
        lastUsedAt: new Date(),
        usageCount: sql`${mcpAccessTokens.usageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(mcpAccessTokens.id, token.id))
      .catch((err) => {
        logger.warn(
          { tokenId: token.id, err },
          "Failed to update MCP token usage stats."
        )
      })

    const memberships =
      (await userMembershipsCache.get(token.createdByUserId)) ?? []
    const membershipWorkspaceIds = memberships.map(
      (membership) => membership.workspaceId
    )
    const allowedWorkspaceIds = token.capabilities.workspaceIds
      ? membershipWorkspaceIds.filter((workspaceId) =>
          token.capabilities.workspaceIds?.includes(workspaceId)
        )
      : membershipWorkspaceIds

    return new McpAuthContextImpl({
      tokenId: token.id,
      ownerUserId: token.createdByUserId,
      allowedWorkspaceIds,
      // McpTokenCapabilities stores tools as string[] | "all"; cast to McpCapabilities
      // which uses the stricter McpToolName[] union. The values are always valid tool names
      // because we validate them at creation time via the tRPC router's Zod schema.
      capabilities:
        token.capabilities as import("@/server/mcp/auth/mcp-auth-context").McpCapabilities,
    })
  }

  /**
   * Creates a new MCP access token for an account.
   *
   * The raw token string is returned once in `result.token` and must be shown to
   * the user immediately. It is never recoverable after this call.
   */
  async createToken(
    userId: string,
    name: string,
    capabilities: McpTokenCapabilities,
    expiration: McpTokenExpirationPreset = "never"
  ): Promise<McpTokenCreationResult> {
    const rawToken = buildMcpTokenSecret()
    const keyPrefix = rawToken.slice(0, 20)
    const secretHash = hashApiKey(rawToken)
    const lastFour = rawToken.slice(-4)
    const expiresAt = resolveExpiration(expiration)

    const [record] = await db
      .insert(mcpAccessTokens)
      .values({
        createdByUserId: userId,
        name,
        keyPrefix,
        secretHash,
        lastFour,
        capabilities,
        status: "active",
        expiresAt,
      })
      .returning()

    logger.info(
      { tokenId: record.id, ownerUserId: userId, createdByUserId: userId },
      "MCP access token created."
    )

    return {
      token: rawToken,
      record: this.toRecord(record),
    }
  }

  /**
   * Revokes an MCP token by setting its status to "revoked" and evicting it from cache.
   * Throws TRPCError NOT_FOUND if the token does not belong to the account.
   */
  async revokeToken(tokenId: string, userId: string): Promise<void> {
    const existing = await db.query.mcpAccessTokens.findFirst({
      where: and(
        eq(mcpAccessTokens.id, tokenId),
        eq(mcpAccessTokens.createdByUserId, userId)
      ),
      columns: { id: true, keyPrefix: true, secretHash: true },
    })

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "MCP token not found.",
      })
    }

    await db
      .update(mcpAccessTokens)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(eq(mcpAccessTokens.id, tokenId))

    // Evict from cache so the token stops working immediately
    await mcpTokenCache.invalidateValidation(
      existing.keyPrefix,
      existing.secretHash
    )

    logger.info({ tokenId, ownerUserId: userId }, "MCP access token revoked.")
  }

  /**
   * Lists all active MCP tokens for an account, ordered newest first.
   * Does not return secret hashes or raw tokens.
   */
  async listTokens(userId: string): Promise<McpTokenRecord[]> {
    const rows = await db.query.mcpAccessTokens.findMany({
      where: eq(mcpAccessTokens.createdByUserId, userId),
      orderBy: [desc(mcpAccessTokens.createdAt)],
    })

    return rows.map((row) => this.toRecord(row))
  }

  private toRecord(row: typeof mcpAccessTokens.$inferSelect): McpTokenRecord {
    return {
      id: row.id,
      createdByUserId: row.createdByUserId,
      name: row.name,
      keyPrefix: row.keyPrefix,
      lastFour: row.lastFour,
      capabilities: row.capabilities,
      status: row.status,
      expiresAt: row.expiresAt,
      lastUsedAt: row.lastUsedAt,
      usageCount: row.usageCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}

export const mcpTokenService = new McpTokenService()
