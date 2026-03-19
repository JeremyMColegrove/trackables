"use client"

import { useState } from "react"

import { DataTable } from "@/components/ui/data-table"
import type { UsageEventUrlState } from "@/lib/usage-event-search"

import type { UsageEventTableData } from "./table-types"
import { UsageDetailsDialog } from "./usage-details-dialog"
import { getUsageEventColumns } from "./usage-event-columns"

export function UsageEventsTable({
  data,
  onFilterToGroup,
  title = "Ingestion Data",
  description = "Derived API event rows from the current query and view settings.",
}: {
  data: UsageEventTableData
  onFilterToGroup: (patch: Partial<UsageEventUrlState>) => void
  title?: React.ReactNode
  description?: string
}) {
  const [selectedUsageEvent, setSelectedUsageEvent] = useState<
    UsageEventTableData["rows"][number] | null
  >(null)

  return (
    <>
      <DataTable
        columns={getUsageEventColumns(data.columns)}
        data={data.rows}
        title={title}
        description={`${description} ${data.totalMatchedEvents} matching event${data.totalMatchedEvents === 1 ? "" : "s"} across ${data.totalGroupedRows} row${data.totalGroupedRows === 1 ? "" : "s"}.`}
        onRowClick={setSelectedUsageEvent}
        emptyMessage="No API usage has been recorded yet."
        initialPageSize={5}
      />
      {selectedUsageEvent ? (
        <UsageDetailsDialog
          usageEvent={selectedUsageEvent}
          onFilterToGroup={onFilterToGroup}
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
