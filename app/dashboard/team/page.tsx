import { auth, currentUser } from "@clerk/nextjs/server"
import {
  ArrowUpRight,
  Clock3,
  MailPlus,
  ShieldCheck,
  UserRoundPlus,
  Users2,
} from "lucide-react"
import { redirect } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const plannedRoles = [
  {
    name: "Owner",
    description:
      "Full control over projects, sharing, API keys, and future team settings.",
  },
  {
    name: "Admin",
    description:
      "Can manage members and collaboration rules without owning every project.",
  },
  {
    name: "Contributor",
    description:
      "Can work inside assigned projects and review form responses or usage activity.",
  },
  {
    name: "Viewer",
    description:
      "Read-only access for stakeholders who should not change configuration.",
  },
] as const

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default async function TeamPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await currentUser()

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "Workspace owner"

  const email = user?.primaryEmailAddress?.emailAddress ?? "No email available"
  const avatarUrl = user?.imageUrl ?? undefined

  return (
    <main className="flex-1">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-8">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          <Card className="border-border/70">
            <CardHeader className="gap-3">
              <Badge variant="outline" className="w-fit">
                Team
              </Badge>
              <div className="space-y-2">
                <CardTitle className="text-3xl">
                  Manage your workspace team
                </CardTitle>
                <CardDescription className="max-w-2xl text-sm leading-6">
                  This first pass establishes the collaboration surface:
                  members, invites, and permission roles. The data model is
                  still single-owner, so actions that need backend support stay
                  explicit instead of hidden.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users2 className="size-4" />
                  Active members
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight">1</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Owner access only
                </p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MailPlus className="size-4" />
                  Pending invites
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight">0</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Invite flow not connected yet
                </p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="size-4" />
                  Role templates
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {plannedRoles.length}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ready for a team domain
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>What this page unlocks next</CardTitle>
              <CardDescription>
                The UI is intentionally shaped around the domain work that still
                needs to be added.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-xl border bg-muted/20 p-4">
                Persist team membership and invitation status.
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                Attach project-level access rules to members instead of
                owner-only access.
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                Replace disabled controls with tRPC procedures for invites,
                roles, and revocation.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <CardTitle>Members</CardTitle>
                <CardDescription>
                  Current workspace access. The owner is the only persisted
                  member today.
                </CardDescription>
              </div>
              <Button variant="outline" disabled>
                <UserRoundPlus className="size-4" />
                Invite member
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg">
                          <AvatarImage src={avatarUrl} alt={fullName} />
                          <AvatarFallback>
                            {getInitials(fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {fullName}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>Owner</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Active</Badge>
                    </TableCell>
                    <TableCell className="text-sm whitespace-normal text-muted-foreground">
                      Full access to projects, responses, API keys, and share
                      settings.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Invites</CardTitle>
                <CardDescription>
                  The workflow is visible now so backend work can target a
                  stable UI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-dashed p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock3 className="size-4 text-muted-foreground" />
                    No pending invites
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Invite states, acceptance, and revocation should become
                    first-class records once the sharing and team domains
                    connect.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled
                >
                  Invite by email
                  <ArrowUpRight className="size-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role model</CardTitle>
                <CardDescription>
                  Planned permission levels for collaborative access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {plannedRoles.map((role) => (
                  <div
                    key={role.name}
                    className="rounded-xl border bg-muted/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{role.name}</p>
                      <Badge variant="outline">Planned</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}
