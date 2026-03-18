export type DashboardNavItem = {
  href: string
  label: string
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Projects",
  },
  {
    href: "/dashboard/team",
    label: "Team",
  },
]

export function isDashboardNavItemActive(href: string, pathname: string) {
  if (href === "/dashboard") {
    return pathname === href || pathname.startsWith("/dashboard/project/")
  }

  return pathname === href
}
