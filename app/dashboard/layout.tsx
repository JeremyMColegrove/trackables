import { SidebarProvider } from "@/components/ui/sidebar"

import { DashboardHeader } from "./DashboardHeader"
import { DashboardSidebar } from "./DashboardSidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={false} className="bg-background">
      <DashboardSidebar />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col bg-background">
        <DashboardHeader />
        {children}
      </div>
    </SidebarProvider>
  )
}
