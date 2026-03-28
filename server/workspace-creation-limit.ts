import { TRPCError } from "@trpc/server"

import { getCreatedWorkspaceLimitMessage } from "@/lib/subscription-limit-messages"

export function assertCanCreateWorkspaceWithCount(
  createdWorkspaceCount: number,
  limit: number | null
) {
  if (limit === null) {
    return
  }

  if (createdWorkspaceCount >= limit) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: getCreatedWorkspaceLimitMessage(limit),
    })
  }
}
