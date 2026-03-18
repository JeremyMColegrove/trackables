"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { dashboardProjectColumns } from "@/app/dashboard/dashboard-project-columns"
import { DataTable } from "@/components/ui/data-table"
import { useTRPC } from "@/trpc/client"

export function DashboardProjectsTable() {
  const trpc = useTRPC()
  const router = useRouter()
  const { data: projects, isLoading } = useQuery(
    trpc.dashboard.getProjects.queryOptions()
  )

  return (
    <DataTable
      columns={dashboardProjectColumns}
      data={projects ?? []}
      onRowClick={(project) => router.push(`/dashboard/project/${project.id}`)}
      emptyMessage={isLoading ? "Loading projects..." : "No projects found."}
      initialPageSize={10}
    />
  )
}
