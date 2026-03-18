import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

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
      <SidebarInset className="min-h-svh min-w-0 bg-background">
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
