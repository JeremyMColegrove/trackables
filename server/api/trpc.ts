import { auth } from "@clerk/nextjs/server"
import { TRPCError, initTRPC } from "@trpc/server"

export async function createTRPCContext() {
  return {
    auth: await auth(),
  }
}

type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<TRPCContext>().create()

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    })
  }

  return next({
    ctx,
  })
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
