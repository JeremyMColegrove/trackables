"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"

import { ActivityDetailsDialog } from "./activity-details-dialog"
import { formSubmissionColumns } from "./form-submission-columns"
import type { SubmissionRow } from "./table-types"

export function FormSubmissionsTable({
  data,
  isDisabled = false,
}: {
  data: SubmissionRow[]
  isDisabled?: boolean
}) {
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRow | null>(
    null
  )

  return (
    <>
      <DataTable
        columns={formSubmissionColumns}
        data={data}
        title={
          <span className="flex items-center gap-2">
            <span>Form Submissions</span>
            {isDisabled ? <Badge variant="outline">Disabled</Badge> : null}
          </span>
        }
        description="Latest structured responses submitted to this project."
        onRowClick={setSelectedSubmission}
        emptyMessage="No form submissions have been recorded yet."
        initialPageSize={5}
      />
      {selectedSubmission ? (
        <ActivityDetailsDialog
          submission={selectedSubmission}
          open
          hideTrigger
          onOpenChange={(open) => {
            if (!open) {
              setSelectedSubmission(null)
            }
          }}
        />
      ) : null}
    </>
  )
}
