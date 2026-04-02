/**
 * MCP Auth Tests
 *
 * Tests for the token validation layer, McpAuthContext capabilities,
 * and auth failure scenarios.
 */

import { describe, it } from "node:test"
import assert from "node:assert/strict"

import { McpAuthContextImpl } from "../auth/mcp-auth-context"
import { McpAuthError } from "../errors/mcp-errors"

// ---------------------------------------------------------------------------
// McpAuthContextImpl unit tests
// These do not require DB or Redis.
// ---------------------------------------------------------------------------

describe("McpAuthContextImpl", () => {
  describe("canUseTool", () => {
    it("returns true for all tools when capabilities.tools is 'all'", () => {
      const ctx = new McpAuthContextImpl({
        tokenId: "tok-1",
        ownerUserId: "user-1",
        allowedWorkspaceIds: ["ws-1", "ws-2"],
        capabilities: { tools: "all" },
      })

      assert.equal(ctx.canUseTool("list_workspaces"), true)
      assert.equal(ctx.canUseTool("find_trackables"), true)
      assert.equal(ctx.canUseTool("list_trackables"), true)
      assert.equal(ctx.canUseTool("create_trackable"), true)
      assert.equal(ctx.canUseTool("search_logs"), true)
      assert.equal(ctx.canUseTool("get_log"), true)
      assert.equal(ctx.canUseTool("create_form"), true)
      assert.equal(ctx.canUseTool("update_form_sharing"), true)
      assert.equal(ctx.canUseTool("list_responses"), true)
      assert.equal(ctx.canUseTool("get_response"), true)
    })

    it("returns true only for listed tools when capabilities.tools is an array", () => {
      const ctx = new McpAuthContextImpl({
        tokenId: "tok-1",
        ownerUserId: "user-1",
        allowedWorkspaceIds: ["ws-1"],
        capabilities: {
          tools: [
            "list_workspaces",
            "find_trackables",
            "list_trackables",
            "search_logs",
          ],
        },
      })

      assert.equal(ctx.canUseTool("list_workspaces"), true)
      assert.equal(ctx.canUseTool("find_trackables"), true)
      assert.equal(ctx.canUseTool("list_trackables"), true)
      assert.equal(ctx.canUseTool("search_logs"), true)
      assert.equal(ctx.canUseTool("create_trackable"), false)
      assert.equal(ctx.canUseTool("get_log"), false)
      assert.equal(ctx.canUseTool("create_form"), false)
      assert.equal(ctx.canUseTool("update_form_sharing"), false)
      assert.equal(ctx.canUseTool("list_responses"), false)
      assert.equal(ctx.canUseTool("get_response"), false)
    })

    it("returns false for all tools when capabilities.tools is an empty array", () => {
      const ctx = new McpAuthContextImpl({
        tokenId: "tok-1",
        ownerUserId: "user-1",
        allowedWorkspaceIds: ["ws-1"],
        capabilities: { tools: [] },
      })

      assert.equal(ctx.canUseTool("list_workspaces"), false)
      assert.equal(ctx.canUseTool("find_trackables"), false)
      assert.equal(ctx.canUseTool("list_trackables"), false)
      assert.equal(ctx.canUseTool("search_logs"), false)
    })
  })

  describe("canAccessWorkspace", () => {
    it("returns true only for allowed workspace IDs", () => {
      const ctx = new McpAuthContextImpl({
        tokenId: "tok-1",
        ownerUserId: "user-1",
        allowedWorkspaceIds: ["ws-1", "ws-2"],
        capabilities: { tools: "all" },
      })

      assert.equal(ctx.canAccessWorkspace("ws-1"), true)
      assert.equal(ctx.canAccessWorkspace("ws-2"), true)
      assert.equal(ctx.canAccessWorkspace("ws-3"), false)
    })
  })

  describe("canAccessTrackable", () => {
    it("returns true for any trackable when no trackableIds whitelist is set", () => {
      const ctx = new McpAuthContextImpl({
        tokenId: "tok-1",
        ownerUserId: "user-1",
        allowedWorkspaceIds: ["ws-1"],
        capabilities: { tools: "all" },
      })

      assert.equal(ctx.canAccessTrackable("any-uuid"), true)
      assert.equal(ctx.canAccessTrackable("another-uuid"), true)
    })

    it("returns true only for whitelisted trackable IDs", () => {
      const ctx = new McpAuthContextImpl({
        tokenId: "tok-1",
        ownerUserId: "user-1",
        allowedWorkspaceIds: ["ws-1"],
        capabilities: {
          tools: "all",
          trackableIds: ["trackable-a", "trackable-b"],
        },
      })

      assert.equal(ctx.canAccessTrackable("trackable-a"), true)
      assert.equal(ctx.canAccessTrackable("trackable-b"), true)
      assert.equal(ctx.canAccessTrackable("trackable-c"), false)
    })

    it("returns false for all trackables when trackableIds is an empty array", () => {
      const ctx = new McpAuthContextImpl({
        tokenId: "tok-1",
        ownerUserId: "user-1",
        allowedWorkspaceIds: ["ws-1"],
        capabilities: { tools: "all", trackableIds: [] },
      })

      assert.equal(ctx.canAccessTrackable("any-uuid"), false)
    })
  })
})

// ---------------------------------------------------------------------------
// McpAuthError unit tests
// ---------------------------------------------------------------------------

describe("McpAuthError", () => {
  it("carries the correct code and message", () => {
    const err = new McpAuthError("UNAUTHORIZED", "Token has expired.")
    assert.equal(err.code, "UNAUTHORIZED")
    assert.equal(err.message, "Token has expired.")
    assert.equal(err.name, "McpAuthError")
  })

  it("is an instance of Error", () => {
    const err = new McpAuthError("FORBIDDEN", "Not allowed.")
    assert.ok(err instanceof Error)
  })
})
