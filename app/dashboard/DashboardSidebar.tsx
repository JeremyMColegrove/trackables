"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
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
import { useTRPC } from "@/trpc/client"
import {
  dashboardNavItems,
  isDashboardNavItemActive,
} from "@/app/dashboard/navigation"

export function DashboardSidebar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()
  const trpc = useTRPC()
  const memberCountQuery = useQuery(trpc.team.getMemberCount.queryOptions())
  const teamMemberCount = memberCountQuery.data?.count ?? 0

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
                      className="flex w-full items-center justify-between gap-2"
                      onClick={() => {
                        if (isMobile) {
                          setOpenMobile(false)
                        }
                      }}
                    >
                      <span>{item.label}</span>
                      {item.href === "/dashboard/team" ? (
                        <Badge
                          variant="secondary"
                          className="min-w-5 px-1.5 text-[11px] leading-none"
                        >
                          {teamMemberCount}
                        </Badge>
                      ) : null}
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
