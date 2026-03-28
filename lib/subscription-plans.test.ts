import assert from "node:assert/strict"
import test from "node:test"

import {
  getFreeTierCreatedWorkspaceLimit,
  getLimitsForTier,
} from "@/lib/subscription-plans"

test("free tier centralizes abuse-prevention defaults", () => {
  const freeLimits = getLimitsForTier("free")

  assert.equal(freeLimits.maxWorkspaceMembers, 10)
  assert.equal(freeLimits.maxApiPayloadBytes, 1024)
  assert.equal(freeLimits.maxApiLogsPerMinute, 10)
  assert.equal(getFreeTierCreatedWorkspaceLimit(), 3)
})

test("paid tiers keep higher API usage limits than free", () => {
  const freeLimits = getLimitsForTier("free")
  const plusLimits = getLimitsForTier("plus")
  const proLimits = getLimitsForTier("pro")

  assert.equal(
    plusLimits.maxApiPayloadBytes! > freeLimits.maxApiPayloadBytes!,
    true
  )
  assert.equal(
    plusLimits.maxApiLogsPerMinute! > freeLimits.maxApiLogsPerMinute!,
    true
  )
  assert.equal(proLimits.maxApiPayloadBytes, null)
  assert.equal(
    proLimits.maxApiLogsPerMinute! > plusLimits.maxApiLogsPerMinute!,
    true
  )
})
