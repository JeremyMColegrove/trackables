"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  dashboardNavItems,
  isDashboardNavItemActive,
} from "@/app/dashboard/navigation"

export function DashboardSidebar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()

  if (!isMobile) {
    return null
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b p-4">
        <Link href="/" className="text-lg font-bold tracking-tighter">
          Trackable.
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-3">
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isDashboardNavItemActive(item.href, pathname)}
                  >
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (isMobile) {
                          setOpenMobile(false)
                        }
                      }}
                    >
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
