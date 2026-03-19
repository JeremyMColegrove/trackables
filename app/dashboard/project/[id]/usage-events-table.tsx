"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"

import type { UsageEventRow } from "./table-types"
import { UsageDetailsDialog } from "./usage-details-dialog"
import { usageEventColumns } from "./usage-event-columns"

export function UsageEventsTable({
  data,
  isDisabled = false,
}: {
  data: UsageEventRow[]
  isDisabled?: boolean
}) {
  const [selectedUsageEvent, setSelectedUsageEvent] =
    useState<UsageEventRow | null>(null)

  return (
    <>
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
        onRowClick={setSelectedUsageEvent}
        emptyMessage="No API usage has been recorded yet."
        initialPageSize={5}
      />
      {selectedUsageEvent ? (
        <UsageDetailsDialog
          usageEvent={selectedUsageEvent}
          open
          onOpenChange={(open) => {
            if (!open) {
              setSelectedUsageEvent(null)
            }
          }}
        />
      ) : null}
    </>
  )
}
