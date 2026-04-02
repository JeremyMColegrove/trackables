import { relations } from "drizzle-orm"
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import {
  createdByUserId,
  expiresAt,
  nullableTimestamp,
  timestamps,
  uuidPrimaryKey,
  usageCount,
} from "@/db/schema/_shared"
import { users } from "@/db/schema/users"

/**
 * Represents the capabilities granted to an MCP token.
 *
 * - tools: "all" grants access to all tools; an array limits access to named tools
 * - workspaceIds: optional array of workspace UUIDs this token may access;
 *   omitting this field grants access to all workspaces the token owner can access
 * - trackableIds: optional array of trackable UUIDs this token may access;
 *   omitting this field grants access to all accessible trackables
 */
export interface McpTokenCapabilities {
  tools: "all" | string[]
  workspaceIds?: string[]
  trackableIds?: string[]
}

/**
 * Machine-style access tokens for MCP connections.
 *
 * These are distinct from the `api_keys` table, which is used for
 * API log ingestion. MCP tokens are scoped to MCP tool access only
 * and carry per-token capability definitions.
 *
 * Token format: `trk_mcp_<24 bytes base64url>`
 * Only the first 20 chars (key_prefix) and SHA256 hash are stored.
 */
export const mcpAccessTokens = pgTable(
  "mcp_access_tokens",
  {
    id: uuidPrimaryKey(),
    createdByUserId: createdByUserId(),
    name: text("name").notNull(),
    /** First 20 characters of the raw token, used as the cache/lookup key */
    keyPrefix: text("key_prefix").notNull(),
    /** SHA256 hex digest of the full raw token */
    secretHash: text("secret_hash").notNull(),
    /** Last 4 characters for display only */
    lastFour: text("last_four").notNull(),
    /** Scoped capabilities: which tools and which trackables */
    capabilities: jsonb("capabilities").$type<McpTokenCapabilities>().notNull(),
    /** "active" or "revoked" */
    status: text("status").notNull().default("active"),
    expiresAt: expiresAt(),
    lastUsedAt: nullableTimestamp("last_used_at"),
    usageCount: usageCount(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("mcp_access_tokens_key_prefix_idx").on(table.keyPrefix),
    index("mcp_access_tokens_status_idx").on(table.status),
    index("mcp_access_tokens_created_by_idx").on(table.createdByUserId),
  ]
)

export const mcpAccessTokensRelations = relations(
  mcpAccessTokens,
  ({ one }) => ({
    createdBy: one(users, {
      fields: [mcpAccessTokens.createdByUserId],
      references: [users.id],
    }),
  })
)
