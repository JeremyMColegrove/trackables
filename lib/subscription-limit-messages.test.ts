import assert from "node:assert/strict"
import test from "node:test"

import {
  getApiLogRateLimitMessage,
  getApiPayloadSizeLimitMessage,
  getCreatedWorkspaceLimitMessage,
  isApiLogRateLimitMessage,
  isApiPayloadSizeLimitMessage,
  isCreatedWorkspaceLimitMessage,
} from "@/lib/subscription-limit-messages"

test("created workspace limit messages stay detectable for the blocked workspace flow", () => {
  const message = getCreatedWorkspaceLimitMessage(3)

  assert.equal(
    message,
    "You have reached the maximum of 3 workspaces you can create on the free tier."
  )
  assert.equal(isCreatedWorkspaceLimitMessage(message), true)
})

test("API payload limit messages describe the configured byte cap", () => {
  const message = getApiPayloadSizeLimitMessage(1024)

  assert.equal(
    message,
    "This request exceeds the maximum API log payload size of 1 KB for the current plan."
  )
  assert.equal(isApiPayloadSizeLimitMessage(message), true)
})

test("API rate-limit messages use the minute window", () => {
  const message = getApiLogRateLimitMessage(10)

  assert.equal(
    message,
    "You have exceeded the maximum of 10 API log attempts per minute for your plan. Please upgrade for a higher logging rate."
  )
  assert.equal(isApiLogRateLimitMessage(message), true)
})
