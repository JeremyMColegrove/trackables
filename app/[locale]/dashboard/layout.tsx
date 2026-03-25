import { DashboardShell } from "./dashboard-shell"
import { WorkspaceContextProvider } from "./workspace-context-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WorkspaceContextProvider>
      <DashboardShell>{children}</DashboardShell>
    </WorkspaceContextProvider>
  )
}
