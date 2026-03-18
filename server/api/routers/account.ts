import { clerkClient } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { users } from "@/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

export const accountRouter = createTRPCRouter({
  getProfilePrivacy: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId

    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        isProfilePrivate: true,
      },
    })

    return {
      isProfilePrivate: user?.isProfilePrivate ?? false,
    }
  }),

  updateProfilePrivacy: protectedProcedure
    .input(
      z.object({
        isProfilePrivate: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      const clerk = await clerkClient()
      const clerkUser = await clerk.users.getUser(userId)

      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...(clerkUser.publicMetadata ?? {}),
          isProfilePrivate: input.isProfilePrivate,
        },
      })

      await db
        .update(users)
        .set({
          isProfilePrivate: input.isProfilePrivate,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))

      return {
        isProfilePrivate: input.isProfilePrivate,
      }
    }),
})
