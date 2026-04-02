import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import {
  mcpAccessTokens,
  type McpTokenCapabilities,
} from "@/db/schema/mcp-tokens"
import { BaseCacheRepository } from "@/server/redis/base-cache.repository"

/**
 * The cached shape stored in Redis for a validated MCP token.
 * Contains everything needed to build an McpAuthContext without hitting the DB.
 * Uses McpTokenCapabilities (from schema) rather than McpCapabilities to avoid
 * circular imports; the token service casts when building McpAuthContextImpl.
 */
export interface CachedMcpTokenValidation {
  token: {
    id: string
    createdByUserId: string
    expiresAt: Date | null
    capabilities: McpTokenCapabilities
    keyPrefix: string
    lastFour: string
  }
}

/**
 * Redis cache for MCP token validation results.
 *
 * Cache key: `keyPrefix:secretHash` (same pattern as ApiKeyCacheRepository).
 * TTL: 5 minutes (300 seconds), matching the existing API key cache.
 *
 * On cache miss, falls back to a database query. Only active, non-revoked
 * tokens are cached — revoked tokens return null and are not stored.
 */
export class McpTokenCacheRepository extends BaseCacheRepository<CachedMcpTokenValidation> {
  constructor() {
    super("mcp-token-validation", 300) // 5 minutes
  }

  protected async fetchFallback(
    combinedId: string
  ): Promise<CachedMcpTokenValidation | null> {
    const [keyPrefix, secretHash] = combinedId.split(":")

    const token = await db.query.mcpAccessTokens.findFirst({
      where: and(
        eq(mcpAccessTokens.keyPrefix, keyPrefix),
        eq(mcpAccessTokens.secretHash, secretHash),
        eq(mcpAccessTokens.status, "active")
      ),
      columns: {
        id: true,
        createdByUserId: true,
        expiresAt: true,
        capabilities: true,
        keyPrefix: true,
        lastFour: true,
      },
    })

    if (!token) return null

    return { token }
  }

  /** Look up a token by its prefix + hash combination. */
  async getValidation(
    keyPrefix: string,
    secretHash: string
  ): Promise<CachedMcpTokenValidation | null> {
    return this.get(`${keyPrefix}:${secretHash}`)
  }

  /** Remove a token from cache (called on revocation). */
  async invalidateValidation(
    keyPrefix: string,
    secretHash: string
  ): Promise<void> {
    await this.delete(`${keyPrefix}:${secretHash}`)
  }
}

export const mcpTokenCache = new McpTokenCacheRepository()
