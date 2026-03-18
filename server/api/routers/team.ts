import { TRPCError } from "@trpc/server"
import { and, eq, ilike, inArray, isNull, notInArray, or } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { users, workspaceTeamMembers } from "@/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import {
  getConnectedTeamUserIds,
  getTeamOwnerId,
  getTeamUserIds,
} from "@/server/team-members"

const userSearchSchema = z.object({
  query: z.string().trim().min(2).max(100),
})

export const teamRouter = createTRPCRouter({
  getMemberCount: protectedProcedure.query(async ({ ctx }) => {
    const ownerId = ctx.auth.userId

    if (!ownerId) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    return {
      count: (await getConnectedTeamUserIds(ownerId)).length,
    }
  }),

  listMembers: protectedProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.auth.userId

    if (!currentUserId) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    const [teamOwnerId, connectedUserIds] = await Promise.all([
      getTeamOwnerId(currentUserId),
      getConnectedTeamUserIds(currentUserId),
    ])

    const [currentUser, connectedMembers] = await Promise.all([
      db.query.users.findFirst({
        where: eq(users.id, currentUserId),
        columns: {
          id: true,
          displayName: true,
          primaryEmail: true,
          imageUrl: true,
        },
      }),
      connectedUserIds.length === 0
        ? Promise.resolve([])
        : db.query.users.findMany({
            where: inArray(users.id, connectedUserIds),
            columns: {
              id: true,
              displayName: true,
              primaryEmail: true,
              imageUrl: true,
            },
          }),
    ])

    return [
      {
        id: currentUserId,
        displayName: currentUser?.displayName ?? null,
        primaryEmail: currentUser?.primaryEmail ?? null,
        imageUrl: currentUser?.imageUrl ?? null,
        roleLabel: currentUserId === teamOwnerId ? "Owner" : "Member",
        isOwner: currentUserId === teamOwnerId,
        addedAt: null,
      },
      ...connectedMembers.map((member) => ({
        id: member.id,
        displayName: member.displayName,
        primaryEmail: member.primaryEmail,
        imageUrl: member.imageUrl,
        roleLabel: member.id === teamOwnerId ? "Owner" : "Member",
        isOwner: member.id === teamOwnerId,
        addedAt: null,
      })),
    ]
  }),

  searchUsers: protectedProcedure
    .input(userSearchSchema)
    .query(async ({ ctx, input }) => {
      const ownerId = ctx.auth.userId

      if (!ownerId) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      const query = input.query.trim()

      const excludedUserIds = [ownerId, ...(await getConnectedTeamUserIds(ownerId))]

      return db.query.users.findMany({
        where: and(
          eq(users.isProfilePrivate, false),
          notInArray(users.id, excludedUserIds),
          or(
            ilike(users.displayName, `%${query}%`),
            ilike(users.primaryEmail, `%${query}%`)
          )
        ),
        limit: 8,
        columns: {
          id: true,
          displayName: true,
          primaryEmail: true,
          imageUrl: true,
        },
      })
    }),

  addMember: protectedProcedure
    .input(
      z.object({
        memberUserId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.auth.userId

      if (!currentUserId) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      if (currentUserId === input.memberUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already on your own team.",
        })
      }

      const member = await db.query.users.findFirst({
        where: eq(users.id, input.memberUserId),
        columns: {
          id: true,
          isProfilePrivate: true,
        },
      })

      if (!member || member.isProfilePrivate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        })
      }

      const teamOwnerId = await getTeamOwnerId(currentUserId)
      const existingMembership = await db.query.workspaceTeamMembers.findFirst({
        where: or(
          and(
            eq(workspaceTeamMembers.ownerId, teamOwnerId),
            eq(workspaceTeamMembers.memberUserId, input.memberUserId)
          ),
          and(
            eq(workspaceTeamMembers.ownerId, input.memberUserId),
            eq(workspaceTeamMembers.memberUserId, teamOwnerId)
          )
        ),
        columns: {
          id: true,
          revokedAt: true,
        },
      })

      if (existingMembership) {
        if (existingMembership.revokedAt) {
          await db
            .update(workspaceTeamMembers)
            .set({
              revokedAt: null,
              updatedAt: new Date(),
            })
            .where(eq(workspaceTeamMembers.id, existingMembership.id))
        }

        return { ok: true }
      }

      await db.insert(workspaceTeamMembers).values({
        ownerId: teamOwnerId,
        memberUserId: input.memberUserId,
        createdByUserId: currentUserId,
      })

      return { ok: true }
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        memberUserId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.auth.userId

      if (!currentUserId) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      const [teamOwnerId, teamUserIds] = await Promise.all([
        getTeamOwnerId(currentUserId),
        getTeamUserIds(currentUserId),
      ])

      if (!teamUserIds.includes(input.memberUserId)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team member not found.",
        })
      }

      if (input.memberUserId === teamOwnerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The team owner cannot be removed yet.",
        })
      }

      const remainingUserIds = teamUserIds.filter(
        (userId) => userId !== input.memberUserId
      )
      const now = new Date()

      await db.transaction(async (tx) => {
        await tx
          .update(workspaceTeamMembers)
          .set({
            revokedAt: now,
            updatedAt: now,
          })
          .where(
            and(
              isNull(workspaceTeamMembers.revokedAt),
              or(
                and(
                  eq(workspaceTeamMembers.ownerId, input.memberUserId),
                  inArray(workspaceTeamMembers.memberUserId, teamUserIds)
                ),
                and(
                  eq(workspaceTeamMembers.memberUserId, input.memberUserId),
                  inArray(workspaceTeamMembers.ownerId, teamUserIds)
                )
              )
            )
          )

        for (const remainingUserId of remainingUserIds) {
          if (remainingUserId === teamOwnerId) {
            continue
          }

          const existingOwnerEdge = await tx.query.workspaceTeamMembers.findFirst({
            where: or(
              and(
                eq(workspaceTeamMembers.ownerId, teamOwnerId),
                eq(workspaceTeamMembers.memberUserId, remainingUserId)
              ),
              and(
                eq(workspaceTeamMembers.ownerId, remainingUserId),
                eq(workspaceTeamMembers.memberUserId, teamOwnerId)
              )
            ),
            columns: {
              id: true,
              revokedAt: true,
            },
          })

          if (existingOwnerEdge) {
            if (existingOwnerEdge.revokedAt) {
              await tx
                .update(workspaceTeamMembers)
                .set({
                  revokedAt: null,
                  updatedAt: now,
                })
                .where(eq(workspaceTeamMembers.id, existingOwnerEdge.id))
            }

            continue
          }

          await tx.insert(workspaceTeamMembers).values({
            ownerId: teamOwnerId,
            memberUserId: remainingUserId,
            createdByUserId: currentUserId,
          })
        }
      })

      return { ok: true }
    }),
})
