import assert from "node:assert/strict"
import test from "node:test"

import { getUsagePayloadSizeBytes } from "@/server/subscriptions/quota-limit-utils"

test("getUsagePayloadSizeBytes measures serialized request size in bytes", () => {
  const payload = {
    event: "signup",
    message: "hello",
  }

  assert.equal(
    getUsagePayloadSizeBytes(payload),
    Buffer.byteLength(JSON.stringify(payload), "utf8")
  )
})
