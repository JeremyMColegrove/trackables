import "server-only"
import { TRPCError } from "@trpc/server"
import { and, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@/db"
import {
  trackableAccessGrants,
  trackableItems,
  workspaceMembers,
  users,
} from "@/db/schema"
import { getWorkspaceMemberships } from "@/server/workspaces"

export type AccessRole = "submit" | "view" | "manage"
export type WorkspaceRole = "owner" | "admin" | "member"

export class AccessControlService {
  private getAllowedRoles(minimumRole: AccessRole) {
    if (minimumRole === "submit") {
      return ["submit", "view", "manage"] as const
    }

    if (minimumRole === "view") {
      return ["view", "manage"] as const
    }

    return ["manage"] as const
  }

  private canManageWorkspace(role: WorkspaceRole) {
    return role === "owner" || role === "admin"
  }

  async assertProjectAccess(
    projectId: string,
    userId: string,
    minimumRole: AccessRole
  ) {
    const project = await db.query.trackableItems.findFirst({
      where: eq(trackableItems.id, projectId),
      columns: {
        id: true,
        kind: true,
        workspaceId: true,
      },
    })

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Trackable not found.",
      })
    }

    const workspaceMembership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, project.workspaceId),
        eq(workspaceMembers.userId, userId),
        isNull(workspaceMembers.revokedAt)
      ),
      columns: {
        id: true,
      },
    })

    if (workspaceMembership) {
      return project
    }

    const grant = await db.query.trackableAccessGrants.findFirst({
      where: and(
        eq(trackableAccessGrants.trackableId, projectId),
        eq(trackableAccessGrants.subjectUserId, userId),
        inArray(trackableAccessGrants.role, this.getAllowedRoles(minimumRole)),
        isNull(trackableAccessGrants.revokedAt)
      ),
      columns: {
        id: true,
      },
    })

    if (!grant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Trackable not found.",
      })
    }

    return project
  }

  async getAccessibleProjectIds(userId: string, minimumRole: AccessRole = "view") {
    const [workspaceProjectRows, grantedProjects] = await Promise.all([
      db
        .select({
          id: trackableItems.id,
        })
        .from(trackableItems)
        .innerJoin(
          workspaceMembers,
          and(
            eq(workspaceMembers.workspaceId, trackableItems.workspaceId),
            eq(workspaceMembers.userId, userId),
            isNull(workspaceMembers.revokedAt)
          )
        ),
      db.query.trackableAccessGrants.findMany({
        where: and(
          eq(trackableAccessGrants.subjectUserId, userId),
          inArray(trackableAccessGrants.role, this.getAllowedRoles(minimumRole)),
          isNull(trackableAccessGrants.revokedAt)
        ),
        columns: {
          trackableId: true,
        },
      }),
    ])

    return Array.from(
      new Set([
        ...workspaceProjectRows.map((project) => project.id),
        ...grantedProjects.map((grant) => grant.trackableId),
      ])
    )
  }

  async resolveActiveWorkspace(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        activeWorkspaceId: true,
      },
    })

    const memberships = await getWorkspaceMemberships(userId)

    const activeMembership =
      memberships.find(
        (membership) => membership.workspaceId === user?.activeWorkspaceId
      ) ?? memberships[0]

    if (!activeMembership) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No workspace found for this account.",
      })
    }

    if (activeMembership.workspaceId !== user?.activeWorkspaceId) {
      await db
        .update(users)
        .set({
          activeWorkspaceId: activeMembership.workspaceId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
    }

    return activeMembership
  }

  async assertWorkspaceAccess(userId: string, workspaceId: string) {
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.workspaceId, workspaceId),
        isNull(workspaceMembers.revokedAt)
      ),
      with: {
        workspace: true,
      },
    })

    if (!membership) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found.",
      })
    }

    return membership
  }

  async assertWorkspaceManagementAccess(userId: string, workspaceId: string) {
    const membership = await this.assertWorkspaceAccess(userId, workspaceId)

    if (!this.canManageWorkspace(membership.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to manage this workspace.",
      })
    }

    return membership
  }
}

export const accessControlService = new AccessControlService()
