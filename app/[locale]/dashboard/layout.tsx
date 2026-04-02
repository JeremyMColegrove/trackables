import { auth } from "@clerk/nextjs/server"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
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
  const { userId } = await auth()

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent("/dashboard")}`)
  }

  return (
    <WorkspaceContextProvider>
      <Suspense fallback={<>{children}</>}>
        <DashboardShell>{children}</DashboardShell>
      </Suspense>
    </WorkspaceContextProvider>
  )
}
