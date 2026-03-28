import assert from "node:assert/strict"
import test from "node:test"

import { TRPCError } from "@trpc/server"

import { assertCanCreateWorkspaceWithCount } from "@/server/workspace-creation-limit"
import { applyWorkspaceCreationSideEffects } from "@/server/workspace-creation-side-effects"

test("workspace creation side effects initialize a free subscription and clear caches", async () => {
  const calls: string[] = []

  await applyWorkspaceCreationSideEffects(
    {
      workspaceId: "workspace-1",
      userId: "user-1",
      setActive: true,
    },
    {
      ensureWorkspaceSubscription: async (workspaceId) => {
        calls.push(`subscription:${workspaceId}`)
      },
      clearMembershipsCache: async (userId) => {
        calls.push(`memberships:${userId}`)
      },
      clearActiveWorkspaceCache: async (userId) => {
        calls.push(`active:${userId}`)
      },
    }
  )

  assert.deepEqual(calls, [
    "subscription:workspace-1",
    "memberships:user-1",
    "active:user-1",
  ])
})

test("workspace creation is blocked once the creator reaches the free-tier cap", () => {
  assert.doesNotThrow(() => assertCanCreateWorkspaceWithCount(2, 3))

  assert.throws(
    () => assertCanCreateWorkspaceWithCount(3, 3),
    (error: unknown) =>
      error instanceof TRPCError &&
      error.message ===
        "You have reached the maximum of 3 workspaces you can create on the free tier."
  )
})
