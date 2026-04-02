import type { Metadata } from "next"
import { Suspense } from "react"

import { createNoIndexMetadata } from "@/lib/seo"

import { DashboardShell } from "./dashboard-shell"
import { WorkspaceContextProvider } from "./workspace-context-provider"

export const metadata: Metadata = createNoIndexMetadata({
  title: "Dashboard",
  description: "Authenticated dashboard for managing trackables.",
})

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WorkspaceContextProvider>
      <Suspense fallback={<>{children}</>}>
        <DashboardShell>{children}</DashboardShell>
      </Suspense>
    </WorkspaceContextProvider>
  )
}
