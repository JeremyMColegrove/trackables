import { z } from "zod"

import { accountRouter } from "@/server/api/routers/account"
import { dashboardRouter } from "@/server/api/routers/dashboard"
import { projectsRouter } from "@/server/api/routers/project"
import { teamRouter } from "@/server/api/routers/team"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"

export const appRouter = createTRPCRouter({
  account: accountRouter,
  dashboard: dashboardRouter,
  projects: projectsRouter,
  team: teamRouter,
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return {
        greeting: `Hello, ${input.text}!`,
        userId: ctx.auth.userId ?? null,
      }
    }),
})

export type AppRouter = typeof appRouter
