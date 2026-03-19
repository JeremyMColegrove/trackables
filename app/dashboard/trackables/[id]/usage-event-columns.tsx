"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Hash } from "lucide-react"

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"

import { formatDateTime, formatRelativeTime } from "./display-utils"
import type { UsageEventColumn, UsageEventRow } from "./table-types"

const usageEventColumnDefinitions: Record<
  UsageEventColumn["id"],
  ColumnDef<UsageEventRow>
> = {
  name: {
    id: "name",
    accessorFn: (row) => row.name,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <Hash className="size-3.5" />
        </div>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
    sortingFn: (left, right) =>
      left.original.name.localeCompare(right.original.name),
    filterFn: (row, _columnId, filterValue) => {
      return row.original.name
        .toLowerCase()
        .includes(String(filterValue).toLowerCase())
    },
  },
  apiKey: {
    id: "apiKey",
    accessorFn: (row) =>
      row.apiKey?.name ?? `${row.apiKeyCount} API key${row.apiKeyCount === 1 ? "" : "s"}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="API Key" />,
    cell: ({ row }) => {
      if (row.original.apiKey) {
        return (
          <div className="space-y-0.5">
            <div className="font-medium">{row.original.apiKey.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.apiKey.maskedKey}
            </div>
          </div>
        )
      }

      return (
        <div className="space-y-0.5">
          <div className="font-medium">
            {row.original.apiKeyCount} API key
            {row.original.apiKeyCount === 1 ? "" : "s"}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.apiKeys
              .slice(0, 2)
              .map((apiKey) => apiKey.name)
              .join(", ")}
            {row.original.apiKeys.length > 2 ? "..." : ""}
          </div>
        </div>
      )
    },
    sortingFn: (left, right) => {
      const leftName = left.original.apiKey?.name ?? left.original.apiKeys[0]?.name ?? ""
      const rightName =
        right.original.apiKey?.name ?? right.original.apiKeys[0]?.name ?? ""

      return leftName.localeCompare(rightName)
    },
  },
  totalHits: {
    accessorKey: "totalHits",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Hits" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.totalHits}</span>
    ),
  },
  lastOccurredAt: {
    accessorKey: "lastOccurredAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Hit" />
    ),
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <div>{formatRelativeTime(row.original.lastOccurredAt)}</div>
        <div className="text-xs text-muted-foreground">
          {formatDateTime(row.original.lastOccurredAt)}
        </div>
      </div>
    ),
  },
}

export function getUsageEventColumns(
  columns: UsageEventColumn[]
): ColumnDef<UsageEventRow>[] {
  return columns
    .filter((column) => column.visible)
    .map((column) => {
      const definition = usageEventColumnDefinitions[column.id]

      return {
        ...definition,
        header: ({ column: tableColumn }) => (
          <DataTableColumnHeader column={tableColumn} title={column.label} />
        ),
      } as ColumnDef<UsageEventRow>
    })
}
