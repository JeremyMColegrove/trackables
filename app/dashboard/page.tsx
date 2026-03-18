import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { DashboardMetrics } from "@/app/dashboard/DashboardMetrics"
import { DashboardProjectsTable } from "@/app/dashboard/DashboardProjectsTable"
import { CreateProjectDialog } from "@/app/dashboard/CreateProjectDialog"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
            <p className="text-sm text-muted-foreground">
              Your high-level metrics and project activity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateProjectDialog />
          </div>
        </div>

        <DashboardMetrics />

        <Separator className="my-2" />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Projects</h2>

          <DashboardProjectsTable />
        </div>
      </div>
    </main>
  )
}
