"use client"

import { DataTable } from "@/components/ui/data-table"

import type { UsageEventRow } from "./table-types"
import { usageEventColumns } from "./usage-event-columns"

export function UsageEventsTable({ data }: { data: UsageEventRow[] }) {
  return (
    <DataTable
      columns={usageEventColumns}
      data={data}
      title="API Usage Hits"
      description="Aggregated API hits grouped by unique name and API key."
      emptyMessage="No API usage has been recorded yet."
      initialPageSize={5}
    />
  )
}
