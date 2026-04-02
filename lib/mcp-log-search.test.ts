import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { buildMcpLogSummaryRows } from "@/lib/mcp-log-search"
import type { UsageEventTableResult } from "@/lib/usage-event-search"

describe("buildMcpLogSummaryRows", () => {
  it("maps flat usage rows to MCP log rows", () => {
    const rows = [
      {
        id: "log-row",
        event: "signup",
        level: "info",
        message: "Created user",
        aggregation: "none",
        groupField: null,
        totalHits: 1,
        lastOccurredAt: "2026-04-02T10:00:00.000Z",
        firstOccurredAt: "2026-04-02T10:00:00.000Z",
        percentage: 100,
        apiKey: {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Primary",
          maskedKey: "trk_...1234",
        },
        apiKeyCount: 1,
        apiKeys: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            name: "Primary",
            maskedKey: "trk_...1234",
          },
        ],
        hits: [
          {
            id: "22222222-2222-2222-2222-222222222222",
            occurredAt: "2026-04-02T10:00:00.000Z",
            payload: {
              event: "signup",
              level: "info",
              message: "Created user",
              route: "/api/signup",
            },
            metadata: null,
            apiKey: {
              id: "11111111-1111-1111-1111-111111111111",
              name: "Primary",
              maskedKey: "trk_...1234",
            },
          },
        ],
      },
    ] satisfies UsageEventTableResult["rows"]

    const result = buildMcpLogSummaryRows(
      rows,
      "33333333-3333-3333-3333-333333333333"
    )

    assert.equal(result.length, 1)
    assert.deepEqual(result[0], {
      id: "22222222-2222-2222-2222-222222222222",
      type: "log",
      level: "info",
      message: "Created user",
      occurredAt: "2026-04-02T10:00:00.000Z",
      payloadPreview: {
        event: "signup",
        level: "info",
        message: "Created user",
        route: "/api/signup",
      },
      totalHits: 1,
      groupBy: null,
      groupValue: null,
      firstOccurredAt: "2026-04-02T10:00:00.000Z",
      lastOccurredAt: "2026-04-02T10:00:00.000Z",
      apiKeyCount: 1,
      uiLink: result[0]?.uiLink,
    })
    assert.match(
      result[0]?.uiLink ?? "",
      /\/dashboard\/trackables\/33333333-3333-3333-3333-333333333333\?logId=22222222-2222-2222-2222-222222222222$/
    )
  })

  it("maps grouped usage rows to MCP group summaries", () => {
    const rows = [
      {
        id: "event:signup",
        event: "signup",
        level: null,
        message: null,
        aggregation: "payload_field",
        groupField: "event",
        totalHits: 12,
        lastOccurredAt: "2026-04-02T10:00:00.000Z",
        firstOccurredAt: "2026-04-02T09:00:00.000Z",
        percentage: 60,
        apiKey: null,
        apiKeyCount: 2,
        apiKeys: [
          {
            id: "11111111-1111-1111-1111-111111111111",
            name: "Primary",
            maskedKey: "trk_...1234",
          },
        ],
        hits: [],
      },
    ] satisfies UsageEventTableResult["rows"]

    const result = buildMcpLogSummaryRows(
      rows,
      "33333333-3333-3333-3333-333333333333"
    )

    assert.equal(result.length, 1)
    assert.deepEqual(result[0], {
      id: "event:signup",
      type: "group",
      level: null,
      message: null,
      occurredAt: null,
      payloadPreview: null,
      totalHits: 12,
      groupBy: "event",
      groupValue: "signup",
      firstOccurredAt: "2026-04-02T09:00:00.000Z",
      lastOccurredAt: "2026-04-02T10:00:00.000Z",
      apiKeyCount: 2,
      uiLink: result[0]?.uiLink,
    })
    assert.match(
      result[0]?.uiLink ?? "",
      /\/dashboard\/trackables\/33333333-3333-3333-3333-333333333333\?aggregate=event$/
    )
  })
})
