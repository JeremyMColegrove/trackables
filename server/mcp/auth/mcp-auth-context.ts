/**
 * MCP Auth Context
 *
 * Defines the normalized auth context that is passed to every MCP tool handler.
 * Raw tokens are never passed into business logic — only this resolved context.
 */

import type { McpToolName as SharedMcpToolName } from "@/lib/mcp-tools"

/** The set of tool names exposed through MCP. */
export type McpToolName = SharedMcpToolName

/**
 * Capabilities granted to an MCP token.
 *
 * - tools: "all" grants every tool; an array restricts to named tools only
 * - workspaceIds: optional workspace UUID allowlist; omitting grants access to
 *   every workspace the token owner can currently access
 * - trackableIds: optional whitelist of trackable UUIDs; omitting grants
 *   access to all accessible trackables in allowed workspaces
 */
export interface McpCapabilities {
  tools: "all" | McpToolName[]
  workspaceIds?: string[]
  trackableIds?: string[]
}

/**
 * The resolved, normalized auth context for an MCP request.
 *
 * Tool handlers receive this object — never a raw token string.
 * All access decisions are made through this interface.
 */
export interface McpAuthContext {
  readonly tokenId: string
  readonly ownerUserId: string
  readonly allowedWorkspaceIds: readonly string[]
  readonly capabilities: McpCapabilities

  /** Returns true if the token is allowed to invoke the given tool. */
  canUseTool(tool: McpToolName): boolean

  /** Returns true if the token is allowed to access the given workspace. */
  canAccessWorkspace(workspaceId: string): boolean

  /**
   * Returns true if the token's capability scope includes the given trackable.
   * When no trackableIds whitelist is set, all accessible trackables are allowed.
   */
  canAccessTrackable(trackableId: string): boolean
}

/** Concrete implementation of McpAuthContext built from a validated token record. */
export class McpAuthContextImpl implements McpAuthContext {
  readonly tokenId: string
  readonly ownerUserId: string
  readonly allowedWorkspaceIds: readonly string[]
  readonly capabilities: McpCapabilities

  constructor(params: {
    tokenId: string
    ownerUserId: string
    allowedWorkspaceIds: readonly string[]
    capabilities: McpCapabilities
  }) {
    this.tokenId = params.tokenId
    this.ownerUserId = params.ownerUserId
    this.allowedWorkspaceIds = params.allowedWorkspaceIds
    this.capabilities = params.capabilities
  }

  canUseTool(tool: McpToolName): boolean {
    const { tools } = this.capabilities
    if (tools === "all") return true
    return (tools as McpToolName[]).includes(tool)
  }

  canAccessWorkspace(workspaceId: string): boolean {
    return this.allowedWorkspaceIds.includes(workspaceId)
  }

  canAccessTrackable(trackableId: string): boolean {
    const { trackableIds } = this.capabilities
    // No whitelist = access to all trackables within allowed workspaces
    if (!trackableIds) return true
    return trackableIds.includes(trackableId)
  }
}
