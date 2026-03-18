"use client"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"

import type { UsageEventRow } from "./table-types"
import { usageEventColumns } from "./usage-event-columns"

export function UsageEventsTable({
  data,
  isDisabled = false,
}: {
  data: UsageEventRow[]
  isDisabled?: boolean
}) {
  return (
    <DataTable
      columns={usageEventColumns}
      data={data}
      title={
        <span className="flex items-center gap-2">
          <span>API Usage Hits</span>
          {isDisabled ? <Badge variant="outline">Disabled</Badge> : null}
        </span>
      }
      description="Aggregated API hits grouped by unique name and API key."
      emptyMessage="No API usage has been recorded yet."
      initialPageSize={5}
    />
  )
}
