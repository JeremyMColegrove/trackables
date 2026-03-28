import assert from "node:assert/strict"
import test from "node:test"
import { render } from "@testing-library/react"

import { setupTestDom } from "@/components/date-range-input/__tests__/test-dom"
import { WorkspaceCreationLimitDialog } from "@/app/[locale]/dashboard/workspace-creation-limit-dialog"

test("workspace creation limit dialog explains the free-tier cap and current usage", () => {
  const teardown = setupTestDom()

  try {
    const view = render(
      <WorkspaceCreationLimitDialog
        open
        onOpenChange={() => {}}
        current={3}
        limit={3}
      />
    )

    assert.equal(
      view.getByText("Workspace limit reached").textContent,
      "Workspace limit reached"
    )
    assert.match(
      view.getByText(/maximum number of workspaces available on the free tier/i)
        .textContent ?? "",
      /free tier/i
    )
    assert.equal(view.getByText("3/3").textContent, "3/3")
    assert.match(
      view.getByText(/Workspaces you join do not count toward this limit/i)
        .textContent ?? "",
      /do not count/i
    )
  } finally {
    teardown()
  }
})
