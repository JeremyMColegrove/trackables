import assert from "node:assert/strict"
import test from "node:test"
import { render } from "@testing-library/react"

import {
  LimitUsageBadge,
  formatLimitUsage,
} from "@/components/ui/limit-usage-badge"
import { setupTestDom } from "@/components/date-range-input/__tests__/test-dom"

test("formatLimitUsage renders the visible used-over-max pattern", () => {
  assert.equal(formatLimitUsage(3, 10), "3/10")
})

test("LimitUsageBadge shows the current and maximum capacity", () => {
  const teardown = setupTestDom()

  try {
    const view = render(<LimitUsageBadge current={3} limit={10} />)

    assert.equal(view.getByText("3/10").textContent, "3/10")
  } finally {
    teardown()
  }
})
