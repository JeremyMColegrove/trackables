"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserAccountButton } from "@/components/user-account-button"
import { cn } from "@/lib/utils"
import { useTRPC } from "@/trpc/client"
import {
  dashboardNavItems,
  isDashboardNavItemActive,
} from "@/app/dashboard/navigation"

export function DashboardHeader() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const trpc = useTRPC()
  const memberCountQuery = useQuery(trpc.team.getMemberCount.queryOptions())
  const teamMemberCount = memberCountQuery.data?.count ?? 0

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 sm:px-8">
        <div className="flex items-center gap-6">
          {isMobile ? <SidebarTrigger /> : null}
          <Link href="/" className="text-lg font-bold tracking-tighter">
            Trackable.
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            {dashboardNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  isDashboardNavItemActive(item.href, pathname)
                    ? "page"
                    : undefined
                }
                className={cn(
                  "inline-flex items-center gap-2 transition-colors hover:text-foreground",
                  isDashboardNavItemActive(item.href, pathname) &&
                    "text-foreground"
                )}
              >
                {item.label}
                {item.href === "/dashboard/team" ? (
                  <Badge
                    variant="secondary"
                    className="min-w-5 px-1.5 text-[11px] leading-none"
                  >
                    {teamMemberCount}
                  </Badge>
                ) : null}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-px bg-border max-sm:hidden" />
          <UserAccountButton />
        </div>
      </div>
    </header>
  )
}
